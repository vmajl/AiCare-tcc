export function renderErrorPage() {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AICare — erro</title>
  </head>
  <body>
    <main style="font-family:system-ui,sans-serif;max-width:640px;margin:80px auto;padding:24px">
      <h1>Não foi possível carregar o AICare.</h1>
      <p>Atualize a página e tente novamente.</p>
    </main>
  </body>
</html>`;
}
