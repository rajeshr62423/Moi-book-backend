import { UserDocument } from '../schemas/user.schema';

/** Public shape of a User document — never includes passwordHash/tokens. */
export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;

  static fromDocument(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: (user as unknown as { createdAt: Date }).createdAt,
    };
  }
}
