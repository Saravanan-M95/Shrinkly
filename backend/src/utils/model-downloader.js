import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';

const streamPipeline = promisify(pipeline);

const BASE_URL = 'https://huggingface.co/Xenova/rmbg-1.4/resolve/main/';
const FILES_TO_DOWNLOAD = [
    'config.json',
    'preprocessor_config.json',
    'onnx/model.onnx'
];

/**
 * Ensures all required model files are present locally.
 * @param {string} cacheDir - The directory to store models in.
 */
export async function ensureModelDownloaded(cacheDir) {
    for (const file of FILES_TO_DOWNLOAD) {
        const localPath = path.join(cacheDir, 'Xenova/rmbg-1.4', file);
        const dirName = path.dirname(localPath);

        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }

        if (fs.existsSync(localPath)) {
            // Already exists, skip. (In a real app, you might check hashes)
            continue;
        }

        const url = `${BASE_URL}${file}`;
        console.log(`[AI-SYNC] Downloading: ${file}...`);
        
        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            await streamPipeline(response.data, fs.createWriteStream(localPath));
            console.log(`[AI-SYNC] Finished: ${file}`);
        } catch (err) {
            console.error(`[AI-SYNC] Error downloading ${file}:`, err.message);
            throw new Error(`Failed to download AI model assets: ${err.message}`);
        }
    }
}
