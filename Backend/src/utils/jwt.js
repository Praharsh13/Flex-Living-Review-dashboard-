import jwt from 'jsonwebtoken'


//JWT FOR SESSION MANAGEMENT
export function signAdmin(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' })
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}
