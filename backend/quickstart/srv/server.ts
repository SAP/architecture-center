import cds from '@sap/cds';

const ORIGINS = { 'http://localhost:3000': 1, 'https://architecture.learning.sap.com': 1 }
cds.on('bootstrap', app => app.use ((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin in ORIGINS) {
    res.set('access-control-allow-origin', origin)
    if (req.method === 'OPTIONS') // preflight request
      return res.set('access-control-allow-methods', 'GET,HEAD,PATCH,POST,DELETE').end()
  }
  next()
}))
