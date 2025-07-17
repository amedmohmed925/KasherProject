
# Auth Feature Endpoints

Base URL: `http://localhost:8080/api`

## Register (Admins Only)
- **POST** `/register`
- Body: `{ name, email, password, companyName, companyAddress }`
- Description: Register a new admin and create a company. Employees cannot register directly.

## Login
- **POST** `/login`
- Body: `{ email, password }`
- Description: Login and receive JWT token.

## Verify OTP (Registration)
- **POST** `/verify-otp`
- Body: `{ email, otp }`
- Description: Verify OTP sent to email during registration. Required to activate account.

## Forgot Password
- **POST** `/forgot-password`
- Body: `{ email }`
- Description: Send a password reset OTP to the user's email.

## Reset Password
- **POST** `/reset-password`
- Body: `{ email, otp, newPassword, confirmNewPassword }`
- Description: Reset password using OTP sent to email.

## Invite Employee
- **POST** `/invite-employee`
- Headers: `Authorization: Bearer <token>` (admin or superAdmin only)
- Body: `{ email, tenantId, name (optional) }`
- Description: Send invitation email to employee to join the company.

## Get Invite Info
- **GET** `/invite-info?token=...`
- Description: Get company name and invite info for the employee registration page (shows company name, cannot be changed by employee).

## Accept Invite
- **POST** `/accept-invite`
- Body: `{ token, password, name (optional) }`
- Description: Employee completes registration using the invitation token received by email. Company name is shown and cannot be changed.
