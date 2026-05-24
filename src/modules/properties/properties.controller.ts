import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
  ParseUUIDPipe,
  Query,
  Req,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import {
  CreatePropertyDto,
  createPropertySchema,
} from './dto/create-property.dto';
import {
  UpdatePropertyDto,
  updatePropertySchema,
} from './dto/update-property.dto';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { FileSystemService } from 'src/services/filesystem/filesystem.service';
import { NotFoundException } from 'src/exceptions/notfound.exception';
import { JoiValidationPipe } from 'src/validation/joi.validation';
import type { IPropertiesQuery } from './interface/query-filter.interface';
import {
  imageFilter,
  mediaFilter,
  memoryUpload,
} from 'src/config/multer.config';
import { FileUploadDto } from 'src/services/filesystem/interfaces/filesystem.interface';
import { PropertyFeaturesService } from '../property-features/property-features.service';
import {
  CreatePropertySwagger,
  DeletePropertySwagger,
  FindAllPropertiesSwagger,
  UpdatePropertySwagger,
} from './docs/properties.docs';
import { PropertiessInterceptor } from './interceptor/properties.interceptor';
import { TrailsService } from '../trails/trails.service';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { PropertyInterceptor } from './interceptor/property.interceptor';
import { Public } from '../auth/decorators/public.decorator';

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly fileSystem: FileSystemService,
    private readonly propertyFeaturesService: PropertyFeaturesService,
    private readonly trailsService: TrailsService,
  ) {}

  @Post()
  @CreatePropertySwagger()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 4 },
        { name: 'video', maxCount: 1 },
        { name: 'salesImage', maxCount: 1 },
      ],
      {
        ...memoryUpload,
        fileFilter: mediaFilter,
      },
    ),
    PropertyInterceptor,
  )
  async create(
    @Body(new JoiValidationPipe(createPropertySchema))
    createPropertyDto: CreatePropertyDto,
    @UploadedFiles()
    files: {
      images?: CustomFile[];
      video?: CustomFile[];
      salesImage?: CustomFile[];
    },
    @Req() req: Request & { user: User },
  ) {
    const user = req.user;

    const imageUrls = await Promise.all(
      (files.images ?? []).map((image) => {
        const fileDto: FileUploadDto = {
          destination: `images/properties/${image.originalname}.${image.extension}`,
          mimetype: image.mimetype,
          buffer: image.buffer,
          filePath: image.path,
        };
        return this.fileSystem.upload(fileDto);
      }),
    );

    const videoFile = files.video?.[0];
    const videoUrl = videoFile
      ? await this.fileSystem.upload({
          destination: `videos/properties/${videoFile.originalname}.${videoFile.extension}`,
          mimetype: videoFile.mimetype,
          buffer: videoFile.buffer,
          filePath: videoFile.path,
        })
      : undefined;

    const salesImagesFile = files.salesImage?.[0];
    const salesImage = salesImagesFile
      ? await this.fileSystem.upload({
          destination: `videos/properties/${salesImagesFile.originalname}.${salesImagesFile.extension}`,
          mimetype: salesImagesFile.mimetype,
          buffer: salesImagesFile.buffer,
          filePath: salesImagesFile.path,
        })
      : undefined;

    const properties = await this.propertiesService.create({
      ...createPropertyDto,
      imageUrls,
      ...(videoUrl && { videoUrl }),
      ...(salesImage && { saleSupportAvatar: salesImage }),
    });

    await this.trailsService.create(
      `${user.fullName} created a new property called ${properties.title}`,
    );

    return properties;
  }

  @Get()
  @Public()
  @FindAllPropertiesSwagger()
  @UseInterceptors(PropertiessInterceptor)
  async findAll(@Query() query: IPropertiesQuery) {
    return await this.propertiesService.find(query);
  }

  @Get(':id')
  @Public()
  @UseInterceptors(PropertyInterceptor)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const property = await this.propertiesService.findById(id);
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  @Patch(':id')
  @UpdatePropertySwagger()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 4 },
        { name: 'video', maxCount: 1 },
        { name: 'salesImage', maxCount: 1 },
      ],
      { ...memoryUpload, fileFilter: mediaFilter },
    ),
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new JoiValidationPipe(updatePropertySchema))
    updatePropertyDto: UpdatePropertyDto,
    @UploadedFiles()
    files: { images?: CustomFile[]; video?: CustomFile[], salesImage?: CustomFile[] },
  ) {
    const property = await this.propertiesService.findById(id);
    if (!property) throw new NotFoundException('Property not found');

    // ── Images ──────────────────────────────────────────────────────────────────
    if (files.images?.length) {
      const newImageUrls = await Promise.all(
        files.images.map((image) => {
          const fileDto: FileUploadDto = {
            destination: `images/properties/${image.originalname}.${image.extension}`,
            mimetype: image.mimetype,
            buffer: image.buffer,
            filePath: image.path,
          };
          return this.fileSystem.upload(fileDto);
        }),
      );

      updatePropertyDto.imageUrls = [
        ...(updatePropertyDto.imageUrls || []),
        ...newImageUrls,
      ];
    }

    // ── Video ───────────────────────────────────────────────────────────────────
    const videoFile = files.video?.[0];
    if (videoFile) {
      // Upload first — only delete the old video if the upload succeeds
      const newVideoUrl = await this.fileSystem.upload({
        destination: `videos/properties/${videoFile.originalname}.${videoFile.extension}`,
        mimetype: videoFile.mimetype,
        buffer: videoFile.buffer,
        filePath: videoFile.path,
      });

      if (property.videoUrl) {
        await this.fileSystem.delete(property.videoUrl).catch((err) => {
          console.warn('Could not delete old property video:', err);
        });
      }

      updatePropertyDto.videoUrl = newVideoUrl;
    }

    const salesImageFile = files.salesImage?.[0];
    if (salesImageFile) {
      const newSalesImageUrl = await this.fileSystem.upload({
        destination: `images/properties/${salesImageFile.originalname}.${salesImageFile.extension}`,
        mimetype: salesImageFile.mimetype,
        buffer: salesImageFile.buffer,
        filePath: salesImageFile.path,
      });
      updatePropertyDto.saleSupportAvatar = newSalesImageUrl;
      if (property.saleSupportAvatar) {
        await this.fileSystem
          .delete(property.saleSupportAvatar)
          .catch((err) => {
            console.warn('Could not delete old sales support image:', err);
          });
      }
    }

    return this.propertiesService.update(property, updatePropertyDto);
  }

  @Patch('/:id/status')
  async updatedStatus(
    @Body(new JoiValidationPipe(updatePropertySchema))
    updatePropertyDto: UpdatePropertyDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: User },
  ) {
    const user = req.user;
    const property = await this.propertiesService.findById(id);
    if (!property) throw new NotFoundException('Property does not exist');

    const update = await this.propertiesService.update(property, {
      status: updatePropertyDto.status,
    });

    await this.trailsService.create(
      `${user.fullName} updated ${property.title} to ${updatePropertyDto.status}`,
    );

    return update;
  }

  @Delete(':id')
  @DeletePropertySwagger()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: User },
  ) {
    const property = await this.propertiesService.findById(id);
    if (!property) throw new NotFoundException('Property not found');
    const user = req.user;

    await Promise.all(
      [
        ...property.imageUrls.map((image) => this.fileSystem.delete(image)),
        property.videoUrl && this.fileSystem.delete(property.videoUrl),
        property.saleSupportAvatar &&
          this.fileSystem.delete(property.saleSupportAvatar),
      ].filter(Boolean),
    );

    const deletedProperty = await this.propertiesService.remove({ id });
    await this.trailsService.create(
      `${user.fullName} deleted a property named ${property.title}`,
    );
    return deletedProperty;
  }
}
