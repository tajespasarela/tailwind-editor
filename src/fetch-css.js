export async function fetchCss(tailwindCustomConfig) {
  return await fetch('http://localhost:8080', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      html: document.body.innerHTML,
      theme: {
        extend: tailwindCustomConfig
      }
    })
  }).then(response => response.text());
}
