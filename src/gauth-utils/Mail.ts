// As we were asked to not Use External APIs
// We create our own APIs

import fetch from 'node-fetch';

import { MailApiUri } from '../config/GMail';

// https://stackoverflow.com/a/32591614/1691072
// EMail is encoded in Base64 Encoded Format
// Perform Encoding in RFC 2822 Standard
export function EncodeResponse(data: string) {
    return Buffer.from(data)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
// Send the EMail to the server
// Input is String in RFC 2822 standard
export async function RFC2822Email(
    accessToken: string,
    raw: string
) {
    const response = await fetch(
        String(`${MailApiUri}?access_token=${accessToken}`),
        {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                raw: raw
            })
        }
    );
    const json = await response.json();
    return json;
}

// Convert Headers from JSON to RFC 2822 standard
// Content-Type: text/plain\n
// From: sender@email.com
function StringifyHeaders(
    headers: Record<string, unknown>
) {
    return Object.entries(headers)
        .map(([k, v]) => `${k.toUpperCase()}:${v}`)
        .join('\n');
}

export function GenerateRFC2822(
    headers: Record<string, unknown>,
    body: string
) {
    return `${StringifyHeaders(headers).replace('\r', '')}


${body.replace('\r', '')}`;
}

export function EncodeRFC2822(raw: string) {
    return EncodeResponse(raw);
}
