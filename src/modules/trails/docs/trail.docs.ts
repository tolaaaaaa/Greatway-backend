import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

export const FindAllTrailsSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all trails',
      description: 'Retrieves a paginated list of audit trails (read-only)',
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
      description: 'Paginated list of trails',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                description: { type: 'string' },
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

export const FindOneTrailSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get trail by ID',
      description: 'Retrieves a single audit trail by its UUID (read-only)',
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: String,
      format: 'uuid',
      description: 'Trail UUID',
    }),
    ApiOkResponse({
      description: 'Trail found',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Trail not found',
    }),
  );