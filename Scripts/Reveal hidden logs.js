(function() {
    const originalConsole = window.console;
    window.console = {
        log: originalConsole.log.bind(originalConsole),
        info: originalConsole.info.bind(originalConsole),
        warn: originalConsole.warn.bind(originalConsole),
        error: originalConsole.error.bind(originalConsole),
        clear: originalConsole.clear.bind(originalConsole),
    };
})();
