import { NextResponse } from 'next/server';
import "dotenv"
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const { recipientEmail, name, email, message } = await req.json();

  console.log(process.env.SMTP_EMAIL, process.env.SMTP_PASSWORD)

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: recipientEmail,
    subject: `New message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    html: `
      <h1>New message from ${name}</h1>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
