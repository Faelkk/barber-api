import { SetMetadata } from '@nestjs/common';

export enum Role {
  Client = 'Client',
  Admin = 'Admin',
  Barber = 'Barber',
  Developer = 'Developer',
}

export const RolesKey = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(RolesKey, roles);
