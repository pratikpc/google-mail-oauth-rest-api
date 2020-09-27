import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SendMail, SendRawMail } from '../controller/Mail';

export default function Email(app: Router) {
    const route = Router();
    app.use('/email', route);

    // Parameter Sender is Optional
    route.post('/:sender?', async (req, res) => {
        const { headers, data } = req.body;
        let { sender: email } = req.params;
        // If No Email Provided, use From Header
        if (email == null || email === '')
            email = headers?.From;

        try {
            const json = await SendMail({
                headers: headers,
                data: data,
                email: email
            });
            return res.json(json);
        } catch (err) {
            console.log(err);
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send(err.message);
        }
    });
    // Pass RFC-2822
    route.post('/rfc2822/:sender', async (req, res) => {
        const raw = req.body;
        const { sender: email } = req.params;
        try {
            const json = await SendRawMail({
                raw: raw,
                email: email
            });
            return res.json(json);
        } catch (err) {
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send(err.message);
        }
    });
}
