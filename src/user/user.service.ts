import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  create(input: CreateUserInput): Promise<UserDocument> {
    return this.userModel.create({
      ...input,
      email: input.email.toLowerCase(),
    });
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  /** Includes the normally-hidden passwordHash, needed only to verify a login attempt. */
  findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  findByIdWithRefreshToken(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+refreshTokenHash').exec();
  }

  /** Includes the normally-hidden passwordHash, needed only to verify a change-password attempt. */
  findByIdWithPassword(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('+passwordHash').exec();
  }

  async setRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { refreshTokenHash })
      .exec();
  }

  async setResetToken(
    userId: string,
    resetPasswordTokenHash: string | null,
    resetPasswordExpires: Date | null,
  ): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: userId },
        { resetPasswordTokenHash, resetPasswordExpires },
      )
      .exec();
  }

  findByResetTokenHash(
    resetPasswordTokenHash: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        resetPasswordTokenHash,
        resetPasswordExpires: { $gt: new Date() },
      })
      .select('+resetPasswordTokenHash +resetPasswordExpires')
      .exec();
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserDocument> {
    if (dto.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing && existing._id.toString() !== userId) {
        throw new ConflictException('An account with this email already exists');
      }
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { ...dto, ...(dto.email ? { email: dto.email.toLowerCase() } : {}) },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: userId },
        {
          passwordHash,
          resetPasswordTokenHash: null,
          resetPasswordExpires: null,
          refreshTokenHash: null,
        },
      )
      .exec();
  }
}
