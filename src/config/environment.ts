export const environment = {
  isDevelopment: process.env.NODE_ENV === "development",
  storageName: process.env.NODE_ENV === "development" ? "sap-architecture-center-dev" : "sap-architecture-center",
  // apiUrl: process.env.NODE_ENV === "development" ? "http://localhost:4004" : "https://tfe-india-genai-validator-dev-backend-srv.cfapps.eu10-004.hana.ondemand.com"
  apiUrl: "https://tfe-india-genai-validator-dev-backend-srv.cfapps.eu10-004.hana.ondemand.com"
};
