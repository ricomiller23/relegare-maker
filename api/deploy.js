/**
 * /api/deploy.js
 * Serverless function to handle Vercel deployments using process.env.VERCEL_TOKEN
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { projectName, html, files } = req.body;
    const token = process.env.RELIGARE_DEPLOY_TOKEN;

    if (!token) {
        return res.status(500).json({ 
            error: 'CONFIGURATION_REQUIRED',
            message: 'RELIGARE_DEPLOY_TOKEN is not set in your Vercel Project Environment Variables. Automation requires this one-time setup.'
        });
    }

    try {
        // Prepare deployment files
        // If 'files' is provided, use it, otherwise use the single 'html'
        const deploymentFiles = files || [
            { file: 'index.html', data: html }
        ];

        const response = await fetch('https://api.vercel.com/v13/deployments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: projectName,
                files: deploymentFiles,
                projectSettings: {
                    framework: null
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ url: data.url });
        } else {
            return res.status(response.status).json({ error: data.error?.message || 'Deployment failed' });
        }
    } catch (error) {
        console.error('Deployment Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
