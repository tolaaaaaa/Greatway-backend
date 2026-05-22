import { Global, Module } from "@nestjs/common";
import { UtilsModule } from "./utils/utils.module";
import { PaginationModule, PaginationService } from "./pagination";
import { FileSystemModule } from "./filesystem/filesystem.module";
import { FileSystemService } from "./filesystem/filesystem.service";
import { fileConfigAsync } from "src/config/filesystems.config";

@Global()
@Module({
    imports: [UtilsModule, PaginationModule,  FileSystemModule.registerAsync(fileConfigAsync)],
    providers: [PaginationService],
    exports: [UtilsModule, PaginationService, FileSystemModule]
})
export class ServicesModule {}