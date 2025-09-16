import { signAdmin } from "../utils/jwt.js";

export async function login(req, res) {
    const { email, password } = req.body || {}

    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  
    // single admin user from .env (simple demo)
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = signAdmin({ sub: email, role: 'admin' })
      return res.json({ ok: true, token, user: { email, role: 'admin' } })
    }
    return res.status(401).json({ error: 'Invalid credentials' })
  }