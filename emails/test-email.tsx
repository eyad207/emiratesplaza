import * as React from 'react'

interface EmailTemplateProps {
  firstName: string
  code: string
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  code,
}) => (
  <html>
    <head>
      <style>
        {`
          body {
            font-family: Arial, sans-serif;
          }
          .container {
            padding: 20px;
          }
          .header {
            font-size: 24px;
            font-weight: bold;
          }
          .code {
            font-size: 18px;
            color: #333;
          }
        `}
      </style>
    </head>
    <body>
      <div className='container'>
        <div className='header'>Welcome, {firstName}!</div>
        <p className='code'>Your verification code is: {code}</p>
      </div>
    </body>
  </html>
)
