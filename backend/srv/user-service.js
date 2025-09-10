const cds = require('@sap/cds');
const xsenv = require('@sap/xsenv');

const { Users } = cds.entities;
const xsuaa = xsenv.getServices({ xsuaa: { tag: 'xsuaa' } }).xsuaa;
class UserService extends cds.ApplicationService {
    async init() {
        // handlers
        this.on('login', (req) => loginHandler(req));
        this.on('loginSuccess', (req) => loginSuccessHandler(req));
        this.on('getUserInfo', (req) => getUserInfoHandler(req));
        // this.on(getUserInfo, (req) => getUserInfoHandlerCdc(req));
        await super.init();
    }
}
module.exports = UserService;

const loginHandler = async (req) => {
    const { http } = cds.context;
    const origin_uri = http && http.req.query.origin_uri;
    // const callback_url = `${http && http.req.protocol}://${http && http.req.get('host')}/user/loginSuccess?origin_uri=${origin_uri}`;
    const callback_url = `https://${http && http.req.get('host')}/user/loginSuccess?origin_uri=${origin_uri}`;
    const authorize_url = `${xsuaa.url}/oauth/authorize?response_type=code&client_id=${xsuaa.clientid}&redirect_uri=${callback_url}`;
    if (http && http.res) http.res.redirect(authorize_url);
};

const loginSuccessHandler = async (req) => {
    const { http } = cds.context;
    const origin_uri = http && http.req.query.origin_uri;
    // const callback_url = `${http && http.req.protocol}://${http && http.req.get('host')}/user/loginSuccess?origin_uri=${origin_uri}`;
    const callback_url = `https://${http && http.req.get('host')}/user/loginSuccess?origin_uri=${origin_uri}`;
    const code = (http && http.req.query && http.req.query.code) || null;
    if (code) {
        // Get Token
        const token_url = `${xsuaa.url}/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${callback_url}`;
        const encodedCredentials = Buffer.from(`${xsuaa.clientid}:${xsuaa.clientsecret}`).toString('base64');
        const token_response = await fetch(token_url, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${encodedCredentials}`,
            },
        });
        const token_data = await token_response.json();
        if (http && http.res) http.res.redirect(`${origin_uri}?t=${token_data.access_token}`);
    } else {
        if (http && http.res) http.res.redirect(`${origin_uri}?e=UNAUTHORIZED`);
    }
};

const getUserInfoHandler = async (req) => {
    const { user } = cds.context;
    console.log(JSON.stringify(user));
    const thisUser = {
        ID: user?.id,
        firstName: user?.attr.givenName,
        lastName: user?.attr.familyName,
        email: user?.attr.email,
        companyId: user?.attr.sapBpidOrg[0],
        company: user?.attr.company[0],
        type: user?.attr.type[0],
    };
};
