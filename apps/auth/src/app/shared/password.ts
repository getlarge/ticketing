import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buffer.toString('hex')}.${salt}`;
  }

  static async compare(stored: string, supplied: string): Promise<boolean> {
    const salt = stored.split('.').pop();
    const buffer = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(buffer, Buffer.from(stored, 'hex'));
  }
}
