/**
 * Minimal Appwrite function for testing getExecution polling
 * 
 * This returns test data after a short delay to simulate async work.
 * Deploy to Appwrite and use the client to test polling behavior.
 */

export default async ({ req, res, log, error }: any) => {
    const path = req.path || '/';

    log(`Received request to path: ${path}`);

    if (path === '/test') {
        // Simulate some async work
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Return test data
        const responseData = {
            ok: true,
            shortlistId: 'test-shortlist-123',
            message: 'This is test data from the minimal server',
            timestamp: new Date().toISOString()
        };

        log(`Returning response: ${JSON.stringify(responseData)}`);

        return res.json(responseData);
    }

    // Default response
    return res.json({
        ok: true,
        message: 'Minimal test server is running',
        availablePaths: ['/test']
    });
};
