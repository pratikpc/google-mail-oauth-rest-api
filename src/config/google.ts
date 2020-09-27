export default {
    web: {
        client_id:
            '1051451370428-o1tavi5fughrjjmj2ufnoq6ekvgmu4fo.apps.googleusercontent.com',
        project_id: 'annular-surf-290719',
        auth_uri:
            'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
            'https://www.googleapis.com/oauth2/v1/certs',
        client_secret: 'zUio_fxIdCNEL3uveEqyhlBh',
        redirect_uris: [
            'http://localhost:8000/auth/callback',
            'http://localhost:8000/',
            'http://localhost'
        ],
        javascript_origins: [
            'http://localhost:8000',
            'http://localhost'
        ]
    }
};
