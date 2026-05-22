import * as fs from "fs"
import { Readable } from "stream"
import archiver from "archiver"
import { WritableStreamBuffer } from "stream-buffers"
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { SpacesStrategy } from "./spaces.strategy"
import { SpacesOptions } from "../../interfaces/config.interface"

// ---- partial fs mock ----
jest.mock("fs", () => {
  const fsActual = jest.requireActual("fs")
  return {
    ...fsActual,
    existsSync: jest.fn(),
    createReadStream: jest.fn()
  }
})
jest.mock("archiver")
jest.mock("stream-buffers")
jest.mock("@aws-sdk/client-s3")

describe("SpacesStrategy", () => {
  let strategy: SpacesStrategy
  let sendMock: jest.Mock
  const config: SpacesOptions = {
    driver: "spaces",
    bucket: "my-bucket",
    region: "eu-central-1",
    key: "ACCESS",
    secret: "SECRET"
  }

  beforeEach(() => {
    sendMock = jest.fn()
    ;(S3Client as jest.Mock).mockImplementation(() => ({
      send: sendMock
    }))
    ;(WritableStreamBuffer as any).mockImplementation(() => ({
      getContents: jest.fn(() => Buffer.from("zip-content")),
      write: jest.fn()
    }))

    strategy = new SpacesStrategy()
    strategy.setConfig(config)
  })

  // -------------------------------
  // upload()
  // -------------------------------
  it("should upload a buffer", async () => {
    sendMock.mockResolvedValue({})

    const url = await strategy.upload({
      buffer: Buffer.from("data"),
      destination: "file.txt",
      mimetype: "text/plain"
    })

    expect(sendMock).toHaveBeenCalledWith(expect.any(PutObjectCommand))
    expect(url).toBe(`https://eu-central-1.digitaloceanspaces.com/my-bucket/file.txt`)
  })

  it("should upload from filePath", async () => {
    sendMock.mockResolvedValue({})
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.createReadStream as jest.Mock).mockReturnValue(Readable.from(["data"]))

    const url = await strategy.upload({
      filePath: "/tmp/file.txt",
      destination: "file.txt",
      mimetype: "text/plain"
    })

    expect(fs.createReadStream).toHaveBeenCalledWith("/tmp/file.txt")
    expect(sendMock).toHaveBeenCalledWith(expect.any(PutObjectCommand))
    expect(url).toBe(`https://eu-central-1.digitaloceanspaces.com/my-bucket/file.txt`)
  })

  it("should throw if buffer and filePath are missing", async () => {
    await expect(strategy.upload({ destination: "x", mimetype: "text/plain" })).rejects.toThrow("Valid file required")
  })

  it("should throw if filePath does not exist", async () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(false)
    await expect(strategy.upload({ filePath: "/missing.txt", destination: "x", mimetype: "text/plain" })).rejects.toThrow(
      "File does not exist at path"
    )
  })

  // -------------------------------
  // get()
  // -------------------------------
  it("should download a file", async () => {
    sendMock.mockResolvedValue({
      Body: { transformToByteArray: async () => Uint8Array.from([1, 2, 3]) }
    })

    const buf = await strategy.get(`https://eu-central-1.digitaloceanspaces.com/my-bucket/file.txt`)
    expect(buf).toEqual(Buffer.from([1, 2, 3]))
    expect(sendMock).toHaveBeenCalledWith(expect.any(GetObjectCommand))
  })

  // -------------------------------
  // getMetaData()
  // -------------------------------
  it("should return metadata", async () => {
    sendMock.mockResolvedValue({
      ContentType: "text/plain",
      ContentLength: 123,
      LastModified: new Date("2023-01-01")
    })

    const meta = await strategy.getMetaData("file.txt")
    expect(meta.mimeType).toBe("text/plain")
    expect(meta.size).toBe(123)
    expect(meta.name).toBe("file.txt")
    expect(sendMock).toHaveBeenCalledWith(expect.any(GetObjectCommand))
  })

  // -------------------------------
  // zipFolder()
  // -------------------------------
  it("should zip a folder", async () => {
    sendMock.mockResolvedValueOnce({
      Contents: [
        { Key: "folder/a.txt", Size: 10 },
        { Key: "folder/b.txt", Size: 20 }
      ]
    })

    jest.spyOn(strategy, "get").mockResolvedValue(Buffer.from("data"))
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

  it("should throw if folder is empty", async () => {
    sendMock.mockResolvedValue({ Contents: [] })
    await expect(strategy.zipFolder("empty")).rejects.toThrow("No files found in the folder")
  })

  // -------------------------------
  // update()
  // -------------------------------
  it("should delete then upload", async () => {
    const deleteSpy = jest.spyOn(strategy, "delete").mockResolvedValue()
    const uploadSpy = jest.spyOn(strategy, "upload").mockResolvedValue("url")

    const url = await strategy.update("old.txt", { buffer: Buffer.from("x"), destination: "new.txt", mimetype: "text/plain" })

    expect(deleteSpy).toHaveBeenCalledWith("old.txt")
    expect(uploadSpy).toHaveBeenCalled()
    expect(url).toBe("url")
  })

  // -------------------------------
  // delete()
  // -------------------------------
  it("should delete a file", async () => {
    sendMock.mockResolvedValue({})
    await strategy.delete(`https://eu-central-1.digitaloceanspaces.com/my-bucket/file.txt`)
    expect(sendMock).toHaveBeenCalledWith(expect.any(DeleteObjectCommand))
  })
})
