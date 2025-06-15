import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import { ResetPasswordSchema } from '@/lib/validator'
import { verifyToken } from '@/lib/token-utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  try {
    const { token, password } = req.body
    await ResetPasswordSchema.parseAsync({
      password,
      confirmPassword: password,
    })

    const email = verifyToken(token) // Verifiser token og hent e-post
    if (!email) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }

    await connectToDatabase()
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.password = await bcrypt.hash(password, 5)
    await user.save()

    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    })
  }
}
