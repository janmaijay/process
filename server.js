const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/search-processor', async (req, res) => {
    const { serial } = req.query;

    if (!serial) {
        return res.status(400).json({ error: 'Serial or model number required' });
    }

    try {
        // Query DuckDuckGo HTML version with browser-like headers
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(serial + ' laptop processor specifications')}`;
        
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });

        const $ = cheerio.load(response.data);
        let snippets = [];

        // Extract text from DuckDuckGo HTML result snippets
        $('.result__snippet').each((i, el) => {
            snippets.push($(el).text().trim());
        });

        // Also grab result titles just in case
        $('.result__title').each((i, el) => {
            snippets.push($(el).text().trim());
        });

        const fullText = snippets.join(' ');

        // Expanded Regex to catch Intel, AMD, and Apple processors accurately
        const cpuRegex = /(Intel\s*(Core)?\s*i[3579]-?\d{4,5}[A-Z]*|AMD\s*Ryzen\s*[3579]\s*\d{4}[A-Z]*|Apple\s*M[1234]\s*(Pro|Max|Ultra)?|Intel\s*Celeron\s*N?\d+|Intel\s*Pentium\s*\w+|Intel\s*Core\s*Ultra\s*[579]\s*\d{3}[A-Z]*)/i;
        const match = fullText.match(cpuRegex);

        if (match) {
            return res.json({ 
                success: true, 
                processor: match[0], 
                summary: snippets.slice(0, 2).join(' | ') 
            });
        } else {
            // If regex didn't find an exact CPU string, but we got web snippets, return the snippets so you can see what came up
            if (snippets.length > 0) {
                return res.json({ 
                    success: false, 
                    message: 'Web results found, but exact CPU pattern not matched.', 
                    snippets: snippets.slice(0, 3) 
                });
            }

            return res.json({ 
                success: false, 
                message: 'No results found on the web for this serial/model number.', 
                snippets: [] 
            });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Server search error', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});