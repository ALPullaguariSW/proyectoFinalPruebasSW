export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'count'],
  summaryTimeUnit: 'ms',
};

export const handleSummary = (data) => {
  return {
    'summary.json': JSON.stringify(data),
    'summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
};

function textSummary(data, options) {
  const { metrics, root_group } = data;
  const { http_req_duration, http_req_failed, checks } = metrics;
  
  let summary = 'K6 Test Summary\n';
  summary += '================\n\n';
  
  if (http_req_duration) {
    summary += `Response Time (95th percentile): ${http_req_duration.values['p(95)']}ms\n`;
    summary += `Average Response Time: ${http_req_duration.values.avg}ms\n`;
  }
  
  if (http_req_failed) {
    summary += `Error Rate: ${(http_req_failed.rate * 100).toFixed(2)}%\n`;
  }
  
  if (checks) {
    summary += `Checks Pass Rate: ${(checks.rate * 100).toFixed(2)}%\n`;
  }
  
  summary += `\nTotal Requests: ${root_group?.checks?.length || 0}\n`;
  
  return summary;
}

function htmlReport(data) {
  const { metrics } = data;
  const { http_req_duration, http_req_failed, checks } = metrics;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>K6 Performance Test Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background-color: #f0f0f0; padding: 10px; border-radius: 5px; }
            .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .success { border-left: 5px solid #4CAF50; }
            .warning { border-left: 5px solid #ff9800; }
            .error { border-left: 5px solid #f44336; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>K6 Performance Test Report</h1>
            <p>Generated on: ${new Date().toISOString()}</p>
        </div>
        
        <div class="metric ${(http_req_duration?.values?.['p(95)'] || 0) < 500 ? 'success' : 'error'}">
            <h3>Response Time</h3>
            <p>95th percentile: ${http_req_duration?.values?.['p(95)'] || 'N/A'}ms</p>
            <p>Average: ${http_req_duration?.values?.avg || 'N/A'}ms</p>
            <p>Max: ${http_req_duration?.values?.max || 'N/A'}ms</p>
        </div>
        
        <div class="metric ${(http_req_failed?.rate || 0) < 0.01 ? 'success' : 'error'}">
            <h3>Error Rate</h3>
            <p>Rate: ${((http_req_failed?.rate || 0) * 100).toFixed(2)}%</p>
            <p>Threshold: < 1%</p>
        </div>
        
        <div class="metric ${(checks?.rate || 0) > 0.99 ? 'success' : 'error'}">
            <h3>Checks Pass Rate</h3>
            <p>Rate: ${((checks?.rate || 0) * 100).toFixed(2)}%</p>
            <p>Threshold: > 99%</p>
        </div>
    </body>
    </html>
  `;
  
  return html;
}
