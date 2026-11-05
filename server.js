const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to search processor details by serial / model number
app.get('/api/search-processor', async (req, res) => {
    const { serial } = req.query;

    if (!serial) {
        return res.status(400).json({ error: 'Serial / Model number required' });
    }

    try {
        // Query duckduckgo search engine HTML for processor info matching serial/model
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(serial + ' laptop spec processor')}`;
        
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        let snippets = [];

        $('.result__snippet').each((i, el) => {
            snippets.push($(el).text());
        });

        const fullText = snippets.join(' ');
        
        // Regex patterns to detect Intel, AMD, or Apple Silicon Processors
        const cpuRegex = /(Intel\s+Core\s+i[3579]-?\d{4,5}[A-Z]*|AMD\s+Ryzen\s+[3579]\s+\d{4}[A-Z]*|Apple\s+M[1234]\s*(Pro|Max|Ultra)?|Intel\s+Celeron\s+\w+|Intel\s+Pentium\s+\w+)/i;
        const match = fullText.match(cpuRegex);

        if (match) {
            return res.json({ success: true, processor: match[0], summary: snippets.slice(0, 2).join(' | ') });
        } else {
            return res.json({ 
                success: false, 
                message: 'Exact processor name not extracted automatically.', 
                snippets: snippets.slice(0, 3) 
            });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Internet fetch failed', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});