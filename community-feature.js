// Cardápio comunitário público: só cardápio transita pela rede.
const COMMUNITY_API='https://meu-ru-cardapio-api-2026.raquel-scrvlh.chatgpt.site/api/menu';
let currentCommunityMenuId=null;
const DEVICE_KEY='meuru.community.device.v1';
let communityDevice=localStorage.getItem(DEVICE_KEY);
if(!communityDevice){communityDevice=crypto.randomUUID();localStorage.setItem(DEVICE_KEY,communityDevice)}
$('#menuSyncStatus').textContent='Carregando cardápio comunitário...';
$('#menuSuggestButton').textContent='✦ Publicar cardápio sem login';
$('#menuSyncButton').textContent='↻ Atualizar cardápio comunitário';
$('#menuSyncStatus').parentElement.querySelector('.note').textContent='As contribuições são públicas e aparecem imediatamente. Duas contestações de navegadores diferentes ocultam o cardápio. Sem login, não é possível garantir duas pessoas distintas.';
const flagsBox=document.createElement('div');
flagsBox.id='menuFlags';flagsBox.className='stack';flagsBox.style.marginTop='12px';
menuSyncNotice.append(flagsBox);
async function loadCommunityMenu(){
  $('#menuSyncStatus').textContent='Buscando atualizações...';
  try{
    const response=await fetch(COMMUNITY_API+'?v='+Date.now(),{cache:'no-store'});
    if(!response.ok)throw Error('HTTP '+response.status);
    const data=await response.json();
    if(data.menu){
      currentCommunityMenuId=data.menu.id;
      state.menu={date:data.menu.date,lunch:data.menu.lunch,dinner:data.menu.dinner,source:'community'};
      save();refreshMenu();
      $('#menuSyncStatus').textContent='Cardápio enviado pela comunidade · sincronizado';
      flagsBox.innerHTML='<button class="secondary" id="flagMenu">⚑ Este não é o cardápio correto ('+data.menu.reports+'/2)</button>';
      $('#flagMenu').onclick=flagCommunityMenu;
    }else{
      currentCommunityMenuId=null;flagsBox.innerHTML='';
      if(state.menu?.source==='community'||state.menu?.source==='github') {state.menu=null;save();refreshMenu()}
      $('#menuSyncStatus').textContent='Nenhum cardápio comunitário ativo. Seja o primeiro a enviar!';
    }
  }catch{
    $('#menuSyncStatus').textContent='Sem conexão. Mostrando a última versão salva no aparelho.';
  }
}
async function flagCommunityMenu(){
  if(!currentCommunityMenuId)return;
  if(!confirm('Confirmar que este cardápio está incorreto? Você só poderá votar uma vez neste dispositivo.'))return;
  try{
    const res=await fetch(COMMUNITY_API+'/report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:currentCommunityMenuId,device:communityDevice})});
    const data=await res.json();if(!res.ok)throw Error(data.error||'Falha');
    toast(data.removed?'Cardápio removido após duas contestações.':'Contestação registrada ('+data.reports+'/2).');
    await loadCommunityMenu();
  }catch(e){toast('Não foi possível contestar: '+e.message)}
}
$('#menuSyncButton').onclick=loadCommunityMenu;
$('#menuSuggestButton').onclick=()=>{document.querySelector('#menuPaste').scrollIntoView({behavior:'smooth',block:'center'});$('#menuPaste').focus();toast('Cole o cardápio e toque em Organizar.')};
$('#menuParse').onclick=()=>{
  const message=$('#menuPaste').value.trim(),date=$('#menuDate').value;
  if(!message||!date){toast('Informe a data e cole o cardápio.');return}
  const parsed=parseMenu(message);
  if(!parsed.lunch.length&&!parsed.dinner.length){toast('Nenhum prato reconhecido. Confira o formato.');return}
  modal('Publicar para todos?',`<p class="muted">Confira os ${parsed.lunch.length+parsed.dinner.length} itens antes da publicação imediata e anônima.</p><div style="max-height:43vh;overflow:auto">${mealPanel('Almoço','☀️',parsed.lunch)}${mealPanel('Jantar','🌙',parsed.dinner)}</div><button class="primary" id="publishMenu">Publicar agora sem login</button>`,()=>{
    $('#publishMenu').onclick=async()=>{
      $('#publishMenu').disabled=true;$('#publishMenu').textContent='Publicando...';
      try{
        const res=await fetch(COMMUNITY_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date,...parsed})});
        const data=await res.json();if(!res.ok)throw Error(data.error||'Falha');
        closeModal();toast('Cardápio publicado para todos!');await loadCommunityMenu();
      }catch(e){toast('Não foi possível publicar: '+e.message);$('#publishMenu').disabled=false;$('#publishMenu').textContent='Tentar novamente'}
    };
  });
};
// Verifica novamente quando o usuário retorna à aba.
menuNav.addEventListener('click',loadCommunityMenu);
window.addEventListener('online',loadCommunityMenu);
loadCommunityMenu();

