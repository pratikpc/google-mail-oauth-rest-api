// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/naming-convention */

import {
    RFC2822Email,
    EncodeRFC2822,
    GenerateRFC2822
} from '../gauth-utils/Mail';
import { RefreshAccessToken } from '../gauth-utils/Token';
import UserStorage from '../resources/UsersStorage';
import ErrorEvents from '../events/ErrorEvents';

// Send RFC2822 Mail
export async function SendRawMail({
    raw,
    email: email_
}: {
    raw: string;
    email: string;
}) {
    const email = String(email_);
    await UserStorage.LoadFile();
    const user = UserStorage.Info[email];

    console.log('RFC2822 Text', raw);

    if (user == null) {
        ErrorEvents.emit('error', 'User Not Found');
        throw new Error('User Not Found');
    }
    const { refresh_token } = user;
    const access_token = (
        await RefreshAccessToken(refresh_token)
    )?.access_token;
    if (access_token == null) {
        ErrorEvents.emit(
            'error',
            'Unable to generate Access Token'
        );
        throw new Error('Unable to generate Access Token');
    }

    const json = await RFC2822Email(
        access_token,
        EncodeRFC2822(String(raw))
    );
    if (json.error != null) {
        ErrorEvents.emit(
            'error',
            'Unable to Send Mail',
            json.error
        );
        throw new Error(json.error);
    }
    console.log('Results of Sending mail are');
    console.log(json);
    return json;
}

export async function SendMail({
    headers,
    data,
    email
}: {
    email: string;
    headers: Record<string, unknown>;
    data: string;
}) {
    return await SendRawMail({
        raw: GenerateRFC2822(headers, data),
        email: email
    });
}
