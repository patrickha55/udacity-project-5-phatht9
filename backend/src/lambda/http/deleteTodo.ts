import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { getUserId } from '../utils';
import { TodoItemsService } from '../../services/todoItems';

const todoService = new TodoItemsService();

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid todoId.'
        })
      };
    }

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid UserId.'
        })
      };
    }

    const IsTodoExists = await todoService.IsTodoExistsAsync(todoId, userId);

    if (!IsTodoExists) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo item with the provided id doesn\'t exists.'
        })
      };
    }

    const result = await todoService.deleteATodoAsync(todoId, userId);

    if (!result) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid todoId.'
        })
      };
    }

    return {
      statusCode: 204,
      body: JSON.stringify({
        status: 'Deleted successfully'
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
