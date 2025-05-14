(function() {
  let logData = [];

  function addToLog(url, apiKeys, payload, response) {
    const timestamp = new Date().toISOString();
    logData.push({
      timestamp,
      url,
      apiKeys,
      payload,
      response
    });
  }

  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    const options = args[1] || {};
    const requestBody = options.body ? options.body : null;

    let apiKeys = [];
    if (options.headers) {

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

    let payload = null;
    if (requestBody) {
      try {
        payload = JSON.parse(requestBody);
      } catch (e) {
        payload = requestBody; 
      }
    }

    if (apiKeys.length > 0 || payload) {
      console.log("API Request Detected:");
      console.log("URL:", url);
      apiKeys.forEach(key => console.log(`${key.key}:`, key.value));
      if (payload) console.log("Payload:", payload);
    }

    const response = await originalFetch(...args);

    const responseClone = response.clone();

    console.log("API Response:");
    console.log("Status:", response.status);
    console.log("Response Body:", responseBody);

    addToLog(url, apiKeys, payload, responseBody);

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
      apiKeys.push({ key: 'Authorization', value: this.getResponseHeader('Authorization') });
    }
    if (headers.includes('x-api-key')) {
      apiKeys.push({ key: 'x-api-key', value: this.getResponseHeader('x-api-key') });
    }

    let payload = body ? JSON.parse(body) : null;

    if (apiKeys.length > 0 || payload) {
      console.log("XHR Request Detected:");
      console.log("URL:", this._url);
      apiKeys.forEach(key => console.log(`${key.key}:`, key.value));
      if (payload) console.log("Payload:", payload);
    }

    this.addEventListener('load', function() {
      const response = this.responseText;
      console.log("XHR Response:");
      console.log("Status:", this.status);
      console.log("Response Body:", response);
    });

    return originalXhrSend.apply(this, arguments);
  };

})();

(function() {
  console.error = function() {};
  console.info = function() {};
  console.debug = function() {};
  console.trace = function() {};
  console.group = function() {};
  console.groupCollapsed = function() {};
  console.groupEnd = function() {};

  window.onerror = function() {
    return true; 
  };

  window.onunhandledrejection = function() {
    return true; 
  };
console.log('%c API Key, Payload, and Response Logging is now active. All relevant data will be logged in the console! ', 'background: #ff70d9; color: #fff');

})();

