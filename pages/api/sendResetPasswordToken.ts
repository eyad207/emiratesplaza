import { NextApiRequest, NextApiResponse } from 'next'
import { generateToken } from '@/lib/token-utils'
import { Resend } from 'resend'
import { ResetPasswordEmail } from '@/emails/email-form' // Updated import
import React from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Generate a secure token
    const token = generateToken(email)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    // Send the email with the reset link
    await resend.emails.send({
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: 'Reset Your Password',
      react: React.createElement(ResetPasswordEmail, {
        firstName: 'User', // Replace with actual first name if available
        resetLink,
      }),
    })

    res.status(200).json({ token })
  } catch (error) {
    console.error('Error sending reset password token:', error)
    res.status(500).json({ message: 'Failed to send reset password token' })
  }
}
