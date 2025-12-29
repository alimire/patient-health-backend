const express = require('express');
const { CloudantV1 } = require('@ibm-cloud/cloudant');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Health check endpoint (used by Kubernetes Liveness Probe)
app.get('/', (req, res) => {
  res.send('Patient Health Backend is running');
});

// API Endpoint: Get Patients
app.get('/api/patients', (req, res) => {
  const authenticator = new IamAuthenticator({
    apikey: process.env.CLOUDANT_APIKEY,
  });
  const service = new CloudantV1({
    authenticator: authenticator,
    serviceUrl: process.env.CLOUDANT_URL,
  });

  service.postAllDocs({
    db: 'patients',
    includeDocs: true,
  }).then(response => {
    res.json(response.result.rows.map(row => row.doc));
  }).catch(err => {
    console.error(err);
    // Return empty list if DB is empty or missing to prevent crash
    res.json([]);
  });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});