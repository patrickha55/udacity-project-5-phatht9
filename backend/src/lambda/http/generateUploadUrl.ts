const attachmentsAccess = new AttachmentsAccess();
import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AttachmentsAccess } from '../../repositories/attachmentsAccess';
import { cors, httpErrorHandler } from 'middy/middlewares';
import * as middy from 'middy';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;

    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid todo id'
        })
      };
    }

    const uploadUrl = attachmentsAccess.createAttachmentPresignedUrl(todoId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    };
  }
);

handler
  .use(httpErrorHandler())
  .use(
    cors({
      origin: '*',
      credentials: true
    })
  );
