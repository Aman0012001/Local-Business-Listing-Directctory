const { execSync } = require('child_process');

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

const port = process.argv[2] || process.env.PORT || 3002;
ensurePortFree(port);
