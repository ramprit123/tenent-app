import { User } from '@prisma/client';

export interface AuthenticatedUser extends User {
  sub: string;
  tenantId: string;
  roles: string[];
}