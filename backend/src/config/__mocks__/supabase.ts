import { jest } from '@jest/globals';

// Manual Jest mock for `src/config/supabase`.
//
// Several unit tests rely on `jest.mock('../../src/config/supabase')` and then
// override `supabase.from` / `supabase.rpc` behavior. Without a manual mock,
// Jest auto-mocking can produce `supabase = null/undefined`, causing
// `Cannot read properties of null (reading 'from')`.

export const supabase = {
  from: jest.fn(),
  rpc: jest.fn(),
};

export async function testSupabaseConnection(): Promise<boolean> {
  return true;
}

export async function query() {
  throw new Error('query() is not implemented in the Supabase Jest mock');
}

export async function insert() {
  throw new Error('insert() is not implemented in the Supabase Jest mock');
}

export async function update() {
  throw new Error('update() is not implemented in the Supabase Jest mock');
}

export async function remove() {
  throw new Error('remove() is not implemented in the Supabase Jest mock');
}
