import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

config();

const BUCKET_ADDR = 'https://carillon-bucket.s3.ap-northeast-2.amazonaws.com/';

const client = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_KEY as string,
    secretAccessKey: process.env.S3_PRIVATE_KEY as string,
  },
  region: 'ap-northeast-2',
});

export async function uploadImageToS3(filename: string, buffer: Buffer) {
  const command = new PutObjectCommand({
    Bucket: 'carillon-bucket',
    Key: filename,
    Body: buffer,
  });
  await client.send(command);
}

export function getFileAddress(filename: string) {
  return BUCKET_ADDR + filename;
}
