import * as fs from "fs"
import archiver from "archiver"
import { Readable } from "stream"
import { WritableStreamBuffer } from "stream-buffers"
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

import { S3Strategy } from "./s3.strategy"
import { S3Options } from "../../interfaces/config.interface"

// ---- mocks ----
jest.mock("fs", () => {
  const fsActual = jest.requireActual("fs") // now inside factory function
  return {
    ...fsActual,
    existsSync: jest.fn(),
    createReadStream: jest.fn()
  }
})

jest.mock("archiver")
jest.mock("stream-buffers")
jest.mock("@aws-sdk/client-s3")

describe("S3Strategy", () => {
  let strategy: S3Strategy
  let sendMock: jest.Mock
  const config: S3Options = {
    driver: "s3",
    bucket: "my-bucket",
    region: "us-east-1",
    key: "ACCESS",
    secret: "SECRET"
  }

  beforeEach(() => {
    sendMock = jest.fn()
    ;(S3Client as jest.Mock).mockImplementation(() => ({ send: sendMock }))
    ;(WritableStreamBuffer as any).mockImplementation(() => ({
      getContents: jest.fn(() => Buffer.from("zip-content")),
      write: jest.fn()
    }))

    strategy = new S3Strategy()
    strategy.setConfig(config)
  })

  // -------------------------------------------------------
  // upload (buffer)
  // -------------------------------------------------------
  it("uploads a file using buffer", async () => {
    sendMock.mockResolvedValue({})
    const url = await strategy.upload({
      buffer: Buffer.from("abc"),
      destination: "path/to/file.txt",
      mimetype: "text/plain"
    })
    expect(sendMock).toHaveBeenCalledWith(expect.any(PutObjectCommand))
    expect(url).toBe("https://my-bucket.s3.us-east-1.amazonaws.com/path/to/file.txt")
  })

  it("uploads a file from filePath", async () => {
    sendMock.mockResolvedValue({})
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.createReadStream as jest.Mock).mockReturnValue(Readable.from(["file-data"]))

    const url = await strategy.upload({
      filePath: "/tmp/a.txt",
      destination: "f1.txt",
      mimetype: "text/plain"
    })

    expect(sendMock).toHaveBeenCalledWith(expect.any(PutObjectCommand))
    expect(url).toBe("https://my-bucket.s3.us-east-1.amazonaws.com/f1.txt")
  })

  it("throws if both buffer and filePath missing", async () => {
    await expect(strategy.upload({ destination: "x", mimetype: "text/plain" })).rejects.toThrow("Valid file required")
  })

  it("throws if filePath does not exist", async () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(false)
    await expect(strategy.upload({ filePath: "/missing.txt", destination: "x", mimetype: "text/plain" })).rejects.toThrow(
      "File does not exist at path"
    )
  })

  it("handles AWS NoSuchBucket error", async () => {
    const err = new Error("no bucket") as any
    err.name = "NoSuchBucket"
    sendMock.mockRejectedValue(err)

    await expect(strategy.upload({ buffer: Buffer.from("x"), destination: "x", mimetype: "text/plain" })).rejects.toThrow(
      "Bucket my-bucket does not exist"
    )
  })

  it("handles AWS AccessDenied error", async () => {
    const err = new Error("denied") as any
    err.name = "AccessDenied"
    sendMock.mockRejectedValue(err)

    await expect(strategy.upload({ buffer: Buffer.from("x"), destination: "x", mimetype: "text/plain" })).rejects.toThrow("Access denied to AWS")
  })

  it("handles generic AWS error", async () => {
    const err = new Error("fail")
    sendMock.mockRejectedValue(err)

    await expect(strategy.upload({ buffer: Buffer.from("x"), destination: "x", mimetype: "text/plain" })).rejects.toThrow(
      "Failed to upload file to AWS"
    )
  })

  // -------------------------------------------------------
  // get()
  // -------------------------------------------------------
  it("downloads a file", async () => {
    sendMock.mockResolvedValue({
      Body: { transformToByteArray: async () => Uint8Array.from([1, 2, 3]) }
    })

    const buf = await strategy.get("a.txt")
    expect(buf).toEqual(Buffer.from([1, 2, 3]))
    expect(sendMock).toHaveBeenCalledWith(expect.any(GetObjectCommand))
  })

  // -------------------------------------------------------
  // getMetaData()
  // -------------------------------------------------------
  it("returns metadata", async () => {
    const lastModified = new Date("2020-01-01")
    sendMock.mockResolvedValue({
      ContentType: "text/plain",
      ContentLength: 123,
      LastModified: lastModified
    })

    const meta = await strategy.getMetaData("folder/a.txt")
    expect(meta).toEqual({
      name: "folder/a.txt",
      mimeType: "text/plain",
      size: 123,
      lastModified,
      url: "folder/a.txt"
    })
    expect(sendMock).toHaveBeenCalledWith(expect.any(GetObjectCommand))
  })

  // -------------------------------------------------------
  // delete()
  // -------------------------------------------------------
  it("deletes a file", async () => {
    sendMock.mockResolvedValue({})
    await strategy.delete("some/file.txt")
    expect(sendMock).toHaveBeenCalledWith(expect.any(DeleteObjectCommand))
  })

  // -------------------------------------------------------
  // update()
  // -------------------------------------------------------
  it("calls delete then upload", async () => {
    const deleteSpy = jest.spyOn(strategy, "delete").mockResolvedValue()
    const uploadSpy = jest.spyOn(strategy, "upload").mockResolvedValue("url")

    const url = await strategy.update("old.txt", {
      buffer: Buffer.from("x"),
      destination: "new.txt",
      mimetype: "text/plain"
    })

    expect(deleteSpy).toHaveBeenCalledWith("old.txt")
    expect(uploadSpy).toHaveBeenCalled()
    expect(url).toBe("url")
  })

  // -------------------------------------------------------
  // zipFolder()
  // -------------------------------------------------------
  it("zips a folder of files", async () => {
    sendMock.mockResolvedValueOnce({
      Contents: [
        { Key: "folder/a.txt", Size: 10 },
        { Key: "folder/b.txt", Size: 20 }
      ]
    })

    jest.spyOn(strategy, "get").mockResolvedValue(Buffer.from("file-content"))

    const mockArchiveAppend = jest.fn()
    const mockFinalize = jest.fn().mockResolvedValue(undefined)
    ;(archiver as any).mockReturnValue({
      pipe: jest.fn(),
      append: mockArchiveAppend,
      finalize: mockFinalize
    })

    const result = await strategy.zipFolder("folder")
    expect(Buffer.isBuffer(result)).toBe(true)
    expect(mockArchiveAppend).toHaveBeenCalledTimes(2)
  })

  it("throws if folder is empty", async () => {
    sendMock.mockResolvedValue({ Contents: [] })
    await expect(strategy.zipFolder("empty")).rejects.toThrow("No files found in the folder")
  })
})
