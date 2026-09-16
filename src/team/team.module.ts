import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamMember, TeamMemberSchema } from './schemas/team-member.schema';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { AccountContextInterceptor } from './account-context.interceptor';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TeamMember.name, schema: TeamMemberSchema },
    ]),
    UserModule,
    AuthModule,
    MailModule,
  ],
  providers: [TeamService, AccountContextInterceptor],
  controllers: [TeamController],
  exports: [TeamService, AccountContextInterceptor],
})
export class TeamModule {}
