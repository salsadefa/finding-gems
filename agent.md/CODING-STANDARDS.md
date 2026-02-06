# Coding Standards & Best Practices - Finding Gems

## 📋 Table of Contents
1. [Code Style Guide](#code-style-guide)
2. [Git Workflow](#git-workflow)
3. [Code Review Checklist](#code-review-checklist)
4. [Common Patterns](#common-patterns)
5. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
6. [Performance Best Practices](#performance-best-practices)
7. [Security Best Practices](#security-best-practices)

---

## 💻 Code Style Guide

### TypeScript/JavaScript Standards

#### 1. **Naming Conventions**
```typescript
// ✅ GOOD - Use descriptive names
const userAuthentication = true;
const fetchUserProfile = async (userId: string) => {};
class UserService {}
interface UserProfile {}

// ❌ BAD - Avoid abbreviations and unclear names
const ua = true;
const getUP = async (id: string) => {};
class US {}
interface UP {}

// Variables & Functions: camelCase
const userName = 'John';
const calculateTotal = () => {};

// Classes & Interfaces: PascalCase
class UserAccount {}
interface UserData {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';

// Private properties: underscore prefix
class User {
  private _password: string;
  private _validate() {}
}

// Boolean variables: is/has/should prefix
const isAuthenticated = true;
const hasPermission = false;
const shouldRetry = true;
```

#### 2. **File Naming**
```bash
# Components: PascalCase
UserProfile.tsx
UserCard.tsx

# Utilities & Services: camelCase
userService.ts
dateUtils.ts

# Types & Interfaces: PascalCase
user.types.ts
api.types.ts

# Tests: match source file with .test or .spec
UserService.test.ts
dateUtils.spec.ts

# Constants: camelCase or kebab-case
constants.ts
api-config.ts
```

#### 3. **Code Formatting**
```typescript
// ✅ GOOD - Consistent formatting
const user = {
  name: 'John',
  email: 'john@example.com',
  role: 'admin',
};

const fetchUsers = async (filters?: UserFilters): Promise<User[]> => {
  const users = await userRepository.findAll(filters);
  return users.map(sanitizeUser);
};

// ❌ BAD - Inconsistent formatting
const user = {name: "John",email: "john@example.com",role: "admin"};

const fetchUsers = async (filters?: UserFilters): Promise<User[]> => 
{
const users = await userRepository.findAll(filters);
return users.map(sanitizeUser)
}

// Prettier configuration
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}

// ESLint configuration
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off"
  }
}
```

#### 4. **Import Organization**
```typescript
// ✅ GOOD - Organized imports
// 1. External dependencies
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 2. Internal modules
import { Button } from '@/components/ui/button';
import { UserCard } from '@/components/UserCard';

// 3. Utilities & Helpers
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/date';

// 4. Types
import type { User, UserFilters } from '@/types/user.types';

// 5. Styles
import './UserList.css';

// ❌ BAD - Random order
import './UserList.css';
import { cn } from '@/lib/utils';
import React from 'react';
import type { User } from '@/types/user.types';
import { Button } from '@/components/ui/button';
```

#### 5. **Function Structure**
```typescript
// ✅ GOOD - Clear function structure
async function createUser(data: CreateUserDto): Promise<User> {
  // 1. Input validation
  const validatedData = userSchema.parse(data);
  
  // 2. Check preconditions
  const existingUser = await findUserByEmail(validatedData.email);
  if (existingUser) {
    throw new ConflictError('User already exists');
  }
  
  // 3. Main logic
  const hashedPassword = await hashPassword(validatedData.password);
  const user = await prisma.user.create({
    data: {
      ...validatedData,
      password: hashedPassword,
    },
  });
  
  // 4. Post-processing
  await sendWelcomeEmail(user.email);
  
  // 5. Return result
  return sanitizeUser(user);
}

// ❌ BAD - Everything mixed together
async function createUser(data: any) {
  const user = await prisma.user.create({
    data: {
      ...data,
      password: await hashPassword(data.password),
    },
  });
  await sendWelcomeEmail(user.email);
  return user;
}
```

---

## 🔄 Git Workflow

### Commit Message Convention

#### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style changes (formatting, semicolons, etc)
refactor: Code refactoring
perf:     Performance improvements
test:     Adding or updating tests
chore:    Build process or auxiliary tool changes
ci:       CI/CD changes
```

#### Examples
```bash
# ✅ GOOD
feat(auth): implement user registration endpoint

- Add POST /api/v1/auth/register endpoint
- Implement email validation
- Add password hashing with bcrypt
- Include JWT token generation

Closes #123

# ✅ GOOD
fix(users): resolve pagination bug on user list

The pagination was returning incorrect total count when
filters were applied. Fixed by adding proper WHERE clause
to count query.

Fixes #456

# ❌ BAD
Update stuff
Fixed bug
WIP
asdfasdf
```

### Branch Naming
```bash
# Format: <type>/<ticket-id>-<short-description>

# ✅ GOOD
feat/FG-123-user-authentication
fix/FG-456-pagination-bug
refactor/FG-789-user-service
docs/FG-101-api-documentation

# ❌ BAD
new-feature
bug-fix
updates
arkan-branch
```

### Pull Request Guidelines
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
1. Step 1
2. Step 2
3. Expected result

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Tests passing
- [ ] No console.log or debug code
- [ ] Environment variables documented
```

---

## ✅ Code Review Checklist

### For Reviewers
```typescript
// Functionality
□ Code works as intended
□ Edge cases handled
□ Error cases handled
□ Input validation present

// Code Quality
□ Follows coding standards
□ No code duplication
□ Functions are single-purpose
□ Variables named clearly
□ Comments explain "why" not "what"

// Security
□ No sensitive data exposed
□ SQL injection prevented
□ XSS prevented
□ Authentication checked
□ Authorization verified

// Performance
□ No N+1 queries
□ Database queries optimized
□ Proper indexes used
□ Caching implemented where needed

// Testing
□ Tests added/updated
□ Tests passing
□ Coverage maintained/improved
□ Edge cases tested

// Documentation
□ JSDoc comments added
□ README updated if needed
□ API docs updated
□ Migration guide if breaking change
```

---

## 🎯 Common Patterns

### 1. **Error Handling Pattern**
```typescript
// ✅ GOOD - Consistent error handling
export const createUser = catchAsync(async (req, res) => {
  // Validation
  const validatedData = userSchema.parse(req.body);
  
  // Check duplicates
  const existingUser = await userService.findByEmail(validatedData.email);
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }
  
  // Create user
  const user = await userService.create(validatedData);
  
  // Success response
  res.status(201).json({
    success: true,
    data: user,
    message: 'User created successfully',
  });
});

// ❌ BAD - Inconsistent error handling
export const createUser = async (req, res) => {
  try {
    const user = await userService.create(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 2. **Async/Await Pattern**
```typescript
// ✅ GOOD - Proper async/await usage
async function fetchUserData(userId: string) {
  const [user, posts, comments] = await Promise.all([
    fetchUser(userId),
    fetchUserPosts(userId),
    fetchUserComments(userId),
  ]);
  
  return { user, posts, comments };
}

// ❌ BAD - Sequential awaits when parallel is possible
async function fetchUserData(userId: string) {
  const user = await fetchUser(userId);
  const posts = await fetchUserPosts(userId);
  const comments = await fetchUserComments(userId);
  
  return { user, posts, comments };
}
```

### 3. **React Component Pattern**
```typescript
// ✅ GOOD - Well-structured component
interface UserListProps {
  filters?: UserFilters;
  onUserSelect?: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ filters, onUserSelect }) => {
  // Hooks at top
  const { data, isLoading, error } = useUsers(filters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Memoized values
  const sortedUsers = useMemo(() => {
    return data?.sort((a, b) => a.name.localeCompare(b.name)) ?? [];
  }, [data]);
  
  // Callbacks
  const handleSelect = useCallback((user: User) => {
    setSelectedId(user.id);
    onUserSelect?.(user);
  }, [onUserSelect]);
  
  // Early returns
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!sortedUsers.length) return <EmptyState />;
  
  // Render
  return (
    <div className="grid gap-4">
      {sortedUsers.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          isSelected={user.id === selectedId}
          onClick={() => handleSelect(user)}
        />
      ))}
    </div>
  );
};

// ❌ BAD - Messy component
export const UserList = ({ filters, onUserSelect }) => {
  const { data, isLoading, error } = useUsers(filters);
  const [selectedId, setSelectedId] = useState(null);
  
  return (
    <div>
      {isLoading ? <div>Loading...</div> : null}
      {error ? <div>Error</div> : null}
      {data?.sort((a, b) => a.name.localeCompare(b.name)).map((user) => (
        <div onClick={() => {
          setSelectedId(user.id);
          onUserSelect(user);
        }}>
          {user.name}
        </div>
      ))}
    </div>
  );
};
```

### 4. **Service Layer Pattern**
```typescript
// ✅ GOOD - Clean service layer
class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}
  
  async createUser(data: CreateUserDto): Promise<User> {
    // Validation
    const validatedData = await this.validateUserData(data);
    
    // Check duplicates
    await this.checkDuplicateEmail(validatedData.email);
    
    // Hash password
    const hashedPassword = await this.hashPassword(validatedData.password);
    
    // Create user
    const user = await this.userRepository.create({
      ...validatedData,
      password: hashedPassword,
    });
    
    // Send email
    await this.emailService.sendWelcomeEmail(user.email);
    
    return this.sanitizeUser(user);
  }
  
  private async validateUserData(data: CreateUserDto) {
    return userSchema.parse(data);
  }
  
  private async checkDuplicateEmail(email: string) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already exists');
    }
  }
  
  private sanitizeUser(user: User) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

