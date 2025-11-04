
const ORIGINS = ["http://localhost:3000", "https://architecture.learning.sap.com"];

cds.on("bootstrap", (app) => {
  app.enable("trust proxy");

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ORIGINS.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Authorization,Content-Type,Accept,Origin"
      );
    }

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    next();
  });
});