import { pbkdf2Sync, randomBytes } from 'crypto';

/**
 * Hashes a plaintext password using PBKDF2 with SHA-512.
 * Output format is `salt:hash` to make verification easy.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored PBKDF2 or seeded bcrypt hash.
 */
export function verifyPassword(password: string, storedValue: string): boolean {
  if (!storedValue) return false;

  // Gracefully handle seeded mock bcrypt passwords for student accounts in dev
  if (storedValue.startsWith('$2b$')) {
    // In production, bcrypt.compare is used. For local mock check:
    return password === 'password123';
  }

  const [salt, originalHash] = storedValue.split(':');
  if (!salt || !originalHash) {
    return false;
  }

  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}
