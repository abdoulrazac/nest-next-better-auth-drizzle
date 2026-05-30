# Plan 3 — Backend Domains

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter les 4 modules domaines restants du backend : Notifications, Files/S3, Settings et Webhooks.

**Architecture:** Chaque module suit le même pattern : Repository (Drizzle) → Service (logique métier) → Controller (endpoints REST + RBAC). Files utilise un `S3Service` dédié pour les presigned URLs (pas de multipart). Webhooks inclut un `WebhookDeliveryService` qui effectue les appels HTTP et enregistre les résultats en DB. Settings se pré-peuple au démarrage via `OnApplicationBootstrap`.

**Tech Stack:** NestJS 11, Fastify, Drizzle ORM (`@repo/db`), `@repo/validators`, `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, `@nestjs/axios`, `@thallesp/nestjs-better-auth`, `@nestjs/swagger`

---

## Fichiers créés ou modifiés

### Notifications

- Créer : `apps/backend/src/modules/notifications/notifications.repository.ts`
- Créer : `apps/backend/src/modules/notifications/notifications.service.ts`
- Créer : `apps/backend/src/modules/notifications/notifications.controller.ts`
- Créer : `apps/backend/src/modules/notifications/notifications.module.ts`

### Files / S3

- Créer : `apps/backend/src/modules/files/s3.service.ts`
- Créer : `apps/backend/src/modules/files/files.repository.ts`
- Créer : `apps/backend/src/modules/files/files.service.ts`
- Créer : `apps/backend/src/modules/files/files.controller.ts`
- Créer : `apps/backend/src/modules/files/files.module.ts`

### Settings

- Créer : `apps/backend/src/modules/settings/settings.repository.ts`
- Créer : `apps/backend/src/modules/settings/settings.service.ts`
- Créer : `apps/backend/src/modules/settings/settings.controller.ts`
- Créer : `apps/backend/src/modules/settings/settings.module.ts`

### Webhooks

- Créer : `apps/backend/src/modules/webhooks/webhooks.repository.ts`
- Créer : `apps/backend/src/modules/webhooks/webhook-delivery.service.ts`
- Créer : `apps/backend/src/modules/webhooks/webhooks.service.ts`
- Créer : `apps/backend/src/modules/webhooks/webhooks.controller.ts`
- Créer : `apps/backend/src/modules/webhooks/webhooks.module.ts`

### Root

- Modifier : `apps/backend/src/app.module.ts`

---

## Task 1 : Module Notifications

**Files:**

- Créer : `apps/backend/src/modules/notifications/notifications.repository.ts`
- Créer : `apps/backend/src/modules/notifications/notifications.service.ts`
- Créer : `apps/backend/src/modules/notifications/notifications.controller.ts`
- Créer : `apps/backend/src/modules/notifications/notifications.module.ts`

- [ ] **Step 1 : Créer `notifications.repository.ts`**

```typescript
// apps/backend/src/modules/notifications/notifications.repository.ts
import { Injectable } from "@nestjs/common";
import { db, notification } from "@repo/db";
import { eq, and, count, inArray } from "drizzle-orm";

