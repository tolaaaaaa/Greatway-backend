import { HttpException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { CONFIG_OPTIONS } from "./entities/config"
import { FILESYSTEM_STRATEGY } from "./entities/strategies"

import { FileSystemService } from "./filesystem.service"
import { FileSystemModuleOptions } from "./interfaces/config.interface"

describe("FileSystemService", () => {
  let service: FileSystemService

  // --- Create mocks for each strategy ---
  const mockStrategy = () => ({
    setConfig: jest.fn().mockReturnThis(),
    upload: jest.fn(),
    get: jest.fn(),
    getMetaData: jest.fn(),
    zipFolder: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  })

  const mockLocal = mockStrategy()
  const mockS3 = mockStrategy()
  const mockSpaces = mockStrategy()
  const mockGoogle = mockStrategy()
  const mockCloudinary = mockStrategy()

  const baseConfig: FileSystemModuleOptions = {
    default: "local",
    clients: {
      local: { driver: "local", root: "/root", baseUrl: "" },
      s3: { driver: "s3", key: "k", secret: "s", bucket: "b", region: "r" },
      spaces: { driver: "spaces", key: "k", secret: "s", bucket: "b", region: "r" },
      google: { driver: "google", bucket: "b", keyFilename: "", projectId: "p" },
      cloudinary: { driver: "cloudinary", cloudName: "c", apiKey: "a", apiSecret: "s" }
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileSystemService,
        { provide: CONFIG_OPTIONS, useValue: baseConfig },

        { provide: FILESYSTEM_STRATEGY.local, useValue: mockLocal },
        { provide: FILESYSTEM_STRATEGY.aws, useValue: mockS3 },
        { provide: FILESYSTEM_STRATEGY.spaces, useValue: mockSpaces },
        { provide: FILESYSTEM_STRATEGY.google, useValue: mockGoogle },
        { provide: FILESYSTEM_STRATEGY.cloudinary, useValue: mockCloudinary }
      ]
    }).compile()

    service = module.get<FileSystemService>(FileSystemService)
  })

  // -------------------------------------
  // CONSTRUCTOR VALIDATION
  // -------------------------------------

  it("should throw if default client is invalid", async () => {
    expect(() => {
      new FileSystemService(
        { default: "wrong", clients: baseConfig.clients },
        mockS3 as any,
        mockSpaces as any,
        mockGoogle as any,
        mockCloudinary as any,
        mockLocal as any
      )
    }).toThrow(HttpException)
  })

  // -------------------------------------
  // GET FILE SYSTEM
  // -------------------------------------

  it("should return correct strategy via getFileSystem()", () => {
    const fs = service.getFileSystem("local")

    expect(fs).toBe(mockLocal)
    expect(mockLocal.setConfig).toHaveBeenCalledWith(baseConfig.clients.local)
  })

  it("should throw if client is not configured", () => {
    expect(() => service.getFileSystem("missing")).toThrow(HttpException)
  })

  // -------------------------------------
  // DEFAULT STRATEGY DELEGATION
  // -------------------------------------

  it("upload() should delegate to default strategy", async () => {
    mockLocal.upload.mockResolvedValue("url-123")

    const res = await service.upload({
      buffer: Buffer.from("abc"),
      destination: "file.txt",
      mimetype: "text/plain"
    })

    expect(mockLocal.upload).toHaveBeenCalled()
    expect(res).toBe("url-123")
  })

  it("get() should delegate to default strategy", async () => {
    const buf = Buffer.from("data")
    mockLocal.get.mockResolvedValue(buf)

    const result = await service.get("path/to.txt")
    expect(result).toBe(buf)
    expect(mockLocal.get).toHaveBeenCalledWith("path/to.txt")
  })

  it("getMetaData() should delegate to default strategy", async () => {
    const meta = { name: "a", size: 1, url: "", mimeType: "text/plain", lastModified: new Date() }
    mockLocal.getMetaData.mockResolvedValue(meta)

    const result = await service.getMetaData("abc")
    expect(result).toBe(meta)
    expect(mockLocal.getMetaData).toHaveBeenCalledWith("abc")
  })

  it("zipFolder() delegates to default strategy", async () => {
    const buffer = Buffer.from("zip")
    mockLocal.zipFolder.mockResolvedValue(buffer)

    const result = await service.zipFolder("/folder")
    expect(result).toBe(buffer)
    expect(mockLocal.zipFolder).toHaveBeenCalledWith("/folder")
  })

  it("update() delegates correctly", async () => {
    mockLocal.update.mockResolvedValue("updated")

    const result = await service.update("x.txt", {
      buffer: Buffer.from("a"),
      destination: "x.txt",
      mimetype: "text/plain"
    })

    expect(result).toBe("updated")
    expect(mockLocal.update).toHaveBeenCalled()
  })

  it("delete() delegates to default strategy", async () => {
    mockLocal.delete.mockResolvedValue(undefined)

    await service.delete("file.txt")

    expect(mockLocal.delete).toHaveBeenCalledWith("file.txt")
  })

  // -------------------------------------
  // STRATEGY MAPPING VALIDATION
  // -------------------------------------

  it("should map each driver to its correct strategy instance", () => {
    const fsS3 = service.getFileSystem("s3")
    const fsGoogle = service.getFileSystem("google")
    const fsSpaces = service.getFileSystem("spaces")
    const fsCloudinary = service.getFileSystem("cloudinary")

    expect(fsS3).toBe(mockS3)
    expect(fsSpaces).toBe(mockSpaces)
    expect(fsGoogle).toBe(mockGoogle)
    expect(fsCloudinary).toBe(mockCloudinary)
  })
})
