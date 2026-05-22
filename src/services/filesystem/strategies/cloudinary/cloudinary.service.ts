import * as fs from "fs"
import axios from "axios"
import archiver from "archiver"
import { Readable } from "stream"
import { WritableStreamBuffer } from "stream-buffers"
import { HttpException, Injectable } from "@nestjs/common"
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary"

import { CloudinaryStorageOptions } from "../../interfaces/config.interface"
import { FileMetada, FilesystemStrategy, FileUploadDto, IFileSystemService } from "../../interfaces/filesystem.interface"
const streamifier = require('streamifier')

export type CloudinaryType = UploadApiErrorResponse | UploadApiResponse

@Injectable()
export class CloudinaryStrategy implements FilesystemStrategy {
  async upload(file: FileUploadDto): Promise<string> {
    try {
      if (!fs.existsSync(file.filePath!)) {
        // throw new Error(`File does not exist ${file.filePath}`)
        if (file.buffer) {
          const uploadFromBuffer = (file: FileUploadDto): Promise<string> => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: file.mimetype.startsWith("video") ? "video" : file.mimetype.startsWith("image") ? "image" : "raw" },
                (error, result) => {
                  if (error) {
                    reject(error)
                  } else {
                    resolve(result!.secure_url)
                  }
                }
              )
              streamifier.createReadStream(file.buffer).pipe(uploadStream)
            })

          }

          return await uploadFromBuffer(file)
        } else {
          throw new Error(`File does not exist ${file.filePath} and no buffer provided`)
        }
      }

      const result = await cloudinary.uploader.upload(file.filePath!, {
        resource_type: file.mimetype.startsWith("video") ? "video" : file.mimetype.startsWith("image") ? "image" : "raw"
      })

      fs.unlinkSync(file.filePath!)
      return result.secure_url
    } catch (error) {
      throw new HttpException(`Failed to upload file to Cloudinary`, 500, {cause: error})
    }
  }

  async get(publicId: string): Promise<Buffer> {
    const url = cloudinary.url(publicId, {
      secure: true
    })

    const response = await axios.get(url, {
      responseType: "arraybuffer"
    })

    return Buffer.from(response.data)
  }

  async getMetaData(path: string): Promise<FileMetada> {
    const result = await cloudinary.api.resource(path, {
      resource_type: "auto"
    })

    return {
      name: result.original_filename,
      size: result.bytes,
      mimeType: result.resource_type + "/" + result.format,
      url: result.secure_url,
      lastModified: new Date(result.created_at)
    }
  }

  async zipFolder(folderPath: string): Promise<Buffer> {
    try {
      const resources = await cloudinary.api.resources({
        prefix: folderPath,
        type: "upload",
        resource_type: "auto",
        max_results: 100
      })

      if (!resources.resources.length) {
        throw new HttpException(`No files found in ${folderPath}`, 404)
      }

      const output = new WritableStreamBuffer()

      const archive = archiver("zip", { zlib: { level: 9 } })
      archive.pipe(output)

      for (const file of resources.resources) {
        const response = await axios.get(file.secure_url, { responseType: "stream" })
        const stream = response.data as Readable
        const name = file.public_id.replace(folderPath + "/", "")
        archive.append(stream, { name: `${name}.${file.format}` })
      }

      archive.finalize()

      const content = output.getContents()

      if (!content) {
        throw new HttpException("internal server error", 500)
      }

      return content
    } catch (error) {
      throw new HttpException(`Failed to zip folder`, 500, {cause: error})
    }
  }

  async update(publicId: string, file: FileUploadDto): Promise<string> {
    await this.delete(publicId)
    return this.upload(file)
  }

  async delete(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
    } catch (error) {
      throw new HttpException(`Failed to delete file from Cloudinary`, 500, {cause: error})
    }
  }

  setConfig(config: CloudinaryStorageOptions): IFileSystemService {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret
    })

    return this
  }
}
