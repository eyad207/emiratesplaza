'use server'

import { Resend } from 'resend'
import { CreateEmailOptions, CreateEmailRequestOptions } from 'resend'
import { render } from '@react-email/render'
import React from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (
  payload: CreateEmailOptions & { react: React.ReactElement },
  options?: CreateEmailRequestOptions | undefined
) => {
  const html = await render(payload.react)
  const data = await resend.emails.send({ ...payload, html }, options)

  return data
}
