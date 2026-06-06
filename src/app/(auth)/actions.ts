'use server';

import { signIn, signOut } from '@/auth';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/hash';
import { AuthError } from 'next-auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export type AuthState = {
  success?: boolean;
  message?: string;
  error?: string;
};

/**
 * Registers a new user in the database.
 */
export async function registerUser(prevState: any, formData: FormData): Promise<AuthState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate fields
  const validation = registerSchema.safeParse({ name, email, password });
  if (!validation.success) {
    const errorMsg = Object.values(validation.error.flatten().fieldErrors)
      .flat()
      .join(' ');
    return { error: errorMsg || 'Validation failed.' };
  }

  try {
    // Check if user already exists
    const userExists = await db.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return { error: 'An account with this email already exists.' };
    }

    // Encrypt password
    const hashedPassword = hashPassword(password);

    // Create user record
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'Account created successfully! Redirecting to login...',
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Failed to create account. Please try again.' };
  }
}

/**
 * Logs in a user using credentials.
 */
export async function loginUser(prevState: any, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate fields
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return { error: 'Invalid email format or password requirements.' };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: true,
      redirectTo: '/saved',
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials. Please verify your email and password.' };
        default:
          return { error: 'An unexpected authentication error occurred.' };
      }
    }
    // IMPORTANT: Next.js redirect relies on throwing a special redirect error.
    // We must re-throw it so the router can trigger the redirect.
    throw error;
  }
}

/**
 * Logs out the user and redirects them to the landing page.
 */
export async function logoutUser() {
  await signOut({ redirectTo: '/' });
}