@Injectable()
export class NotificationsRepository {
  async findAllForUser(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const where = eq(notification.userId, userId);

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(notification)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(notification.createdAt),
      db.select({ total: count() }).from(notification).where(where),
    ]);

    return { items, total, page, limit };
  }

  async markAsRead(userId: string, ids: string[]) {
    return db
      .update(notification)
      .set({ read: true, readAt: new Date() })
      .where(
        and(eq(notification.userId, userId), inArray(notification.id, ids)),
      )
      .returning();
  }

  async markAllAsRead(userId: string) {
    return db
      .update(notification)
      .set({ read: true, readAt: new Date() })
      .where(and(eq(notification.userId, userId), eq(notification.read, false)))
      .returning();
  }

  async delete(userId: string, id: string) {
    const [deleted] = await db
      .delete(notification)
      .where(and(eq(notification.id, id), eq(notification.userId, userId)))
      .returning();
    return deleted ?? null;
  }

  async countUnread(userId: string) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(notification)
      .where(
        and(eq(notification.userId, userId), eq(notification.read, false)),
      );
    return total;
  }
}
```

- [ ] **Step 2 : Créer `notifications.service.ts`**

```typescript
// apps/backend/src/modules/notifications/notifications.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { NotificationsRepository } from "./notifications.repository";
import type { MarkAsReadInput } from "@repo/validators/notifications";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  findAll(userId: string, page: number, limit: number) {
    return this.notificationsRepository.findAllForUser(userId, page, limit);
  }

  countUnread(userId: string) {
    return this.notificationsRepository.countUnread(userId);
  }

  markAsRead(userId: string, input: MarkAsReadInput) {
    return this.notificationsRepository.markAsRead(userId, input.ids);
  }

  markAllAsRead(userId: string) {
    return this.notificationsRepository.markAllAsRead(userId);
  }

  async delete(userId: string, id: string) {
    const deleted = await this.notificationsRepository.delete(userId, id);
    if (!deleted) throw new NotFoundException(`Notification ${id} not found`);
    return deleted;
  }
}
```

- [ ] **Step 3 : Créer `notifications.controller.ts`**

```typescript
// apps/backend/src/modules/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UserHasPermission } from "@thallesp/nestjs-better-auth";
import { NotificationsService } from "./notifications.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AuditLogInterceptor } from "../../common/interceptors/audit-log.interceptor";
import {
  markAsReadSchema,
  type MarkAsReadInput,
} from "@repo/validators/notifications";

@ApiTags("notifications")
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: "notifications", version: "1" })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List my notifications" })
  @UserHasPermission({ permission: { notifications: ["read"] } })
  findAll(
    @CurrentUser() user: { id: string },
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    return this.notificationsService.findAll(
      user.id,
      Number(page),
      Number(limit),
    );
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Count unread notifications" })
  @UserHasPermission({ permission: { notifications: ["read"] } })
  countUnread(@CurrentUser() user: { id: string }) {
    return this.notificationsService.countUnread(user.id);
  }

  @Post("mark-read")
  @ApiOperation({ summary: "Mark specific notifications as read" })
  @UserHasPermission({ permission: { notifications: ["read"] } })
  markAsRead(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(markAsReadSchema)) body: MarkAsReadInput,
  ) {
    return this.notificationsService.markAsRead(user.id, body);
  }

  @Post("mark-all-read")
  @ApiOperation({ summary: "Mark all notifications as read" })
  @UserHasPermission({ permission: { notifications: ["read"] } })
  markAllAsRead(@CurrentUser() user: { id: string }) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a notification" })
  @UserHasPermission({ permission: { notifications: ["manage"] } })
  remove(
    @CurrentUser() user: { id: string },
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.delete(user.id, id);
  }
}
```

- [ ] **Step 4 : Créer `notifications.module.ts`**

```typescript
// apps/backend/src/modules/notifications/notifications.module.ts
import { Module } from "@nestjs/common";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { NotificationsRepository } from "./notifications.repository";

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

- [ ] **Step 5 : Vérifier les types**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/backend && bunx tsc --noEmit
```

- [ ] **Step 6 : Commit**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle
git add apps/backend/src/modules/notifications/
git commit -m "feat(backend): add notifications module"
```

---

## Task 2 : Module Files / S3

**Files:**

- Créer : `apps/backend/src/modules/files/s3.service.ts`
- Créer : `apps/backend/src/modules/files/files.repository.ts`
- Créer : `apps/backend/src/modules/files/files.service.ts`
- Créer : `apps/backend/src/modules/files/files.controller.ts`
- Créer : `apps/backend/src/modules/files/files.module.ts`

- [ ] **Step 1 : Créer `s3.service.ts`**

```typescript
// apps/backend/src/modules/files/s3.service.ts
import { Injectable } from "@nestjs/common";
import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env";

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = env.S3_BUCKET;
    this.client = new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
      forcePathStyle: true,
    });
  }

  async getPresignedUploadUrl(key: string, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });
    return getSignedUrl(this.client, command, { expiresIn: 900 });
  }

  getPublicUrl(key: string): string {
    return `${env.S3_ENDPOINT}/${this.bucket}/${key}`;
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async objectExists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 2 : Créer `files.repository.ts`**

```typescript
// apps/backend/src/modules/files/files.repository.ts
import { Injectable } from "@nestjs/common";
import { db, file } from "@repo/db";
import { eq, ilike, count, and, type SQL } from "drizzle-orm";
import type { FileQuery } from "@repo/validators/files";

