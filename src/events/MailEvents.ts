// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/naming-convention */

import { EventEmitter } from 'events';

import {
    RFC2822Email,
    EncodeRFC2822,
    GenerateRFC2822
} from '../controller/Mail';
import { RefreshAccessToken } from '../controller/Token';
import UserStorage from '../resources/UsersStorage';
import ErrorEvents from './ErrorEvents';

const MailEvents = new EventEmitter();

// Runs when Send EMail is Emitted
MailEvents.on(
    'send',
    ({
        headers,
        data,
        email
    }: {
        email: string;
        headers: Record<string, unknown>;
        data: string;
    }) => {
        MailEvents.emit('send_raw', {
            raw: GenerateRFC2822(headers, data),
            email: email
        });
    }
);
// Runs when Send RFC2822 is Selected and Sent is Emitted
MailEvents.on(
    'send_raw',
    async ({
        raw,
        email: email_
    }: {
        raw: string;
        email: string;
    }) => {
        const email = String(email_);
        await UserStorage.LoadFile();
        const user = UserStorage.Info[email];

        console.log('RFC2822 Text', raw);

        if (user == null) {
            ErrorEvents.emit('error', 'User Not Found');
            return;
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
            return;
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
            return;
        }
        console.log('Results of Sending mail are');
        console.log(json);
    }
);

export default MailEvents;
