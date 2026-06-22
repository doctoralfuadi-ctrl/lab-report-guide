// Minimal markdown renderer for AI interpretation responses.
// Supports: headings (##, ###), bold (**), inline code (`x`), unordered lists, ordered lists, paragraphs.
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Splits a full markdown interpretation into:
//   main: everything except the diet / exercise / recommendations sections
//   recommendations: only the diet + exercise + recommendations sections
// Detection is multi-language (Arabic + English keywords).
export function splitInterpretation(md) {
  if (!md) return { main: "", recommendations: "" };
  const lines = md.split(/\r?\n/);
  const headerRe = /^(##\s+)(.+)$/;
  const recHeaderRe = /(diet|food|nutrition|exercise|physical|activity|lifestyle|recommendation|recommendations|\u062a\u063a\u0630\u064a\u0629|\u0637\u0639\u0627\u0645|\u0623\u0637\u0639\u0645\u0629|\u063a\u0630\u0627\u0621|\u062d\u0645\u064a\u0629|\u0631\u064a\u0627\u0636\u0629|\u0646\u0634\u0627\u0637|\u062a\u0645\u0627\u0631\u064a\u0646|\u062a\u0648\u0635\u064a\u0627\u062a)/i;

  const main = [];
  const recs = [];
  let bucket = main;

  for (const raw of lines) {
    const m = raw.match(headerRe);
    if (m) {
      // A new ## heading \u2014 pick bucket based on its title
      bucket = recHeaderRe.test(m[2]) ? recs : main;
    }
    bucket.push(raw);
  }
  return { main: main.join("\n").trim(), recommendations: recs.join("\n").trim() };
}

export function renderMarkdown(md) {
  if (!md) return "";
  const lines = md.split(/\r?\n/);
  let html = "";
  let inUl = false, inOl = false;

  const closeLists = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
    if (inOl) { html += "</ol>"; inOl = false; }
  };

  const sectionClass = (title) => {
    const t = title.toLowerCase();
    if (/(diet|food|nutrition|\u062a\u063a\u0630\u064a\u0629|\u0637\u0639\u0627\u0645|\u0623\u0637\u0639\u0645\u0629|\u063a\u0630\u0627\u0621|\u062d\u0645\u064a\u0629)/i.test(t)) return "md-diet";
    if (/(exercise|physical|activity|lifestyle|workout|\u0631\u064a\u0627\u0636\u0629|\u0646\u0634\u0627\u0637|\u062a\u0645\u0627\u0631\u064a\u0646|\u0623\u0646\u0634\u0637\u0629)/i.test(t)) return "md-exercise";
    if (/(recommendation|recommendations|\u062a\u0648\u0635\u064a\u0627\u062a)/i.test(t)) return "md-recs";
    if (/(disclaimer|\u062a\u0646\u0628\u064a\u0647)/i.test(t)) return "md-disclaimer";
    return "";
  };

  const inline = (s) => {
    let t = escapeHtml(s);
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return t;
  };

  for (let raw of lines) {
    const line = raw.trim();
    if (!line) { closeLists(); continue; }
    if (line.startsWith("### ")) { closeLists(); html += `<h3>${inline(line.slice(4))}</h3>`; continue; }
    if (line.startsWith("## "))  { closeLists(); const text = line.slice(3); const cls = sectionClass(text); html += `<h2${cls ? ` class="${cls}"` : ""}>${inline(text)}</h2>`; continue; }
    if (line.startsWith("# "))   { closeLists(); html += `<h2>${inline(line.slice(2))}</h2>`; continue; }
    if (/^[-*]\s+/.test(line)) {
      if (inOl) { html += "</ol>"; inOl = false; }
      if (!inUl) { html += "<ul>"; inUl = true; }
      html += `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`;
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (inUl) { html += "</ul>"; inUl = false; }
      if (!inOl) { html += "<ol>"; inOl = true; }
      html += `<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`;
      continue;
    }
    closeLists();
    html += `<p>${inline(line)}</p>`;
  }
  closeLists();
  return html;
}
