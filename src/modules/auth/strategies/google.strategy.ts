// import { Request } from "express"
// import { Injectable } from "@nestjs/common"
// import { ConfigService } from "@nestjs/config"
// import { PassportStrategy } from "@nestjs/passport"

// import { AuthService } from "../auth.service"
// import { Strategy } from "passport-google-oauth2"
// import { UsersService } from "src/modules/users/users.service"
// import { CreateUserDto } from "src/modules/users/dto/create-user.dto"
// import { User } from "src/modules/users/entities/user.entity"


// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
//   constructor(
//     private authService: AuthService,
//     public configService: ConfigService,
//     public usersService: UsersService
//   ) {
//     super({
//       clientID: configService.get("auth.google.clientId"),
//       clientSecret: configService.get("auth.google.clientSecret"),
//       callbackURL: configService.get("auth.google.callbackUrl"),
//       scope: ["profile", "email"],
//       passReqToCallback: true
//     })
//   }

//   async validate(req: Request, _accessToken: string, _refreshToken: string, profile: any): Promise<User> {

//     let user = await this.authService.validateEmail(profile.email)

//     if (!user) {
  

//       const dto: CreateUserDto = {
//         email: profile.email
//       }

//       user = await this.usersService.create(dto)
//     } else if (user) {
//       // mark existing user email as verified
//       user = await this.usersService.update(user, { isEmailVerified: true })
//     }

//     // Prevent a user other than a vendor login from the vendor mobile app.
//     if (clientValidation.data === "vendor-mobile" && user.role !== UserRoleEnum.Vendor) {
//       return null
//     }

//     // Prevent a user other than a customer login from the customer mobile app.
//     if (clientValidation.data === "customer-mobile" && user.role !== UserRoleEnum.Customer) {
//       return null
//     }

//     req.user = user

//     return user
//   }
// }
