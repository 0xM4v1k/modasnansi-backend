/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from '@permissions/guards/permissions.guard';
import { PermissionsDecorator } from '@permissions/decorators/permissions.decorator';
import { PermissionsEnum } from '@permissions/enums/PermissionsEnum';
import { RegisterUserDto } from './dto/register-user.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.authService.loginUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req): any {
    return req.user;
  }

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto): any {
    return this.authService.registerUser(registerUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @PermissionsDecorator(PermissionsEnum.USERS_UPDATE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch('activate/:id')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.authService.activateUser(id);
  }
}
