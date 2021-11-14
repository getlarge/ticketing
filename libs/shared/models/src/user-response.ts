import { User } from './user';

export interface UserResponse extends Omit<User, 'password'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: string;
  email: string;
}
