const axios = require('axios');
const readline = require('readline');

const API_URL = 'https://app.yoso.fun/api/invite/validate';

// --- CONFIGURATION ---
const HEADERS = {
    'accept': '*/*',
    'cookie': 'alchemy-account-state%3Awagmi.store=...', // NOT RECOMMENDED 
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0'
};

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m"
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function validateCodes() {
    console.log(`${colors.cyan}${colors.bright}=== YOSO CODE VALIDATOR ===${colors.reset}\n`);
    
    rl.question(`${colors.bright}Enter YOSO code(s) to check: ${colors.reset}`, async (input) => {
        const codes = input.split(/[\s,]+/).map(c => c.trim()).filter(c => c.length > 0);

        if (codes.length === 0) {
            console.log(`${colors.red}❌ No codes entered.${colors.reset}`);
            process.exit();
        }

        for (const testCode of codes) {
            process.stdout.write(`${colors.cyan}Checking ${testCode}... ${colors.reset}`);

            try {
                const res = await axios.get(API_URL, { 
                    params: { code: testCode }, 
                    headers: HEADERS 
                });
                
                if (res.data.valid) {
                    console.log(`${colors.green}${colors.bright}VALID ✅${colors.reset}`);
                } else {
                    console.log(`${colors.yellow}INVALID (${res.data.error}) ❌${colors.reset}`);
                }
            } catch (e) {
                const errorMsg = e.response?.data?.error || "Network Error";
                console.log(`${colors.red}FAILED (${errorMsg}) ⚠️${colors.reset}`);
            }
        }

        rl.close();
    });
}

validateCodes();
