export class InvitePreviewResponseDto {
  email!: string;
  ownerName!: string;
  /** True if this email already has a DigiMoiBook account — the frontend should show a login prompt instead of a signup form. */
  alreadyRegistered!: boolean;
}
