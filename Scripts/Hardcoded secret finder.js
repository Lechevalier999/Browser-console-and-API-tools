(async () => {
  const patterns = [
    { type: 'Generic Secret', regex: /['"`][A-Za-z0-9_\-]{16,}['"`]/g },
    { type: 'API Key', regex: /api[_-]?key['"`]?\s*[:=]\s*['"`][A-Za-z0-9_\-]{8,}['"`]/gi },
    { type: 'Secret', regex: /secret['"`]?\s*[:=]\s*['"`][A-Za-z0-9_\-]{8,}['"`]/gi },
    { type: 'Token', regex: /token['"`]?\s*[:=]\s*['"`][A-Za-z0-9_\-]{8,}['"`]/gi },
    { type: 'Password', regex: /password['"`]?\s*[:=]\s*['"`][^'"`]{4,}['"`]/gi },
    { type: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
    { type: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/g },
    { type: 'Google OAuth', regex: /ya29\.[0-9A-Za-z\-_]+/g },
    { type: 'GitHub Token', regex: /ghp_[0-9A-Za-z]{36}/g },
    { type: 'Insecure Resource (HTTP)', regex: /src=['"]http:\/\/[^'"]+/gi },
    { type: 'Exposed Credentials in URL', regex: /https?:\/\/[^\s\/]+:[^\s\/]+@/gi }, // e.g., user:pass@
    { type: 'Inline Event Handler', regex: /on\w+=['"][^'"]+['"]/gi },
  ];

  async function fetchAndScan(url, context) {
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const text = await res.text();
      return scanText(text, url, context);
    } catch {
      return [];
    }
  }

  function scanText(text, location, context) {
    let findings = [];
    patterns.forEach(({ type, regex }) => {
      let match;
      while ((match = regex.exec(text))) {
        findings.push({
          type,
          match: match[0],
          location,
          context,
        });
      }
    });
    return findings;
  }

  let sources = [];

  sources.push({ type: 'html', content: document.documentElement.outerHTML, location: document.location.href });

  document.querySelectorAll('script:not([src])').forEach((el, i) => {
    sources.push({
      type: 'inline-script',
      content: el.textContent,
      location: `${document.location.href} (inline script #${i + 1})`
    });
  });

  document.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        sources.push({
          type: 'inline-event',
          content: attr.value,
          location: `${document.location.href} (<${el.tagName.toLowerCase()} ${attr.name}="...">)`
        });
      }
    });
  });

  const externalSelectors = [
    { tag: 'script', attr: 'src' },
    { tag: 'link[rel="stylesheet"]', attr: 'href' },
    { tag: 'iframe', attr: 'src' },
    { tag: 'img', attr: 'src' }
  ];
  let externalUrls = [];
  externalSelectors.forEach(({ tag, attr }) => {
    document.querySelectorAll(tag).forEach(el => {
      const url = el.getAttribute(attr);
      if (url && url.startsWith('https://')) {
        externalUrls.push({ url, context: `<${el.tagName.toLowerCase()} ${attr}="${url}">` });
      }
      if (url && url.startsWith('http://')) {
        sources.push({
          type: 'insecure-resource',
          content: url,
          location: document.location.href,
        });
      }
    });
  });

  function getVisibleText() {
    let walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node.parentElement || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        const style = window.getComputedStyle(node.parentElement);
        return style && style.display !== 'none' && style.visibility !== 'hidden'
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    let text = "", node;
    while (node = walker.nextNode()) text += node.textContent + "\n";
    return text;
  }
  sources.push({ type: 'visible-text', content: getVisibleText(), location: document.location.href });

  let findings = [];
  sources.forEach(src => {
    findings.push(...scanText(src.content, src.location, src.type));
  });

  for (const ext of externalUrls) {
    findings.push(...await fetchAndScan(ext.url, ext.context));
  }

  // --- Updated logging section (collapsible findings) ---
  if (findings.length === 0) {
    console.log("✅ No secrets or security weaknesses found.");
    return;
  }

  console.groupCollapsed(`🕵️ Security Findings (${findings.length}) — click to expand`);
  findings.forEach(f =>
    console.log(
      `🔸 [${f.type}]\n    Match: ${f.match}\n    Location: ${f.location}\n    Context: ${f.context || ""}\n`
    )
  );
  console.groupEnd();
  // ------------------------------------------------------

})();
