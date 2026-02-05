// ============================================
// Supabase Mock - Finding Gems Backend Tests
// ============================================

export const mockSupabaseData: Record<string, any[]> = {
  users: [],
  creator_applications: [],
  creator_profiles: [],
};

export const resetMockData = () => {
  mockSupabaseData.users = [];
  mockSupabaseData.creator_applications = [];
  mockSupabaseData.creator_profiles = [];
};

export const createMockUser = (overrides = {}) => ({
  id: 'user-uuid-123',
  email: 'test@example.com',
  name: 'Test User',
  username: 'testuser',
  role: 'buyer',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockApplication = (overrides = {}) => ({
  id: 'app-uuid-123',
  userId: 'user-uuid-123',
  bio: 'This is a test bio that is at least 50 characters long for validation.',
  professionalBackground: 'Software Engineer',
  expertise: ['web', 'mobile'],
  portfolioUrl: 'https://portfolio.example.com',
  motivation: 'This is a test motivation that is at least 100 characters long for validation purposes. I want to share my tools with the community.',
  status: 'pending',
  createdAt: new Date().toISOString(),
  reviewedAt: null,
  reviewedBy: null,
  rejectionReason: null,
  ...overrides,
});

// Mock query builder pattern
const createQueryBuilder = (table: string) => {
  let filters: any[] = [];
  let orderField = '';
  let orderAsc = false;
  let rangeStart = 0;
  let rangeEnd = 100;
  let singleResult = false;
  let countOption = false;

  const filterData = (data: any[]) => {
    let result = [...data];
    for (const filter of filters) {
      result = result.filter(item => {
        if (filter.operator === 'eq') {
          return item[filter.column] === filter.value;
        }
        if (filter.operator === 'neq') {
          return item[filter.column] !== filter.value;
        }
        return true;
      });
    }
    return result;
  };

  const builder = {
    select: (_fields: string, options?: { count?: string }) => {
      if (options?.count) countOption = true;
      return builder;
    },
    eq: (column: string, value: any) => {
      filters.push({ column, value, operator: 'eq' });
      return builder;
    },
    neq: (column: string, value: any) => {
      filters.push({ column, value, operator: 'neq' });
      return builder;
    },
    order: (column: string, opts?: { ascending?: boolean }) => {
      orderField = column;
      orderAsc = opts?.ascending ?? false;
      return builder;
    },
    range: (start: number, end: number) => {
      rangeStart = start;
      rangeEnd = end;
      return builder;
    },
    single: () => {
      singleResult = true;
      return builder.then();
    },
    then: async () => {
      const tableData = mockSupabaseData[table] || [];
      let result = filterData(tableData);

      if (orderField) {
        result.sort((a, b) => {
          const aVal = a[orderField];
          const bVal = b[orderField];
          if (orderAsc) return aVal < bVal ? -1 : 1;
          return aVal > bVal ? -1 : 1;
        });
      }

      if (singleResult) {
        if (result.length === 0) {
          return { data: null, error: { code: 'PGRST116', message: 'No rows found' } };
        }
        return { data: result[0], error: null };
      }

      result = result.slice(rangeStart, rangeEnd + 1);
      return {
        data: result,
        error: null,
        count: countOption ? filterData(tableData).length : undefined,
      };
    },
  };

  return builder;
};

// Mock insert builder
const createInsertBuilder = (table: string) => {
  let insertData: any = null;

  const builder = {
    select: () => builder,
    single: async () => {
      if (!insertData) {
        return { data: null, error: { message: 'No data to insert' } };
      }

      const newItem = {
        id: `mock-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...insertData,
      };

      mockSupabaseData[table] = mockSupabaseData[table] || [];
      mockSupabaseData[table].push(newItem);

      return { data: newItem, error: null };
    },
  };

  return {
    insert: (data: any) => {
      insertData = data;
      return builder;
    },
  };
};

// Mock update builder
const createUpdateBuilder = (table: string) => {
  let updateData: any = null;
  let filters: any[] = [];

  const builder = {
    eq: (column: string, value: any) => {
      filters.push({ column, value, operator: 'eq' });
      return builder;
    },
    then: async () => {
      mockSupabaseData[table] = (mockSupabaseData[table] || []).map(item => {
        const matches = filters.every(f => item[f.column] === f.value);
        if (matches) {
          return { ...item, ...updateData, updatedAt: new Date().toISOString() };
        }
        return item;
      });
      return { error: null };
    },
  };

  return {
    update: (data: any) => {
      updateData = data;
      return builder;
    },
  };
};

// Mock delete builder
const createDeleteBuilder = (table: string) => {
  let filters: any[] = [];

  const builder = {
    eq: (column: string, value: any) => {
      filters.push({ column, value, operator: 'eq' });
      return builder;
    },
    then: async () => {
      mockSupabaseData[table] = (mockSupabaseData[table] || []).filter(item => {
        const matches = filters.every(f => item[f.column] === f.value);
        return !matches;
      });
      return { error: null };
    },
  };

  return builder;
};

// Main mock Supabase client
export const mockSupabase = {
  from: (table: string) => ({
    select: (fields?: string, options?: any) => createQueryBuilder(table).select(fields || '*', options),
    insert: (data: any) => createInsertBuilder(table).insert(data),
    update: (data: any) => createUpdateBuilder(table).update(data),
    delete: () => createDeleteBuilder(table),
  }),
};

// Jest mock
jest.mock('../../src/config/supabase', () => ({
  supabase: mockSupabase,
}));