// Carteira QR: toque no código, digitação manual e leitura local da câmera/galeria.
$('#qrThumb').style.cursor='pointer';$('#walletQR').style.cursor='pointer';
$('#qrThumb').onclick=()=>state.qr?showFullQR():tab('wallet');
$('#walletQR').onclick=()=>state.qr?showFullQR():$('#qrFile').click();
const qrActions=document.createElement('div');qrActions.className='stack';
qrActions.innerHTML='<button class="secondary" id="qrNumber"># Gerar pelo número de cadastro</button><button class="secondary" id="qrCamera">◎ Ler QR com a câmera</button><button class="secondary" id="qrPhoto">📷 Tirar foto do QR code</button><input type="file" accept="image/*" capture="environment" id="qrCameraFile" class="hidden"><p class="note">Seu cadastro e QR ficam somente neste dispositivo. Confira se o leitor do RU aceita o código gerado.</p>';
$('#uploadQR').insertAdjacentElement('afterend',qrActions);
function saveQRPayload(value){
  try{
    const svg=window.MeuRUQrSVG(value);
    state.qr='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    state.qrPayload=value;
    save();render();toast('QR code gerado e salvo!');return true;
  }catch{toast('Conteúdo longo demais para gerar. Guarde a foto original.');return false}
}
$('#qrNumber').onclick=()=>modal('Gerar QR pelo cadastro',`<p class="muted">Digite apenas os números, se tiver certeza de que o QR original codifica exatamente esse cadastro.</p><div class="field"><label>Número de cadastro</label><input id="qrCadastro" inputmode="numeric" pattern="[0-9]*" placeholder="Ex.: 6140" value="${/^[0-9]+$/.test(state.qrPayload||'')?state.qrPayload:''}"></div><button class="primary" id="generateQR">Gerar e salvar QR</button>`,()=>{$('#generateQR').onclick=()=>{const n=$('#qrCadastro').value.trim();if(!/^\d{1,24}$/.test(n)){toast('Digite de 1 a 24 dígitos.');return}if(saveQRPayload(n))closeModal()}});
async function tryDecodeQR(file){
  if(!('BarcodeDetector' in window))return null;
  try{
    const img=await createImageBitmap(file);
    const detector=new BarcodeDetector({formats:['qr_code']});
    const results=await detector.detect(img);img.close?.();
    return results[0]?.rawValue||null;
  }catch{return null}
}
function importQRFile(file){
  if(!file||!file.type.startsWith('image/')){toast('Escolha uma imagem.');return}
  if(file.size>7e6){toast('Imagem muito grande. Limite de 7 MB.');return}
  tryDecodeQR(file).then(decoded=>{
    if(decoded&&saveQRPayload(decoded)){toast('QR identificado e recriado no aparelho!');return}
    const reader=new FileReader();reader.onload=()=>{state.qr=reader.result;state.qrPayload=null;save();render();toast('Imagem guardada. Leitura automática não disponível neste navegador.')};reader.readAsDataURL(file);
  });
}
$('#qrFile').onchange=e=>{importQRFile(e.target.files?.[0]);e.target.value=''};
$('#qrCameraFile').onchange=e=>{importQRFile(e.target.files?.[0]);e.target.value=''};
$('#qrPhoto').onclick=()=>$('#qrCameraFile').click();
$('#qrCamera').onclick=async()=>{
  if(!navigator.mediaDevices?.getUserMedia||!('BarcodeDetector' in window)){toast('Leitura ao vivo indisponível. Use Tirar foto.');return}
  modal('Ler QR com a câmera','<video id="qrVideo" autoplay playsinline muted style="width:100%;border-radius:15px;background:#081e28"></video><button class="secondary" id="stopQrCamera">Cancelar</button>');
  let stream;
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});$('#qrVideo').srcObject=stream;}
  catch{closeModal();toast('Não foi possível acessar a câmera.');return}
  const stop=()=>{stream.getTracks().forEach(t=>t.stop());if($('#qrVideo'))closeModal()};
  $('#stopQrCamera').onclick=stop;
  const watcher=new MutationObserver(()=>{if(!$('#qrVideo')){stream.getTracks().forEach(t=>t.stop());watcher.disconnect()}});
  watcher.observe(document.body,{childList:true,subtree:true});
  const detector=new BarcodeDetector({formats:['qr_code']});
  const scan=async()=>{
    const video=$('#qrVideo');if(!video||video.readyState<2)return;
    try{const results=await detector.detect(video);if(results[0]?.rawValue){stop();saveQRPayload(results[0].rawValue)}}catch{}
  };
  const timer=setInterval(()=>{if(!$('#qrVideo')){clearInterval(timer);return}scan()},550);
};
