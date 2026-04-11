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
            // Error response from Remove.bg is typically a JSON buffer
            const errorData = JSON.parse(Buffer.from(err.response.data).toString());
            console.error('[PRO-AI] API Error:', errorData);
            throw new Error(`Remove.bg Error: ${errorData.errors[0].title}`);
        }
        throw err;
    }
}
