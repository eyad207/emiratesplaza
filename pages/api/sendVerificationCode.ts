import { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'
import { EmailTemplate } from '@/emails/email-form'
import React from 'react'
import { SENDER_EMAIL, SENDER_NAME } from '@/lib/constants'

const resend = new Resend('re_BDf2kDyp_FSoS9wE1SitHzKqqKqQAfaK9')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { email, code, firstName } = req.body

    try {
      await resend.emails.send({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: email,
        subject: 'Your Verification Code',
        react: React.createElement(EmailTemplate, { firstName, code }),
      })
      res.status(200).json({ message: 'Email sent successfully' })
    } catch (error) {
      console.error('Failed to send email:', error)
      res.status(500).json({ error: 'Failed to send email' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
