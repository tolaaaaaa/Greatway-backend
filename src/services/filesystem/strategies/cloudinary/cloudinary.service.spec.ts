import * as fs from "fs"
import axios from "axios"
import archiver from "archiver"
import { Readable } from "stream"
// import { WritableStreamBuffer } from 'stream-buffers'
import { HttpException } from "@nestjs/common"
import { v2 as cloudinary } from "cloudinary"

import { CloudinaryStrategy } from "./cloudinary.service"

// -------------------------------------
// MOCKS
// -------------------------------------

jest.mock("fs")
jest.mock("axios")
jest.mock("archiver")
jest.mock("stream-buffers", () => ({
  WritableStreamBuffer: jest.fn().mockImplementation(() => {
    const buffer = Buffer.from("zip-content")
    return {
      getContents: jest.fn(() => buffer)
    }
  })
}))
jest.mock("cloudinary", () => ({
  v2: {
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn()
    },
    url: jest.fn(),
    api: {
      resource: jest.fn(),
      resources: jest.fn()
    },
    config: jest.fn()
  }
}))

describe("CloudinaryStrategy", () => {
  let strategy: CloudinaryStrategy

  beforeEach(() => {
    jest.clearAllMocks()
    strategy = new CloudinaryStrategy()
  })

  // -------------------------------------
  // UPLOAD
  // -------------------------------------

  it("should upload file successfully", async () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(cloudinary.uploader.upload as jest.Mock).mockResolvedValue({
      secure_url: "https://cdn/result-url"
    })

    const file = {
      filePath: "/tmp/test.png",
      mimetype: "image/png",
      destination: "folder"
    }

    const res = await strategy.upload(file)

    expect(fs.existsSync).toHaveBeenCalledWith("/tmp/test.png")
    expect(cloudinary.uploader.upload).toHaveBeenCalled()
    expect(fs.unlinkSync).toHaveBeenCalledWith("/tmp/test.png")
    expect(res).toBe("https://cdn/result-url")
  })

  it("should throw error if file does not exist", async () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(false)

    await expect(
      strategy.upload({
        filePath: "/missing/file.jpg",
        mimetype: "image/jpeg",
        destination: "dest"
      })
    ).rejects.toThrow(HttpException)
  })

  // -------------------------------------
  // GET (Download buffer)
  // -------------------------------------

  it("should download file buffer", async () => {
    ;(cloudinary.url as jest.Mock).mockReturnValue("https://cloudinary/file.jpg")
    ;(axios.get as jest.Mock).mockResolvedValue({
      data: Buffer.from("abc")
    })

    const result = await strategy.get("public-id")

    expect(cloudinary.url).toHaveBeenCalledWith("public-id", { secure: true })
    expect(axios.get).toHaveBeenCalled()
    expect(Buffer.isBuffer(result)).toBe(true)
  })

  // -------------------------------------
  // GET METADATA
  // -------------------------------------

  it("should return metadata from cloudinary", async () => {
    ;(cloudinary.api.resource as jest.Mock).mockResolvedValue({
      original_filename: "file",
      bytes: 123,
      resource_type: "image",
      format: "png",
      secure_url: "secure-url",
      created_at: "2020-01-01T00:00:00Z"
    })

    const result = await strategy.getMetaData("public-id")

    expect(result).toEqual({
      name: "file",
      size: 123,
      mimeType: "image/png",
      url: "secure-url",
      lastModified: new Date("2020-01-01T00:00:00Z")
    })
  })

  // -------------------------------------
  // ZIP FOLDER
  // -------------------------------------

  it("should zip resources into a buffer", async () => {
    // Mock cloudinary list resources
    ;(cloudinary.api.resources as jest.Mock).mockResolvedValue({
      resources: [
        {
          public_id: "folder/file1",
          secure_url: "https://file1",
          format: "jpg"
        },
        {
          public_id: "folder/file2",
          secure_url: "https://file2",
          format: "png"
        }
      ]
    })

    // Mock axios stream
    const stream1 = new Readable()
    stream1.push("file1")
    stream1.push(null)

    const stream2 = new Readable()
    stream2.push("file2")
    stream2.push(null)
    ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: stream1 }).mockResolvedValueOnce({ data: stream2 })

    // Mock archiver
    const append = jest.fn()
    const finalize = jest.fn()

    ;(archiver as unknown as jest.Mock).mockReturnValue({
      pipe: jest.fn(),
      append,
      finalize
    })

    const result = await strategy.zipFolder("folder")

    expect(cloudinary.api.resources).toHaveBeenCalled()
    expect(append).toHaveBeenCalledTimes(2)
    expect(finalize).toHaveBeenCalled()
    expect(Buffer.isBuffer(result)).toBe(true)
  })

  it("should throw if no resources to zip", async () => {
    ;(cloudinary.api.resources as jest.Mock).mockResolvedValue({
      resources: []
    })

    await expect(strategy.zipFolder("folder")).rejects.toThrow(HttpException)
  })

  // -------------------------------------
  // UPDATE
  // -------------------------------------

  it("should call delete then upload on update", async () => {
    const deleteSpy = jest.spyOn(strategy, "delete").mockResolvedValue()
    const uploadSpy = jest.spyOn(strategy, "upload").mockResolvedValue("url")

    const res = await strategy.update("public-id", {
      filePath: "/x",
      mimetype: "image/png",
      destination: "folder"
    })

    expect(deleteSpy).toHaveBeenCalledWith("public-id")
    expect(uploadSpy).toHaveBeenCalled()
    expect(res).toBe("url")
  })

  // -------------------------------------
  // DELETE
  // -------------------------------------

  it("should delete file from cloudinary", async () => {
    ;(cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({})

    await strategy.delete("pub-id")

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("pub-id", { resource_type: "image" })
  })

  it("should throw if cloudinary delete fails", async () => {
    ;(cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(new Error("fail"))

    await expect(strategy.delete("id")).rejects.toThrow(HttpException)
  })

  // -------------------------------------
  // SET CONFIG
  // -------------------------------------

  it("should configure cloudinary", () => {
    strategy.setConfig({
      cloudName: "c",
      apiKey: "k",
      apiSecret: "s",
      driver: "cloudinary"
    })

    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: "c",
      api_key: "k",
      api_secret: "s"
    })
  })
})
