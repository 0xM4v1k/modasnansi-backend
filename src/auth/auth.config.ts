import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtOptions: JwtModuleOptions = {
  secret:
    process.env.JWT_SECRET ||
    'gT8+F6vs+hnEuCdvW2KkzxNmKy5YITc7evqhasTf8wfDAr2ji+EnU5ZnsAXlR2cMb0TO3Hjeccx33LYu8R7PNg==',
  signOptions: {
    expiresIn: '1d',
    algorithm: 'HS256',
  },
};
