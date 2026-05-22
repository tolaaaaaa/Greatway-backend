import * as fs from "fs"
import * as path from "path"
import archiver from "archiver"
import { WritableStreamBuffer } from "stream-buffers"

import { LocalFsStrategy } from "./local.strategy"
import { LocalFsOptions } from "../../interfaces/config.interface"

// ---- mocks ----
jest.mock("fs", () => {
  const fsActual = jest.requireActual("fs")
  return {
    ...fsActual,
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    readdirSync: jest.fn(),
    statSync: jest.fn(),
    promises: {
      copyFile: jest.fn(),
      readFile: jest.fn(),
      stat: jest.fn(),
      unlink: jest.fn()
    }
  }
})
jest.mock("archiver")
jest.mock("stream-buffers")

describe("LocalFsStrategy", () => {
  let strategy: LocalFsStrategy
  const config: LocalFsOptions = {
    driver: "local",
    root: path.join("/tmp", "local"),
    baseUrl: "http://localhost/files"
  }

  beforeEach(() => {
    strategy = new LocalFsStrategy()
    strategy.setConfig(config)
  })

  // -------------------------------
  // upload()
  // -------------------------------
  it("should upload a file", async () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.promises.copyFile as jest.Mock).mockResolvedValue(undefined)

    const destination = path.join(config.root, "dest.txt")
    const url = await strategy.upload({
      filePath: "/tmp/source.txt",
      destination: "dest.txt",
      mimetype: "text/plain"
    })

    expect(fs.promises.copyFile).toHaveBeenCalledWith("/tmp/source.txt", destination)
    expect(url).toBe(`http://localhost/files/dest.txt`)
  })

  it("should create directory if missing", async () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(false)
    ;(fs.promises.copyFile as jest.Mock).mockResolvedValue(undefined)

    const folderPath = path.join(config.root, "folder")
    await strategy.upload({
      filePath: "/tmp/source.txt",
      destination: "folder/dest.txt",
      mimetype: "text/plain"
    })

    expect(fs.mkdirSync).toHaveBeenCalledWith(folderPath, { recursive: true })
    expect(fs.promises.copyFile).toHaveBeenCalled()
  })

  it("should throw if filePath missing", async () => {
    await expect(strategy.upload({ destination: "x", mimetype: "text/plain" } as any)).rejects.toThrow("File path is required")
  })

  // -------------------------------
  // get()
  // -------------------------------
  it("should read a file", async () => {
    ;(fs.promises.readFile as jest.Mock).mockResolvedValue(Buffer.from("data"))

    const fullPath = path.join(config.root, "file.txt")
    const buf = await strategy.get("file.txt")

    expect(buf).toEqual(Buffer.from("data"))
    expect(fs.promises.readFile).toHaveBeenCalledWith(fullPath)
  })

  // -------------------------------
  // getMetaData()
  // -------------------------------
  it("should return metadata", async () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    const birthtime = new Date("2023-01-01")
    ;(fs.promises.stat as jest.Mock).mockResolvedValue({ size: 100, birthtime })

    const meta = await strategy.getMetaData("file.txt")

    expect(meta.name).toBe("file.txt")
    expect(meta.size).toBe(100)
    expect(meta.mimeType).toBe("text/plain") // match mime.lookup
    expect(meta.url).toBe("http://localhost/files/file.txt")
    expect(meta.lastModified).toBe(birthtime)
  })

  it("should throw if file does not exist", async () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(false)
    await expect(strategy.getMetaData("missing.txt")).rejects.toThrow("File not found at path")
  })

  // -------------------------------
  // zipFolder()
  // -------------------------------
  it("should zip a folder", async () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.readdirSync as jest.Mock).mockReturnValue(["file1.txt", "file2.txt"])
    ;(fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => false })

    const mockArchiveFile = jest.fn()

    // store finish callback here
    let finishCallback: any | null = null

    const mockFinalize = jest.fn().mockImplementation(() => {
      if (finishCallback) setImmediate(() => finishCallback())
      return Promise.resolve()
    })

    // Mock archiver
    ;(archiver as any).mockImplementation(() => ({
      pipe: jest.fn().mockImplementation((output: any) => {
        output.on = jest.fn((event: string, cb: any) => {
          if (event === "finish") finishCallback = cb
        })
        output.getContents = jest.fn(() => Buffer.from("zip-content"))
      }),
      file: mockArchiveFile,
      finalize: mockFinalize,
      on: jest.fn()
    }))
    ;(WritableStreamBuffer as any).mockImplementation(() => ({
      getContents: jest.fn(() => Buffer.from("zip-content")),
      write: jest.fn(),
      on: jest.fn((event: string, cb: any) => {
        if (event === "finish") cb()
      })
    }))

    const buffer = await strategy.zipFolder("folder")
    expect(Buffer.isBuffer(buffer)).toBe(true)
    expect(mockArchiveFile).toHaveBeenCalledTimes(2)
  })

  it("should throw if folder missing", async () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(false)
    await expect(strategy.zipFolder("missing")).rejects.toThrow("Folder not found")
  })

  // -------------------------------
  // update()
  // -------------------------------
  it("should delete then upload", async () => {
    const deleteSpy = jest.spyOn(strategy, "delete").mockResolvedValue()
    const uploadSpy = jest.spyOn(strategy, "upload").mockResolvedValue("url")

    const url = await strategy.update("old.txt", { filePath: "/tmp/src.txt", destination: "new.txt", mimetype: "text/plain" })

    expect(deleteSpy).toHaveBeenCalledWith("old.txt")
    expect(uploadSpy).toHaveBeenCalled()
    expect(url).toBe("url")
  })

  // -------------------------------
  // delete()
  // -------------------------------
  it("should delete a file if exists", async () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.promises.unlink as jest.Mock).mockResolvedValue(undefined)

    const fullPath = path.join(config.root, "file.txt")
    await strategy.delete("file.txt")
    expect(fs.promises.unlink).toHaveBeenCalledWith(fullPath)
  })

  it("should not throw if file does not exist", async () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(false)
    await expect(strategy.delete("file.txt")).resolves.toBeUndefined()
  })
})