// ❌ BAD - Everything in one function
async function createUser(data: any) {
  const user = await prisma.user.create({
    data: {
      ...data,
      password: await bcrypt.hash(data.password, 10),
    },
  });
  
  await sendEmail(user.email, 'Welcome!');
  
  delete user.password;
  return user;
}
```

---

## 🚫 Anti-Patterns to Avoid

### 1. **God Objects**
```typescript
// ❌ BAD - God object doing everything
class UserController {
  async register(req, res) {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) throw new Error('Missing fields');
    
    // Check duplicate
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('User exists');
    
    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({ data: { email, password: hashed } });
    
    // Send email
    await sendEmail(email, 'Welcome');
    
    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    
    res.json({ user, token });
  }
}

// ✅ GOOD - Separation of concerns
class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}
  
  register = catchAsync(async (req, res) => {
    const userData = userSchema.parse(req.body);
    const result = await this.authService.register(userData);
    
    res.status(201).json({
      success: true,
      data: result,
    });
  });
}
```

### 2. **Callback Hell**
```typescript
// ❌ BAD - Callback hell
function getUserData(userId, callback) {
  getUser(userId, (err, user) => {
    if (err) return callback(err);
    
    getPosts(userId, (err, posts) => {
      if (err) return callback(err);
      
      getComments(userId, (err, comments) => {
        if (err) return callback(err);
        
        callback(null, { user, posts, comments });
      });
    });
  });
}

