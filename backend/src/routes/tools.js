import express from 'express';
import multer from 'multer';
import { removeBackgroundPro } from '../utils/pro-ai-processor.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/tools/remove-background
router.post('/remove-background', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        console.log(`[DEBUG] Received file: ${req.file.originalname}, Size: ${req.file.size}, Mimetype: ${req.file.mimetype}`);
        
        // Use the Professional API (Remove.bg)
        const outputBuffer = await removeBackgroundPro(req.file.buffer);
        
        res.set('Content-Type', 'image/png');
        res.send(outputBuffer);
    } catch (e) {
        console.error("AI BG Removal Error:", e);
        
        // Inform user if the API key is the issue
        if (e.message.includes('API Key is missing')) {
            return res.status(401).json({ 
                error: 'Professional API Key is missing. Please add REMOVE_BG_API_KEY to your backend .env file.' 
            });
        }
        
        res.status(500).json({ error: 'Professional AI processing failed: ' + e.message });
    }
});

export default router;
