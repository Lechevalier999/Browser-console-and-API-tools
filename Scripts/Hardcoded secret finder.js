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

  async function scanScript(src) {
    try {
      const res = await fetch(src);
      if (!res.ok) return [];
      const text = await res.text();
      let findings = [];
      patterns.forEach((pat) => {
        let match;
        while ((match = pat.exec(text))) {
          findings.push({ pattern: pat.toString(), match: match[0] });
        }
      });
      return findings;
    } catch (e) {
      return [];
    }
  }

  const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
  if (!scripts.length) {
    console.log("No external scripts found.");
    return;
  }

  console.log(`Scanning ${scripts.length} JavaScript files for hardcoded secrets...`);
  for (const src of scripts) {
    const findings = await scanScript(src);
    if (findings.length > 0) {
      console.log(`\nPossible secrets found in ${src}:`);
      findings.forEach(f =>
        console.log(`  [${f.pattern}] --> ${f.match}`)
      );
    }
  }
  console.log("Scan complete.");
})();
