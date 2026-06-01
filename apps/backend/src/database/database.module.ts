// apps/backend/src/database/database.module.ts
import { Global, Module } from '@nestjs/common';
import { db } from '@repo/db';

export const DATABASE_TOKEN = 'DATABASE';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useValue: db,
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
