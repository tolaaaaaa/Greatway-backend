import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GalleriesService } from './galleries.service';
import {
  CreateGalleryDto,
  createGallerySchema,
} from './dto/create-gallery.dto';
import {
  UpdateGalleryDto,
  updateGallerySchema,
} from './dto/update-gallery.dto';
import { NotFoundException } from 'src/exceptions/notfound.exception';
import { JoiValidationPipe } from 'src/validation/joi.validation';
import { imageFilter, memoryUpload } from 'src/config/multer.config';
import { FileSystemService } from 'src/services/filesystem/filesystem.service';
import { FileUploadDto } from 'src/services/filesystem/interfaces/filesystem.interface';
import {
  CreateGallerySwagger,
  FindAllGalleriesSwagger,
  FindOneGallerySwagger,
  UpdateGallerySwagger,
  DeleteGallerySwagger,
} from './docs/gallery.docs';
import { GalleryInterceptor } from './interceptor/gallery.interceptor';
import { GallerysInterceptor } from './interceptor/galleries.interceptor';
import type { IGallerysQuery } from './interface/query-filter';
import { BadReqException } from 'src/exceptions/badRequest.exception';
import { Public } from '../auth/decorators/public.decorator';

@Controller('galleries')
export class GalleriesController {
  constructor(
    private readonly galleriesService: GalleriesService,
    private readonly fileSystem: FileSystemService,
  ) {}

  @Post()
  @CreateGallerySwagger()
  @UseInterceptors(
    FileInterceptor('media', { ...memoryUpload, fileFilter: imageFilter }),
    GalleryInterceptor,
  )
  async create(
    @Body(new JoiValidationPipe(createGallerySchema))
    createGalleryDto: CreateGalleryDto,
    @UploadedFile() file: CustomFile,
  ) {
    if (!file) {
     throw new BadReqException("Media file is required")
    } 


     const fileDto: FileUploadDto = {
        destination: `images/gallery/${file.originalname}.${file.extension}`,
        mimetype: file.mimetype,
        buffer: file.buffer,
        filePath: file.path,
      };
      createGalleryDto.imageUrl = await this.fileSystem.upload(fileDto);


    return this.galleriesService.create(createGalleryDto);
  }

  @Get()
  @Public()
  @FindAllGalleriesSwagger()
  @UseInterceptors(GallerysInterceptor)
  findAll(@Query() query: IGallerysQuery) {
    return this.galleriesService.find(query);
  }

  @Get(':id')
  @UseInterceptors(GalleryInterceptor)
  @FindOneGallerySwagger()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const gallery = await this.galleriesService.findById(id);
    if (!gallery) throw new NotFoundException('Gallery image not found');
    return gallery;
  }

  @Patch(':id')
  @UpdateGallerySwagger()
  @UseInterceptors(
    FileInterceptor('image', { ...memoryUpload, fileFilter: imageFilter }),
    GalleryInterceptor,
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new JoiValidationPipe(updateGallerySchema))
    updateGalleryDto: UpdateGalleryDto,
    @UploadedFile() file: CustomFile,
  ) {
    const gallery = await this.galleriesService.findById(id);
    if (!gallery) throw new NotFoundException('Gallery image not found');

    if (file) {
      // Delete old image
      await this.fileSystem.delete(gallery.imageUrl);

      // Upload new image
      const fileDto: FileUploadDto = {
        destination: `images/gallery/${file.originalname}.${file.extension}`,
        mimetype: file.mimetype,
        buffer: file.buffer,
        filePath: file.path,
      };
      updateGalleryDto.imageUrl = await this.fileSystem.upload(fileDto);
    }

    return this.galleriesService.update(gallery, updateGalleryDto);
  }

  @Delete(':id')
  @DeleteGallerySwagger()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const gallery = await this.galleriesService.findById(id);
    if (!gallery) throw new NotFoundException('Gallery image not found');

    // Delete image from storage
    await this.fileSystem.delete(gallery.imageUrl);

    return this.galleriesService.remove({ id });
  }
}
