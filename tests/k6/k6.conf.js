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
