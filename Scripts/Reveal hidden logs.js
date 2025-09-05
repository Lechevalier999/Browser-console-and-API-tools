(function () {
    const originalConsole = window.console;
    originalConsole.log = originalConsole.log.bind(originalConsole);
    originalConsole.info = originalConsole.info.bind(originalConsole);
    originalConsole.warn = originalConsole.warn.bind(originalConsole);
    originalConsole.error = originalConsole.error.bind(originalConsole);
    originalConsole.clear = originalConsole.clear.bind(originalConsole);
})();
