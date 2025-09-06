// index.js - UPGRADED WITH DATA PERSISTENCE

const express = require('express');
const fs = require('fs'); // Node.js File System module. Yeh naya hai!
const path = require('path'); // Path module for finding files correctly.

const app = express();
const PORT = process.env.PORT || 3003;

// --- NEW: Database Path Setup ---
const DB_PATH = path.join(__dirname, 'db.json');

// --- In-Memory Database (will be loaded from file) ---
let urlDatabase = {};

// --- NEW: Function to load data from db.json ---
function loadDatabase() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        urlDatabase = JSON.parse(data);
        console.log('[INFO] Database loaded successfully.');
    } catch (error) {
        // If file doesn't exist or is empty, start fresh
        console.log('[WARN] Could not load database, starting with an empty one.');
        urlDatabase = {};
    }
}

// --- NEW: Function to save data to db.json ---
function saveDatabase() {
    try {
        const data = JSON.stringify(urlDatabase, null, 2); // null, 2 makes the JSON file readable
        fs.writeFileSync(DB_PATH, data, 'utf8');
        console.log('[INFO] Database saved successfully.');
    } catch (error) {
        console.error('[ERROR] Failed to save database:', error);
    }
}


// --- Middleware ---
app.use(express.json());
app.use(express.static('public'));

// --- Utility Functions ---
function generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
}

// --- API Endpoints ---
app.post('/shorten', (req, res) => {
    const { defaultUrl, timeRules } = req.body;

    if (!defaultUrl) {
        return res.status(400).json({ error: 'A default URL is required.' });
    }
    if (!Array.isArray(timeRules)) {
        return res.status(400).json({ error: 'timeRules must be an array.' });
    }

    const shortCode = generateShortCode();
    urlDatabase[shortCode] = { defaultUrl, timeRules };
    
    // --- NEW: Save changes to the file ---
    saveDatabase(); 

    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
    console.log(`[INFO] Created advanced link ${shortCode} with ${timeRules.length} rules.`);
    res.status(201).json({ message: 'Customizable time-aware URL created!', shortUrl });
});

app.get('/:shortCode', (req, res) => {
    const shortCode = req.params.shortCode;
    const urlInfo = urlDatabase[shortCode];

    if (!urlInfo) return res.status(404).send('Short URL not found.');

    const currentHour = new Date().getHours();
    let targetUrl = urlInfo.defaultUrl;

    for (const rule of urlInfo.timeRules) {
        if (currentHour >= rule.startHour && currentHour < rule.endHour) {
            targetUrl = rule.url;
            console.log(`[INFO] Rule match for hour ${currentHour}. Redirecting to ${targetUrl}`);
            break;
        }
    }
    
    if (targetUrl === urlInfo.defaultUrl) {
        console.log(`[INFO] No rule matched. Redirecting to default: ${targetUrl}`);
    }
    res.redirect(targetUrl);
});

// --- Server Activation ---
app.listen(PORT, () => {
    // --- NEW: Load the database when the server starts ---
    loadDatabase();
    console.log(`Server with persistence is running on http://localhost:${PORT}`);
});