import { BinaryLike, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync: (
  password: BinaryLike,
  salt: BinaryLike,
  keyLength: number
) => Promise<Buffer> = promisify(scrypt);

export class Password {
  static keyLength = 64;

  static async toHash(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    const buffer = await scryptAsync(password, salt, this.keyLength);
    return `${buffer.toString('hex')}.${salt}`;
  }

  static async compare(stored: string, supplied: string): Promise<boolean> {
    const [storedHash, salt] = stored.split('.');
    const buffer = await scryptAsync(supplied, salt, this.keyLength);
    return timingSafeEqual(buffer, Buffer.from(storedHash, 'hex'));
  }
}
