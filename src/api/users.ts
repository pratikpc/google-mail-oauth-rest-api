import { Router } from 'express';

import UserStorage from '../resources/UsersStorage';

export default function Users(app: Router) {
    const route = Router();
    app.use('/users', route);

    route.get('/', async (_req, res) => {
        await UserStorage.LoadFile();
        return res.json(UserStorage.Info);
    });
}
