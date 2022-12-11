export interface TodoItemDTO {
    todoId: string;
    createdAt: string;
    name: string;
    dueDate: string;
    done: boolean;
    attachmentUrl?: string;
}
