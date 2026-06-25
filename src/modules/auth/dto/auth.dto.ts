import { UserRole } from 'src/modules/users/interface/user.role.inteface';
import * as joi from 'joi';

export class AuthDto {
  fullName?: string;
  email!: string;
  role!: UserRole;
  password!: string;
  confirmPassword!: string;
}

export class LoginDto {
  email!: string;
  password!: string;
}

export class VerifyEmailDto {
  code!: string
}

export class ForgotPasswordDto {
  email!: string
}

export class ChangePasswordDto {
  password!: string
  confirmPassword!: string
}

export class ResendOtpDto {
  email!: string
}

export class LoginAuthDto {
  email!: string
  id!: string
}

export const registerSchema = joi.object({
  fullName: joi.string().optional(),
  email: joi
    .string()
    .email()
    .lowercase()
    .trim()
    .custom((value: string) => {
      return value.toLowerCase();
    }, 'Convert email to lowercase')
    .required(),
  password: joi.string().required(),
  confirmPassword: joi.string().valid(joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

export const loginSchema = joi.object({
  email: joi
    .string()
    .email()
    .trim()
    .custom((value: string) => {
      return value.toLowerCase();
    }, 'lowercase email')
    .required(),
  password: joi.string().required(),
});


export const verifyEmailSchema = joi.object({
  code: joi.string().required()
})

export const forgotPasswordSchema = joi.object({
  email: joi.string().email().required()
})

export const changePasswordSchema = joi.object({
  password: joi.string().min(8).required(),
  confirmPassword: joi.string().valid(joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});


export const resendOtpSchema = joi.object({
  email: joi.string().required()
})