// ✅ GOOD - Async/await
async function getUserData(userId: string) {
  const [user, posts, comments] = await Promise.all([
    getUser(userId),
    getPosts(userId),
    getComments(userId),
  ]);
  
  return { user, posts, comments };
}
```

### 3. **Magic Numbers/Strings**
```typescript
// ❌ BAD - Magic numbers and strings
if (user.role === 'admin') {
  setTimeout(() => logout(), 3600000);
}

// ✅ GOOD - Named constants
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds

if (user.role === USER_ROLES.ADMIN) {
  setTimeout(() => logout(), SESSION_TIMEOUT);
}
```

### 4. **Premature Optimization**
```typescript
// ❌ BAD - Over-engineering for performance
const userCache = new Map();
const userCacheTTL = new Map();

async function getUser(id: string) {
  if (userCache.has(id) && Date.now() < userCacheTTL.get(id)) {
    return userCache.get(id);
  }
  
  const user = await fetchUser(id);
  userCache.set(id, user);
  userCacheTTL.set(id, Date.now() + 60000);
  
  return user;
}

// ✅ GOOD - Simple first, optimize when needed
async function getUser(id: string) {
  return await fetchUser(id);
}

// Later, if profiling shows this is a bottleneck:
// - Add React Query caching (frontend)
// - Add Redis caching (backend)
// - Add database query optimization
```

---

## ⚡ Performance Best Practices

### Database
```typescript
// ✅ GOOD - Optimize queries
// 1. Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// 2. Use indexes
@@index([email])
@@index([createdAt])

// 3. Avoid N+1 queries
const users = await prisma.user.findMany({
  include: {
    posts: true,
  },
});

// 4. Pagination
const users = await prisma.user.findMany({
  skip: (page - 1) * limit,
  take: limit,
});

// ❌ BAD - N+1 query problem
const users = await prisma.user.findMany();
for (const user of users) {
  user.posts = await prisma.post.findMany({
    where: { userId: user.id },
  });
}
```

### Frontend
```typescript
// ✅ GOOD - Optimize React components
// 1. Memoize expensive computations
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// 2. Use React.memo for expensive components
export const UserCard = React.memo<UserCardProps>(({ user }) => {
  return <div>{user.name}</div>;
});

// 3. Lazy load routes
const UserProfile = lazy(() => import('./pages/UserProfile'));

// 4. Debounce user input
const debouncedSearch = useDebouncedValue(searchTerm, 300);

// ❌ BAD - Re-renders everything
function UserList({ users }) {
  return users.sort((a, b) => a.name.localeCompare(b.name)).map((user) => (
    <div onClick={() => console.log(user)}>{user.name}</div>
  ));
}
```

---

## 🔒 Security Best Practices

### Input Validation
```typescript
// ✅ GOOD - Validate all inputs
const userSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(50),
});

export const register = catchAsync(async (req, res) => {
  const validatedData = userSchema.parse(req.body);
  // ... rest of logic
});

// ❌ BAD - No validation
export const register = async (req, res) => {
  const { email, password } = req.body;
  // ... directly use user input
};
```

### Authentication
```typescript
// ✅ GOOD - Secure authentication
// 1. Hash passwords
const hashedPassword = await bcrypt.hash(password, 12);

// 2. Use secure JWT
const token = jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// 3. Verify tokens properly
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// 4. Check user still exists
const user = await prisma.user.findUnique({ where: { id: decoded.id } });
if (!user) throw new UnauthorizedError();

// ❌ BAD - Insecure
const password = req.body.password; // Plain text
const token = user.id; // No encryption
```

### SQL Injection Prevention
```typescript
// ✅ GOOD - Parameterized queries
const users = await prisma.user.findMany({
  where: {
    email: userEmail,
  },
});

// ❌ BAD - String concatenation
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = '${userEmail}'
`;
```

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Effective TypeScript](https://effectivetypescript.com/)
- [React Best Practices](https://react.dev/learn)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Remember:** Write code for humans first, computers second. Code is read more often than it's written!
