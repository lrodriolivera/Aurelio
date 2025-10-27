// =========================================
// Password Utilities (bcrypt)
// =========================================

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class PasswordUtils {
  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (password.length > 100) {
      errors.push('La contraseña no puede tener más de 100 caracteres');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default PasswordUtils;
