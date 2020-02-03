import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event:', event)
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  console.log(updatedTodo)
  const updateTodoItem = await updateTodo(updatedTodo, todoId)
  
  return {
      statusCode: 200,
      headers: {
          'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
          items: updateTodoItem
      })
  } 
}
