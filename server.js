const express = require("express");
const client = require("prom-client");

const app = express();
const PORT = 3000;

/**
 * Default system metrics
 */
client.collectDefaultMetrics();

/**
 * Custom metrics
 */
const requestCounter = new client.Counter({
  name: "api_requests_total",
  help: "Total API requests",
  labelNames: ["method", "endpoint", "status"],
});

const requestDuration = new client.Histogram({
  name: "api_request_duration_seconds",
  help: "API request duration",
  labelNames: ["method", "endpoint"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2],
});

/**
 * API endpoint
 */
app.get("/api/hello", (req, res) => {
  const end = requestDuration.startTimer();

  res.status(200).json({
    message: "Hello from Node.js API",
  });

  requestCounter.inc({
    method: "GET",
    endpoint: "/api/hello",
    status: 200,
  });

  end({ method: "GET", endpoint: "/api/hello" });
});

/**
 * Metrics endpoint
 */
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`API running → http://localhost:${PORT}`);
});
