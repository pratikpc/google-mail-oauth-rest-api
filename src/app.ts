import express from 'express';

import Loader from './loaders';

import config from './config/server';
import ErrorEvents from './events/ErrorEvents';

const app = express();

// Load all Routes
// And Configure Applic
Loader(app)
    .then(() => {
        app.listen(
            // By Default Port 8000 selected
            // eslint-disable-next-line promise/always-return
            Number(process.env.PORT || config.port || 8080),
            () => {
                console.log('Server Started');
            }
        );
    })
    .catch((err) => ErrorEvents.emit('error', err));
