import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { TodoItemsService } from '../../services/todoItems';
import { createLogger } from '../../utils/logger';
import { ExtractEvent } from '../../helpers/ExtractEvent';

const todoService = new TodoItemsService();
const logger = createLogger('Delete todo lambda fuction.');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Start extracting info from api gateway event.');

    const { userId, todoId } = ExtractEvent(event);

    if (!todoId) {
      logger.warn('Todo id is invalid.', {
        todoId
      });

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid todoId.'
        })
      };
    }

    if (!userId) {
      logger.warn('User id is invalid.', {
        userId
      });

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid UserId.'
        })
      };
    }

    const IsTodoExists = await todoService.IsTodoExistsAsync(todoId, userId);

    if (!IsTodoExists) {
      logger.info('Todo item doesn\'t exists');

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
          error: 'Fail to delete an todo item.'
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
