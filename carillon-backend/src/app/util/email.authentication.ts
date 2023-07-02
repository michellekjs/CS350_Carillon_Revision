import nodemailer from 'nodemailer';
import logger from './logger';

export async function sendEmail(email: string, authCode: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_ID,
      pass: process.env.GMAIL_PASS,
    },
  });
  const mailOptions = {
    from: {
      name: 'Carillon-authenticator',
      address: 'carillon-authenticator@gmail.com',
    },
    to: email,
    subject: '이메일 인증',
    html: `<h1>이메일 인증</h1>
          <div>
            아래 코드를 입력해주세요.
            <p style="font-size:20px;margin-top:20px">
                <b><b>${authCode}</b></b>
            </p>
          </div>`,
    text: '코드를 입력하고 인증을 완료해주세요.',
  };
  const info = await transporter.sendMail(mailOptions);
  logger.info(`Email sent: ${info}`);
}

export function generateAuthCode() {
  const codeLength = 6;
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  let result = '';
  for (let i = 0; i < codeLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
