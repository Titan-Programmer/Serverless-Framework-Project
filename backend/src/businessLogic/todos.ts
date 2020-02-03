import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { parseUserId } from '../auth/utils'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodosAccess()
const bucketName = process.env.IMAGES_S3_BUCKET

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
    const forUserId = parseUserId(jwtToken)
    return await todoAccess.getAllTodos(forUserId);
}

export async function getTodoItemById(todoId: string)
{
    return await todoAccess.getTodoItem(todoId)
}

export async function createTodo(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
    
    const todoId = uuid.v4()
    const forUserId = parseUserId(jwtToken)

    console.log(`Creating todo item: ${createTodoRequest}`)
    return await todoAccess.createTodo({
        todoId: todoId,
        userId: forUserId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: " "
    })
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, todoId: string) {
    console.log(`Querying database for todo item: ${todoId}`)
    var currentTodoItem = await todoAccess.getTodoItem(todoId)

    console.log(`Updating current item with new details: ${todoId}`)
    currentTodoItem.name = updateTodoRequest.name
    currentTodoItem.dueDate = updateTodoRequest.dueDate
    currentTodoItem.done = updateTodoRequest.done

    return await todoAccess.updateTodoItem(currentTodoItem)
}

export async function deleteTodo(jwtToken: string, todoId: string) {
    const userId = parseUserId(jwtToken)
    console.log(`Starting function for deleting todo item: ${todoId} for userId: ${userId}`)    
    return await todoAccess.deleteTodoItem(userId, todoId)
}

export async function addAttachmentUrl(imageId: string, todoId: string) {
    console.log(`Getting attachment url for item: ${todoId}`)
    const url = await todoAccess.uploadFile(imageId)    

    console.log(`Querying database for todo item: ${todoId}`)
    var currentTodoItem = await todoAccess.getTodoItem(todoId)

    console.log(`Updating current item with new details: ${todoId}`)
    currentTodoItem.attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
    await todoAccess.updateTodoItem(currentTodoItem)

    return url
}