import { jest } from '@jest/globals';

// Manual Jest mock for `src/config/supabase`.
//
// Some unit tests call `jest.mock('../../src/config/supabase')` and then stub
// `supabase.from` / `supabase.rpc`. Without a manual mock implementation, Jest
// auto-mocking can yield `supabase = null/undefined`, which leads to runtime
// errors like `Cannot read properties of null (reading 'from')`.

function createQueryBuilder() {
  const resultList = { data: [], error: null, count: 0 };
  const resultSingle = { data: { id: 'mock-id' }, error: null };

  const builder: any = {
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    neq: jest.fn(() => builder),
    order: jest.fn(() => builder),
    range: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    single: jest.fn(async () => resultSingle),
    // Make the builder awaitable (Supabase query builders are thenable).
    then: (onFulfilled: any, onRejected: any) => Promise.resolve(resultList).then(onFulfilled, onRejected),
  };

  return builder;
}

function createInsertBuilder() {
  const resultSingle = { data: { id: 'mock-id' }, error: null };

  const builder: any = {
    select: jest.fn(() => builder),
    single: jest.fn(async () => resultSingle),
    then: (onFulfilled: any, onRejected: any) => Promise.resolve(resultSingle).then(onFulfilled, onRejected),
  };

  return builder;
}

function createUpdateBuilder() {
  const resultSingle = { data: { id: 'mock-id' }, error: null };

  const builder: any = {
    eq: jest.fn(() => builder),
    select: jest.fn(() => builder),
    single: jest.fn(async () => resultSingle),
    then: (onFulfilled: any, onRejected: any) => Promise.resolve({ data: null, error: null }).then(onFulfilled, onRejected),
  };

  return builder;
}

function createDeleteBuilder() {
  const builder: any = {
    eq: jest.fn(() => builder),
    then: (onFulfilled: any, onRejected: any) => Promise.resolve({ data: null, error: null }).then(onFulfilled, onRejected),
  };
  return builder;
}

export const supabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => createQueryBuilder()),
    insert: jest.fn(() => createInsertBuilder()),
    update: jest.fn(() => createUpdateBuilder()),
    delete: jest.fn(() => createDeleteBuilder()),
  })),
  rpc: jest.fn(async () => ({ data: null, error: null })),
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
