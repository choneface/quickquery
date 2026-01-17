import type pg from 'pg';
import type { DatabaseSchema } from './types.js';
export declare function loadSchema(client: pg.Client): Promise<DatabaseSchema>;
export declare function createEmptySchema(): DatabaseSchema;
