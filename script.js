import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const run = (cmd) => {
  console.log(`⚙️  Running: ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

const baseModules = [
  "auth",
  "user",
  "society",
  "building",
  "flat",
  "tenant",
  "maintenance",
  "complaint",
  "payment",
  "event",
  "announcement",
  "vendor",
  "asset",
  "notification",
  "audit-log",
];

// 1️⃣ Generate modules, controllers, services
for (const module of baseModules) {
  run(`npx nest g module ${module}`);
  run(`npx nest g service ${module} --no-spec`);
  run(`npx nest g controller ${module} --no-spec`);
}

// 2️⃣ Setup Prisma schema
if (!fs.existsSync("prisma/schema.prisma")) run(`npx prisma init`);

const prismaSchema = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String   @id @default(cuid())
  name            String
  email           String   @unique
  password        String
  role            UserRole @default(RESIDENT)
  refreshToken    String?
  flats           Flat[]
  complaints      Complaint[]
  payments        Payment[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Society {
  id        String   @id @default(cuid())
  name      String
  address   String
  buildings Building[]
}

enum UserRole {
  ADMIN
  COMMITTEE
  RESIDENT
  TENANT
}
`;

fs.writeFileSync("prisma/schema.prisma", prismaSchema);
run(`npx prisma generate`);

// 3️⃣ Create global PrismaService
fs.writeFileSync(
  "src/prisma.service.ts",
  `
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
`
);

// 4️⃣ Auth Module Implementation
fs.writeFileSync(
  "src/auth/auth.service.ts",
  `
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwt.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });
      if (!user || user.refreshToken !== token)
        throw new UnauthorizedException('Invalid refresh token');

      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(data: any) {
    const hash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hash },
    });
  }
}
`
);

fs.writeFileSync(
  "src/auth/auth.controller.ts",
  `
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  register(@Body() data: any) {
    return this.service.register(data);
  }

  @Post('login')
  login(@Body() data: any) {
    return this.service.validateUser(data.email, data.password).then((user) => this.service.login(user));
  }

  @Post('refresh')
  refresh(@Body('refreshToken') token: string) {
    return this.service.refreshToken(token);
  }
}
`
);

fs.writeFileSync(
  "src/auth/auth.module.ts",
  `
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey',
    }),
  ],
  providers: [AuthService, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}
`
);

// 5️⃣ Role Decorator + Guards + CurrentUser
fs.mkdirSync("src/common", { recursive: true });

fs.writeFileSync(
  "src/common/roles.decorator.ts",
  `
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
`
);

fs.writeFileSync(
  "src/common/roles.guard.ts",
  `
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (!roles) return true;
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return roles.includes(user.role);
  }
}
`
);

fs.writeFileSync(
  "src/common/jwt-auth.guard.ts",
  `
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Missing token');

    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwt.verify(token, { secret: process.env.JWT_SECRET || 'supersecretkey' });
      req.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
`
);

fs.writeFileSync(
  "src/common/current-user.decorator.ts",
  `
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
`
);

// 6️⃣ Example protected route usage
const exampleController = `
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  @Get('profile')
  @Roles('ADMIN', 'RESIDENT')
  getProfile(@CurrentUser() user: any) {
    return { message: 'Access granted', user };
  }
}
`;

fs.writeFileSync("src/user/user.controller.ts", exampleController);

console.log("✅ Monolith with Auth, RBAC, Decorators, and Prisma fully bootstrapped!");
