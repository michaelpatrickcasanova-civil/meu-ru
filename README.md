# Meu RU — GitHub Pages

Site estático com controle local de tickets e sincronização **somente do cardápio** via `cardapio.json` no GitHub.

## Publicar

1. Abra o repositório `michaelpatrickcasanova-civil/meu-ru` na branch `principal`.
2. Use **Add file > Upload files** e envie os arquivos desta pasta (não o ZIP).
3. Confirme o commit na branch `principal`.
4. Em **Settings > Pages**, mantenha `principal` e `/(root)`.
5. Após a publicação, abra `https://michaelpatrickcasanova-civil.github.io/meu-ru/`.

## Publicar cardápio

Edite `cardapio.json` no GitHub. O formato é:

```json
{
  "date": "2026-11-09",
  "lunch": [{"name":"Arroz branco","portion":"200 g"}],
  "dinner": [{"name":"Sopa mineira","portion":"350 g"}],
  "updatedAt": "2026-11-09T10:00:00-03:00",
  "source": "Cardápio informado pela comunidade"
}
```

O site e o APK que carregar essa mesma fonte verão o mesmo cardápio publicado. Usuários podem propor sugestões pela aba Cardápio, que abre uma GitHub Issue (requer conta GitHub). O proprietário revisa e altera `cardapio.json`; Issues não publicam automaticamente.

## Privacidade e offline

- Tickets, QR code, perfil e histórico ficam no armazenamento local do navegador, sem envio ao GitHub.
- O service worker guarda a interface para uso offline após a primeira visita online.
- A última versão do cardápio salva no navegador continua visível offline.
- Armazenamentos locais de navegador e APK são independentes; não sincronizam saldo ou QR.
- Dados locais podem ser perdidos se o usuário limpar o armazenamento. Use backup.
