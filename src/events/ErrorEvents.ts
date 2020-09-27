import { EventEmitter } from 'events';

const ErrorEvents = new EventEmitter();

// Run On Error
ErrorEvents.on('error', (...error: unknown[]) => {
    // Add all Error Logs to Database
    console.error(new Date(), 'Error Occured', ...error);
});

export default ErrorEvents;
