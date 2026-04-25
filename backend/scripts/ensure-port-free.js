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
 * Robustly ensures ports are free before starting the application.
 * Specifically handles Windows environment by killing processes holding the port.
 */
function ensurePortFree(port) {
    console.log(`🔍 Checking if port ${port} is in use...`);
    try {
        if (process.platform === 'win32') {
            // Windows: Find PID holding the port and kill it
            // We use a more direct approach to ensure it actually stops
            const findCmd = `netstat -ano | findstr :${port}`;
            const output = execSync(findCmd, { encoding: 'utf8' }).trim();
            
            if (output) {
                const lines = output.split('\n');
                const pids = new Set();
                
                lines.forEach(line => {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && !isNaN(pid) && pid !== '0') {
                        pids.add(pid);
                    }
                });
                
                pids.forEach(pid => {
                    console.log(`💀 Killing process ${pid} holding port ${port}...`);
                    try {
                        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
                    } catch (e) {
                        // PID might have already exited
                    }
                });
                console.log(`✅ Port ${port} cleared.`);
            } else {
                console.log(`✅ Port ${port} is already free.`);
            }
        } else {
            // Unix: Use fuser
            execSync(`fuser -k ${port}/tcp || true`, { stdio: 'ignore' });
            console.log(`✅ Port ${port} is now free.`);
        }
    } catch (error) {
        // Silently continue
        console.log(`ℹ️ Port ${port} check completed.`);
    }
}

// Clean up both 3000 (Frontend) and 3001 (Backend) to avoid ghost conflicts
const portsToClean = [3000, 3001];
const targetPort = parseInt(process.argv[2] || process.env.PORT || getPortFromEnv() || 3001);

if (!portsToClean.includes(targetPort)) {
    portsToClean.push(targetPort);
}

portsToClean.forEach(ensurePortFree);

