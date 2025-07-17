

# Auth Feature Endpoints

Base URL: `http://localhost:8080/api`

---

## 1. Register (Admins Only)
**POST** `/register`
- **Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "confirmPassword": "string",
    "companyName": "string",
    "companyAddress": "string"
  }
  ```
- **Description:**
  - Registers a new admin and creates a company (tenant).
  - Employees cannot register directly.
  - Sends OTP to email for verification.
- **Response:** `201 Created` on success, with message to verify email.

---

## 2. Verify OTP (Registration)
**POST** `/verify-otp`
- **Body:**
  ```json
  { "email": "string", "otp": "string" }
  ```
- **Description:**
  - Verifies OTP sent to email during registration.
  - Required to activate account.
- **Response:** Success message if verified.

---

## 3. Login
**POST** `/login`
- **Body:**
  ```json
  { "email": "string", "password": "string" }
  ```
- **Description:**
  - Login and receive JWT token and refresh token.
  - Returns user info (id, name, email, role, tenantId).
- **Response:**
  ```json
  {
    "token": "jwt",
    "refreshToken": "jwt",
    "user": { "id": "...", "name": "...", "email": "...", "role": "...", "tenantId": "..." }
  }
  ```

---

## 4. Forgot Password
**POST** `/forgot-password`
- **Body:**
  ```json
  { "email": "string" }
  ```
- **Description:**
  - Sends a 6-digit OTP to the user's email for password reset.
- **Response:** Success message if code sent.

---

## 5. Reset Password
**POST** `/reset-password`
- **Body:**
  ```json
  {
    "email": "string",
    "otp": "string",
    "newPassword": "string",
    "confirmNewPassword": "string"
  }
  ```
- **Description:**
  - Resets password using OTP sent to email.
- **Response:** Success message if password reset.

---

## 6. Invite Employee
**POST** `/invite-employee`
- **Headers:** `Authorization: Bearer <token>` (admin or superAdmin only)
- **Body:**
  ```json
  { "email": "string", "tenantId": "string", "name": "string (optional)" }
  ```
- **Description:**
  - Sends invitation email to employee to join the company.
  - Generates a unique invite link with a token (valid 2 days).
- **Response:** Success message and invite link.

---

## 7. Get Invite Info
**GET** `/invite-info?token=...`
- **Description:**
  - Decodes invite token and returns company name, address, and invitee email/name for registration page.
- **Response:**
  ```json
  {
    "email": "...",
    "tenantId": "...",
    "companyName": "...",
    "companyAddress": "...",
    "name": "..."
  }
  ```

---

## 8. Accept Invite (Employee Registration)
**POST** `/accept-invite`
- **Body:**
  ```json
  {
    "token": "string",
    "password": "string",
    "name": "string (optional)"
  }
  ```
- **Description:**
  - Employee completes registration using invitation token received by email.
  - Company name is shown and cannot be changed by employee.
- **Response:**
  ```json
  {
    "message": "Employee registered",
    "user": { "id": "...", "email": "...", "role": "employee", "tenantId": "..." }
  }
  ```

---

## ملاحظات هامة
- جميع الردود في حال الخطأ ترجع رسالة واضحة (`message`).
- OTP صالح لمرة واحدة فقط.
- رابط الدعوة للموظف صالح لمدة يومين فقط.
- لا يمكن للموظف تغيير اسم الشركة عند التسجيل عبر الدعوة.
- يجب تفعيل البريد الإلكتروني للأدمن قبل تسجيل الدخول.
