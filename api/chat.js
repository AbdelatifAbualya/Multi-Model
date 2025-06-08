
// api/chat.js - Enhanced API handler for multi-model processing
// Optimized for Vercel serverless deployment with advanced features

export default async function handler(req, res) {
    // CORS Configuration for enhanced security
    const allowedOrigins = [
        'http://localhost:3000',
        'https://your-app.vercel.app', // Replace with your actual domain
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
    ].filter(Boolean);

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests for chat
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'Only POST requests are supported'
        });
    }

    try {
        // Enhanced request validation
        const { message, stage = 'all', settings = {} } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Invalid request',
                message: 'Valid message is required'
            });
        }

        // Rate limiting check (basic implementation)
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (await isRateLimited(clientIP)) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Please wait before sending another message'
            });
        }

        // Process the multi-model request
        const result = await processEnhancedMultiModelRequest(message, stage, settings);
        
        return res.status(200).json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
            processing_time: result.processing_time || 0
        });

    } catch (error) {
        console.error('API Error Details:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        return res.status(500).json({ 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Processing failed'
        });
    }
}

/**
 * Enhanced multi-model processing with advanced features
 */
async function processEnhancedMultiModelRequest(message, stage, settings) {
    const startTime = Date.now();
    
    const results = {
        deepseek: null,
        qwen: null,
        gemini: null,
        final_response: null,
        processing_time: 0,
        models_used: [],
        confidence_score: 0
    };

    try {
        // Validate API keys
        validateAPIKeys();

        // Stage 1: DeepSeek V3-0324 Analysis
        if (stage === 'all' || stage === 'deepseek') {
            console.log('🔍 Starting DeepSeek analysis...');
            results.deepseek = await callDeepSeekAPI(message, settings);
            results.models_used.push('deepseek');
        }

        // Stage 2: Qwen3-30B-A3B Code Generation
        if (stage === 'all' || stage === 'qwen') {
            console.log('⚡ Starting Qwen processing...');
            const context = results.deepseek ? 
                `Based on this analysis: ${results.deepseek}\n\nUser request: ${message}` : 
                message;
            results.qwen = await callQwenAPI(context, settings);
            results.models_used.push('qwen');
        }

        // Stage 3: Gemini 2.5 Pro Synthesis
        if (stage === 'all' || stage === 'gemini') {
            console.log('✨ Starting Gemini synthesis...');
            const context = buildEnhancedGeminiContext(message, results.deepseek, results.qwen);
            results.gemini = await callGeminiAPI(context, settings);
            results.models_used.push('gemini');
        }

        // Generate final response with enhanced synthesis
        results.final_response = synthesizeEnhancedResponse(results, message);
        results.confidence_score = calculateConfidenceScore(results);
        results.processing_time = Date.now() - startTime;

        return results;

    } catch (error) {
        console.error('Multi-model processing error:', error);
        throw new Error(`Processing failed: ${error.message}`);
    }
}

/**
 * Enhanced DeepSeek API call with advanced configuration
 */
