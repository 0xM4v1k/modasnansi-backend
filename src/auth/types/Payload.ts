export interface Payload {
  username?: string;
  full_name?: string;
  sub: number;
  permissions?: string[];
  iat?: number;
  exp?: number;
}
