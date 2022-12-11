import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { TodoItemsService } from "../../services/todoItems";
import { createLogger } from "../../utils/logger";
import { getUserId } from "../utils";

const todoService = new TodoItemsService();
const logger = createLogger('Update a todo item attachment');

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info('Starting update todo attachment');

        const todoId = event.pathParameters.todoId;

        if (!todoId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Invalid todo id provided'
                })
            };
        }

        const payload = JSON.parse(event.body);

        const userId: string = getUserId(event);

        logger.info('All params: ', {
            todoId,
            userId,
            payload
        });

        const result = await todoService.updateATodoAttachment(todoId, userId, payload.s3Key);

        return {
            statusCode: result ? 200 : 500,
            body: JSON.stringify({
                message: result ? 'Update successfully' : 'Update fail'
            })
        };
    }
);

handler
    .use(httpErrorHandler())
    .use(cors(
        {
            origin: "*",
            credentials: true,
        }
    ));