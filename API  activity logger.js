(function() {
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    const options = args[1];
    const requestBody = options && options.body ? options.body : null;

    let apiKeys = [];
    if (options && options.headers) {
      // Check for API key in headers (common: 'Authorization', 'x-api-key')
      const headers = options.headers;
      if (headers['Authorization']) {
        apiKeys.push({ key: 'Authorization', value: headers['Authorization'] });
      }
      if (headers['x-api-key']) {
        apiKeys.push({ key: 'x-api-key', value: headers['x-api-key'] });
      }
    }

    const urlParams = new URLSearchParams(url.split('?')[1]);
    if (urlParams.has('api_key')) {
      apiKeys.push({ key: 'api_key', value: urlParams.get('api_key') });
    }

    if (apiKeys.length > 0) {
      console.log("API Request Detected:");
      console.log("URL:", url);
      apiKeys.forEach(key => {
        console.log(`${key.key}:`, key.value);
      });
    }

    const response = await originalFetch(...args);

    return response;
  };

  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    this._method = method;
    return originalXhrOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    let apiKeys = [];
    const urlParams = new URLSearchParams(this._url.split('?')[1]);

    if (urlParams.has('api_key')) {
      apiKeys.push({ key: 'api_key', value: urlParams.get('api_key') });
    }

    const headers = this.getAllResponseHeaders();
    if (headers.includes('Authorization')) {
      apiKeys.push({ key: 'Authorization', value: headers['Authorization'] });
    }
    if (headers.includes('x-api-key')) {
      apiKeys.push({ key: 'x-api-key', value: headers['x-api-key'] });
    }

    if (apiKeys.length > 0) {
      console.log("XHR Request Detected:");
      console.log("URL:", this._url);
      apiKeys.forEach(key => {
        console.log(`${key.key}:`, key.value);
      });
    }

    return originalXhrSend.apply(this, arguments);
  };

  console.log('API Key Logging is now active. All API keys will be logged in the console.');
})();

