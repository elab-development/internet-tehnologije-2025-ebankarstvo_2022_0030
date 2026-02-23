import jwt from "jsonwebtoken";

const COOKIE_NAME = "ebanka_token"

export function signToken(payload: { userId: string; email: string }) {
    const secret = process.env.JWT_SECRET!
    return jwt.sign(payload, secret, { expiresIn: "7d" })
}

export function verifyToken(token: string) {
    const secret = process.env.JWT_SECRET!
    return jwt.verify(token, secret) as { userId: string; email: string; iat: number, exp: number }
}

export { COOKIE_NAME }