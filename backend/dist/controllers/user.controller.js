"use strict";
// ============================================
// User Controller - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = exports.getMe = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const supabase_1 = require("../config/supabase");
const catchAsync_1 = require("../utils/catchAsync");
const errors_1 = require("../utils/errors");
const password_1 = require("../utils/password");
/**
 * Sanitize user object by removing password
 */
const sanitizeUser = (user) => {
    const { password, ...sanitized } = user;
    return sanitized;
};
/**
 * @desc    Get all users with pagination and filters
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
exports.getUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', role, isActive, search, } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    // Build query
    let query = supabase_1.supabase
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
    if (error)
        throw error;
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
exports.getUserById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { data: user, error } = await supabase_1.supabase
        .from('users')
        .select('*, creator_profile:creator_profiles(*)')
        .eq('id', id)
        .single();
    if (error || !user) {
        throw new errors_1.NotFoundError('User not found');
    }
    // Check if user can access this profile
    if (req.user?.id !== id && req.user?.role !== 'admin') {
        if (user.role !== 'creator' || !user.is_active) {
            throw new errors_1.NotFoundError('User not found');
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
exports.createUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email, password, name, username, role = 'buyer', isActive = true } = req.body;
    // Validate required fields
    if (!email || !password || !name || !username) {
        throw new errors_1.ValidationError('All fields are required');
    }
    // Check if email exists
    const { data: existingEmail } = await supabase_1.supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();
    if (existingEmail) {
        throw new errors_1.ConflictError('User with this email already exists');
    }
    // Check if username exists
    const { data: existingUsername } = await supabase_1.supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase())
        .single();
    if (existingUsername) {
        throw new errors_1.ConflictError('Username is already taken');
    }
    // Hash password
    const hashedPassword = await (0, password_1.hashPassword)(password);
    // Create user
    const { data: user, error } = await supabase_1.supabase
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
    if (error)
        throw error;
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
exports.updateUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { email, name, username, role, isActive, avatar } = req.body;
    // Check if user exists
    const { data: existingUser, error: findError } = await supabase_1.supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
    if (findError || !existingUser) {
        throw new errors_1.NotFoundError('User not found');
    }
    // Authorization check
    if (req.user?.id !== id) {
        if (req.user?.role !== 'admin') {
            throw new errors_1.ForbiddenError('You can only update your own profile');
        }
    }
    else {
        if (role !== undefined || isActive !== undefined) {
            throw new errors_1.ForbiddenError('You cannot change your role or active status');
        }
    }
    // Check email uniqueness if updating email
    if (email && email !== existingUser.email) {
        const { data: emailExists } = await supabase_1.supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();
        if (emailExists) {
            throw new errors_1.ConflictError('Email is already in use');
        }
    }
    // Check username uniqueness if updating username
    if (username && username !== existingUser.username) {
        const { data: usernameExists } = await supabase_1.supabase
            .from('users')
            .select('id')
            .eq('username', username.toLowerCase())
            .single();
        if (usernameExists) {
            throw new errors_1.ConflictError('Username is already taken');
        }
    }
    // Update user
    const updateData = {};
    if (email)
        updateData.email = email.toLowerCase();
    if (name)
        updateData.name = name.trim();
    if (username)
        updateData.username = username.toLowerCase();
    if (role !== undefined)
        updateData.role = role;
    if (isActive !== undefined)
        updateData.is_active = isActive;
    if (avatar)
        updateData.avatar = avatar;
    const { data: updatedUser, error } = await supabase_1.supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select('*, creator_profile:creator_profiles(*)')
        .single();
    if (error)
        throw error;
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
exports.deleteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    // Check if user exists
    const { data: existingUser, error: findError } = await supabase_1.supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
    if (findError || !existingUser) {
        throw new errors_1.NotFoundError('User not found');
    }
    // Authorization check
    if (req.user?.id !== id && req.user?.role !== 'admin') {
        throw new errors_1.ForbiddenError('You can only delete your own profile');
    }
    // Prevent admin from deleting themselves
    if (id === req.user?.id && req.user?.role === 'admin') {
        throw new errors_1.ForbiddenError('Admin cannot delete their own account');
    }
    // Soft delete - set is_active to false
    const { error } = await supabase_1.supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);
    if (error)
        throw error;
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
exports.getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const { data: user, error } = await supabase_1.supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();
    if (error || !user) {
        throw new errors_1.NotFoundError('User not found');
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
exports.updateMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const { name, username, avatar } = req.body;
    // Check username uniqueness if updating
    if (username && username !== req.user.username) {
        const { data: usernameExists } = await supabase_1.supabase
            .from('users')
            .select('id')
            .eq('username', username.toLowerCase())
            .single();
        if (usernameExists) {
            throw new errors_1.ConflictError('Username is already taken');
        }
    }
    const updateData = {};
    if (name)
        updateData.name = name.trim();
    if (username)
        updateData.username = username.toLowerCase();
    if (avatar)
        updateData.avatar = avatar;
    const { data: updatedUser, error } = await supabase_1.supabase
        .from('users')
        .update(updateData)
        .eq('id', req.user.id)
        .select('*, creator_profile:creator_profiles(*)')
        .single();
    if (error)
        throw error;
    res.status(200).json({
        success: true,
        data: {
            user: sanitizeUser(updatedUser),
        },
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=user.controller.js.map