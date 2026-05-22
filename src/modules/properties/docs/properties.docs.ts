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
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';

export const CreatePropertySwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new property',
      description: 'Creates a new property with images and features',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Property data with images',
      type: CreatePropertyDto,
    }),
    ApiCreatedResponse({
      description: 'Property created successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          salesPrice: { type: 'string' },
          location: { type: 'string' },
          description: { type: 'string' },
          imageUrls: { type: 'array', items: { type: 'string' } },
          features: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                description: { type: 'string' },
                icon: { type: 'string', nullable: true },
              },
            },
          },
          videoUrl: { type: 'string' },
          supportInCharge: { type: 'string' },
          whatsAppNumber: { type: 'string' },
          altNumber: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Validation failed',
    }),
  );

export const FindAllPropertiesSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all properties',
      description: 'Retrieves a paginated list of properties with optional location filter',
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
    ApiQuery({
      name: 'location',
      required: false,
      type: String,
      description: 'Filter by location',
    }),
    ApiOkResponse({
      description: 'Paginated list of properties',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                salesPrice: { type: 'string' },
                location: { type: 'string' },
                description: { type: 'string' },
                imageUrls: { type: 'array', items: { type: 'string' } },
                features: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      description: { type: 'string' },
                      icon: { type: 'string', nullable: true },
                    },
                  },
                },
                videoUrl: { type: 'string' },
                supportInCharge: { type: 'string' },
                whatsAppNumber: { type: 'string' },
                altNumber: { type: 'string' },
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

export const FindOnePropertySwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get property by ID',
      description: 'Retrieves a single property by its UUID',
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: String,
      format: 'uuid',
      description: 'Property UUID',
    }),
    ApiOkResponse({
      description: 'Property found',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          salesPrice: { type: 'string' },
          location: { type: 'string' },
          description: { type: 'string' },
          imageUrls: { type: 'array', items: { type: 'string' } },
          features: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                description: { type: 'string' },
                icon: { type: 'string', nullable: true },
              },
            },
          },
          videoUrl: { type: 'string' },
          supportInCharge: { type: 'string' },
          whatsAppNumber: { type: 'string' },
          altNumber: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Property not found',
    }),
  );

export const UpdatePropertySwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update property',
      description: 'Updates an existing property with partial data',
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: String,
      format: 'uuid',
      description: 'Property UUID',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Property data to update',
      type: UpdatePropertyDto,
    }),
    ApiOkResponse({
      description: 'Property updated successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          salesPrice: { type: 'string' },
          location: { type: 'string' },
          description: { type: 'string' },
          imageUrls: { type: 'array', items: { type: 'string' } },
          features: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                description: { type: 'string' },
                icon: { type: 'string', nullable: true },
              },
            },
          },
          videoUrl: { type: 'string' },
          supportInCharge: { type: 'string' },
          whatsAppNumber: { type: 'string' },
          altNumber: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Property not found',
    }),
    ApiBadRequestResponse({
      description: 'Validation failed',
    }),
  );

export const DeletePropertySwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete property',
      description: 'Deletes a property and its associated images',
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: String,
      format: 'uuid',
      description: 'Property UUID',
    }),
    ApiOkResponse({
      description: 'Property deleted successfully',
      schema: {
        type: 'object',
        properties: {
          affected: { type: 'number', description: 'Number of records deleted' },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Property not found',
    }),
  );