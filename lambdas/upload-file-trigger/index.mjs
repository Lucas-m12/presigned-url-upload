import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoClient = new DynamoDBClient();

export const handler = async (event) => {
  const commands = event.Records.map((record) => {
    const filekey = decodeURIComponent(record.s3.object.key);
    return new UpdateItemCommand({
      TableName: 'upload-study',
      Key: { filekey: { S: filekey } },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': { S: 'uploaded' },
      },
    });
  });
  
  await Promise.all(commands.map((command) => dynamoClient.send(command)));

  return {
    statusCode: 200,
    body: JSON.stringify('Uploaded files updated'),
  };
};
