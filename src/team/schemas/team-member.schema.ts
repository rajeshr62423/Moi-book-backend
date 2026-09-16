import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TeamMemberDocument = HydratedDocument<TeamMember>;

export const TEAM_MEMBER_STATUSES = ['pending', 'accepted'] as const;
export type TeamMemberStatus = (typeof TEAM_MEMBER_STATUSES)[number];

@Schema({ timestamps: true })
export class TeamMember {
  // The account whose events/guests/vendors/ledger/moi this membership grants access to.
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  // Set once the invite is accepted and linked to a real User account.
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  memberId?: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({
    type: String,
    required: true,
    enum: TEAM_MEMBER_STATUSES,
    default: 'pending',
  })
  status!: TeamMemberStatus;

  // Never selected by default — only compared against on the invite-accept routes.
  @Prop({ required: true, select: false })
  inviteTokenHash!: string;

  @Prop({ type: Date, required: true })
  inviteExpires!: Date;

  @Prop({ type: Date })
  acceptedAt?: Date;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