@Injectable()
export class FilesRepository {
  async findAll(query: FileQuery) {
    const { page, limit, mimeType } = query;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (mimeType) conditions.push(ilike(file.mimeType, `${mimeType}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(file)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(file.createdAt),
      db.select({ total: count() }).from(file).where(where),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string) {
    const [found] = await db.select().from(file).where(eq(file.id, id));
    return found ?? null;
  }

  async create(data: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    bucket: string;
    key: string;
    url: string;
    uploadedBy?: string | null;
  }) {
    const [created] = await db.insert(file).values(data).returning();
    return created;
  }

  async delete(id: string) {
    const [deleted] = await db.delete(file).where(eq(file.id, id)).returning();
    return deleted ?? null;
  }
}
```

- [ ] **Step 3 : Créer `files.service.ts`**

```typescript
// apps/backend/src/modules/files/files.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { S3Service } from "./s3.service";
import { FilesRepository } from "./files.repository";
import type { FileQuery } from "@repo/validators/files";
import { env } from "../../config/env";

@Injectable()
export class FilesService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly filesRepository: FilesRepository,
  ) {}

  async getPresignedUploadUrl(
    originalName: string,
    mimeType: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    const ext = originalName.split(".").pop() ?? "bin";
    const key = `uploads/${randomUUID()}.${ext}`;
    const uploadUrl = await this.s3Service.getPresignedUploadUrl(key, mimeType);
    return { uploadUrl, key };
  }

  async confirmUpload(
    userId: string,
    data: {
      key: string;
      originalName: string;
      mimeType: string;
      size: number;
    },
  ) {
    const exists = await this.s3Service.objectExists(data.key);
    if (!exists) {
      throw new BadRequestException(
        `File not found in storage. Upload to the presigned URL first.`,
      );
    }

    const url = this.s3Service.getPublicUrl(data.key);
    const filename = data.key.split("/").pop() ?? data.key;

    return this.filesRepository.create({
      filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      bucket: env.S3_BUCKET,
      key: data.key,
      url,
      uploadedBy: userId,
    });
  }

  findAll(query: FileQuery) {
    return this.filesRepository.findAll(query);
  }

  async findById(id: string) {
    const found = await this.filesRepository.findById(id);
    if (!found) throw new NotFoundException(`File ${id} not found`);
    return found;
  }

  async delete(id: string) {
    const found = await this.findById(id);
    await this.s3Service.deleteObject(found.key);
    return this.filesRepository.delete(id);
  }
}
```

- [ ] **Step 4 : Créer `files.controller.ts`**

```typescript
// apps/backend/src/modules/files/files.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UserHasPermission } from "@thallesp/nestjs-better-auth";
import { FilesService } from "./files.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AuditLogInterceptor } from "../../common/interceptors/audit-log.interceptor";
import { fileQuerySchema, type FileQuery } from "@repo/validators/files";
import { z } from "zod";

const presignedUrlRequestSchema = z.object({
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
});

const confirmUploadSchema = z.object({
  key: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
});

type PresignedUrlRequest = z.infer<typeof presignedUrlRequestSchema>;
type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;

@ApiTags("files")
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: "files", version: "1" })
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ApiOperation({ summary: "List files" })
  @UserHasPermission({ permission: { files: ["read"] } })
  findAll(@Query(new ZodValidationPipe(fileQuerySchema)) query: FileQuery) {
    return this.filesService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get file by id" })
  @UserHasPermission({ permission: { files: ["read"] } })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.filesService.findById(id);
  }

  @Post("presigned-url")
  @ApiOperation({ summary: "Get presigned upload URL" })
  @UserHasPermission({ permission: { files: ["upload"] } })
  getPresignedUrl(
    @Body(new ZodValidationPipe(presignedUrlRequestSchema))
    body: PresignedUrlRequest,
  ) {
    return this.filesService.getPresignedUploadUrl(
      body.originalName,
      body.mimeType,
    );
  }

  @Post("confirm")
  @ApiOperation({ summary: "Confirm upload and register file metadata" })
  @UserHasPermission({ permission: { files: ["upload"] } })
  confirmUpload(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(confirmUploadSchema)) body: ConfirmUploadInput,
  ) {
    return this.filesService.confirmUpload(user.id, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete file" })
  @UserHasPermission({ permission: { files: ["delete"] } })
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.filesService.delete(id);
  }
}
```

- [ ] **Step 5 : Créer `files.module.ts`**

```typescript
// apps/backend/src/modules/files/files.module.ts
import { Module } from "@nestjs/common";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { FilesRepository } from "./files.repository";
import { S3Service } from "./s3.service";

@Module({
  controllers: [FilesController],
  providers: [FilesService, FilesRepository, S3Service],
  exports: [S3Service, FilesService],
})
export class FilesModule {}
```

- [ ] **Step 6 : Vérifier les types**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/backend && bunx tsc --noEmit
```

- [ ] **Step 7 : Commit**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle
git add apps/backend/src/modules/files/
git commit -m "feat(backend): add files module with S3 presigned URL upload"
```

---

## Task 3 : Module Settings

**Files:**

- Créer : `apps/backend/src/modules/settings/settings.repository.ts`
- Créer : `apps/backend/src/modules/settings/settings.service.ts`
- Créer : `apps/backend/src/modules/settings/settings.controller.ts`
- Créer : `apps/backend/src/modules/settings/settings.module.ts`

- [ ] **Step 1 : Créer `settings.repository.ts`**

```typescript
// apps/backend/src/modules/settings/settings.repository.ts
import { Injectable } from "@nestjs/common";
import { db, appSetting, userPreference } from "@repo/db";
import { eq } from "drizzle-orm";

@Injectable()
export class SettingsRepository {
  async findAllAppSettings() {
    return db.select().from(appSetting).orderBy(appSetting.key);
  }

  async findAppSetting(key: string) {
    const [found] = await db
      .select()
      .from(appSetting)
      .where(eq(appSetting.key, key));
    return found ?? null;
  }

  async upsertAppSetting(key: string, value: string) {
    const [result] = await db
      .insert(appSetting)
      .values({ key, value })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  async findUserPreference(userId: string) {
    const [found] = await db
      .select()
      .from(userPreference)
      .where(eq(userPreference.userId, userId));
    return found ?? null;
  }

  async upsertUserPreference(
    userId: string,
    data: { theme?: string; language?: string; timezone?: string },
  ) {
    const [result] = await db
      .insert(userPreference)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: userPreference.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return result;
  }
}
```

- [ ] **Step 2 : Créer `settings.service.ts`**

```typescript
// apps/backend/src/modules/settings/settings.service.ts
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { SettingsRepository } from "./settings.repository";
import type { AppSettings, UserPreferences } from "@repo/validators/settings";

const DEFAULT_APP_SETTINGS: AppSettings = {
  appName: "Enterprise App",
  supportEmail: "support@example.com",
  maintenanceMode: false,
};

@Injectable()
export class SettingsService implements OnApplicationBootstrap {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async onApplicationBootstrap() {
    for (const [key, value] of Object.entries(DEFAULT_APP_SETTINGS)) {
      const existing = await this.settingsRepository.findAppSetting(key);
      if (!existing) {
        await this.settingsRepository.upsertAppSetting(
          key,
          JSON.stringify(value),
        );
      }
    }
  }

  async getAppSettings(): Promise<AppSettings> {
    const rows = await this.settingsRepository.findAllAppSettings();
    const raw = Object.fromEntries(
      rows.map((r) => {
        try {
          return [r.key, JSON.parse(r.value)];
        } catch {
          return [r.key, r.value];
        }
      }),
    );
    return raw as AppSettings;
  }

  async updateAppSettings(data: Partial<AppSettings>) {
    for (const [key, value] of Object.entries(data)) {
      await this.settingsRepository.upsertAppSetting(
        key,
        JSON.stringify(value),
      );
    }
    return this.getAppSettings();
  }

  async getUserPreferences(userId: string) {
    return (
      (await this.settingsRepository.findUserPreference(userId)) ?? {
        userId,
        theme: "system",
        language: "en",
        timezone: "UTC",
      }
    );
  }

  async updateUserPreferences(userId: string, data: UserPreferences) {
    return this.settingsRepository.upsertUserPreference(userId, data);
  }
}
```

- [ ] **Step 3 : Créer `settings.controller.ts`**

```typescript
// apps/backend/src/modules/settings/settings.controller.ts
import { Controller, Get, Patch, Body, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UserHasPermission } from "@thallesp/nestjs-better-auth";
import { SettingsService } from "./settings.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AuditLogInterceptor } from "../../common/interceptors/audit-log.interceptor";
import {
  appSettingsSchema,
  userPreferencesSchema,
  type AppSettings,
  type UserPreferences,
} from "@repo/validators/settings";

@ApiTags("settings")
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: "settings", version: "1" })
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get("app")
  @ApiOperation({ summary: "Get app settings" })
  @UserHasPermission({ permission: { settings: ["read"] } })
  getAppSettings() {
    return this.settingsService.getAppSettings();
  }

  @Patch("app")
  @ApiOperation({ summary: "Update app settings (admin only)" })
  @UserHasPermission({ permission: { settings: ["manage"] } })
  updateAppSettings(
    @Body(new ZodValidationPipe(appSettingsSchema.partial()))
    body: Partial<AppSettings>,
  ) {
    return this.settingsService.updateAppSettings(body);
  }

  @Get("preferences")
  @ApiOperation({ summary: "Get my preferences" })
  @UserHasPermission({ permission: { settings: ["read"] } })
  getPreferences(@CurrentUser() user: { id: string }) {
    return this.settingsService.getUserPreferences(user.id);
  }

  @Patch("preferences")
  @ApiOperation({ summary: "Update my preferences" })
  @UserHasPermission({ permission: { settings: ["read"] } })
  updatePreferences(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(userPreferencesSchema.partial()))
    body: Partial<UserPreferences>,
  ) {
    return this.settingsService.updateUserPreferences(
      user.id,
      body as UserPreferences,
    );
  }
}
```

- [ ] **Step 4 : Créer `settings.module.ts`**

```typescript
// apps/backend/src/modules/settings/settings.module.ts
import { Module } from "@nestjs/common";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";
import { SettingsRepository } from "./settings.repository";

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, SettingsRepository],
  exports: [SettingsService],
})
export class SettingsModule {}
```

- [ ] **Step 5 : Vérifier les types**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/backend && bunx tsc --noEmit
```

- [ ] **Step 6 : Commit**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle
git add apps/backend/src/modules/settings/
git commit -m "feat(backend): add settings module with app settings and user preferences"
```

---

## Task 4 : Module Webhooks

**Files:**

- Créer : `apps/backend/src/modules/webhooks/webhooks.repository.ts`
- Créer : `apps/backend/src/modules/webhooks/webhook-delivery.service.ts`
- Créer : `apps/backend/src/modules/webhooks/webhooks.service.ts`
- Créer : `apps/backend/src/modules/webhooks/webhooks.controller.ts`
- Créer : `apps/backend/src/modules/webhooks/webhooks.module.ts`

- [ ] **Step 1 : Créer `webhooks.repository.ts`**

```typescript
// apps/backend/src/modules/webhooks/webhooks.repository.ts
import { Injectable } from "@nestjs/common";
import { db, webhook, webhookDelivery } from "@repo/db";
import { eq, count } from "drizzle-orm";
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
} from "@repo/validators/webhooks";

@Injectable()
export class WebhooksRepository {
  async findAll(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(webhook)
        .limit(limit)
        .offset(offset)
        .orderBy(webhook.createdAt),
      db.select({ total: count() }).from(webhook),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string) {
    const [found] = await db.select().from(webhook).where(eq(webhook.id, id));
    return found ?? null;
  }

  async findActiveByEvent(event: string) {
    const rows = await db
      .select()
      .from(webhook)
      .where(eq(webhook.active, true));
    return rows.filter((w) => w.events.includes(event));
  }

  async create(data: CreateWebhookInput & { createdBy?: string }) {
    const [created] = await db
      .insert(webhook)
      .values({
        name: data.name,
        url: data.url,
        events: data.events,
        secret: data.secret,
        createdBy: data.createdBy,
      })
      .returning();
    return created;
  }

  async update(id: string, data: UpdateWebhookInput) {
    const [updated] = await db
      .update(webhook)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(webhook.id, id))
      .returning();
    return updated ?? null;
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(webhook)
      .where(eq(webhook.id, id))
      .returning();
    return deleted ?? null;
  }

  async createDelivery(data: {
    webhookId: string;
    event: string;
    payload: unknown;
    statusCode: number | null;
    response: string | null;
    success: boolean;
  }) {
    const [created] = await db
      .insert(webhookDelivery)
      .values({
        webhookId: data.webhookId,
        event: data.event,
        payload: data.payload,
        statusCode: data.statusCode,
        response: data.response,
        success: data.success,
      })
      .returning();
    return created;
  }

  async findDeliveriesByWebhook(
    webhookId: string,
    page: number,
    limit: number,
  ) {
    const offset = (page - 1) * limit;
    const where = eq(webhookDelivery.webhookId, webhookId);
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(webhookDelivery)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(webhookDelivery.createdAt),
      db.select({ total: count() }).from(webhookDelivery).where(where),
    ]);
    return { items, total, page, limit };
  }
}
```

- [ ] **Step 2 : Créer `webhook-delivery.service.ts`**

```typescript
// apps/backend/src/modules/webhooks/webhook-delivery.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { WebhooksRepository } from "./webhooks.repository";

@Injectable()
export class WebhookDeliveryService {
  private readonly logger = new Logger(WebhookDeliveryService.name);

  constructor(
    private readonly webhooksRepository: WebhooksRepository,
    private readonly httpService: HttpService,
  ) {}

  async dispatch(event: string, payload: unknown): Promise<void> {
    const hooks = await this.webhooksRepository.findActiveByEvent(event);
    await Promise.allSettled(
      hooks.map((hook) => this.deliverOne(hook, event, payload)),
    );
  }

  private async deliverOne(
    hook: { id: string; url: string; secret: string | null },
    event: string,
    payload: unknown,
  ): Promise<void> {
    let statusCode: number | null = null;
    let response: string | null = null;
    let success = false;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Webhook-Event": event,
      };
      if (hook.secret) {
        headers["X-Webhook-Secret"] = hook.secret;
      }

      const res = await firstValueFrom(
        this.httpService.post(hook.url, payload, {
          headers,
          timeout: 10000,
        }),
      );
      statusCode = res.status;
      response =
        typeof res.data === "string" ? res.data : JSON.stringify(res.data);
      success = res.status >= 200 && res.status < 300;
    } catch (err: unknown) {
      const e = err as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      statusCode = e.response?.status ?? null;
      response = e.response?.data
        ? JSON.stringify(e.response.data)
        : (e.message ?? "Unknown error");
      success = false;
      this.logger.warn(
        `Webhook delivery failed for hook ${hook.id} (${hook.url}): ${response}`,
      );
    }

    await this.webhooksRepository.createDelivery({
      webhookId: hook.id,
      event,
      payload,
      statusCode,
      response,
      success,
    });
  }
}
```

- [ ] **Step 3 : Créer `webhooks.service.ts`**

```typescript
// apps/backend/src/modules/webhooks/webhooks.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { WebhooksRepository } from "./webhooks.repository";
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
} from "@repo/validators/webhooks";

@Injectable()
export class WebhooksService {
  constructor(private readonly webhooksRepository: WebhooksRepository) {}

  findAll(page: number, limit: number) {
    return this.webhooksRepository.findAll(page, limit);
  }

  async findById(id: string) {
    const found = await this.webhooksRepository.findById(id);
    if (!found) throw new NotFoundException(`Webhook ${id} not found`);
    return found;
  }

  create(data: CreateWebhookInput, userId?: string) {
    return this.webhooksRepository.create({ ...data, createdBy: userId });
  }

  async update(id: string, data: UpdateWebhookInput) {
    await this.findById(id);
    return this.webhooksRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.webhooksRepository.delete(id);
  }

  async getDeliveries(id: string, page: number, limit: number) {
    await this.findById(id);
    return this.webhooksRepository.findDeliveriesByWebhook(id, page, limit);
  }
}
```

- [ ] **Step 4 : Créer `webhooks.controller.ts`**

```typescript
// apps/backend/src/modules/webhooks/webhooks.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UserHasPermission } from "@thallesp/nestjs-better-auth";
import { WebhooksService } from "./webhooks.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AuditLogInterceptor } from "../../common/interceptors/audit-log.interceptor";
import {
  createWebhookSchema,
  updateWebhookSchema,
  type CreateWebhookInput,
  type UpdateWebhookInput,
} from "@repo/validators/webhooks";

@ApiTags("webhooks")
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller({ path: "webhooks", version: "1" })
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: "List webhooks" })
  @UserHasPermission({ permission: { webhooks: ["read"] } })
  findAll(@Query("page") page = 1, @Query("limit") limit = 20) {
    return this.webhooksService.findAll(Number(page), Number(limit));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get webhook by id" })
  @UserHasPermission({ permission: { webhooks: ["read"] } })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.webhooksService.findById(id);
  }

  @Get(":id/deliveries")
  @ApiOperation({ summary: "Get webhook delivery history" })
  @UserHasPermission({ permission: { webhooks: ["read"] } })
  getDeliveries(
    @Param("id", ParseUUIDPipe) id: string,
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    return this.webhooksService.getDeliveries(id, Number(page), Number(limit));
  }

  @Post()
  @ApiOperation({ summary: "Create webhook" })
  @UserHasPermission({ permission: { webhooks: ["write"] } })
  create(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(createWebhookSchema)) body: CreateWebhookInput,
  ) {
    return this.webhooksService.create(body, user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update webhook" })
  @UserHasPermission({ permission: { webhooks: ["write"] } })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateWebhookSchema)) body: UpdateWebhookInput,
  ) {
    return this.webhooksService.update(id, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete webhook" })
  @UserHasPermission({ permission: { webhooks: ["delete"] } })
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.webhooksService.delete(id);
  }
}
```

- [ ] **Step 5 : Créer `webhooks.module.ts`**

```typescript
// apps/backend/src/modules/webhooks/webhooks.module.ts
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";
import { WebhooksRepository } from "./webhooks.repository";
import { WebhookDeliveryService } from "./webhook-delivery.service";

@Module({
  imports: [HttpModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhooksRepository, WebhookDeliveryService],
  exports: [WebhookDeliveryService],
})
export class WebhooksModule {}
```

- [ ] **Step 6 : Vérifier les types**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/backend && bunx tsc --noEmit
```

- [ ] **Step 7 : Commit**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle
git add apps/backend/src/modules/webhooks/
git commit -m "feat(backend): add webhooks module with HTTP delivery"
```

---

## Task 5 : Wiring final — app.module.ts + vérification

**Files:**

- Modifier : `apps/backend/src/app.module.ts`

- [ ] **Step 1 : Mettre à jour `apps/backend/src/app.module.ts`**

```typescript
// apps/backend/src/app.module.ts
import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { FilesModule } from "./modules/files/files.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { WebhooksModule } from "./modules/webhooks/webhooks.module";

@Module({
  imports: [
    AuthModule,
    HealthModule,
    AccountsModule,
    NotificationsModule,
    FilesModule,
    SettingsModule,
    WebhooksModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 2 : Vérifier les types (full project)**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle/apps/backend && bunx tsc --noEmit
```

- [ ] **Step 3 : Commit final**

```bash
cd /Users/abdoul/Desktop/Dev/templates/nest-next-better-auth-drizzle
git add apps/backend/src/app.module.ts
git commit -m "feat(backend): wire all domain modules into AppModule"
```
