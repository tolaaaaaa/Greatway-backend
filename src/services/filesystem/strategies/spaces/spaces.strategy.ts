import * as fs from "fs"
import archiver from "archiver"
import { WritableStreamBuffer } from "stream-buffers"
import { HttpException, Injectable } from "@nestjs/common"
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client, ObjectCannedACL, ListObjectsV2Command } from "@aws-sdk/client-s3"

import { SpacesOptions } from "../../interfaces/config.interface"
import { FileMetada, FileUploadDto, IFileSystemService, FilesystemStrategy } from "../../interfaces/filesystem.interface"

@Injectable()
export class SpacesStrategy implements FilesystemStrategy {
  private client!: S3Client
  private endpoint!: string
  private config!: SpacesOptions

  setConfig(config: SpacesOptions): IFileSystemService {
    this.config = config
    this.endpoint = `https://${this.config.region}.digitaloceanspaces.com`
    this.client = new S3Client({
      credentials: {
        accessKeyId: config.key,
        secretAccessKey: config.secret
      },
      endpoint: this.endpoint,
      region: config.region,
      forcePathStyle: true
    })
    return this
  }

  async upload(file: FileUploadDto): Promise<string> {
    const error = this.checkConfig(this.config)
    if (error) throw new HttpException(error, 500)

    if (!file.filePath && !file.buffer) {
      throw new HttpException("Valid file required (buffer or filePath)", 500)
    }

    if (file.filePath && !fs.existsSync(file.filePath)) {
      throw new HttpException(`File does not exist at path: ${file.filePath}`, 500)
    }

    try {
      const body = file.buffer || fs.createReadStream(file.filePath!)

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: file.destination,
          Body: body,
          ContentType: file.mimetype,
          ACL: "public-read" as ObjectCannedACL
        })
      )

      return `${this.endpoint}/${this.config.bucket}/${file.destination}`
    } catch (error) {
      if (error instanceof Error && error.name === "NoSuchBucket") {
        throw new HttpException(`No bucket`, 500)
      }
      if (error instanceof Error && error.name === "AccessDenied") {
        throw new HttpException(`Access denied`, 500)
      }
      throw new HttpException(error instanceof Error ? error.message : "Internal server error", 500)
    }
  }

  async get(path: string): Promise<Buffer> {
    const error = this.checkConfig(this.config)
    if (error) throw new HttpException(error, 500)

    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: this.getKeyFromUrl(path)
        })
      )
      return Buffer.from(await response.Body!.transformToByteArray())
    } catch (error) {
      if (error instanceof Error && error.name  === `NoSuchKey`) {
        throw new HttpException(`not found`, 404)
      }

     throw new HttpException(error instanceof Error ? error.message : "Internal server error", 500)
    }
  }

  async getMetaData(path: string): Promise<FileMetada> {
    const error = this.checkConfig(this.config)
    if (error) throw new HttpException(error, 500)

    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: path
      })
    )

    return {
      name: path,
      mimeType: response.ContentType!,
      size: response.ContentLength!,
      lastModified: response.LastModified!,
      url: path.replace(this.endpoint, "")
    }
  }

  async zipFolder(prefix: string): Promise<Buffer> {
    const error = this.checkConfig(this.config)
    if (error) throw new HttpException(error, 500)

    const command = new ListObjectsV2Command({
      Bucket: this.config.bucket,
      Prefix: prefix
    })

    const result = await this.client.send(command)

    if (!result.Contents || result.Contents.length === 0) {
      throw new HttpException("No files found in the folder", 404)
    }

    const files = result.Contents.filter((file) => file.Key && file.Size! > 0).map((file) => file.Key)

    const output = new WritableStreamBuffer()

    const archive = archiver("zip", { zlib: { level: 9 } })
    archive.pipe(output)

    for (const key of files) {
      const buffer = await this.get(`${this.endpoint}/${this.config.bucket}/${key}`)
      const filename = key!.replace(`${prefix}/`, "")
      archive.append(buffer, { name: filename })
    }

    await archive.finalize()

    const content = output.getContents()

    if (!content) {
      throw new HttpException("internal server error", 500)
    }

    return content
  }

  async update(path: string, file: FileUploadDto): Promise<string> {
    const error = this.checkConfig(this.config)
    if (error) throw new HttpException(error, 500)

    await this.delete(path)
    return this.upload(file)
  }

  async delete(path: string): Promise<void> {
    const error = this.checkConfig(this.config)
    if (error) throw new HttpException(error, 500)

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: this.getKeyFromUrl(path)
      })
    )
  }

  private checkConfig(options: SpacesOptions) {
    if (!options.driver) {
      return "Invalid driver"
    }

    if (!options.bucket) {
      return "No storage bucket"
    }

    if (!options.region) {
      return "Region not specified"
    }

    if (!options.secret || !options.key) {
      return "Invalid credentials"
    }

    return ""
  }

  private getKeyFromUrl(url: string): string {
    return url.replace(`${this.endpoint}/${this.config.bucket}/`, "")
  }
}
