import cds from '@sap/cds';
import express from 'express';
import authRoutes from './vanilla/src/api/auth';
import publishRoutes from './vanilla/src/api/publish';

cds.on('bootstrap', app => {
  // configure cors
  app.use ((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && origin == cds.env.FRONTEND_URL) {
      res.set('access-control-allow-origin', origin)
      if (req.method === 'OPTIONS') // preflight request
        return res
          .set('access-control-allow-methods', 'GET,HEAD,PATCH,POST,DELETE')
          .set('access-control-allow-headers', 'Content-Type,Authorization,Accept')
          .end()
    }
    next()
  });

  app.use(express.json({ limit: '5mb' }));

  app.use('/user', authRoutes);
  app.use('/api', publishRoutes);
});
