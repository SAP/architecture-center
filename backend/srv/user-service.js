const cds = require('@sap/cds');
const xsenv = require('@sap/xsenv');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables for local development
if (process.env.NODE_ENV !== 'production') {
    const envPath = path.resolve(__dirname, '../.env');
    dotenv.config({ path: envPath });
}

const { Users } = cds.entities;
let xsuaa = {};
try { xsuaa = xsenv.getServices({ xsuaa: { tag: 'xsuaa' } }).xsuaa; }
catch (e) { console.log('Error loading xsuaa service:', e); }

const upsAuth = process.env.VCAP_SERVICES ? null : JSON.parse(process.env.VCAP_SERVICES)['user-provided'][0]['credentials'];


// General configuration
const JWT_SECRET = upsAuth ? upsAuth.JWT_SECRET : process.env.JWT_SECRET;
const FRONTEND_URL = upsAuth ? upsAuth.FRONTEND_URL : process.env.FRONTEND_URL || 'http://localhost:3000';
const XSUAA_URL = xsuaa.url || process.env.XSUAA_URL;
const XSUAA_CLIENTID = xsuaa.clientid || process.env.XSUAA_CLIENTID;
const XSUAA_SECRET = xsuaa.clientsecret || process.env.XSUAA_SECRET;

// Initial log removed for production-ready code.

if (!JWT_SECRET || !FRONTEND_URL) {
    throw new Error('Missing JWT_SECRET or FRONTEND_URL environment variables.');
}

// Whitelisted domains for redirects
const ALLOWED_REDIRECT_DOMAINS = [
    'architecture.learning.sap.com',
    'localhost',
    new URL(FRONTEND_URL).hostname
];

// Helper function to validate redirect URI
const isValidRedirect = (uri) => {
    if (!uri) return false;
    try {
        const url = new URL(uri);
        return ALLOWED_REDIRECT_DOMAINS.includes(url.hostname);
    } catch (e) {
        return false;
    }
};

// Helper function to create app token
const createAppToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
class UserService extends cds.ApplicationService {
    async init() {
        // BTP authentication handlers
        this.on('login', (req) => loginHandler(req));
        this.on('loginSuccess', (req) => loginSuccessHandler(req));
        this.on('logout', (req) => logoutHandler(req));
        this.on('logoutSuccess', (req) => logoutSuccessHandler(req));
        this.on('getUserInfo', (req) => getUserInfoHandler(req));

        await super.init();
    }
}
module.exports = UserService;

const loginHandler = async (req) => {
    const { http } = cds.context;
    const provider = 'btp';
    const origin_uri = http && http.req.query && http.req.query.origin_uri;

    // Validate redirect URI
    const target_origin = isValidRedirect(origin_uri) ? origin_uri : FRONTEND_URL;

    let callback_url = `${http.req.protocol}://${http && http.req.get('host')}/user/loginSuccess?provider=${provider}&origin_uri=${encodeURIComponent(target_origin)}`;
    callback_url = encodeURIComponent(callback_url);
    const authorize_url = `${XSUAA_URL}/oauth/authorize?login_hint=%257B%2522origin%2522%253A%2522sap.default%2522%257D&response_type=code&client_id=${XSUAA_CLIENTID}&redirect_uri=${callback_url}`;
    if (http && http.res) http.res.redirect(authorize_url);
};

const loginSuccessHandler = async (req) => {
    const { http } = cds.context;
    const code = (http && http.req.query && http.req.query.code) || null;
    const origin_uri = http && http.req.query.origin_uri;

    // Validate redirect URI
    const target_origin = isValidRedirect(origin_uri) ? origin_uri : FRONTEND_URL;

    if (!code) {
        if (http && http.res) http.res.redirect(`${target_origin}?e=UNAUTHORIZED`);
        return;
    }

    let callback_url = `${http.req.protocol}://${http && http.req.get('host')}/user/loginSuccess?provider=btp&origin_uri=${origin_uri}`;
    callback_url = encodeURIComponent(callback_url);

    try {
        // Get Token from BTP
        const token_url = `${XSUAA_URL}/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${callback_url}`;
        const encodedCredentials = Buffer.from(`${XSUAA_CLIENTID}:${XSUAA_SECRET}`).toString('base64');
        const token_response = await fetch(token_url, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${encodedCredentials}`,
            },
        });
        const token_data = await token_response.json();

        if (token_data.access_token) {
            if (http && http.res) http.res.redirect(`${target_origin}?t=${token_data.id_token}`);
        }
    } catch (error) {
        console.error('BTP auth callback error:', error.message || error);
    }
};

const logoutHandler = async (req) => {
    const { http } = cds.context;
    const provider = 'btp';
    const origin_uri = http && http.req.query && http.req.query.origin_uri;

    // Validate redirect URI
    const target_origin = isValidRedirect(origin_uri) ? origin_uri : FRONTEND_URL;

    let callback_url = `${http.req.protocol}://${http && http.req.get('host')}/user/logoutSuccess?provider=${provider}&origin_uri=${encodeURIComponent(target_origin)}`;
    callback_url = encodeURIComponent(callback_url);
    const logout_url = `${XSUAA_URL}/logout.do?redirect=${callback_url}&client_id=${XSUAA_CLIENTID}`;

    if (http && http.res)
        http.res.redirect(logout_url);
};

const logoutSuccessHandler = async (req) => {
    const { http } = cds.context;
    const origin_uri = (http && http.req.query.origin_uri) || FRONTEND_URL;

    // Validate redirect URI
    const target_origin = isValidRedirect(origin_uri) ? origin_uri : FRONTEND_URL;

    if (http && http.res) {
        http.res.redirect(`${target_origin}?logout=success`);
    }

    return 'Logout successful';
};

const getUserInfoHandler = async (req) => {
    const { user } = cds.context;
    const thisUser = {
        ID: user?.id,
        firstName: user?.attr.givenName,
        lastName: user?.attr.familyName,
        email: user?.attr.email,
        companyId: '',
        company: '',
        type: ''
    };
    return thisUser;
};
