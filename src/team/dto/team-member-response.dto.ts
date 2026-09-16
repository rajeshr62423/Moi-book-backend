import {
  TeamMemberDocument,
  TeamMemberStatus,
} from '../schemas/team-member.schema';

export class TeamMemberResponseDto {
  id!: string;
  email!: string;
  status!: TeamMemberStatus;
  invitedAt!: Date;
  acceptedAt?: Date;

  static fromDocument(member: TeamMemberDocument): TeamMemberResponseDto {
    const doc = member as unknown as { createdAt: Date };
    return {
      id: member._id.toString(),
      email: member.email,
      status: member.status,
      invitedAt: doc.createdAt,
      acceptedAt: member.acceptedAt,
    };
  }
}

export class TeamResponseDto {
  isOwner!: boolean;
  members!: TeamMemberResponseDto[];
}
