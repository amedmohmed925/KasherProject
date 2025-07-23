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

## 6. Refresh Token
**POST** `/refresh-token`
- **Body:**
  ```json
  { "refreshToken": "string" }
  ```
- **Description:**
  - Generates a new JWT token using a valid refresh token.
  - Ensures the user remains logged in without re-entering credentials.
- **Response:**
  ```json
  {
    "token": "newJwt",
    "refreshToken": "newRefreshToken"
  }
  ```

---

## 7. Logout
**POST** `/logout`
- **Body:**
  ```json
  { "refreshToken": "string" }
  ```
- **Description:**
  - Invalidates the provided refresh token.
  - Ensures the user is logged out securely.
- **Response:** Success message if logout is successful.

---

## مراجعة منطق AUTH
- **التسجيل (Register):**
  - يتم تسجيل الأدمن فقط، مع إنشاء شركة (Tenant).
  - يتم إرسال OTP إلى البريد الإلكتروني لتفعيل الحساب.

- **تسجيل الدخول (Login):**
  - يتم إصدار JWT وRefresh Token.
  - يتم إرجاع معلومات المستخدم (id, name, email, role, tenantId).

- **إعادة تعيين كلمة المرور (Forgot/Reset Password):**
  - يتم إرسال OTP إلى البريد الإلكتروني لإعادة تعيين كلمة المرور.
  - OTP صالح لمرة واحدة فقط.

- **تحديث التوكن (Refresh Token):**
  - يتيح للمستخدم البقاء مسجلاً دون الحاجة إلى إعادة تسجيل الدخول.

- **تسجيل الخروج (Logout):**
  - يضمن تسجيل الخروج الآمن عن طريق إبطال التوكن.
