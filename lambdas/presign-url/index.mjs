import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

const s3Client = new S3Client();
const dynamoClient = new DynamoDBClient();

export const handler = async (event) => {
  const { filename } = JSON.parse(event.body);

  if (!filename) {
    return {
      statusCode: 400,
      body: JSON.stringify('Missing filename'),
    };
  };

  const filekey = `${randomUUID()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: 'upload-study',
    Key: filekey,
  });

  const dynamoCommand = new PutItemCommand({
    TableName: 'upload-study',
    Item: {
      filekey: { S: filekey },
      originalFilename: { S: filename },
      uploadDate: { S: new Date().toJSON() },
      status: { S: 'pending' },
    }
  });

  const signedUrl = await getSignedUrl(
    s3Client,
    command,
    { expiresIn: 60 }
  );

  await dynamoClient.send(dynamoCommand);

  const response = {
    statusCode: 200,
    body: JSON.stringify({ signedUrl }),
  };
  return response;
};
