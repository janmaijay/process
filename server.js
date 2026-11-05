const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to process serial/model number
app.get('/api/search-processor', (req, res) => {
    const { serial } = req.query;

    if (!serial) {
        return res.status(400).json({ error: 'Serial or model number required' });
    }

    const query = serial.trim().toUpperCase();

    // Smart Database / Pattern Recognition for common Dell, HP, Lenovo, and Apple serial patterns
    let detectedProcessor = "";
    let brand = "Unknown Brand";

    if (query.includes("LATITUDE") || query.includes("INSPIRON") || query.includes("DELL")) {
        brand = "Dell";
        if (query.includes("5490") || query.includes("7490")) detectedProcessor = "Intel Core i5-8350U (8th Gen)";
        else if (query.includes("5400") || query.includes("7400")) detectedProcessor = "Intel Core i5-8265U / i7-8665U";
        else if (query.includes("5510")) detectedProcessor = "Intel Core i5-1145G7 (11th Gen)";
        else detectedProcessor = "Intel Core i5 / i7 (Gen 8th - 11th)";
    } 
    else if (query.includes("PROBOOK") || query.includes("ELITEBOOK") || query.includes("HP")) {
        brand = "HP";
        if (query.includes("450 G6")) detectedProcessor = "Intel Core i5-8265U";
        else if (query.includes("450 G7")) detectedProcessor = "Intel Core i5-10210U";
        else if (query.includes("840 G5")) detectedProcessor = "Intel Core i5-8350U";
        else detectedProcessor = "Intel Core i5 / i7 (HP Standard Spec)";
    }
    else if (query.includes("THINKPAD") || query.includes("LENOVO")) {
        brand = "Lenovo";
        if (query.includes("T480")) detectedProcessor = "Intel Core i5-8250U / i7-8550U";
        else if (query.includes("T490")) detectedProcessor = "Intel Core i5-8265U / i5-8365U";
        else detectedProcessor = "Intel Core i5 / AMD Ryzen 5 Pro";
    }
    else if (query.includes("MACBOOK") || query.includes("APL")) {
        brand = "Apple";
        if (query.includes("M1")) detectedProcessor = "Apple M1 Chip (8-core CPU)";
        else if (query.includes("M2")) detectedProcessor = "Apple M2 Chip";
        else detectedProcessor = "Apple Silicon M-Series";
    }
    else {
        // Generic fallback search link generator so user can check manually if not hardcoded
        return res.json({
            success: false,
            message: "Direct automated lookup restricted on cloud server. Click below to check manually on official support site.",
            searchLinks: [
                { name: "Check on Dell Support", url: `https://www.dell.com/support/home/en-in/quicksearch?q=${encodeURIComponent(serial)}` },
                { name: "Check on HP Support", url: `https://support.hp.com/in-en/search?q=${encodeURIComponent(serial)}` },
                { name: "Check on Lenovo Support", url: `https://pcsupport.lenovo.com/in/en/search?query=${encodeURIComponent(serial)}` }
            ]
        });
    }

    return res.json({
        success: true,
        brand: brand,
        processor: detectedProcessor,
        summary: `Identified via model pattern matching for query: ${serial}`
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});