const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to search processor details using DuckDuckGo Instant Answer API
app.get('/api/search-processor', async (req, res) => {
    const { serial } = req.query;

    if (!serial) {
        return res.status(400).json({ error: 'Serial / Model number required' });
    }

    try {
        // Using DuckDuckGo official free API
        const query = encodeURIComponent(serial + ' laptop processor spec');
        const apiUrl = `https://api.duckduckgo.com/?q=${query}&format=json&no_html=1&skip_disambig=1`;
        
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const data = response.data;
        let combinedText = '';

        // Collect text from abstract and related topics
        if (data.AbstractText) {
            combinedText += data.AbstractText + ' ';
        }
        
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            data.RelatedTopics.forEach(topic => {
                if (topic.Text) {
                    combinedText += topic.Text + ' ';
                }
            });
        }

        // Regex patterns to detect Intel, AMD, or Apple Silicon Processors
        const cpuRegex = /(Intel\s+Core\s+i[3579]-?\d{4,5}[A-Z]*|AMD\s+Ryzen\s+[3579]\s+\d{4}[A-Z]*|Apple\s+M[1234]\s*(Pro|Max|Ultra)?|Intel\s+Celeron\s+\w+|Intel\s+Pentium\s+\w+)/i;
        const match = combinedText.match(cpuRegex);

        if (match) {
            return res.json({ 
                success: true, 
                processor: match[0], 
                summary: data.AbstractText || 'Found via database search match.' 
            });
        } else {
            // Fallback: If API returns text but regex doesn't match directly, return abstract text if available
            if (data.AbstractText) {
                return res.json({ 
                    success: true, 
                    processor: "Check summary details below", 
                    summary: data.AbstractText 
                });
            }

            return res.json({ 
                success: false, 
                message: 'Processor details not found for this specific serial/model.', 
                snippets: [] 
            });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Internet fetch failed', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});