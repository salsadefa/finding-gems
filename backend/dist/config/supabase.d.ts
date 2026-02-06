import { SupabaseClient } from '@supabase/supabase-js';
export declare const supabase: SupabaseClient;
export declare function testSupabaseConnection(): Promise<boolean>;
export declare function query(table: string, options?: any): Promise<({
    error: true;
} & "Received a generic string")[]>;
export declare function insert(table: string, data: any): Promise<any>;
export declare function update(table: string, id: string, data: any): Promise<any>;
export declare function remove(table: string, id: string): Promise<boolean>;
//# sourceMappingURL=supabase.d.ts.map