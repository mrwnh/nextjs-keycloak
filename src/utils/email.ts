import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendConfirmationEmail(email: string, firstName: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Registration Confirmation',
    text: `Dear ${firstName},\n\nThank you for registering for our event. Your registration has been confirmed.\n\nBest regards,\nEvent Team`,
    html: `<p>Dear ${firstName},</p><p>Thank you for registering for our event. Your registration has been confirmed.</p><p>Best regards,<br>Event Team</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}