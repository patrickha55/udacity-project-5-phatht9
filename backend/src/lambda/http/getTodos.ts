import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { TodoItemsService } from '../../services/todoItems';

const todoService = new TodoItemsService();

/**
 * Get all TODO items for a current user
 */
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoItems = await todoService.getAllUsersTodoItemsAsync(event);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todoItems
      })
    };
  }
);

handler.use(
  cors({
    origin: '*',
    credentials: true
  })
);
