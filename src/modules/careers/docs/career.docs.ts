import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateCareerDto } from '../dto/create-career.dto';
import { UpdateCareerDto } from '../dto/update-career.dto';

export const CreateCareerSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new career',
      description: 'Creates a new job posting',
    }),
    ApiBody({
      type: CreateCareerDto,
    }),
    ApiCreatedResponse({
      description: 'Career created successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          employmentType: {
            type: 'string',
            enum: ['on-site', 'remote', 'hybrid'],
          },
          location: { type: 'string' },
          status: {
            type: 'string',
            enum: ['open', 'closed', 'draft'],
          },
          companyName: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiConflictResponse({
      description: 'Job title already exists',
    }),
    ApiBadRequestResponse({
      description: 'Validation failed',
    }),
  );

export const FindAllCareersSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all careers',
      description:
        'Retrieves a paginated list of careers with optional filters',
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
      name: 'status',
      required: false,
      type: String,
      enum: ['open', 'closed', 'draft'],
      description: 'Filter by status',
    }),
    ApiQuery({
      name: 'employmentType',
      required: false,
      type: String,
      enum: ['on-site', 'remote', 'hybrid'],
      description: 'Filter by employment type',
    }),
    ApiQuery({
      name: 'location',
      required: false,
      type: String,
      description: 'Filter by location',
    }),
    ApiOkResponse({
      description: 'Paginated list of careers',
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
                description: { type: 'string' },
                employmentType: {
                  type: 'string',
                  enum: ['on-site', 'remote', 'hybrid'],
                },
                location: { type: 'string' },
                status: {
                  type: 'string',
                  enum: ['open', 'closed', 'draft'],
                },
                companyName: { type: 'string' },
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

export const FindOneCareerSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get career by ID',
      description: 'Retrieves a single career by its UUID',
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: String,
      format: 'uuid',
      description: 'Career UUID',
    }),
    ApiOkResponse({
      description: 'Career found',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          employmentType: {
            type: 'string',
            enum: ['on-site', 'remote', 'hybrid'],
          },
          location: { type: 'string' },
          status: {
            type: 'string',
            enum: ['open', 'closed', 'draft'],
          },
          companyName: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Career not found',
    }),
  );

export const UpdateCareerSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update career',
      description: 'Updates an existing career with partial data',
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: String,
      format: 'uuid',
      description: 'Career UUID',
    }),
    ApiBody({
      type: UpdateCareerDto,
    }),
    ApiOkResponse({
      description: 'Career updated successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          employmentType: {
            type: 'string',
            enum: ['on-site', 'remote', 'hybrid'],
          },
          location: { type: 'string' },
          status: {
            type: 'string',
            enum: ['open', 'closed', 'draft'],
          },
          companyName: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Career not found',
    }),
    ApiBadRequestResponse({
      description: 'Validation failed',
    }),
  );

export const DeleteCareerSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete career',
      description: 'Deletes a career posting',
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: String,
      format: 'uuid',
      description: 'Career UUID',
    }),
    ApiOkResponse({
      description: 'Career deleted successfully',
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
      description: 'Career not found',
    }),
  );