/**
 * Node.js client for testing Appwrite getExecution polling
 * 
 * This tests whether getExecution returns the responseBody for async executions.
 * 
 * Usage:
 *   1. Update the configuration below with your Appwrite details
 *   2. Run: npx ts-node test.ts
 */

import { Client, Functions } from 'appwrite';

// ============================================================
// CONFIGURATION - Update these values with your Appwrite setup
// ============================================================
const CONFIG = {
    endpoint: 'https://cloud.appwrite.io/v1',  // Your Appwrite endpoint
    projectId: 'YOUR_PROJECT_ID',               // Your project ID
    functionId: 'YOUR_FUNCTION_ID',             // ID of deployed test function
    apiKey: 'YOUR_API_KEY'                      // API key (or use session auth)
};

// ============================================================
// Polling function (same as executeFunctionNew from production)
// ============================================================
async function testPolling(
    functions: Functions,
    functionId: string,
    body: string,
    path: string = '/'
): Promise<void> {
    console.log('\n=== Starting Polling Test ===');
    console.log(`Function ID: ${functionId}`);
    console.log(`Path: ${path}`);
    console.log(`Body: ${body}`);

    // Create async execution and capture the execution ID
    console.log('\n1. Creating async execution...');
    const execution = await functions.createExecution(functionId, body, true, path);
    const executionId = execution.$id;
    console.log(`   Execution ID: ${executionId}`);
    console.log(`   Initial status: ${execution.status}`);

    const startTime = Date.now();
    const timeoutMs = 60000; // 60 seconds
    let pollCount = 0;

    // Initial delay
    console.log('\n2. Waiting 1 second before first poll...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('\n3. Starting poll loop...');
    while (true) {
        pollCount++;
        console.log(`\n   --- Poll #${pollCount} ---`);

        const result = await functions.getExecution(functionId, executionId);

        console.log(`   Status: ${result.status}`);
        console.log(`   Response Status Code: ${result.responseStatusCode}`);
        console.log(`   Response Body: "${result.responseBody}"`);
        console.log(`   Response Body Length: ${result.responseBody?.length || 0}`);
        console.log(`   Response Headers:`, result.responseHeaders);

        if (result.status === 'completed') {
            console.log('\n=== EXECUTION COMPLETED ===');
            console.log('Full result object:');
            console.log(JSON.stringify(result, null, 2));

            if (result.responseBody) {
                console.log('\n✅ SUCCESS: responseBody is available!');
                console.log('Parsed response:', JSON.parse(result.responseBody));
            } else {
                console.log('\n❌ FAILURE: responseBody is empty!');
                console.log('This confirms the Appwrite limitation.');

                // Check if content-length indicates data was returned
                const contentLength = result.responseHeaders?.find(
                    (h: any) => h.name === 'content-length'
                );
                if (contentLength) {
                    console.log(`\nNote: content-length header shows ${contentLength.value} bytes`);
                    console.log('The backend DID return data, but getExecution does not expose it.');
                }
            }
            break;
        }

        if (result.status === 'failed') {
            console.log('\n❌ EXECUTION FAILED');
            console.log('Errors:', result.errors);
            break;
        }

        // Check timeout
        if (Date.now() - startTime > timeoutMs) {
            console.log('\n⏱️ TIMEOUT: Polling exceeded 60 seconds');
            break;
        }

        // Wait before next poll
        console.log('   Waiting 2 seconds before next poll...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log('\n=== Test Complete ===\n');
}

// ============================================================
// Main
// ============================================================
async function main() {
    console.log('Appwrite getExecution Polling Test');
    console.log('===================================\n');

    // Validate configuration
    if (CONFIG.projectId === 'YOUR_PROJECT_ID') {
        console.error('ERROR: Please update the CONFIG values in this file.');
        console.error('       Set your Appwrite endpoint, project ID, function ID, and API key.');
        process.exit(1);
    }

    // Initialize Appwrite client
    const client = new Client()
        .setEndpoint(CONFIG.endpoint)
        .setProject(CONFIG.projectId);

    const functions = new Functions(client);

    // Run the test
    try {
        await testPolling(
            functions,
            CONFIG.functionId,
            JSON.stringify({ test: true }),
            '/test'
        );
    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

main();
