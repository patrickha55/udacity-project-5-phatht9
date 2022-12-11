import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { TodoItemsService } from '../../services/todoItems';
import { createLogger } from '../../utils/logger';

const todoService = new TodoItemsService();
const logger = createLogger('Create todo item.');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Start creating a new todo item.');
    if (!event.body) {
      logger.error('Invalid request body.');
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields.'
        })
      };
    }

    const newTodoDTO = await todoService.createATodoAsync(event);

    logger.info('A new todo item created!', {
      newTodo: newTodoDTO
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTodoDTO
      })
    };
  });

handler.use(
  cors({
    origin: '*',
    credentials: true
  })
);
