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
  const params = {
    Source: 'verifyEmail@gardennexus.com',
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: {
        Data: 'Verify Your Email for GardenNexus'
      },
      Body: {
        Html: {
          Data: `
            <h1>Welcome to GardenNexus!</h1>
            <p>Please click the link below to verify your email:</p>
            <a href="https://gardennexus.com/verify/${verificationToken}">Verify Email</a>
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