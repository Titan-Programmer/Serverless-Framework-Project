// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it - complete
const apiId = 'llht1w6cwe'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map - complete
  domain: 'dev-f5k24k62.eu.auth0.com',            // Auth0 domain
  clientId: 'yI2E6IWnNXRfXmjgagwyvZd31Hatun9Z',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
