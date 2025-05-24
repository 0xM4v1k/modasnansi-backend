/* 
  Esta estrategia JWT se encarga de:
  - Extraer el token de los encabezados de la petición usando el esquema Bearer.
  - Verificar la firma del token y que no haya expirado.
  - Una vez validado el token, en el método validate se busca el usuario en la base de datos.
  - Si el usuario existe, se retorna un payload enriquecido con información útil (ID, nombre, roles, etc.).
  Nota: La verificación de la firma y la expiración se realizan antes de ejecutar el método validate.
*/

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '@users/users.service';
import { Payload } from '../types/Payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    // Aquí se configura la estrategia JWT.
    // jwtFromRequest: Extrae el token del header Authorization del tipo Bearer.
    // ignoreExpiration: false => Se valida que el token no haya expirado.
    // secretOrKey: Se utiliza el secreto definido en las variables de entorno o un valor por defecto.
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        'gT8+F6vs+hnEuCdvW2KkzxNmKy5YITc7evqhasTf8wfDAr2ji+EnU5ZnsAXlR2cMb0TO3Hjeccx33LYu8R7PNg==',
    });
  }

  async validate(payload: Payload): Promise<Payload> {
    const user = await this.usersService.findPermissionsById(payload.sub);

    if (!user) {
      throw new UnauthorizedException(`User with ID ${payload.sub} not found`);
    }

    const newPayload: Payload = {
      sub: payload.sub,
      full_name: user.full_name,
      username: user.username,
      // extract only permission names and assign them to the permissions property
      permissions: user.permissions ? user.permissions.map((p) => p.name) : [],
    };

    // Retornamos el payload enriquecido con información del usuario.
    return newPayload;
  }
}
