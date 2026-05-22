import * as fs from "fs"
import archiver from "archiver"
import { WritableStreamBuffer } from "stream-buffers"
import { Storage } from "@google-cloud/storage"
import { Readable } from "stream"

import { GoogleStorageStrategy } from "./google.strategy"
import { GoogleStorageOptions } from "../../interfaces/config.interface"

// ---- mocks ----
jest.mock("fs")
jest.mock("archiver")
jest.mock("stream-buffers")
jest.mock("@google-cloud/storage")

describe("GoogleStorageStrategy", () => {
  let strategy: GoogleStorageStrategy

  const config: GoogleStorageOptions = {
    driver: "google",
    bucket: "test-bucket",
    projectId: "project-id",
    keyFilename: "key.json",
    publicUrl: "http://public-url.com"
  }

  const mockFile = {
    createWriteStream: jest.fn(),
    makePublic: jest.fn(),
    download: jest.fn(),
    getMetadata: jest.fn(),
    delete: jest.fn()
  }

  const mockBucket = {
    file: jest.fn(() => mockFile),
    getFilesStream: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(Storage as any).mockImplementation(() => ({
      bucket: () => mockBucket
    }))

    strategy = new GoogleStorageStrategy()
    strategy.setConfig(config)
  })

  // -------------------------------
  // upload()
  // -------------------------------
  it("should upload a buffer", async () => {
    const streamEnd = jest.fn()
    const mockStream: any = {
      on: jest.fn((event, cb) => {
        if (event === "finish") cb()
      }),
      end: streamEnd
    }

    mockFile.createWriteStream.mockReturnValue(mockStream)
    mockFile.makePublic.mockResolvedValue(undefined)

    const buffer = Buffer.from("data")

    const url = await strategy.upload({
      buffer,
      destination: "file.txt",
      mimetype: "text/plain"
    })

    expect(mockFile.createWriteStream).toHaveBeenCalledWith({
      metadata: { contentType: "text/plain" },
      resumable: false
    })
    expect(streamEnd).toHaveBeenCalledWith(buffer)
    expect(mockFile.makePublic).toHaveBeenCalled()
    expect(url).toBe("http://public-url.com/test-bucket/file.txt")
  })

  it("should upload a filePath", async () => {
    const mockStream: any = {
      on: jest.fn((event, cb) => {
        if (event === "finish") cb()
      }),
      end: jest.fn()
    }

    mockFile.createWriteStream.mockReturnValue(mockStream)

    const readStream = { pipe: jest.fn() }
    ;(fs.createReadStream as jest.Mock).mockReturnValue(readStream)

    await strategy.upload({
      filePath: "/tmp/file.txt",
      destination: "file.txt",
      mimetype: "text/plain"
    })

    expect(fs.createReadStream).toHaveBeenCalledWith("/tmp/file.txt")
    expect(readStream.pipe).toHaveBeenCalledWith(mockStream)
  })

  it("should throw if no filePath or buffer", async () => {
    await expect(strategy.upload({ destination: "x", mimetype: "text/plain" } as any)).rejects.toThrow("No filePath or buffer provided")
  })

  // -------------------------------
  // get()
  // -------------------------------
  it("should download a file", async () => {
    const fileBuffer = Buffer.from("data")
    mockFile.download.mockResolvedValue([fileBuffer])

    const buf = await strategy.get("file.txt")

    expect(buf).toEqual(fileBuffer)
    expect(mockBucket.file).toHaveBeenCalledWith("file.txt")
    expect(mockFile.download).toHaveBeenCalled()
  })

  // -------------------------------
  // getMetaData()
  // -------------------------------
  it("should return metadata", async () => {
    const meta = {
      name: "file.txt",
      size: "100",
      contentType: "text/plain",
      timeStorageClassUpdated: "2023-01-01T00:00:00Z"
    }

    mockFile.getMetadata.mockResolvedValue([meta])

    const result = await strategy.getMetaData("file.txt")

    expect(result.name).toBe("file.txt")
    expect(result.size).toBe(100)
    expect(result.mimeType).toBe("text/plain")
    expect(result.url).toBe("http://public-url.com/file.txt")
    expect(result.lastModified).toEqual(new Date("2023-01-01T00:00:00Z"))
  })

  // -------------------------------
  // delete()
  // -------------------------------
  it("should delete a file", async () => {
    mockFile.delete.mockResolvedValue(undefined)

    await strategy.delete("file.txt")

    expect(mockBucket.file).toHaveBeenCalledWith("file.txt")
    expect(mockFile.delete).toHaveBeenCalled()
  })

  // -------------------------------
  // update()
  // -------------------------------
  it("should delete then upload", async () => {
    const deleteSpy = jest.spyOn(strategy, "delete").mockResolvedValue()
    const uploadSpy = jest.spyOn(strategy, "upload").mockResolvedValue("url")

    const url = await strategy.update("file.txt", {
      buffer: Buffer.from("x"),
      destination: "file.txt",
      mimetype: "text/plain"
    })

    expect(deleteSpy).toHaveBeenCalledWith("file.txt")
    expect(uploadSpy).toHaveBeenCalled()
    expect(url).toBe("url")
  })

  // -------------------------------
  // zipFolder()
  // -------------------------------
  it("should zip a folder", async () => {
    mockBucket.getFilesStream.mockImplementation(() => {
      const files = [{ name: "folder/file1.txt" }, { name: "folder/file2.txt" }]

      let index = 0

      const stream = new Readable({
        objectMode: true,
        async read() {
          if (index >= files.length) {
            // delay end so async handlers finish
            setTimeout(() => this.push(null), 10)
            return
          }

          // delay each data emission to let async .on("data") run
          const file = files[index++]
          setTimeout(() => this.push(file), 10)
        }
      })

      return stream
    })

    // Mock archiver behavior
    const mockArchiveAppend = jest.fn()
    const mockFinalize = jest.fn().mockResolvedValue(undefined)

    ;(archiver as any).mockImplementation(() => ({
      pipe: jest.fn(),
      append: mockArchiveAppend,
      finalize: mockFinalize,
      on: jest.fn()
    }))

    // Mock WritableStreamBuffer
    ;(WritableStreamBuffer as any).mockImplementation(() => ({
      getContents: jest.fn(() => Buffer.from("zip-buffer")),
      write: jest.fn(),
      on: jest.fn((event, cb) => {
        if (event === "finish") cb()
      })
    }))

    const buffer = await strategy.zipFolder("folder")

    expect(Buffer.isBuffer(buffer)).toBe(true)
    expect(buffer).toEqual(Buffer.from("zip-buffer"))
  })
})
