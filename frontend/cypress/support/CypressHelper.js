class CypressHelper {
  constructor(cy) {
    this.cy = cy;
    this.failedTests = [];

    // Catch all failures and send to slack
    Cypress.on("fail", (error, test) => {
      const parentTitle = test.parent.title;
      const testFile = test.invocationDetails.relativeFile;
      const testTitle = test.title;
      const errorMessage = error.message;

      this.failedTests.push({
        parentTitle,
        testFile,
        testTitle,
        errorMessage,
      });

      throw error; // throw error to have test still fail
    });
  }

  setupHeaders = (cn, userId) => {
    this.cy
      .intercept(`${Cypress.env("API_URL")}**`, ({ headers }) => {
        this.addHeaders(headers, cn, userId);
      })
      .as("gamechangerAPI");

    this.cy.server({
      onAnyRequest: (_route, proxy) => {
        proxy.xhr.setRequestHeader(
          "x-env-ssl_client_certificate",
          cn || Cypress.env("SSL_CLIENT_CERTIFICATE")
        );
        proxy.xhr.setRequestHeader(
          "SSL_CLIENT_S_DN_CN",
          userId || Cypress.env("SSL_CLIENT_S_DN_CN")
        );
      },
    });
  };

  addHeaders = (headers, cn, userId) => {
    headers["x-env-ssl_client_certificate"] =
      cn || Cypress.env("SSL_CLIENT_CERTIFICATE");
    headers["SSL_CLIENT_S_DN_CN"] = userId || Cypress.env("SSL_CLIENT_S_DN_CN");
  };
}

export default CypressHelper;
