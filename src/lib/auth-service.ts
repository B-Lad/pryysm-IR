// Database-backed authentication service
// This service handles user login and validation against the database

import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'master';
  companyName?: string;
  numPrinters?: string;
  country?: string;
  industry?: string;
  avatar?: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Find user by email
export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  try {
    // Note: You'll need to add User model to Prisma schema
    // This is a placeholder - adjust based on your actual User model
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        numPrinters: true,
        country: true,
        industry: true,
        avatar: true,
      },
    });
    return user as AuthUser | null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

// Authenticate user with email and password
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    console.log('🔐 Starting authentication for:', email);
    // Find user by email
    const userWithPassword = await prisma.user.findUnique({
      where: { email },
    });

    console.log('👤 User found:', !!userWithPassword);

    if (!userWithPassword) {
      console.log('❌ User not found:', email);
      return { success: false, error: 'User not found' };
    }

    if (!userWithPassword.passwordHash) {
      console.log('❌ User has no password set');
      return { success: false, error: 'User has no password set' };
    }

    // Verify password
    console.log('🔑 Verifying password...');
    const isPasswordValid = await verifyPassword(password, userWithPassword.passwordHash);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return { success: false, error: 'Invalid password' };
    }

    console.log('✅ Password valid, returning user data');
    // Return user data without password
    const user = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      name: userWithPassword.name,
      role: userWithPassword.role,
      companyName: userWithPassword.companyName,
      numPrinters: userWithPassword.numPrinters,
      country: userWithPassword.country,
      industry: userWithPassword.industry,
      avatar: userWithPassword.avatar,
    };

    return { success: true, user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

// Create new user
export async function createUser(
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'master' = 'admin',
  additionalData?: Partial<AuthUser>
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        companyName: additionalData?.companyName,
        numPrinters: additionalData?.numPrinters,
        country: additionalData?.country,
        industry: additionalData?.industry,
        avatar: additionalData?.avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        numPrinters: true,
        country: true,
        industry: true,
        avatar: true,
      },
    });

    return { success: true, user: newUser as AuthUser };
  } catch (error) {
    console.error('User creation error:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

// Update user
export async function updateUser(
  id: string,
  updates: Partial<AuthUser>
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: updates.name,
        companyName: updates.companyName,
        numPrinters: updates.numPrinters,
        country: updates.country,
        industry: updates.industry,
        avatar: updates.avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        numPrinters: true,
        country: true,
        industry: true,
        avatar: true,
      },
    });

    return { success: true, user: updatedUser as AuthUser };
  } catch (error) {
    console.error('User update error:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

// Logout (server-side cleanup if needed)
export async function logoutUser(userId: string): Promise<{ success: boolean }> {
  try {
    // You could clear sessions, tokens, or other data here if needed
    console.log(`User ${userId} logged out`);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }
}
