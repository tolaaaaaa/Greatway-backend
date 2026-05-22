Here's the streamlined version:

```markdown
# AGENT.md

## Project Overview

This is a **NestJS monolith** with feature modules, backed by **TypeORM** (PostgreSQL),
**Socket.IO** for real-time features, **Firebase** for file storage, **Redis** for
caching/OTP flows, and **Agora/Mux** for livestreaming.

All modules follow the standard NestJS architecture with services, controllers, 
interceptors for response shaping, and global services from `src/services/`.

---

## Architecture: Standard NestJS Module Pattern

Every module follows this structure:

```
src/modules/<module-name>/
├── docs/
│   └── <module-name>.docs.ts          ← ALL Swagger decorators via applyDecorators()
├── dto/
│   ├── create-<module-name>.dto.ts
│   ├── update-<module-name>.dto.ts
│   └── <module-name>-response.dto.ts
├── entities/
│   └── <module-name>.entity.ts        ← TypeORM @Entity()
├── interface/
│   ├── <module-name>-response.interface.ts
│   ├── <module-name>-response-mapper.interface.ts   ← abstract class with transform()
│   ├── <module-name>s-response.interface.ts         ← type alias for PaginatedResult<I...Response>
│   └── query-filter.interface.ts
├── interceptors/
│   ├── <module-name>.interceptor.ts    ← single item: extends mapper, implements NestInterceptor
│   └── <module-name>s.interceptor.ts  ← list: extends mapper, injects PaginationService, paginates
├── <module-name>.controller.ts
├── <module-name>.service.ts
└── <module-name>.module.ts
```

### Key Rules

**Service** injects TypeORM repositories via `@InjectRepository(Entity)`. 
`findAll`/`find` returns `[items, total]` as a tuple — the list interceptor handles
pagination shaping via `PaginationService`.

**Validation** uses Joi schemas co-located in the DTO file, applied via `JoiValidationPipe` directly on `@Body()`:
```typescript
@Post()
@UseInterceptors(PropertyInterceptor)
async create(@Body(new JoiValidationPipe(createPropertySchema)) dto: CreatePropertyDto) {}
```

**Interceptors** extend the abstract mapper class and implement `NestInterceptor`:
- Single-item interceptors call `this.transform(data)` → returns mapped response
- List interceptors inject `PaginationService`, read `page`/`limit` from `request.query`,
  and call `this.paginationService.paginate(data, total, { page, limit })`

**Controller** methods are decorated with:
1. Auth/guard/interceptor decorators
2. A single Swagger decorator imported from `docs/`
3. No `@ApiOperation`, `@ApiResponse`, or any raw Swagger decorator inline

---

## Global Services

All global services live under `src/services/` and are registered in `ServicesModule`:

```typescript
@Global()
@Module({
    imports: [UtilsModule, PaginationModule, FileSystemModule.registerAsync(fileConfigAsync)],
    providers: [PaginationService],
    exports: [UtilsModule, PaginationService, FileSystemModule]
})
export class ServicesModule {}
```

| Service | Import Path | What It Provides |
|---|---|---|
| Pagination | `src/services/pagination` | `PaginationService`, `PaginatedResult<T>`, `PaginationParams` |
| FileSystem | `src/services/filesystem` | `FileSystemService`, `FileUploadDto` |
| Utils | `src/services/utils` | Utility functions |

---

## Response Shape Reference

### Single Item

Controller returns entity directly. Interceptor transforms via mapper:
```typescript
// Controller
@Get(':id')
@UseInterceptors(PropertyInterceptor)
async findOne(@Param('id') id: string) {
  return await this.propertiesService.findById(id);
}

// Interceptor transforms to IPropertyResponse shape
```

### Paginated List

```typescript
// Controller
@Get()
@UseInterceptors(PropertiessInterceptor)
async findAll(@Query() query: IPropertiesQuery) {
  return await this.propertiesService.find(query);
}

// Service returns [items, total]
// Interceptor returns:
{
  data: T[],
  total: number,
  page: number,
  limit: number,
  totalPages: number,
  hasNextPage: boolean,
  hasPreviousPage: boolean
}
```

---

## Naming Conventions — STRICTLY ENFORCED

| Context | Convention | Examples |
|---|---|---|
| TypeORM entity columns | `camelCase` | `salesPrice`, `imageUrls`, `whatsAppNumber` |
| DTOs, interfaces, response objects | `camelCase` | `salesPrice`, `imageUrls`, `whatsAppNumber` |
| File names | `kebab-case` | `create-property.dto.ts`, `property-response.interface.ts` |

---

## File Naming Conventions

```
# Module files (all kebab-case)
<module>.controller.ts
<module>.service.ts
<module>.module.ts
<module>.entity.ts
create-<module>.dto.ts
update-<module>.dto.ts
<module>-response.dto.ts
<module>-response.interface.ts
<module>-response-mapper.interface.ts
<module>s-response.interface.ts
query-filter.interface.ts
<module>.interceptor.ts
<module>s.interceptor.ts
<module>.docs.ts
```

---

## Swagger / API Documentation — STRICTLY ENFORCED

**No Swagger decorator is ever written directly on a controller method.**

All Swagger documentation lives in a `docs/` file at the module root:
```typescript
// docs/properties.docs.ts
export const CreatePropertySwagger = () =>
  applyDecorators(
    ApiOperation({ summary: "Create a new property" }),
    ApiBody({ type: CreatePropertyDto }),
    ApiCreatedResponse({ type: PropertyResponseDto }),
  );

export const FindAllPropertiesSwagger = () =>
  applyDecorators(
    ApiOperation({ summary: "Get all properties" }),
    ApiQuery({ name: 'page', required: false }),
    ApiQuery({ name: 'limit', required: false }),
    ApiOkResponse({ type: PaginatedPropertyResponseDto }),
  );
```

Controller usage:
```typescript
@Post()
@CreatePropertySwagger()
@UseInterceptors(PropertyInterceptor)
async create(@Body(...) dto: CreatePropertyDto) {}
```

---

## Barrel Files (`index.ts`) — REQUIRED

Every folder boundary must have an `index.ts`:
```typescript
// interface/index.ts
export * from './property-response.interface';
export * from './property-response-mapper.interface';
export * from './propertys-response.interface';
export * from './query-filter.interface';
```

---

## Common Violation Checklist

- [ ] `snake_case` in DTOs, interfaces, or entities → **fix to camelCase**
- [ ] Raw array/tuple returned from list endpoint → **add list interceptor with PaginationService**
- [ ] Swagger decorators on controller methods → **move to docs/ file**
- [ ] Missing barrel files → **add index.ts at folder boundaries**
- [ ] Missing interceptors on GET endpoints → **add single & list interceptors**
- [ ] `console.log` in production code → **remove or replace with Logger**
- [ ] Direct file paths in imports → **use barrel imports**
```

---