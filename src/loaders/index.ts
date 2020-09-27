import bodyParser from 'body-parser';
import cors from 'cors';
import StatusCode from 'http-status-codes';

import type { Application } from 'express';

import UserStorage from '../resources/UsersStorage';

import Auth from '../api/auth';
import Users from '../api/users';
import Email from '../api/mail';
import { LoadWellKnownConfiguration } from '../controller/Token';

export default async function Loader(app: Application) {
    // https://stackoverflow.com/a/46475726
    // To Get https as protocol
    app.enable('trust proxy');

    //  Health Check
    //  Used to verify if application is working or not
    app.get('/status', (_req, res) =>
        res.sendStatus(StatusCode.OK)
    );

    // Enable Cross Origin Resource Sharing to all origins by default
    app.use(cors());

    // Middleware that transforms the raw string of req.body into json
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.text());

    // Load all the Routes
    Auth(app);
    Users(app);
    Email(app);

    // By default, Show sign In Page
    app.get('/', (_req, res) =>
        res.redirect('/auth/signIn')
    );

    // Load the Well Known Config
    // From the OpenID Google Config Website
    // So we can use future APIs to interact with it
    await LoadWellKnownConfiguration();
    // Load the Configuration File with which we are storing
    // User meta data
    await UserStorage.LoadFile();
}
