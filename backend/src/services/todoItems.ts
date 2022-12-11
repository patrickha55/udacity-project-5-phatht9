// import { AttachmentUtils } from './attachmentUtils';
// import * as createError from 'http-errors';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { createLogger } from '../utils/logger';
import { CreateTodoRequest } from '../dtos/requests/CreateTodoRequest';
import { getUserId } from '../lambda/utils';
import { Logger } from 'winston';
import { TodoItem } from '../models/TodoItem';
import { TodoItemDTO } from '../dtos/responses/TodoItemDTO';
import { TodoItemsAccess } from '../repositories/todoItemsAccess';
import * as uniqueId from 'uuid';
import { UpdateTodoRequest } from '../dtos/requests/UpdateTodoRequest';

export class TodoItemsService {
    private readonly todoItemsAccess: TodoItemsAccess;
    private readonly logger: Logger;

    constructor() {
        this.todoItemsAccess = new TodoItemsAccess();
        this.logger = createLogger('Todo Service');
    }

    /**
     * Get all todo items of an user.
     * @param event An event
     * @returns A list of todo items.
     */
    async getAllUsersTodoItemsAsync(event: APIGatewayProxyEvent): Promise<TodoItemDTO[]> {
        this.logger.info('Get the userId');

        const userId = getUserId(event);

        const todoItems = await this.todoItemsAccess.getAllTodoItemsAsync(userId);

        const todoItemDTOs: TodoItemDTO[] = todoItems.map(item => {
            return {
                todoId: item.todoId,
                createdAt: item.createdAt,
                attachmentUrl: item.attachmentUrl,
                done: item.done,
                dueDate: item.dueDate,
                name: item.name
            };
        });

        return todoItemDTOs;
    }

    /**
     * Create new attributes for a todo and calling createTodo from data access.
     * @param event An event.
     * @returns A new todo item.
     */
    async createATodoAsync(event: APIGatewayProxyEvent): Promise<TodoItemDTO> {
        this.logger.info('Create a todo.');

        const userId = getUserId(event);

        const parsedBody: CreateTodoRequest = JSON.parse(event.body);

        const todoId = uniqueId.v4();

        const createdAt = new Date().toISOString();

        const newTodo: TodoItem = {
            todoId,
            userId,
            createdAt,
            attachmentUrl: '',
            done: false,
            ...parsedBody
        };

        await this.todoItemsAccess.createTodoAsync(newTodo);

        const newTodoDTO: TodoItemDTO = {
            todoId: newTodo.todoId,
            createdAt: newTodo.createdAt,
            attachmentUrl: newTodo.attachmentUrl,
            done: newTodo.done,
            dueDate: newTodo.dueDate,
            name: newTodo.name
        };

        return newTodoDTO;
    }

    /**
     * Update an existing todo item by getting necessary information and calling todo data access.
     * @param event An event
     * @returns True if update successfully, else false.
     */
    async updateATodoAsync(event: APIGatewayProxyEvent): Promise<boolean> {
        const todoId: string = event.pathParameters.todoId;
        const userId: string = getUserId(event);

        this.logger.info('todoId and userId: ', {
            todoId, userId
        });

        if (!todoId || !userId) {
            throw new Error('Invalid todoId or userId');
        }

        const existing = await this.todoItemsAccess.todoExistsAsync(todoId, userId);

        if (!existing) {
            this.logger.info(`Todo with an id ${todoId} doesn't exists.`);
            return false;
        }

        const todo: UpdateTodoRequest = JSON.parse(event.body);

        this.logger.info('Updated todo attributes', {
            todo
        });

        return await this.todoItemsAccess.updateTodoAsync(todoId, userId, todo);;
    }

    async updateATodoAttachment(todoId: string, userId: string, s3Key: string): Promise<boolean> {
        return this.todoItemsAccess.updateTodoAttachmentAsync(todoId, userId, s3Key);
    }

    /**
     * Delete an existing todo item.
     * @param event An event
     * @returns True if delete successfully, else false.
     */
    async deleteATodoAsync(todoId: string, userId: string): Promise<boolean> {
        return await this.todoItemsAccess.deleteTodoAsync(todoId, userId);
    }

    /**Check to see if a todo item exists. */
    async IsTodoExistsAsync(todoId: string, userId: string): Promise<boolean> {

        return await this.todoItemsAccess.todoExistsAsync(todoId, userId);
    }
}