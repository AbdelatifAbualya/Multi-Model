// At the very end of your api/chat.js file, ensure this exact export:

export default async function handler(req, res) {
    // CORS Configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'Only POST requests are supported'
        });
    }

    try {
        const { message, stage = 'all', settings = {} } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Invalid request',
                message: 'Valid message is required'
            });
        }

        // Simplified response for initial testing
        const mockResponse = {
            success: true,
            data: {
                final_response: generateTestResponse(message),
                models_used: ['deepseek', 'qwen', 'gemini'],
                processing_time: 1500,
                confidence_score: 85
            },
            timestamp: new Date().toISOString()
        };
        
        return res.status(200).json(mockResponse);

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Processing failed'
        });
    }
}

function generateTestResponse(message) {
    return `
        <div class="response-container">
            <h4 style="color: #6366f1; margin-bottom: 1rem;">🤖 Multi-Model Response</h4>
            
            <div style="margin: 1rem 0; padding: 1rem; background: rgba(30, 30, 30, 0.9); border-radius: 12px; border-left: 4px solid #ff6b6b;">
                <strong>🔍 DeepSeek Analysis:</strong>
                <p style="margin-top: 0.5rem; line-height: 1.6; color: #b0b0b0;">
                    Analyzed your message: "${message.substring(0, 100)}" with deep reasoning and systematic thinking.
                </p>
            </div>

            <div style="margin: 1rem 0; padding: 1rem; background: rgba(30, 30, 30, 0.9); border-radius: 12px; border-left: 4px solid #4ecdc4;">
                <strong>⚡ Qwen Implementation:</strong>
                <p style="margin-top: 0.5rem; line-height: 1.6; color: #b0b0b0;">
                    Generated efficient solution with MoE architecture and clean implementation patterns.
                </p>
            </div>

            <div style="margin: 1rem 0; padding: 1rem; background: rgba(30, 30, 30, 0.9); border-radius: 12px; border-left: 4px solid #ffe66d;">
                <strong>✨ Gemini Synthesis:</strong>
                <p style="margin-top: 0.5rem; line-height: 1.6; color: #b0b0b0;">
                    Enhanced with superior synthesis and optimized user experience design.
                </p>
            </div>

            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 1rem; border-radius: 12px; margin-top: 1.5rem; color: white;">
                <strong>✅ Result:</strong> Multi-model processing complete! All systems operational.
            </div>
        </div>
    `;
}
