export interface JwtPayload {
  sub: string; // user id
  email: string;
  tenantId: string;
  roles: string[];
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    roles: string[];
  };
  accessToken: string;
  refreshToken: string;
}
