const ORIGINS = ["http://localhost:3000", "https://architecture.learning.sap.com"];

cds.on("bootstrap", (app) => {
  app.enable("trust proxy");
  return app.use((req, res, next) => {
    res.set("access-control-allow-headers", "Authorization");
    if (ORIGINS.includes(req.headers.origin)) {
      res.set("access-control-allow-origin", req.headers.origin);
      if (req.method === "OPTIONS")
        // preflight request
        return res.set("access-control-allow-methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS").end();
    }
    next();
  });
});
