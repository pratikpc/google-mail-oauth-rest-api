import { Router } from 'express';
import StatusCode from 'http-status-codes';

import url from 'url';
import googleConfig from '../config/google';
import { LoginUri } from '../gauth-utils/Token';
import AuthEvents from '../events/AuthEvents';

export default function Auth(app: Router) {
    const route = Router();
    app.use('/auth', route);

    route.get('/signIn', (req, res) => {
        // Get the current Callback URI
        // Where we can ask Google Sign in to Redirect back to
        const requrl = url.format({
            protocol: req.protocol,
            host: req.get('host'),
            pathname: '/auth/callback'
        });
        // Redirect to the Auth URI
        const uri = LoginUri({
            client_id: googleConfig.web.client_id,
            scope: [
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            // Redirect to this URL alone when Needed to Callback
            redirect_uris: [requrl],
            state: 'perform_login'
        });
        return res.redirect(uri);
    });

    // Sign In Architecture
    // Let us assume the Login takes place
    // We reach Google
    // But now Google needs to contact us back with information
    // For this we use callback
    // Google calls Callback URI
    route.get('/callback', (req, res) => {
        // Check if any error took place
        if (req.query.error != null)
            return res
                .status(StatusCode.UNAUTHORIZED)
                .json({
                    error: req.query.error
                });
        // Check if this was started by perform_login call
        const state = String(req.query.state);
        if (state !== 'perform_login')
            return res
                .status(StatusCode.BAD_REQUEST)
                .send('Query State Does not Match');

        // Now that it works
        // Sign the User In
        // Emit the signal to the Listener
        // Later, let the listener handle everything
        AuthEvents.emit('sign_up', req.query);

        return res.sendStatus(StatusCode.OK);
    });
}
