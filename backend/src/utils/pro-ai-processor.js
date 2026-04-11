import axios from 'axios';
import FormData from 'form-data';

/**
 * Removes background using the Professional Remove.bg API.
 * @param {Buffer} inputBuffer - The original image buffer.
 * @returns {Promise<Buffer>} - The processed image buffer (PNG).
 */
export async function removeBackgroundPro(inputBuffer) {
    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey || apiKey === 'your_remove_bg_api_key_here') {
        throw new Error('Remove.bg API Key is missing. Please add it to your .env file.');
    }

    console.log('[PRO-AI] Sending request to Remove.bg API...');

    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', inputBuffer, { filename: 'image.jpg' });

    try {
        const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': apiKey,
            },
            responseType: 'arraybuffer',
        });

        console.log('[PRO-AI] Successfully processed image via API.');
        return Buffer.from(response.data);
    } catch (err) {
        if (err.response && err.response.data) {
            try {
                // Error response from Remove.bg is typically a JSON buffer
                const errorData = JSON.parse(Buffer.from(err.response.data).toString());
                console.error('[PRO-AI] API Error:', errorData);
                
                const vendorError = (errorData.errors?.[0]?.title || '').toLowerCase();
                if (vendorError.includes('foreground')) {
                    throw new Error('No clear subject or foreground could be identified in the image. Please try a different photo.');
                }
                if (vendorError.includes('size')) {
                    throw new Error('The image is too large or unsupported. Please use a smaller file or a standard JPEG/PNG.');
                }
                throw new Error('The image could not be processed. Please try another photo.');
            } catch (parseErr) {
                // If it's already an error we threw above, re-throw it.
                if (parseErr.message && !parseErr.message.includes('Unexpected')) {
                    throw parseErr;
                }
                throw new Error('Failed to process image. The service might be temporarily unavailable.');
            }
        }
        throw new Error('Failed to process image. Please try again.');
    }
}
