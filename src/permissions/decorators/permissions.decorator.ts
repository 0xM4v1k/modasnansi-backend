import { SetMetadata } from '@nestjs/common';
import { PermissionsEnum } from '../enums/PermissionsEnum';

export const PERMISSIONS_KEY = 'permissions';
export const PermissionsDecorator = (...permissions: PermissionsEnum[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
