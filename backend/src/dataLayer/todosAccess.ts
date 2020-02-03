import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
//import { TodoImageItem } from '../models/TodoImageItem'

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3 = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosUserIndex = process.env.TODOS_USER_ID_INDEX,
        private readonly todosIdIndex = process.env.TODOS_ID_INDEX,
        //private readonly imagesTable = process.env.IMAGES_TABLE,
        private readonly bucketName = process.env.IMAGES_S3_BUCKET) { }        

    async getAllTodos(userId: string) {
        console.log(`Getting all todo items for user ${userId}`)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosUserIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            }
        }).promise()

        return result.Items as TodoItem[]
    }

    async createTodo(newTodoItem: TodoItem): Promise<TodoItem> {
        console.log(`Creating a todo item`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: newTodoItem
        }).promise()

        return newTodoItem
    }

    async getTodoItem(todoId: string) {
        console.log(`Getting todo item: ${todoId}`)

        const result = await this.docClient.query({
            TableName : this.todosTable,
            IndexName : this.todosIdIndex,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
            },
            ScanIndexForward: false
        }).promise()

        if (result) {
            for (const item of result.Items) {
                const todoItem = item as TodoItem
                console.log(todoItem)
                return todoItem 
            }
        }        
        return undefined;        
    }

    async updateTodoItem(todoItem: TodoItem) {
        console.log(`Updating todo item: ${todoItem.todoId}`)

        await this.docClient.put({
            TableName : this.todosTable,            
            Item: todoItem
        }).promise()

        return todoItem
    }

    async deleteTodoItem(userId: String, todoId: string) {
        console.log(`Deleting todo item for todo item: ${todoId} and user: ${userId}`)

        await this.docClient.delete({
            TableName : this.todosTable,
            Key: {
                "todoId": todoId
            }
        }).promise()

        return "Deleted Item Successfully"
    }

    async uploadFile(imageId: string) {
        const urlExpiration = 300
        return this.s3.getSignedUrl('putObject', {
          Bucket: this.bucketName,
          Key: imageId,
          Expires: urlExpiration
        })
    }
}