async function callDeepSeekAPI(message, settings = {}) {
    const temperature = settings.temperature || 0.7;
    
    const requestBody = {
        model: process.env.DEEPSEEK_MODEL || 'accounts/fireworks/models/deepseek-v3-0324',
        messages: [
            {
                role: "system",
                content: `You are DeepSeek V3-0324, the premier analytical reasoning model.
                
                CORE IDENTITY: Strategic Problem Analyzer & Mathematical Reasoner
                SPECIALIZATIONS:
                - Chain-of-thought reasoning with explicit step documentation
                - Mathematical analysis with proof verification
                - Complex problem decomposition and strategic planning
                - Risk assessment and edge case identification
                
                ENHANCED CAPABILITIES:
                - Multi-perspective analysis with bias consideration
                - Quantitative reasoning with uncertainty estimation
                - Systematic debugging of logical inconsistencies
                - Strategic recommendation synthesis
                
                RESPONSE STRUCTURE:
                ## Executive Summary
                [Brief 2-3 sentence overview]
                
                ## Deep Analysis
                [Systematic reasoning with explicit steps]
                
                ## Key Insights
                [Critical findings and patterns identified]
                
                ## Strategic Recommendations
                [Actionable next steps with risk assessment]
                
                ## Edge Cases & Considerations
                [Potential issues and mitigation strategies]
                
                GUIDELINES:
                - Use explicit reasoning chains: "Because X, therefore Y"
                - Quantify uncertainty: "High confidence" vs "Moderate confidence"
                - Identify assumptions and validate them
                - Consider multiple solution approaches
                - Focus on ANALYSIS not implementation`
            },
            {
                role: "user",
                content: message
            }
        ],
        max_tokens: 1200,
        temperature: temperature,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stream: false
    };

    const response = await fetch(`${process.env.FIREWORKS_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`DeepSeek API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Enhanced Qwen API call with thinking mode optimization
 */
async function callQwenAPI(context, settings = {}) {
    const temperature = settings.temperature || 0.5;
    
    const requestBody = {
        model: process.env.QWEN_MODEL || 'accounts/fireworks/models/qwen3-30b-a3b',
        messages: [
            {
                role: "system",
                content: `You are Qwen3-30B-A3B, the efficient implementation specialist.
                
                CORE IDENTITY: Code Architect & Solution Developer
                SPECIALIZATIONS:
                - MoE architecture optimization for complex problems
                - Thinking mode activation for multi-step reasoning
                - Clean, modular code generation with best practices
                - Performance optimization and scalability planning
                
                ENHANCED FEATURES:
                - Iterative development with version control mindset
                - Cross-platform compatibility considerations
                - Security-first implementation approach
                - Documentation-driven development
                
                RESPONSE STRUCTURE:
                ## Implementation Strategy
                [High-level approach based on analysis]
                
                ## Technical Architecture
                [System design and component breakdown]
                
                ## Core Implementation
                [Clean, well-commented code with explanations]
                
                ## Testing & Validation
                [Test cases and validation approaches]
                
                ## Performance Considerations
                [Optimization strategies and scalability notes]
                
                ## Security & Best Practices
                [Security measures and code quality standards]
                
                THINKING MODE ACTIVATION:
                - For complex logic: Break into sub-problems
                - For algorithms: Step-by-step pseudocode first
                - For architecture: Consider all stakeholders
                - For optimization: Profile before optimize
                
                GUIDELINES:
                - Write production-ready code with error handling
                - Include comprehensive comments and documentation
                - Consider edge cases in implementation
                - Optimize for readability and maintainability
                - Focus on IMPLEMENTATION not theory`
            },
            {
                role: "user", 
                content: context
            }
        ],
        max_tokens: 1800,
        temperature: temperature,
        top_p: 0.95,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stream: false
    };

    const response = await fetch(`${process.env.FIREWORKS_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Qwen API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Enhanced Gemini API call with advanced synthesis
 */
async function callGeminiAPI(context, settings = {}) {
    const temperature = settings.temperature || 0.4;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: `You are Gemini 2.5 Pro, the master synthesizer and UI optimization expert.

CORE IDENTITY: Synthesis Specialist & User Experience Architect
SPECIALIZATIONS:
- Advanced code synthesis with 1M+ token context utilization
- Superior front-end development and UI/UX optimization
- Multi-source information integration and coherence
- Production deployment and platform optimization

ENHANCED CAPABILITIES:
- Cross-browser compatibility and accessibility (WCAG 2.1+)
- Performance optimization with Core Web Vitals focus
- Modern design system integration and responsive design
- SEO optimization and social media integration

RESPONSE STRUCTURE:
## Synthesis Overview
[Integration of all previous analyses and implementations]

## Enhanced Solution
[Optimized final implementation with improvements]

## UI/UX Enhancements
[Design improvements and user experience optimizations]

## Production Readiness
[Deployment considerations and platform-specific optimizations]

## Quality Assurance
[Testing strategies and quality metrics]

## Future Scalability
[Growth considerations and extensibility planning]

CONTEXT TO SYNTHESIZE:
${context}

SYNTHESIS GUIDELINES:
- Integrate insights from all previous models seamlessly
- Enhance rather than replace previous work
- Focus on user experience and practical deployment
- Optimize for production environments (Vercel, Netlify, etc.)
- Consider accessibility, performance, and SEO
- Provide deployment-ready configurations
- Balance feature richness with performance`
            }]
        }],
        generationConfig: {
            temperature: temperature,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2400,
            candidateCount: 1,
            stopSequences: []
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    };

    const response = await fetch(`${process.env.GOOGLE_BASE_URL}/models/${process.env.GEMINI_MODEL}:generateContent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GOOGLE_API_KEY,
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error('Invalid response format from Gemini API');
    }
}

/**
 * Enhanced context building for Gemini synthesis
 */
function buildEnhancedGeminiContext(originalMessage, deepseekResult, qwenResult) {
    const sections = [];
    
    sections.push(`ORIGINAL USER REQUEST:\n${originalMessage}`);
    
    if (deepseekResult) {
        sections.push(`DEEPSEEK V3-0324 ANALYSIS:\n${deepseekResult}`);
    }
    
    if (qwenResult) {
        sections.push(`QWEN3-30B-A3B IMPLEMENTATION:\n${qwenResult}`);
    }
    
    sections.push(`SYNTHESIS OBJECTIVES:
- Integrate all previous analyses into a cohesive solution
- Enhance implementation with modern best practices
- Optimize for production deployment and user experience
- Ensure accessibility, performance, and maintainability
- Provide actionable next steps and deployment guidance`);

    return sections.join('\n\n');
}

/**
 * Enhanced response synthesis with quality scoring
 */
function synthesizeEnhancedResponse(results, originalMessage) {
    const { deepseek, qwen, gemini } = results;
    
    // Prioritize based on availability and quality
    if (gemini && gemini.trim().length > 100) {
        return gemini;
    } else if (qwen && qwen.trim().length > 100) {
        return qwen;
    } else if (deepseek && deepseek.trim().length > 100) {
        return deepseek;
    } else {
        return generateFallbackResponse(originalMessage);
    }
}

/**
 * Calculate confidence score based on response quality
 */
function calculateConfidenceScore(results) {
    let score = 0;
    const { deepseek, qwen, gemini } = results;
    
    // Base score for each successful model response
    if (deepseek && deepseek.length > 50) score += 30;
    if (qwen && qwen.length > 50) score += 35;
    if (gemini && gemini.length > 50) score += 35;
    
    // Bonus for comprehensive responses
    if (deepseek && deepseek.length > 500) score += 5;
    if (qwen && qwen.length > 800) score += 5;
    if (gemini && gemini.length > 1000) score += 5;
    
    return Math.min(score, 100);
}

/**
 * Generate fallback response when models fail
 */
function generateFallbackResponse(message) {
    return `I apologize, but I encountered difficulties processing your request through the multi-model pipeline. 

This could be due to:
- Temporary API service issues
- Network connectivity problems
- Rate limiting or quota restrictions

**Your message:** "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"

**Suggested actions:**
1. Please try your request again in a few moments
2. Consider simplifying your query if it's very complex
3. Check that all required services are operational

I'm designed to provide you with the best possible responses by leveraging multiple AI models. Thank you for your patience!`;
}

/**
 * Basic rate limiting implementation
 */
async function isRateLimited(clientIP) {
    // In a production environment, you'd want to use Redis or similar
    // This is a simplified in-memory approach
    if (!global.rateLimitCache) {
        global.rateLimitCache = new Map();
    }
    
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 10; // Max requests per window
    
    const clientData = global.rateLimitCache.get(clientIP) || { count: 0, resetTime: now + windowMs };
    
    if (now > clientData.resetTime) {
        // Reset the window
        clientData.count = 1;
        clientData.resetTime = now + windowMs;
    } else {
        clientData.count++;
    }
    
    global.rateLimitCache.set(clientIP, clientData);
    
    return clientData.count > maxRequests;
}

/**
 * Validate that all required API keys are present
 */
function validateAPIKeys() {
    const requiredKeys = [
        'FIREWORKS_API_KEY',
        'GOOGLE_API_KEY',
        'FIREWORKS_BASE_URL',
        'GOOGLE_BASE_URL'
    ];
    
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    
    if (missingKeys.length > 0) {
        throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
    }
}

/**
 * Health check endpoint (can be called via GET to /api/chat?health=true)
 */
export async function healthCheck() {
    try {
        validateAPIKeys();
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            models: {
                deepseek: !!process.env.DEEPSEEK_MODEL,
                qwen: !!process.env.QWEN_MODEL,
                gemini: !!process.env.GEMINI_MODEL
            }
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}
