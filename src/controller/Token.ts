/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/naming-convention */

// Use this To Interact with Google APIs
// Interact with Tokens
// As we were asked to not Use External APIs
// We create our own APIs

import { URLSearchParams } from 'url';
import fetch from 'node-fetch';

import OpenID from '../interfaces/OpenID';
import googleConfig from '../config/google';
import { WellKnownEndPoint } from '../config/GMail';

let Config: OpenID;

export async function LoadWellKnownConfiguration() {
    const response = await fetch(WellKnownEndPoint);
    if (!response.ok) return;
    const json = await response.json();
    Config = json as OpenID;
}

function encodeGetParams(
    params: Record<string, string | boolean>
) {
    return Object.entries(params)
        .map((kv) => kv.map(encodeURIComponent).join('='))
        .join('&');
}

// Generate the Login URI from where user logs into our website
// https://developers.google.com/identity/protocols/oauth2/web-server
export function LoginUri({
    client_id,
    scope,
    redirect_uris,
    access_type,
    state
}: {
    client_id: string;
    scope: string | string[];
    redirect_uris: string[] | string;
    access_type?: string;
    state: string;
}) {
    let redirectUri = '';
    if (Array.isArray(redirect_uris))
        [redirectUri] = redirect_uris;
    redirectUri = String(redirectUri);

    return `${
        Config?.authorization_endpoint
    }?${encodeGetParams({
        state: state,
        access_type: access_type ?? 'offline',
        scope: Array.isArray(scope)
            ? scope.join(' ')
            : scope,
        include_granted_scopes: true,
        response_type: 'code',
        // Callback URI called on Failure or Success
        redirect_uri: redirectUri,
        client_id: client_id,
        prompt: 'consent'
    })}`;
}

// Fetch the Access Token from Google
// Using Refresh Token or Code Token
// https://developers.google.com/identity/protocols/oauth2/web-server
// Use this to make things a lot more general purpose
async function TokenFetch(params: Record<string, unknown>) {
    const { redirect_uris } = googleConfig.web;
    let redirect_uri = '';
    if (Array.isArray(redirect_uris))
        [redirect_uri] = redirect_uris;
    redirect_uri = String(redirect_uri);

    return await fetch(`${Config?.token_endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type':
                'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            ...params,
            client_id: googleConfig.web.client_id,
            client_secret: googleConfig.web.client_secret,
            redirect_uri: redirect_uri
        })
    });
}

// Return the Access Token from the Code Token
// https://developers.google.com/identity/protocols/oauth2/web-server
export async function AccessTokens(code: string) {
    const response = await TokenFetch({
        code: code,
        grant_type: 'authorization_code'
    });
    if (!response.ok) return null;
    const json = await response.json();
    return {
        access_token: String(json.access_token),
        refresh_token: String(json.refresh_token)
    };
}

// Return the Access Token from the Refresh Token
// The Access Token last for small durations
// https://developers.google.com/identity/protocols/oauth2/web-server
export async function RefreshAccessToken(
    refresh_token: string
) {
    const response = await TokenFetch({
        refresh_token: refresh_token,
        grant_type: 'refresh_token'
    });
    if (!response.ok) return null;
    const json = await response.json();
    return {
        access_token: String(json.access_token),
        refresh_token: String(refresh_token)
    };
}

// Returns true if Revocation Successful
export async function RevokeToken(token: string) {
    return (
        await fetch(
            `${Config?.revocation_endpoint}?token=${token}`,
            {
                method: 'POST',
                headers: {
                    'Content-type':
                        'application/x-www-form-urlencoded'
                }
            }
        )
    ).ok;
}

export async function UserInfo(token: string) {
    return (
        await fetch(
            `${Config.userinfo_endpoint}?alt=json`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
    ).json();
}

// Return EMail ID of User
export async function UserGetEmail(token: string) {
    const userInfo = await UserInfo(token);
    if (userInfo.email_verified)
        return String(userInfo.email);
    return null;
}
