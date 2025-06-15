import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key'

export function generateToken(email: string): string {
  return jwt.sign({ email }, SECRET_KEY, { expiresIn: '15m' }) // Token valid for 15 minutes
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { email: string }
    return decoded.email
  } catch {
    return null
  }
}
