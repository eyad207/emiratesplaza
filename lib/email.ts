import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string
  subject: string
  text: string
}) {
  try {
    await resend.emails.send({
      from: process.env.SENDER_EMAIL!,
      to,
      subject,
      text,
    })
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
