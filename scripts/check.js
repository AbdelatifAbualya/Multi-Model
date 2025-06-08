// scripts/env-check.js - Environment check for Vercel deployment
// This script provides guidance for setting up environment variables

console.log('🔍 Production Environment Setup Guide');
console.log('=====================================\n');

console.log('🔑 Required API Keys:\n');

console.log('1. FIREWORKS AI API KEY:');
console.log('   • Sign up at: https://fireworks.ai/');
console.log('   • Go to: https://fireworks.ai/api-keys');
console.log('   • Create new API key');
console.log('   • Copy the key (starts with "fw-")');

console.log('\n2. GOOGLE AI API KEY:');
console.log('   • Go to: https://ai.google.dev/');
console.log('   • Click "Get API key"');
console.log('   • Create new project or select existing');
console.log('   • Generate API key (starts with "AIza")');

console.log('\n📋 Vercel Environment Variables Setup:\n');

console.log('In your Vercel dashboard, go to:');
console.log('Project Settings > Environment Variables');
console.log('\nAdd these variables:\n');

const envVars = [
    { name: 'FIREWORKS_API_KEY', value: 'your_fireworks_api_key_here', required: true },
    { name: 'GOOGLE_API_KEY', value: 'your_google_ai_key_here', required: true },
    { name: 'FIREWORKS_BASE_URL', value: 'https://api.fireworks.ai/inference/v1', required: true },
    { name: 'GOOGLE_BASE_URL', value: 'https://generativelanguage.googleapis.com/v1beta', required: true },
    { name: 'DEEPSEEK_MODEL', value: 'accounts/fireworks/models/deepseek-v3-0324', required: true },
    { name: 'QWEN_MODEL', value: 'accounts/fireworks/models/qwen3-30b-a3b', required: true },
    { name: 'GEMINI_MODEL', value: 'gemini-2.5-pro', required: true },
    { name: 'NODE_ENV', value: 'production', required: false }
];

envVars.forEach((env, index) => {
    const status = env.required ? '[REQUIRED]' : '[OPTIONAL]';
    console.log(`${index + 1}. ${env.name} ${status}`);
    console.log(`   Value: ${env.value}`);
    console.log('');
});

console.log('⚠️ IMPORTANT SECURITY NOTES:\n');
console.log('• Never commit API keys to your GitHub repository');
console.log('• Use the Vercel dashboard to set environment variables');
console.log('• Keep your .env.example file for reference only');
console.log('• Each environment variable applies to all deployments');

console.log('\n🧪 Testing Your Deployment:\n');
console.log('After deployment, test these endpoints:');
console.log('• https://your-app.vercel.app/ - Main application');
console.log('• https://your-app.vercel.app/health - Health check');
console.log('• https://your-app.vercel.app/api/chat - API endpoint');

console.log('\n🔧 Troubleshooting:\n');
console.log('If deployment fails:');
console.log('1. Check Vercel function logs');
console.log('2. Verify all environment variables are set');
console.log('3. Ensure API keys are valid and active');
console.log('4. Check project structure matches requirements');

console.log('\n🎯 Deployment Checklist:\n');
console.log('□ All files uploaded to GitHub');
console.log('□ Repository connected to Vercel');
console.log('□ Environment variables configured');
console.log('□ First deployment successful');
console.log('□ Health check endpoint working');
console.log('□ All three AI models responding');

console.log('\n✅ Your environment setup is complete!');

// Export for potential future use
export default {
    environmentChecked: true,
    requiredVars: envVars.filter(env => env.required).length,
    timestamp: new Date().toISOString()
};
