const cds = require('@sap/cds');
const xsenv = require('@sap/xsenv');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

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

console.log('--- SERVER STARTING ---');
console.log('Attempting to load .env from:', envPath);
console.log('-----------------------');

if (!JWT_SECRET || !FRONTEND_URL) {
    throw new Error('Missing JWT_SECRET or FRONTEND_URL environment variables.');
}

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
    let callback_url = `${http.req.protocol}://${http && http.req.get('host')}/user/loginSuccess?provider=${provider}&origin_uri=${origin_uri}`;
    callback_url = encodeURIComponent(callback_url);
    const authorize_url = `${XSUAA_URL}/oauth/authorize?login_hint=%257B%2522origin%2522%253A%2522sap.default%2522%257D&response_type=code&client_id=${XSUAA_CLIENTID}&redirect_uri=${callback_url}`;
    if (http && http.res) http.res.redirect(authorize_url);
};

const loginSuccessHandler = async (req) => {
    const { http } = cds.context;
    const code = (http && http.req.query && http.req.query.code) || null;
    const origin_uri = http && http.req.query.origin_uri;

    // [TODO] Clean Up
    if (!code) {
        const origin_uri = http && http.req.query.origin_uri;
        if (http && http.res) http.res.redirect(`${origin_uri}?e=UNAUTHORIZED`);
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
            if (http && http.res) http.res.redirect(`${origin_uri}?t=${token_data.id_token}`);
            // Create app token with BTP user info
        }
    } catch (error) {
        console.error('BTP auth callback error:', error.message || error);
    }
};

const logoutHandler = async (req) => {
    const { http } = cds.context;
    const provider = 'btp';
    const origin_uri = http && http.req.query && http.req.query.origin_uri;

    console.log(`Logout request for provider: ${provider}`);

    let callback_url = `${http.req.protocol}://${http && http.req.get('host')}/user/logoutSuccess?provider=${provider}&origin_uri=${origin_uri}`;
    callback_url = encodeURIComponent(callback_url);
    const logout_url = `${XSUAA_URL}/logout.do?redirect=${callback_url}&client_id=${XSUAA_CLIENTID}`;

    console.log(`BTP logout URL: ${logout_url}`);

    if (http && http.res)
        http.res.redirect(logout_url);
};

const logoutSuccessHandler = async (req) => {
    const { http } = cds.context;
    const provider = 'btp';
    const origin_uri = http && http.req.query.origin_uri || FRONTEND_URL;

    console.log(`Logout success for provider: ${provider}`);

    // Clear any server-side session data if needed
    // For now, just redirect back to the origin
    if (http && http.res) {
        http.res.redirect(`${origin_uri}?logout=success&provider=${provider}`);
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
