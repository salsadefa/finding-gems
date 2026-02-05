import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare function testConnection(): Promise<boolean>;
export declare function disconnect(): Promise<void>;
//# sourceMappingURL=database.d.ts.map