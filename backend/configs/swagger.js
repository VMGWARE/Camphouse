const { getVersion } = require("../utils/general");

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Camphouse Express API with Swagger",
      version: getVersion(),
      description:
        "The Camphouse API is a RESTful API that allows you to access Camphouse's data and functionality.",
      license: {
        name: "Creative Commons NonCommercial",
        url: "https://creativecommons.org/licenses/by-nc/4.0/",
      },
    },
    servers: [
      {
        url: "https://camphouse.vmgware.dev",
        description: "Production server (uses live data)",
      },
      {
        url: "http://localhost:3000",
        description: "Development server (uses test data)",
      },
    ],
  },
  apis: ["./controllers/*.js"],
};

module.exports = options;
