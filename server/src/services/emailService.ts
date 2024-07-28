// server/services/emailService.ts
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

export const sendVerificationEmail = async (to: string, verificationToken: string) => {
  const backendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.gardennexus.com'  // Use your actual production API URL here
    : 'http://localhost:4001';  // Use your local backend port

  const verificationLink = `${backendUrl}/api/verify/${verificationToken}`;

  const params = {
    Source: 'Garden Nexus <noreply@gardennexus.com>',
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: {
        Data: 'Welcome to Garden Nexus - Please Verify Your Email'
      },
      Body: {
        Html: {
          Data: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email for GardenNexus</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; font-size: 16px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #DDE5B6; color: #6C584C; text-align: center; padding: 20px; font-size: 20px; }
        .content { background-color: #f4f4f4; padding: 20px; border-radius: 5px; color: #000000; font-size: 16px; }
        .button { display: inline-block; background-color: #DDE5B6; color: #6C584C; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Garden Nexus!</h1>
        </div>
        <div class="content">
            <p>Dear Garden Nexus Member,</p>
            <p>Thank you for joining our community. We're excited to have you on board!</p>
            <p>To complete your registration, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
                <a href="${verificationLink}" class="button" style="color: #6C584C;">Verify My Email</a>
            </p>
            <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
            <p>${verificationLink}</p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with Garden Nexus, please ignore this email.</p>
            <p>Happy Gardening!</p>
            <p>Best regards,<br>The Garden Nexus Team</p>
        </div>
        <div class="footer">
            <p>© 2024 GardenNexus. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
          `
        }
      }
    }
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log('Verification email sent:', result.MessageId);
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};