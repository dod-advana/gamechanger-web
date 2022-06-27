const axiosLib = require("axios");
const https = require("https");
const fs = require("fs");

const GITLAB_PROJECT_ID = process.env.CI_MERGE_REQUEST_PROJECT_ID;
const GITLAB_MERGE_REQUEST_ID = process.env.CI_MERGE_REQUEST_IID;
const GITLAB_CYPRESS_TOKEN = process.env.GITLAB_CYPRESS_TOKEN;

const axios = axiosLib.create({
  baseURL: `https://gitlab.advana.boozallencsn.com/api/v4/projects/${GITLAB_PROJECT_ID}/merge_requests/${GITLAB_MERGE_REQUEST_ID}/notes`,
  httpsAgent: new https.Agent({
    keepAlive: false,
    rejectUnauthorized: false,
  }),
});

// Load results json from cypress results folder into const var
const results = JSON.parse(fs.readFileSync("results.json", "utf8"));

// Generate starting markdown for message to gitlab mr
let message = `
  # Cypress Test Results
  ## Overall Status
  ${
    results.stats.failures > 0
      ? ":rotating_light: Failed :rotating_light:"
      : ":white_check_mark: Passed :white_check_mark:"
  }
  
  ## Metadata
  - Total Tests: ${results.stats.tests}
  - Total Failures: ${results.stats.failures}
  - Total Passes: ${results.stats.passes}
  - Total Skipped: ${results.stats.skipped}
  - Percentage Passed: ${results.stats.passPercent.toFixed(2)}%
  - Overall Duration: ${results.stats.duration / 1000}s
  
  ## Failed Tests
`;

results.results.forEach((result) => {
  let hasFailures = false;
  const failures = [];
  result.suites.forEach((suite) => {
    if (suite.failures.length > 0) {
      hasFailures = true;
    }
    suite.tests.forEach((test) => {
      if (test.fail) {
        failures.push(test);
      }
    });
  });

  if (hasFailures) {
    message += `
  ### :rotating_light: ${result.file} :rotating_light:
  `;
    failures.forEach((failure) => {
      message += `
  #### ${failure.title}
  - ${failure.err.estack}
  `;
    });
  }
});

await axios.post(`?private_token=${GITLAB_CYPRESS_TOKEN}`, { body: message });
