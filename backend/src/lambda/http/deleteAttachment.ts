import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";
import { UpdateTodoRequest } from "../../dtos/requests/UpdateTodoRequest";
import { TodoItemDTO } from "../../dtos/responses/TodoItemDTO";
import { ExtractEvent } from "../../helpers/ExtractEvent";
import { AttachmentService } from "../../services/attachmentService";
import { TodoItemsService } from "../../services/todoItems";
import { createLogger } from "../../utils/logger";

const attachmentService = new AttachmentService();
const todoService = new TodoItemsService();
const logger = createLogger('Delete attachment logger.');

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

        const todoItemDTO: TodoItemDTO = await todoService.getTodoItemAsync(todoId, userId);

        if (!todoItemDTO) {
            logger.info('Todo item with the provided id doesn\'t exists.', {
                todoId
            });

            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: 'Todo Item with the provided ID doesn\'t exists.'
                })
            };
        }

        const doesTodoItemHasAnAttachment = await attachmentService.isAttachmentExists(todoId);

        if (!doesTodoItemHasAnAttachment) {
            logger.warn('The todo item found doesn\'t has an attachment');

            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: 'No attachment found.'
                })
            };
        }

        const result = await attachmentService.deleteAttachmentAsync(todoId);

        if (!result) {
            logger.warn('The todo item found doesn\'t has an attachment');

            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Delete attachment failed.'
                })
            };
        }

        const todo: UpdateTodoRequest = {
            name: todoItemDTO.name,
            attachmentUrl: '',
            done: todoItemDTO.done,
            dueDate: todoItemDTO.dueDate
        };

        const isUpdatedTodoSuccess = await todoService.updateATodoAsync(todoId, userId, todo);

        if (!isUpdatedTodoSuccess) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Update an todo item failed.'
                })
            };
        }

        return {
            statusCode: 204,
            body: JSON.stringify({
                error: 'Attachment of an todo item deleted successfully!'
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