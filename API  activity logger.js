(function() {
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    console.log("Request URL:", args[0]);
    console.log("Request Options:", args[1]);

    const requestClone = args[1] && args[1].body ? args[1].body : null;

    if (requestClone) {
      console.log("Request Body:", await requestClone.text());
    }

    const response = await originalFetch(...args);

    console.log("Response Status:", response.status);
    console.log("Response URL:", response.url);

    if (response.status === 200 && args[1]?.method !== 'GET') {
      const responseBody = await response.clone().text();
      console.log("Response Body:", responseBody);
    }

    return response; // Return the response as usual
  };

  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    this._method = method;
    console.log(`XHR Request: ${method} ${url}`);
    return originalXhrOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    if (body) {
      console.log("XHR Request Body:", body);
    }
    this.addEventListener("load", function() {
      console.log(`XHR Response for ${this._method} ${this._url}:`);
      console.log("Status:", this.status);
      console.log("Response Body:", this.responseText);
    });

    return originalXhrSend.apply(this, arguments);
  };

  console.log('**#API Logger is now active. All requests will be logged in the console.**');
})();
