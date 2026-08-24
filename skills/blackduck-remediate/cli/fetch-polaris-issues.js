#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

// Parse command-line arguments
const args = process.argv.slice(2);
const params = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--/, '');
  const value = args[i + 1];
  params[key] = value;
}

const { serverUrl, accessToken, projectId, branchId, output } = params;

if (!serverUrl || !accessToken || !projectId || !branchId) {
  console.error('Usage: node fetch-polaris-issues.js --serverUrl <url> --accessToken <token> --projectId <id> --branchId <id> --output <file>');
  process.exit(1);
}

// Remove https:// or http:// from serverUrl
const cleanUrl = serverUrl.replace(/^https?:\/\//, '');

// Fetch issues (no pagination - just one call)
async function fetchAllIssues() {
  console.log('⏳ Fetching issues from Polaris...\n');

  const issues = await fetchPage(0, 500);

  console.log(`\n✅ Fetched ${issues.length} issues\n`);
  return issues;
}

function fetchPage(offset, limit) {
  return new Promise((resolve, reject) => {
    const path = `/api/findings/issues?projectId=${projectId}&branchId=${branchId}&_includeAiTriageStatus=true&_includeExtensionProperties=true&_includeRiskScore=true&_filter=triage%3Astatus%3Din%3D(%27not-dismissed%27%2C%27to-be-fixed%27)&_sort=occurrence%3Aseverity%7Cdesc&_first=${limit}&_offset=${offset}&_includeType=true&_includeOccurrenceProperties=true&_includeTriageProperties=true&_includeFirstDetectedOn=true&_includeContext=true`;

    const options = {
      hostname: cleanUrl,
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Api-token': accessToken,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }

        try {
          const json = JSON.parse(data);
          resolve(json._items || []);
        } catch (err) {
          reject(new Error(`Failed to parse JSON: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

// Main execution
fetchAllIssues()
  .then((issues) => {
    // Save to output file
    const outputFile = output || '/tmp/polaris-issues.json';
    fs.writeFileSync(outputFile, JSON.stringify({ _items: issues }, null, 2));
    console.log(`📄 Saved ${issues.length} issues to: ${outputFile}\n`);
  })
  .catch((err) => {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  });
