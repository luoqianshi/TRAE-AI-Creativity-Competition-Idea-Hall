
(function () {
    const logContainer = document.createElement('div');
    logContainer.id = 'debug-log-container';
    logContainer.style.position = 'fixed';
    logContainer.style.bottom = '0';
    logContainer.style.right = '0';
    logContainer.style.width = '400px';
    logContainer.style.height = '300px';
    logContainer.style.overflowY = 'scroll';
    logContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    logContainer.style.color = '#fff';
    logContainer.style.fontSize = '12px';
    logContainer.style.zIndex = '9999';
    logContainer.style.padding = '10px';
    logContainer.style.pointerEvents = 'none';
    document.body.appendChild(logContainer);

    function appendLog(type, args) {
        const msg = args.map(arg => {
            if (typeof arg === 'object') return JSON.stringify(arg);
            return String(arg);
        }).join(' ');
        const line = document.createElement('div');
        line.textContent = `[${type}] ${msg}`;
        line.style.borderBottom = '1px solid #333';
        logContainer.appendChild(line);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    const originalLog = console.log;
    console.log = function (...args) {
        originalLog.apply(console, args);
        appendLog('LOG', args);
    };

    const originalError = console.error;
    console.error = function (...args) {
        originalError.apply(console, args);
        appendLog('ERR', args);
    };
})();
