import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FOOTER = `
---
Dette er en automatisk melding fra EmiratesPlaza. Vennligst ikke svar på denne e-posten.
`

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
      from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      text: `${text}\n\n${EMAIL_FOOTER}`,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email') // Propagate the error
  }
}
