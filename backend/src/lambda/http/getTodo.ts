import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { TodoItemDTO } from "../../dtos/responses/TodoItemDTO";
import { ExtractEvent } from "../../helpers/ExtractEvent";
import { TodoItemsService } from "../../services/todoItems";
import { createLogger } from "../../utils/logger";

const todoService = new TodoItemsService();
const logger = createLogger('Get an todo item lambda function');

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info('Start getting an todo item.');

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

        const item: TodoItemDTO = await todoService.getTodoItemAsync(todoId, userId);

        return {
            statusCode: 200,
            body: JSON.stringify({
                item
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