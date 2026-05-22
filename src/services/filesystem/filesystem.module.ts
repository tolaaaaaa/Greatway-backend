import { DynamicModule, Module } from "@nestjs/common"

import { CONFIG_OPTIONS } from "./entities/config"
import { FileSystemService } from "./filesystem.service"
import { FileSystemModuleAsynOptions, FileSystemModuleOptions } from "./interfaces/config.interface"
import { FILESYSTEM_STRATEGY } from "./entities/strategies"
import { LocalFsStrategy } from "./strategies/local/local.strategy"
import { S3Strategy } from "./strategies/s3/s3.strategy"
import { GoogleStorageStrategy } from "./strategies/google/google.strategy"
import { SpacesStrategy } from "./strategies/spaces/spaces.strategy"
import { CloudinaryStrategy } from "./strategies/cloudinary/cloudinary.service"

@Module({})
export class FileSystemModule {
  static register(options: FileSystemModuleOptions): DynamicModule {
    return {
      module: FileSystemModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options
        },
        {
          provide: FILESYSTEM_STRATEGY.local,
          useClass: LocalFsStrategy
        },
        {
          provide: FILESYSTEM_STRATEGY.aws,
          useClass: S3Strategy
        },
        {
          provide: FILESYSTEM_STRATEGY.google,
          useClass: GoogleStorageStrategy
        },
        {
          provide: FILESYSTEM_STRATEGY.spaces,
          useClass: SpacesStrategy
        },
        {
          provide: FILESYSTEM_STRATEGY.cloudinary,
          useClass: CloudinaryStrategy
        },
        FileSystemService
      ],
      exports: [
        FileSystemService,
        CONFIG_OPTIONS,
        FILESYSTEM_STRATEGY.local,
        FILESYSTEM_STRATEGY.aws,
        FILESYSTEM_STRATEGY.google,
        FILESYSTEM_STRATEGY.spaces,
        FILESYSTEM_STRATEGY.cloudinary
      ]
    }
  }

  static registerAsync(options: FileSystemModuleAsynOptions): DynamicModule {
    return {
      module: FileSystemModule,
      imports: [...(options.imports || [])],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useFactory: options.useFactory!,
          inject: options.inject || []
        },
        {
          provide: FILESYSTEM_STRATEGY.local,
          useClass: LocalFsStrategy
        },
        {
          provide: FILESYSTEM_STRATEGY.aws,
          useClass: S3Strategy
        },
        {
          provide: FILESYSTEM_STRATEGY.google,
          useClass: GoogleStorageStrategy
        },
        {
          provide: FILESYSTEM_STRATEGY.spaces,
          useClass: SpacesStrategy
        },
        {
          provide: FILESYSTEM_STRATEGY.cloudinary,
          useClass: CloudinaryStrategy
        },
        FileSystemService
      ],
      exports: [
        FileSystemService,
        CONFIG_OPTIONS,
        FILESYSTEM_STRATEGY.local,
        FILESYSTEM_STRATEGY.aws,
        FILESYSTEM_STRATEGY.google,
        FILESYSTEM_STRATEGY.spaces,
        FILESYSTEM_STRATEGY.cloudinary
      ]
    }
  }
}
