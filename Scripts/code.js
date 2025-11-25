




(async () => {
  const apiUrl = 'https://play.blooket.com/api/users/add-rewards';

  const payload = {
    t: "63503fb4ac194c93b93eb321", 
    addedTokens: 500,
    addedXp: 300
  };

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.headers.has('X-Ns-Patoken')) {
    const token = response.headers.get('X-Ns-Patoken');
  }
};
  const xNsPaToken = 'token';

  const headers = {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Origin': 'https://play.blooket.com/towerdefense',
    'Referer': 'https://play.blooket.com/towerdefense/final',
    'x-ns-patoken': xNsPaToken,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      credentials: 'include', 
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${text}`);
    }

    const result = await response.json();
    console.log('Add Rewards Response:', result);
  } catch (err) {
    console.error('Error calling add-rewards API:', err);
  }
})();
