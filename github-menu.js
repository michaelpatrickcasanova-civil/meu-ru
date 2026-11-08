// Sincronização somente do cardápio. Saldo, QR e histórico nunca são enviados.
const MENU_ENDPOINT = './cardapio.json';
const ISSUE_URL = 'https://github.com/michaelpatrickcasanova-civil/meu-ru/issues/new';
const menuSyncNotice = document.createElement('div');
menuSyncNotice.className = 'card stack';
menuSyncNotice.style.marginTop = '13px';
menuSyncNotice.innerHTML = '<strong>☁️ Cardápio compartilhado</strong><p class="muted" id="menuSyncStatus">Procurando atualizações...</p><button class="secondary" id="menuSyncButton">↻ Atualizar cardápio</button><button class="secondary" id="menuSuggestButton">↗ Enviar sugestão para revisão</button><p class="note">Para enviar uma sugestão pelo GitHub, é necessário entrar em uma conta. O cardápio só muda para todos após aprovação e atualização do arquivo cardapio.json.</p>';
$('#menu .menu-hero').insertAdjacentElement('afterend', menuSyncNotice);
const previousMenuRender = refreshMenu;
refreshMenu = function () {
  previousMenuRender();
  const saved = state.menu;
  if (saved?.source === 'github') $('#menuDateLabel').textContent += ' · Compartilhado';
};
async function syncMenu() {
  $('#menuSyncStatus').textContent = 'Buscando cardápio mais recente...';
  try {
    const res = await fetch(MENU_ENDPOINT + '?v=' + Date.now(), {cache:'no-store'});
    if (!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    if (!Array.isArray(data.lunch) || !Array.isArray(data.dinner)) throw new Error('Formato inválido');
    if (!data.date || (!data.lunch.length && !data.dinner.length)) {
      $('#menuSyncStatus').textContent = 'Ainda não há cardápio publicado no GitHub.';
      return;
    }
    const valid = items => items.filter(x => typeof x.name === 'string' && typeof x.portion === 'string').map(x=>({name:x.name.slice(0,140),portion:x.portion.slice(0,40)}));
    const current = state.menu;
    if (!current || current.source==='github' || data.date>=current.date) {
      state.menu = {date:String(data.date),lunch:valid(data.lunch),dinner:valid(data.dinner),source:'github'};
      save(); refreshMenu();
    }
    $('#menuSyncStatus').textContent = 'Atualizado pelo GitHub. Disponível para consulta offline.';
  } catch (error) {
    $('#menuSyncStatus').textContent = 'Sem conexão ou cardápio indisponível. Exibindo a última versão salva, se houver.';
  }
}
$('#menuSyncButton').onclick = syncMenu;
$('#menuSuggestButton').onclick = () => {
  const raw = $('#menuPaste').value.trim();
  if (!raw) {toast('Cole a mensagem do cardápio antes de enviar.');return;}
  const date = $('#menuDate').value;
  const title = encodeURIComponent('Sugestão de cardápio — '+date);
  const body = encodeURIComponent('Data: '+date+'\n\nMensagem recebida:\n\n'+raw+'\n\nPor favor, revisar antes de publicar.');
  window.open(ISSUE_URL+'?title='+title+'&body='+body, '_blank', 'noopener');
};
// Um cardápio colado localmente é apenas um rascunho até ser aprovado.
const pasteHint = document.createElement('p');
pasteHint.className = 'note';
pasteHint.textContent = 'Organizar e salvar aqui cria uma cópia neste aparelho. Para compartilhar com todos, use Enviar sugestão para revisão.';
$('#menuParse').insertAdjacentElement('afterend', pasteHint);
const pwaLink = document.createElement('link');
pwaLink.rel='manifest';pwaLink.href='./manifest.webmanifest';document.head.append(pwaLink);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));
syncMenu();
