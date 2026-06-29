'use client'

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

export default function ReCaptchaWrapper({ 
  children, 
  siteKey 
}: { 
  children: React.ReactNode, 
  siteKey: string 
}) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey} scriptProps={{
      async: false,
      defer: false,
      appendTo: 'head',
      nonce: undefined
    }}>
      {children}
    </GoogleReCaptchaProvider>
  )
}
