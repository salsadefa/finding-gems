// ============================================
// User Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../utils/errors';
import { hashPassword } from '../utils/password';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  PaginationParams,
} from '../types/user.types';

/**
 * Sanitize user object by removing password
 */
const sanitizeUser = (user: any) => {
  const { password, ...sanitized } = user;
  return sanitized;
};

/**
 * @desc    Get all users with pagination and filters
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    role,
    isActive,
    search,
  } = req.query as PaginationParams & UserFilters;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build query
  let query = supabase
    .from('users')
    .select('*, creator_profile:creator_profiles(*)', { count: 'exact' });

  if (role) {
    query = query.eq('role', role);
  }

  if (isActive !== undefined) {
    query = query.eq('is_active', String(isActive) === 'true');
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
  }

  // Apply sorting and pagination
  const { data: users, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(skip, skip + take - 1);

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    data: {
      users: (users || []).map(sanitizeUser),
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: user, error } = await supabase
    .from('users')
    .select('*, creator_profile:creator_profiles(*)')
    .eq('id', id)
    .single();

  if (error || !user) {
    throw new NotFoundError('User not found');
  }

  // Check if user can access this profile
  if (req.user?.id !== id && req.user?.role !== 'admin') {
    if (user.role !== 'creator' || !user.is_active) {
      throw new NotFoundError('User not found');
    }
  }

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user),
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Create new user (Admin only)
 * @route   POST /api/v1/users
 * @access  Private (Admin)
 */
export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password, name, username, role = 'buyer', isActive = true } = req.body as CreateUserRequest;

  // Validate required fields
  if (!email || !password || !name || !username) {
    throw new ValidationError('All fields are required');
  }

  // Check if email exists
  const { data: existingEmail } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (existingEmail) {
    throw new ConflictError('User with this email already exists');
  }

  // Check if username exists
  const { data: existingUsername } = await supabase
    .from('users')
    .select('id')
    .eq('username', username.toLowerCase())
    .single();

  if (existingUsername) {
    throw new ConflictError('Username is already taken');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      username: username.toLowerCase(),
      role,
      is_active: isActive,
    })
    .select('*, creator_profile:creator_profiles(*)')
    .single();

  if (error) throw error;

  res.status(201).json({
    success: true,
    data: {
      user: sanitizeUser(user),
    },
    message: 'User created successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Update user
 * @route   PATCH /api/v1/users/:id
 * @access  Private (Own profile or Admin)
 */
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, name, username, role, isActive, avatar } = req.body as UpdateUserRequest;

  // Check if user exists
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !existingUser) {
    throw new NotFoundError('User not found');
  }

  // Authorization check
  if (req.user?.id !== id) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenError('You can only update your own profile');
    }
  } else {
    if (role !== undefined || isActive !== undefined) {
      throw new ForbiddenError('You cannot change your role or active status');
    }
  }

  // Check email uniqueness if updating email
  if (email && email !== existingUser.email) {
    const { data: emailExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (emailExists) {
      throw new ConflictError('Email is already in use');
    }
  }

  // Check username uniqueness if updating username
  if (username && username !== existingUser.username) {
    const { data: usernameExists } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (usernameExists) {
      throw new ConflictError('Username is already taken');
    }
  }

  // Update user
  const updateData: any = {};
  if (email) updateData.email = email.toLowerCase();
  if (name) updateData.name = name.trim();
  if (username) updateData.username = username.toLowerCase();
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.is_active = isActive;
  if (avatar) updateData.avatar = avatar;

  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select('*, creator_profile:creator_profiles(*)')
    .single();

  if (error) throw error;

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(updatedUser),
    },
    message: 'User updated successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Delete user (soft delete - set isActive to false)
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin or own profile)
 */
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if user exists
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !existingUser) {
    throw new NotFoundError('User not found');
  }

  // Authorization check
  if (req.user?.id !== id && req.user?.role !== 'admin') {
    throw new ForbiddenError('You can only delete your own profile');
  }

  // Prevent admin from deleting themselves
  if (id === req.user?.id && req.user?.role === 'admin') {
    throw new ForbiddenError('Admin cannot delete their own account');
  }

  // Soft delete - set is_active to false
  const { error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
export const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error || !user) {
    throw new NotFoundError('User not found');
  }

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user),
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Update current user profile
 * @route   PATCH /api/v1/users/me
 * @access  Private
 */
export const updateMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  const { name, username, avatar } = req.body;

  // Check username uniqueness if updating
  if (username && username !== req.user.username) {
    const { data: usernameExists } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (usernameExists) {
      throw new ConflictError('Username is already taken');
    }
  }

  const updateData: any = {};
  if (name) updateData.name = name.trim();
  if (username) updateData.username = username.toLowerCase();
  if (avatar) updateData.avatar = avatar;

  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', req.user.id)
    .select('*, creator_profile:creator_profiles(*)')
    .single();

  if (error) throw error;

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(updatedUser),
    },
    message: 'Profile updated successfully',
    timestamp: new Date().toISOString(),
  });
});
