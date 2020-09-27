import { Router } from 'express';
import MailEvents from '../events/MailEvents';

export default function Email(app: Router) {
    const route = Router();
    app.use('/email', route);

    // Parameter Sender is Optional
    route.post('/:sender?', (req, res) => {
        const { headers, data } = req.body;
        let { sender: email } = req.params;
        // If No Email Provided, use From Header
        if (email == null || email === '')
            email = headers?.From;
        MailEvents.emit('send', {
            headers: headers,
            data: data,
            email: email
        });
        return res.send(
            'Mail Added to Queue. Check Console'
        );
    });
    // Pass RFC-2822
    route.post('/rfc2822/:sender', (req, res) => {
        const raw = req.body;
        const { sender: email } = req.params;
        MailEvents.emit('send_raw', {
            raw: raw,
            email: email
        });
        return res.send(
            'Mail Added to Queue. Check Console'
        );
    });
}
