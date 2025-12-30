/**
 * Simple Load Test Script for Qannoni API
 *
 * A lightweight load test that can be run with Node.js without external dependencies.
 *
 * Usage:
 *   npx ts-node tests/simple-load-test.ts
 *   npx ts-node tests/simple-load-test.ts https://legaldocs-api.a-m-zein.workers.dev
 *
 * Environment Variables:
 *   API_URL - Target API URL
 *   CONCURRENCY - Number of concurrent requests (default: 10)
 *   DURATION - Test duration in seconds (default: 60)
 */

const API_URL = process.argv[2] || process.env.API_URL || 'http://localhost:4001';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '10');
const DURATION = parseInt(process.env.DURATION || '60') * 1000;

interface TestResult {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  success: boolean;
  error?: string;
}

interface TestStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
}

const endpoints = [
  { method: 'GET', path: '/health', weight: 5 },
  { method: 'GET', path: '/', weight: 3 },
  { method: 'GET', path: '/api/templates/categories', weight: 10 },
  { method: 'GET', path: '/api/gdpr/rights', weight: 2 },
  { method: 'GET', path: '/api/compliance/data-residency', weight: 2 },
];

// Calculate weighted random endpoint selection
const weightedEndpoints: typeof endpoints = [];
endpoints.forEach(ep => {
  for (let i = 0; i < ep.weight; i++) {
    weightedEndpoints.push(ep);
  }
});

function getRandomEndpoint() {
  return weightedEndpoints[Math.floor(Math.random() * weightedEndpoints.length)];
}

async function makeRequest(endpoint: typeof endpoints[0]): Promise<TestResult> {
  const startTime = Date.now();
  const url = `${API_URL}${endpoint.path}`;

  try {
    const response = await fetch(url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
      },
    });

    const duration = Date.now() - startTime;

    return {
      endpoint: endpoint.path,
      method: endpoint.method,
      statusCode: response.status,
      duration,
      success: response.status >= 200 && response.status < 300,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      endpoint: endpoint.path,
      method: endpoint.method,
      statusCode: 0,
      duration,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

function calculateStats(results: TestResult[], durationMs: number): TestStats {
  const responseTimes = results.map(r => r.duration).sort((a, b) => a - b);
  const successfulRequests = results.filter(r => r.success).length;

  return {
    totalRequests: results.length,
    successfulRequests,
    failedRequests: results.length - successfulRequests,
    averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0,
    minResponseTime: Math.min(...responseTimes) || 0,
    maxResponseTime: Math.max(...responseTimes) || 0,
    p50ResponseTime: calculatePercentile(responseTimes, 50),
    p95ResponseTime: calculatePercentile(responseTimes, 95),
    p99ResponseTime: calculatePercentile(responseTimes, 99),
    requestsPerSecond: results.length / (durationMs / 1000),
    errorRate: ((results.length - successfulRequests) / results.length) * 100 || 0,
  };
}

async function runWorker(results: TestResult[], endTime: number): Promise<void> {
  while (Date.now() < endTime) {
    const endpoint = getRandomEndpoint();
    const result = await makeRequest(endpoint);
    results.push(result);
  }
}

async function runLoadTest(): Promise<void> {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    Qannoni API Load Test                       ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  Target:      ${API_URL}`);
  console.log(`  Concurrency: ${CONCURRENCY} workers`);
  console.log(`  Duration:    ${DURATION / 1000} seconds`);
  console.log('');
  console.log('───────────────────────────────────────────────────────────────');
  console.log('  Starting load test...');
  console.log('');

  const results: TestResult[] = [];
  const startTime = Date.now();
  const endTime = startTime + DURATION;

  // Create worker promises
  const workers: Promise<void>[] = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(runWorker(results, endTime));
  }

  // Progress reporting
  const progressInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const currentRps = results.length / elapsed;
    process.stdout.write(`\r  Progress: ${Math.round(elapsed)}s | Requests: ${results.length} | RPS: ${currentRps.toFixed(1)}    `);
  }, 1000);

  // Wait for all workers to complete
  await Promise.all(workers);

  clearInterval(progressInterval);
  console.log('');
  console.log('');

  // Calculate final stats
  const actualDuration = Date.now() - startTime;
  const stats = calculateStats(results, actualDuration);

  // Print results
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                         RESULTS                                ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  REQUESTS');
  console.log(`    Total:      ${stats.totalRequests}`);
  console.log(`    Successful: ${stats.successfulRequests}`);
  console.log(`    Failed:     ${stats.failedRequests}`);
  console.log(`    Error Rate: ${stats.errorRate.toFixed(2)}%`);
  console.log('');
  console.log('  THROUGHPUT');
  console.log(`    Requests/s: ${stats.requestsPerSecond.toFixed(2)}`);
  console.log('');
  console.log('  RESPONSE TIMES (ms)');
  console.log(`    Min:     ${stats.minResponseTime.toFixed(0)}`);
  console.log(`    Avg:     ${stats.averageResponseTime.toFixed(0)}`);
  console.log(`    Max:     ${stats.maxResponseTime.toFixed(0)}`);
  console.log(`    p50:     ${stats.p50ResponseTime.toFixed(0)}`);
  console.log(`    p95:     ${stats.p95ResponseTime.toFixed(0)}`);
  console.log(`    p99:     ${stats.p99ResponseTime.toFixed(0)}`);
  console.log('');

  // Endpoint breakdown
  console.log('  ENDPOINT BREAKDOWN');
  const endpointStats = new Map<string, TestResult[]>();
  results.forEach(r => {
    const key = `${r.method} ${r.endpoint}`;
    if (!endpointStats.has(key)) {
      endpointStats.set(key, []);
    }
    endpointStats.get(key)!.push(r);
  });

  endpointStats.forEach((epResults, key) => {
    const epStats = calculateStats(epResults, actualDuration);
    console.log(`    ${key}`);
    console.log(`      Requests: ${epStats.totalRequests} | Avg: ${epStats.averageResponseTime.toFixed(0)}ms | p95: ${epStats.p95ResponseTime.toFixed(0)}ms`);
  });

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');

  // Performance assessment
  console.log('');
  console.log('  ASSESSMENT');
  const issues: string[] = [];

  if (stats.errorRate > 1) {
    issues.push(`⚠️  High error rate: ${stats.errorRate.toFixed(2)}% (target: <1%)`);
  }
  if (stats.p95ResponseTime > 500) {
    issues.push(`⚠️  Slow p95 response: ${stats.p95ResponseTime.toFixed(0)}ms (target: <500ms)`);
  }
  if (stats.p99ResponseTime > 1000) {
    issues.push(`⚠️  Slow p99 response: ${stats.p99ResponseTime.toFixed(0)}ms (target: <1000ms)`);
  }

  if (issues.length === 0) {
    console.log('  ✅ All performance targets met!');
  } else {
    issues.forEach(issue => console.log(`  ${issue}`));
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // Exit with error code if thresholds not met
  if (stats.errorRate > 5) {
    process.exit(1);
  }
}

// Run the test
runLoadTest().catch(error => {
  console.error('Load test failed:', error);
  process.exit(1);
});
