import { pipeline, RawImage, env } from '@huggingface/transformers';
import sharp from 'sharp';
import path from 'path';
import { ensureModelDownloaded } from './model-downloader.js';

// Configure environment for local-only execution
const CACHE_DIR = path.resolve('./models_cache');
env.allowLocalModels = true;
env.allowRemoteModels = false; // Disable library's own flaky fetch
env.localModelPath = CACHE_DIR; // Point to our local cache

let segmenter = null;

/**
 * Loads the RMBG-1.4 model from the local cache.
 */
async function getSegmenter() {
    if (!segmenter) {
        // First, ensure files are physically present using our robust downloader
        await ensureModelDownloaded(CACHE_DIR);

        console.log('[AI] Initializing Local RMBG-1.4 model...');
        segmenter = await pipeline('image-segmentation', 'Xenova/rmbg-1.4', {
            device: 'cpu' 
        });
        console.log('[AI] Model initialized successfully.');
    }
    return segmenter;
}

/**
 * Removes background from an image buffer using RMBG-1.4.
 * @param {Buffer} inputBuffer - The original image buffer.
 * @returns {Promise<Buffer>} - The processed image buffer (PNG with transparency).
 */
export async function removeBackgroundHighFidelity(inputBuffer) {
    const model = await getSegmenter();

    // 1. Prepare original image metadata using Sharp
    const originalMetadata = await sharp(inputBuffer).metadata();
    
    // 2. Convert Sharp buffer to Transformers.js RawImage
    const rawImage = await RawImage.fromBuffer(inputBuffer);

    // 3. Run Inference (Predict segmentation mask)
    console.log('[AI] Executing segmentation...');
    const result = await model(rawImage);
    
    // The model returns a mask as a Uint8Array
    const maskData = result[0].mask.data;
    const { width, height } = result[0].mask;

    // 4. Create a Sharp mask from the result
    const maskBuffer = Buffer.from(maskData);
    const sharpMask = sharp(maskBuffer, {
        raw: {
            width,
            height,
            channels: 1 // Alpha/Grayscale mask
        }
    });

    // 5. Apply the mask to the original image
    const resizedMask = await sharpMask
        .resize(originalMetadata.width, originalMetadata.height)
        .toBuffer();

    const outputBuffer = await sharp(inputBuffer)
        .joinChannel(resizedMask) // Apply mask as alpha channel
        .toFormat('png')
        .toBuffer();

    console.log('[AI] Segmentation complete.');
    return outputBuffer;
}
