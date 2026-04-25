import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "src/auth/auth.module";
import { OtpModule } from "src/auth/otp/otp.module";
import { UsersModule } from "src/users/users.module";
import { DivisionModule } from "./division/division.module";

@Module({
  imports: [
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: "15d" },
      }),
      PrismaModule,AuthModule,OtpModule,UsersModule, DivisionModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
