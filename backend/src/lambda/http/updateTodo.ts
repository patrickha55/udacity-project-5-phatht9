import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { TodoItemsService } from '../../services/todoItems';
import { createLogger } from '../../utils/logger';
import { UpdateTodoRequest } from '../../dtos/requests/UpdateTodoRequest';
import { ExtractEvent } from '../../helpers/ExtractEvent';

const todoService = new TodoItemsService();
const logger = createLogger('Update todo logger');

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

    const { userId, todoId } = ExtractEvent(event);

    const todo: UpdateTodoRequest = JSON.parse(event.body);

    logger.info('Updated todo attributes', {
      todo
    });

    const result = await todoService.updateATodoAsync(todoId, userId, todo);

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
