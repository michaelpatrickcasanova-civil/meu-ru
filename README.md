# Meu RU — GitHub Pages

Site estático com controle local de tickets e sincronização **somente do cardápio** pelo serviço comunitário Meu RU. O arquivo `cardapio.json` anterior não é mais usado como fonte principal.

## Publicar

1. Abra o repositório `michaelpatrickcasanova-civil/meu-ru` na branch `principal`.
2. Use **Add file > Upload files** e envie os arquivos desta pasta (não o ZIP).
3. Confirme o commit na branch `principal`.
4. Em **Settings > Pages**, mantenha `principal` e `/(root)`.
5. Após a publicação, abra `https://michaelpatrickcasanova-civil.github.io/meu-ru/`.

## Publicar cardápio

Na aba Cardápio, qualquer estudante pode colar a mensagem, revisar os itens e publicar anonimamente. O cardápio aparece imediatamente nos outros dispositivos conectados. A API aceita até três contribuições por origem de rede a cada 24 horas. Para manutenção manual, o formato dos pratos é:

```json
{
  "date": "2026-11-09",
  "lunch": [{"name":"Arroz branco","portion":"200 g"}],
  "dinner": [{"name":"Sopa mineira","portion":"350 g"}],
  "updatedAt": "2026-11-09T10:00:00-03:00",
  "source": "Cardápio informado pela comunidade"
}
```

O site e o APK usam a mesma API: `https://meu-ru-cardapio-api-2026.raquel-scrvlh.chatgpt.site/api/menu`. Duas contestações por identificadores distintos de navegador ocultam um cardápio. Sem login, não é possível garantir que os identificadores representem duas pessoas diferentes.

## Privacidade e offline

- Tickets, QR code, perfil e histórico ficam no armazenamento local do navegador, sem envio ao GitHub.
- O service worker guarda a interface para uso offline após a primeira visita online.
- A última versão do cardápio salva no navegador continua visível offline.
- A câmera ao vivo depende de `BarcodeDetector`, disponível apenas em alguns navegadores. A importação de imagem preserva a foto se a leitura automática não funcionar.
- Armazenamentos locais de navegador e APK são independentes; não sincronizam saldo ou QR.
- Dados locais podem ser perdidos se o usuário limpar o armazenamento. Use backup.
