import nodemailer from 'nodemailer';

async function sendMail(email: string, subject: string, content: string, attachments?: Array<{filename: string, content: Buffer}>) {
  const transporter = nodemailer.createTransport({
    'auth': {
      'pass': process.env.PASSWORD_NOREPLY,
      'user': process.env.EMAIL_NOREPLY,
    },
    'service': 'gmail',
  });

  const mail: any = {
    'from': 'Rays Application <' + process.env.EMAIL + '>',
    'html': content,
    'subject': subject,
    'to': email,
  };

  if (attachments) { mail.attachments = attachments; }

  await transporter.sendMail(mail);
}

export default sendMail;
