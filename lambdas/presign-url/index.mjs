import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_REGION });

const BUCKET = process.env.BUCKET_NAME;
const KEY_PREFIX = process.env.KEY_PREFIX ?? '';
const EXPIRES_IN = Number(process.env.EXPIRES_IN ?? 300);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  const method = event?.requestContext?.http?.method ?? 'POST';
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  let filename;
  try {
    const raw = event?.isBase64Encoded
      ? Buffer.from(event.body ?? '', 'base64').toString('utf8')
      : event?.body ?? '';
    ({ filename } = JSON.parse(raw || '{}'));
  } catch {
    return json(400, { message: 'Invalid JSON body' });
  }

  if (!filename) {
    return json(400, { message: 'filename is required' });
  }

  const key = `${KEY_PREFIX}${filename}`;
  const signedUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: EXPIRES_IN },
  );

  return json(200, { signedUrl });
};
