import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { TodoItemsService } from '../../services/todoItems';

const todoService = new TodoItemsService();

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields.'
        })
      };
    }

    if (!event.pathParameters.todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required todoId.'
        })
      };
    }

    const result = await todoService.updateATodoAsync(event);

    if (result) {
      return {
        statusCode: 204,
        body: JSON.stringify({
          status: 'Updated successfully'
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'Something went wrong'
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
