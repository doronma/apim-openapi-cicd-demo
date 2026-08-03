const https = require('https');

function parseArgs() {
  const args = process.argv.slice(2);
  let api = 'order-service';
  let env = 'dev';
  let token = process.env.GITHUB_TOKEN || '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--api' && i + 1 < args.length) api = args[i + 1];
    if (args[i] === '--env' && i + 1 < args.length) env = args[i + 1];
    if (args[i] === '--token' && i + 1 < args.length) token = args[i + 1];
  }

  return { api, env, token };
}

function triggerDeployment() {
  const { api, env, token } = parseArgs();

  console.log(`==================================================`);
  console.log(`📣 Script-Triggered Deployment Request`);
  console.log(`   Target API Service : ${api}`);
  console.log(`   Target Environment : ${env.toUpperCase()}`);
  console.log(`==================================================`);

  if (!token) {
    console.log(`⚠️  No GitHub token provided. To trigger remotely via script:`);
    console.log(`   node scripts/trigger-deploy.js --api ${api} --env ${env} --token YOUR_GITHUB_PAT_TOKEN`);
    console.log(`\nAlternatively, you can trigger manually in the GitHub UI at:`);
    console.log(`   https://github.com/doronma/apim-openapi-cicd-demo/actions/workflows/api-cd.yml`);
    return;
  }

  const payload = JSON.stringify({
    ref: 'main',
    inputs: {
      service: api,
      environment: env
    }
  });

  const options = {
    hostname: 'api.github.com',
    path: '/repos/doronma/apim-openapi-cicd-demo/actions/workflows/api-cd.yml/dispatches',
    method: 'POST',
    headers: {
      'User-Agent': 'NodeJS-Deployment-Script',
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 204) {
      console.log(`✅ SUCCESS: Deployment trigger sent to GitHub Actions!`);
      console.log(`   Check pipeline run at: https://github.com/doronma/apim-openapi-cicd-demo/actions`);
    } else {
      console.error(`❌ HTTP Error: ${res.statusCode} ${res.statusMessage}`);
    }
  });

  req.on('error', (e) => {
    console.error(`❌ Request failed: ${e.message}`);
  });

  req.write(payload);
  req.end();
}

triggerDeployment();
