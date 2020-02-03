import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { addAttachmentUrl } from '../../businessLogic/todos'
import 'source-map-support/register'
import * as uuid from 'uuid'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  const todoId = event.pathParameters.todoId  
  const imageId = uuid.v4()

  const url = await addAttachmentUrl(imageId, todoId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}