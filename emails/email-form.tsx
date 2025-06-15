import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Link,
} from '@react-email/components'

interface ResetPasswordEmailProps {
  firstName?: string // Made optional with a fallback
  resetLink: string
}

const EMAIL_TEXT = {
  preview: 'Tilbakestill passordet ditt',
  greeting: 'Hei',
  instruction:
    'Vi har mottatt en forespørsel om å tilbakestille passordet ditt. Klikk på knappen nedenfor for å tilbakestille det:',
  button: 'Tilbakestill passord',
  note: 'Hvis du ikke ba om å tilbakestille passordet, vennligst se bort fra denne e-posten. Denne lenken utløper om 15 minutter.',
  footer: 'Takk,\nEmiratesPlaza-teamet',
}

export const ResetPasswordEmail: React.FC<
  Readonly<ResetPasswordEmailProps>
> = ({ firstName = 'Bruker', resetLink }) => (
  <Html>
    <Head />
    <Preview>{EMAIL_TEXT.preview}</Preview>
    <Tailwind>
      <Body className='font-sans bg-gray-100'>
        <Container className='max-w-xl p-6 bg-white rounded-lg shadow-md'>
          <Heading className='text-2xl font-bold text-gray-800'>
            {EMAIL_TEXT.greeting}, {firstName}!
          </Heading>
          <Section className='mt-4'>
            <Text className='text-lg text-gray-700'>
              {EMAIL_TEXT.instruction}
            </Text>
            <div className='mt-6 text-center'>
              <Link
                href={resetLink}
                className='inline-block px-6 py-3 text-white bg-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-700'
              >
                {EMAIL_TEXT.button}
              </Link>
            </div>
            <Text className='mt-6 text-sm text-gray-600'>
              {EMAIL_TEXT.note}
            </Text>
          </Section>
          <Text className='mt-8 text-sm text-gray-500'>
            {EMAIL_TEXT.footer}
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
)
