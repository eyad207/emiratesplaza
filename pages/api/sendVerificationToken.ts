import { NextApiRequest, NextApiResponse } from 'next'
import { generateToken } from '@/lib/token-utils'
import { sendEmail } from '@/lib/email'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, firstName } = req.body

    if (!email || !firstName) {
      return res
        .status(400)
        .json({ message: 'Email and first name are required' })
    }

    // Generate a secure token
    const token = generateToken(email)

    // Send the token via email
    await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      text: `Hello ${firstName},\n\nUse the following token to reset your password:\n\n${token}\n\nThis token will expire in 15 minutes.`,
    })

    res.status(200).json({ token })
  } catch (error) {
    console.error('Error sending verification token:', error)
    res.status(500).json({ message: 'Failed to send verification token' })
  }
}
