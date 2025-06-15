import { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'
import { ResetPasswordEmail } from '@/emails/email-form' // Updated import
import React from 'react'
import { SENDER_EMAIL, SENDER_NAME } from '@/lib/constants'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { email, firstName } = req.body

    if (!email || !firstName) {
      return res
        .status(400)
        .json({ message: 'Email and first name are required' })
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    try {
      // Send the code via email
      await resend.emails.send({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: email,
        subject: 'Your Verification Code',
        react: React.createElement(ResetPasswordEmail, {
          firstName,
          resetLink: code,
        }), // Updated usage
      })

      res.status(200).json({ code })
    } catch (error) {
      console.error('Failed to send email:', error)
      res.status(500).json({ error: 'Failed to send email' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
