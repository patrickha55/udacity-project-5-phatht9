import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';

import { verify } from 'jsonwebtoken';
import Axios from 'axios';
import { JwtPayload } from '../../auth/JwtPayload';

const jwksUrl = 'https://dev-qcygqyyjkj6m7ese.us.auth0.com/.well-known/jwks.json';

export const handler = async (
    event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
    console.info('Authorizing a user', event.authorizationToken);
    try {
        const jwtToken = await verifyToken(event.authorizationToken);
        console.info('User was authorized', jwtToken);

        return generatePolicy(jwtToken.sub, '*', 'Allow');
    } catch (e) {
        console.error('User not authorized', { error: e.message });

        return generatePolicy('user', '*', 'Deny');;
    }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
    const token = getToken(authHeader);

    const certInfo: string = await getCertInfo();

    return verify(token, certInfo, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header');

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header');

    const split = authHeader.split(' ');
    const token = split[1];

    return token;
}

/**
 * Get a singing certificate form Auth0
 */
async function getCertInfo(): Promise<string> {
    try {
        const response = await (await Axios.get(jwksUrl)).data;
        const data: string = response['keys'][0]['x5c'][0];
        const certInfo = certToPEM(data);
        return certInfo;
    } catch (error) {
        console.error(`Can't fetch the Authentication certificate. Error: `, error);
    }
}

/**
 * Convert JWKS cert to PEM
 * @param cert 
 * @returns 
 */
export function certToPEM(cert: string): string {
    cert = cert.match(/.{1,64}/g).join('\n');
    cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
    return cert;
}

/**
 * Generate an api gateway authorizer policy for authentication.
 * @param principalId An id of a user
 * @param resource Resources an user can access. Pass in '*' for all resources.
 * @param effect Allow or Deny.
 * @returns A policy for api gateway.
 */
function generatePolicy(
    principalId: string,
    resource: string,
    effect: string
): CustomAuthorizerResult {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    };
}
