import { EventEmitter } from 'events';

import {
    AccessTokens,
    UserGetEmail
} from '../controller/Token';
import UserStorage from '../resources/UsersStorage';

const AuthEvents = new EventEmitter();

// Runs when Sign Up is Emitted
AuthEvents.on(
    'sign_up',
    async ({ code }: { code: string }) => {
        // Try to Access Tokens
        const tokens = await AccessTokens(code);
        // If we were unable to access Tokens, return
        if (tokens == null) return;
        // Get the Email
        const email = await UserGetEmail(
            tokens.access_token
        );
        // If Email unknown, return
        if (email == null) return;

        await UserStorage.LoadFile();
        UserStorage.SetUser(email, {
            code: code,
            email: email,
            refresh_token: tokens.refresh_token
        });
        await UserStorage.Save;
    }
);

export default AuthEvents;
