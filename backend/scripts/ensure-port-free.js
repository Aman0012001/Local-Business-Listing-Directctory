const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getPortFromEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const match = content.match(/^PORT=(\d+)/m);
            if (match) return parseInt(match[1]);
        }
    } catch (err) {
        // Ignore errors
    }
    return null;
}


/**
 * Robustly ensures a port is free before starting the application.
 * Specifically handles Windows environment by killing processes holding the port.
 */
function ensurePortFree(port) {
    console.log(`🔍 Checking if port ${port} is in use...`);
    try {
        let command = '';
        if (process.platform === 'win32') {
            // Windows: Find PID holding the port and kill it
            command = `powershell -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"`;
        } else {
            // Unix: Use fuser or lsof
            command = `fuser -k ${port}/tcp || true`;
        }
        
        execSync(command);
        console.log(`✅ Port ${port} is now free (or was already free).`);
    } catch (error) {
        // Silently continue if no process was found or kill failed
        console.log(`ℹ️ No active process found on port ${port} or already cleared.`);
    }
}

const port = process.argv[2] || process.env.PORT || getPortFromEnv() || 3001;
ensurePortFree(port);
