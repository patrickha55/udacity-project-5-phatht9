import { APIGatewayProxyEvent } from "aws-lambda";
import { CompositeKey } from "../models/compositeKey";
import { createLogger } from "../utils/logger";
import { GetUserId } from "./getUserId";

export function ExtractEvent(event: APIGatewayProxyEvent): CompositeKey {
    const logger = createLogger('Extract event helper function.');
    const todoId: string = event.pathParameters.todoId;
    const userId: string = GetUserId(event);

    logger.info('todoId and userId: ', {
        todoId,
        userId
    });

    return {
        userId,
        todoId
    };
}