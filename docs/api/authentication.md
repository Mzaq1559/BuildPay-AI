# Authentication

BuildPay AI uses JWT (JSON Web Tokens).

1. Client sends `POST /api/v1/auth/login` with email and password (form data).
2. Server verifies password via bcrypt and issues a JWT token.
3. Client stores token and sends it in `Authorization: Bearer <token>`.
