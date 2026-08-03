const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  let api = '';
  let env = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--api' && i + 1 < args.length) {
      api = args[i + 1];
    } else if (args[i] === '--env' && i + 1 < args.length) {
      env = args[i + 1];
    }
  }

  if (!api || !env) {
    console.error('Usage: node scripts/deploy-apim.js --api <service-name> --env <dev|staging|prod>');
    process.exit(1);
  }

  return { api, env };
}

function main() {
  const { api, env } = parseArgs();
  console.log(`==================================================`);
  console.log(`🚀 Starting APIM Deployment Simulation`);
  console.log(`   API Service : ${api}`);
  console.log(`   Environment : ${env.toUpperCase()}`);
  console.log(`==================================================`);

  const rootDir = path.resolve(__dirname, '..');
  const specPath = path.join(rootDir, 'apis', api, 'openapi.yaml');
  const configPath = path.join(rootDir, 'apis', api, 'config', `${env}.json`);

  if (!fs.existsSync(specPath)) {
    console.error(`❌ OpenAPI Spec file not found: ${specPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Environment Config file not found: ${configPath}`);
    process.exit(1);
  }

  const specContent = fs.readFileSync(specPath, 'utf8');
  const configContent = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  console.log(`📄 Step 1: Loaded OpenAPI Spec (${specPath})`);
  console.log(`⚙️  Step 2: Loaded APIM Environment Config (${configPath})`);
  console.log(`   -> Target Backend URL: ${configContent.backendUrl}`);
  console.log(`   -> Rate Limit: ${configContent.rateLimitCallsPerMinute} calls/min`);
  console.log(`   -> JWT Policy: ${configContent.apimPolicies.validateJwt ? 'ENABLED' : 'DISABLED'}`);

  console.log(`🌐 Step 3: Deploying OpenAPI spec directly to APIM Gateway...`);
  // Simulation of APIM REST API / CLI call
  console.log(`✅ OpenAPI Spec imported into APIM successfully.`);

  console.log(`🔧 Step 4: Applying APIM environment parameters & policies for '${env}'...`);
  console.log(`✅ APIM Backend service endpoint set to: ${configContent.backendUrl}`);
  console.log(`✅ APIM Rate limiting policy configured.`);

  console.log(`--------------------------------------------------`);
  console.log(`🎉 SUCCESS: '${api}' deployed successfully to APIM (${env.toUpperCase()})`);
  console.log(`==================================================\n`);
}

main();
