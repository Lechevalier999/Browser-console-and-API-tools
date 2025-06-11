(async () => {
  const patterns = [
    /['"`][A-Za-z0-9_\-]{16,}['"`]/g, 
    /['"`][A-Za-z0-9_\-]{32,}['"`]/g, 
    /api[_-]?key['"`]?\s*[:=]\s*['"`][A-Za-z0-9_\-]{8,}['"`]/gi,
    /secret['"`]?\s*[:=]\s*['"`][A-Za-z0-9_\-]{8,}['"`]/gi,
    /token['"`]?\s*[:=]\s*['"`][A-Za-z0-9_\-]{8,}['"`]/gi,
    /password['"`]?\s*[:=]\s*['"`][^'"`]{4,}['"`]/gi,
    /AKIA[0-9A-Z]{16}/g, 
    /AIza[0-9A-Za-z\-_]{35}/g, 
    /ya29\.[0-9A-Za-z\-_]+/g, 
    /ghp_[0-9A-Za-z]{36}/g, 
  ];

  // Set to avoid duplicate scans
  const scannedUrls = new Set();

  async function scanScript(src, depth = 1, maxDepth = 2) {
    if (scannedUrls.has(src) || depth > maxDepth) return [];
    scannedUrls.add(src);

    try {
      const res = await fetch(src);
      if (!res.ok) return [];
      const text = await res.text();
      let findings = [];
      patterns.forEach((pat) => {
        let match;
        while ((match = pat.exec(text))) {
          findings.push({ pattern: pat.toString(), match: match[0], src });
        }
      });

      // Recursively scan any new script src found within this script (basic heuristic)
      const newScriptUrls = Array.from(
        text.matchAll(/<script\s+[^>]*src=['"]([^'"]+)['"]/gi)
      ).map(m => (new URL(m[1], src)).href);

      for (const url of newScriptUrls) {
        findings = findings.concat(await scanScript(url, depth + 1, maxDepth));
      }

      return findings;
    } catch (e) {
      return [];
    }
  }

  // Scan inline scripts
  function scanInlineScripts() {
    let findings = [];
    document.querySelectorAll('script:not([src])').forEach(script => {
      const code = script.textContent;
      patterns.forEach((pat) => {
        let match;
        while ((match = pat.exec(code))) {
          findings.push({ pattern: pat.toString(), match: match[0], src: 'inline-script' });
        }
      });
    });
    return findings;
  }

  // Scan the HTML body
  function scanHTML() {
    let findings = [];
    const html = document.documentElement.outerHTML;
    patterns.forEach((pat) => {
      let match;
      while ((match = pat.exec(html))) {
        findings.push({ pattern: pat.toString(), match: match[0], src: 'HTML' });
      }
    });
    return findings;
  }

  // Start scanning
  const scriptSrcs = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
  let allFindings = [];

  // External scripts (with recursive search)
  for (const src of scriptSrcs) {
    allFindings = allFindings.concat(await scanScript(src));
  }

  // Inline scripts
  allFindings = allFindings.concat(scanInlineScripts());

  // HTML
  allFindings = allFindings.concat(scanHTML());

  if (allFindings.length === 0) {
    console.log("No possible secrets found.");
  } else {
    console.log(`\nPossible secrets found:`);
    allFindings.forEach(f =>
      console.log(`[${f.pattern}] --> ${f.match} (in ${f.src})`)
    );
  }
  console.log("Wide scan complete.");
})();
