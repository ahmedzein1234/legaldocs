/**
 * Load Testing Script for Qannoni API
 *
 * This script uses Artillery for load testing the API endpoints.
 * Install Artillery: npm install -g artillery
 *
 * Usage:
 *   artillery run load-test.js
 *   artillery run load-test.js --output results.json
 *   artillery report results.json
 *
 * For local testing:
 *   API_URL=http://localhost:4001 artillery run load-test.js
 *
 * For production testing:
 *   API_URL=https://legaldocs-api.a-m-zein.workers.dev artillery run load-test.js
 */

const config = {
  target: process.env.API_URL || 'http://localhost:4001',
  phases: [
    // Warm-up phase
    { duration: 30, arrivalRate: 5, name: 'Warm-up' },
    // Ramp-up load
    { duration: 60, arrivalRate: 10, rampTo: 50, name: 'Ramp-up' },
    // Sustained load
    { duration: 120, arrivalRate: 50, name: 'Sustained load' },
    // Spike test
    { duration: 30, arrivalRate: 100, name: 'Spike test' },
    // Cool-down
    { duration: 30, arrivalRate: 10, name: 'Cool-down' },
  ],
  plugins: {
    'expect': {},
  },
  defaults: {
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'en',
    },
  },
};

const scenarios = [
  {
    name: 'Health Check',
    weight: 5,
    flow: [
      {
        get: {
          url: '/health',
          expect: [
            { statusCode: 200 },
            { contentType: 'application/json' },
          ],
        },
      },
    ],
  },
  {
    name: 'API Info',
    weight: 3,
    flow: [
      {
        get: {
          url: '/',
          expect: [
            { statusCode: 200 },
          ],
        },
      },
    ],
  },
  {
    name: 'Template Categories',
    weight: 10,
    flow: [
      {
        get: {
          url: '/api/templates/categories',
          expect: [
            { statusCode: 200 },
          ],
        },
      },
    ],
  },
  {
    name: 'GDPR Rights Info',
    weight: 2,
    flow: [
      {
        get: {
          url: '/api/gdpr/rights',
          expect: [
            { statusCode: 200 },
          ],
        },
      },
    ],
  },
  {
    name: 'Data Residency Info',
    weight: 2,
    flow: [
      {
        get: {
          url: '/api/compliance/data-residency',
          expect: [
            { statusCode: 200 },
          ],
        },
      },
    ],
  },
  {
    name: 'Login Flow (Invalid)',
    weight: 5,
    flow: [
      {
        post: {
          url: '/api/auth/login',
          json: {
            email: 'test@example.com',
            password: 'wrongpassword',
          },
          expect: [
            { statusCode: [400, 401] },
          ],
        },
      },
    ],
  },
  {
    name: 'Register Validation',
    weight: 3,
    flow: [
      {
        post: {
          url: '/api/auth/register',
          json: {
            email: 'invalid-email',
            password: '123', // Too short
            fullName: 'Test User',
          },
          expect: [
            { statusCode: 400 },
          ],
        },
      },
    ],
  },
];

module.exports = { config, scenarios };
