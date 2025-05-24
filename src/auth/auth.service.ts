import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@users/entities/user.entity';
import { UsersService } from '@users/users.service';
import * as bcrypt from 'bcrypt';
import { Payload } from './types/Payload';
import { Permission } from '@permissions/entities/permission.entity';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Función auxiliar para extraer solo el nombre de los permisos
  private extractPermissionNames(permissions: Permission[]): string[] {
    return permissions.map((permission) => permission.name);
  }

  // Función auxiliar para crear el payload a partir de un usuario
  private createPayload(user: User): Payload {
    return {
      username: user.username,
      full_name: user.full_name,
      sub: user.id,
      permissions: user.permissions
        ? this.extractPermissionNames(user.permissions)
        : [],
    };
  }

  async authenticateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userService.findPermissionsByUsername(username);

    if (user.is_active === false) {
      throw new UnauthorizedException(`Usuario ${username} no habilitado`);
    }

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  loginUser(user: User) {
    const payload = this.createPayload(user);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const user = await this.userService.create({
      ...registerUserDto,
      is_active: false,
      permissions: [],
    });
    return this.loginUser(user);
  }

  async activateUser(id: number) {
    return this.userService.activate(id);
  }
}
