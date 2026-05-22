import { ModuleMetadata } from "@nestjs/common"

// --- Individual driver option contracts ---
export type LocalFsOptions = {
  driver: "local"
  root: string // absolute path to local storage root
  baseUrl: string // base URL for serving local files
}

export type S3Options = {
  driver: "s3"
  key: string
  bucket: string
  region: string
  secret: string
}

export type SpacesOptions = {
  driver: "spaces"
  key: string
  secret: string
  bucket: string
  region: string
}

export type GoogleStorageOptions = {
  driver: "google"
  bucket: string
  keyFilename: string // path to service account key
  projectId: string
  publicUrl?: string // optional: override public base URL
}

export type CloudinaryStorageOptions = {
  driver: "cloudinary"
  cloudName: string
  apiKey: string
  apiSecret: string
}

// Union of all possible driver names
export type FileSystemDriver = "local" | "s3" | "google" | "spaces" | "cloudinary"

// Union of all possible driver config objects
export type FIleSystemDriverOption = LocalFsOptions | SpacesOptions | GoogleStorageOptions | S3Options | CloudinaryStorageOptions

// Default client must be one of the defined keys
export type FileSystemDefault = string

// Top-level options that the FilesystemModule will consume
export interface FileSystemModuleOptions {
  clients: IFileSystemClients // map of configured storage clients
  default: FileSystemDefault // the default storage driver key
}

// Shape of all supported storage clients
export type IFileSystemClients = Record<string, FIleSystemDriverOption>

// Async module registration options
export interface FileSystemModuleAsynOptions extends Pick<ModuleMetadata, "imports"> {
  useFactory?: (...args: any[]) => Promise<FileSystemModuleOptions> | FileSystemModuleOptions
  inject?: any[]
}
