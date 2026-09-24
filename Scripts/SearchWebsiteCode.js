(async () => {
  const input = prompt(
    "Enter keywords to search for (separate multiple keywords with spaces):"
  );

  if (!input?.trim()) return;

  const keywords = input
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const resources = [];

  // Current HTML
  resources.push({
    type: "HTML",
    url: location.href,
    content: document.documentElement.outerHTML
  });

  // External JavaScript files
  document.querySelectorAll('script[src]').forEach(script => {
    resources.push({
      type: "JS",
      url: new URL(script.src, location.href).href
    });
  });

  // External CSS files
  document.querySelectorAll('link[rel="stylesheet"][href]').forEach(link => {
    resources.push({
      type: "CSS",
      url: new URL(link.href, location.href).href
    });
  });

  console.clear();
  console.log(`Found ${resources.length} resources. Searching...`);

  // Download JS/CSS resources
  for (const resource of resources) {
    if (!resource.content) {
      try {
        const response = await fetch(resource.url);
        resource.content = await response.text();
      } catch (error) {
        resource.error = error.message;
      }
    }
  }

  const results = [];

  for (const resource of resources) {
    if (!resource.content) continue;

    const text = resource.content;
    const lowerText = text.toLowerCase();

    const matches = [];

    for (const keyword of keywords) {
      let position = 0;

      while ((position = lowerText.indexOf(keyword, position)) !== -1) {
        const start = Math.max(0, position - 100);
        const end = Math.min(
          text.length,
          position + keyword.length + 100
        );

        matches.push({
          keyword,
          position,
          snippet: text.slice(start, end)
        });

        position += keyword.length;
      }
    }

    if (matches.length) {
      results.push({
        type: resource.type,
        url: resource.url,
        matches
      });
    }
  }

  console.log(
    `Finished. Found matches in ${results.length} resource(s).`
  );

  // Display results
  for (const result of results) {
    console.group(
      `%c[${result.type}] ${result.url}`,
      "font-weight:bold"
    );

    for (const match of result.matches) {
      console.log(
        `%c${match.keyword}`,
        "color:#00a000;font-weight:bold",
        `\n${match.snippet}`
      );
    }

    console.groupEnd();
  }

  // Make results available as `window.keywordSearchResults`
  window.keywordSearchResults = results;

  console.log(
    "Results are also available as window.keywordSearchResults"
  );
})();
