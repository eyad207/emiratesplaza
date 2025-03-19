import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import { ResetPasswordSchema } from '@/lib/validator'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  try {
    const { email, password } = req.body
    await ResetPasswordSchema.parseAsync({
      password,
      confirmPassword: password,
    })

    await connectToDatabase()
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.password = await bcrypt.hash(password, 5)
    await user.save()

    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message })
    } else {
      res.status(400).json({ message: 'An unknown error occurred' })
    }
  }
}
