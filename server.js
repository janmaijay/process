const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/search-processor', (req, res) => {
    const { serial } = req.query;

    if (!serial) {
        return res.status(400).json({ error: 'Serial or model number required' });
    }

    const query = serial.trim().toUpperCase();

    // Exact Database mapping for your provided models and codes
    const database = {
        "HP 240 14 INCH G10": "Intel Core i5-1335U (13th Gen)",
        "OPTIPLEX 3000": "Intel Core i5-12500 (12th Gen)",
        "HP 240 14 INCH G9": "Intel Core i5-1235U (12th Gen)",
        "82TS": "AMD Ryzen 5 7530U (Lenovo IdeaPad Slim 3)",
        "VICTUS BY HP GAMING LAPTOP 15-FA1XXX": "Intel Core i5-12500H / i7-13700H",
        "82K1": "AMD Ryzen 5 5600H (Lenovo IdeaPad Gaming 3)",
        "HP 240R 14 INCH G10": "Intel Core i5-1335U",
        "HP ZBOOK 8 G1I": "Intel Core Ultra 7 155H",
        "ZENBOOK S 13 UX5304VA": "Intel Core i7-1355U",
        "ASUS TUF GAMING F17 FX706HC": "Intel Core i5-11400H",
        "HP PAVILION LAPTOP 14-EC1XXX": "AMD Ryzen 5 5625U",
        "82K2": "AMD Ryzen 7 5800H (Lenovo IdeaPad Gaming 3)",
        "21RSS0H300": "Intel Core Ultra 5 125U (Lenovo ThinkPad)",
        "ROG ZEPHYRUS G14 GA403UM": "AMD Ryzen 7 8845HS",
        "VICTUS BY HP GAMING LAPTOP 15-FA2XXX": "Intel Core i5-13420H / i7-13620H",
        "LATITUDE 7480": "Intel Core i5-7300U / i7-7600U (7th Gen)",
        "83GS": "Intel Core Ultra 7 155H (Lenovo Yoga / Slim)",
        "HP 240 G8": "Intel Core i3-1115G4 / i5-1135G7",
        "HP ZBOOK FIREFLY 14 INCH G11": "Intel Core Ultra 5 125U / Ultra 7 155U"
    };

    // Find matching model key
    let foundProcessor = null;
    let matchedKey = "";
    for (let key in database) {
        if (query.includes(key)) {
            foundProcessor = database[key];
            matchedKey = key;
            break;
        }
    }

    if (foundProcessor) {
        return res.json({
            success: true,
            processor: foundProcessor,
            summary: `Exact match found for: ${matchedKey}`
        });
    } else {
        return res.json({
            success: false,
            message: "Model not found in the custom database. Please check manufacturer official support.",
            searchLinks: [
                { name: "Check on HP Support", url: `https://support.hp.com/in-en/search?q=${encodeURIComponent(serial)}` },
                { name: "Check on Lenovo Support", url: `https://pcsupport.lenovo.com/in/en/search?query=${encodeURIComponent(serial)}` },
                { name: "Check on Dell Support", url: `https://www.dell.com/support/home/en-in/quicksearch?q=${encodeURIComponent(serial)}` }
            ]
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});