import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(
    @CurrentUser() authUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findById(authUser.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserResponseDto.fromDocument(user);
  }
}
