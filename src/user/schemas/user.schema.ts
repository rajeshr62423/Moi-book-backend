import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

// Property values are never set via `new User()` — Mongoose hydrates real
// documents from the DB, and SchemaFactory reads these via the @Prop
// decorators' reflected metadata. The `!` tells TS that's intentional
// instead of flagging "no initializer" on every required field.
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email!: string;

  @Prop({ trim: true })
  phone?: string;

  // Never selected by default; auth.service explicitly requests it with
  // `.select('+passwordHash')` when it needs to compare a login attempt.
  @Prop({ required: true, select: false })
  passwordHash!: string;

  // Hash of the current refresh token, not the token itself, so a leaked DB
  // dump can't be replayed as a session. Cleared on logout.
  // `type` is explicit because @nestjs/mongoose can't infer a Mongoose
  // SchemaType from a TS union like `string | null` via reflection alone.
  @Prop({ type: String, select: false })
  refreshTokenHash?: string | null;

  @Prop({ type: String, select: false })
  resetPasswordTokenHash?: string | null;

  @Prop({ type: Date, select: false })
  resetPasswordExpires?: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
