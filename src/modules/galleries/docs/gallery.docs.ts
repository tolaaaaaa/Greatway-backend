import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { CreateGalleryDto } from '../dto/create-gallery.dto';
import { UpdateGalleryDto } from '../dto/update-gallery.dto';

export const CreateGallerySwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new gallery image',
      description: 'Uploads a new image to the gallery',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Gallery image data',
      type: CreateGalleryDto,
    }),
    ApiCreatedResponse({
      description: 'Gallery image created successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          imageUrl: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Validation failed',
    }),
  );

export const FindAllGalleriesSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all gallery images',
      description: 'Retrieves a paginated list of gallery images',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (default: 1)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page (default: 10)',
    }),
    ApiOkResponse({
      description: 'Paginated list of gallery images',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                imageUrl: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          total: { type: 'number' },
          page: { type: 'number' },
          limit: { type: 'number' },
          totalPages: { type: 'number' },
          hasNextPage: { type: 'boolean' },
          hasPreviousPage: { type: 'boolean' },
        },
      },
    }),
  );

export const FindOneGallerySwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get gallery image by ID',
      description: 'Retrieves a single gallery image by its UUID',
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: String,
      format: 'uuid',
      description: 'Gallery UUID',
    }),
    ApiOkResponse({
      description: 'Gallery image found',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          imageUrl: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Gallery image not found',
    }),
  );

export const UpdateGallerySwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update gallery image',
      description: 'Updates an existing gallery image URL',
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: String,
      format: 'uuid',
      description: 'Gallery UUID',
    }),
    ApiBody({
      type: UpdateGalleryDto,
    }),
    ApiOkResponse({
      description: 'Gallery image updated successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          imageUrl: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Gallery image not found',
    }),
    ApiBadRequestResponse({
      description: 'Validation failed',
    }),
  );

export const DeleteGallerySwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete gallery image',
      description: 'Deletes a gallery image',
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: String,
      format: 'uuid',
      description: 'Gallery UUID',
    }),
    ApiOkResponse({
      description: 'Gallery image deleted successfully',
      schema: {
        type: 'object',
        properties: {
          affected: {
            type: 'number',
            description: 'Number of records deleted',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Gallery image not found',
    }),
  );