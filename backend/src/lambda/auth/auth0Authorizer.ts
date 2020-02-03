import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const certificate = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJL7DOP9pd4pTAMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1mNWsyNGs2Mi5ldS5hdXRoMC5jb20wHhcNMjAwMTMxMjM0NTA0WhcN
MzMxMDA5MjM0NTA0WjAkMSIwIAYDVQQDExlkZXYtZjVrMjRrNjIuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyjsEcudXooSMssD9
NVeVx0tY5JaaU/xGpPJ2oiiykao4a6Lc4SvxpFKPbGWcFsHuKAU3+dhL/tTiOi16
XJ6kH06vMCeY7KHb0ytVZ+8SrincjRrCNRuersTv1qY6okvUKBoxNgn0/EjAkhxo
e4Ii+vJ/C+WV+1B87N2HhXub513gppEY66bHdQsjwXuHLGa/noACZxWm8Y4sd5Rm
Vkl7Y9S/GUHEETPYIYVn71MhFNiESqGDaxMuMIL3g12T8wtuddSolUNtyAhQhq6Y
k1c1xq8gR+zVrB9tAey0RbQ9wlJrXTp3oUomFd/A7X7FvwJNvYGsFGqxNAoVJSph
fM52xQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRTH/rvdK5O
+EgKgT7ahuzJ+gpdZTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AKI9eVrk6qkWtRyJ3Ygjgi+UCYWuJbjhU4K4kZWe8qM91Z+tRc/KlmDSGy/bcrJ4
8QiLBMUDTLOdMl9T9Qw123xux/j62re7A9MZjAmsnMqJNhP16kBcQlhl0GpFvG5v
bUt8GlVEkhF97tGlRZRPF5qUxmYoBj+wLSisk9xYxHZUl5YKhZ+lMm44SIZWdRJ1
SHx4nCwaFsWM24Jz7ddI6m5XO5DIoIa0+06zyaRifmSWRNni4/Qj72+CQMUCq/CI
2ZBtE1AhKT34sZVmjgCZmp30xYWQ0lgP/MgxafVCnYHDOScjvSszJhapOQ0kmF6Z
G6BbLBwRNQp8id/gVouZANo=
-----END CERTIFICATE-----`

// const jwksUrl = 'https://dev-f5k24k62.eu.auth0.com/.well-known/jwks.json'

export const handler = async ( event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {  
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt  

  if (!jwt) {
    throw new Error('Invalid Token') 
  } 

  // const certificate = await Axios.get(jwksUrl)  

  return verify(token, certificate, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
