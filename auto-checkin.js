// Opção local de check-in ao exibir o QR. Não transmite dados pessoais.
(() => {
  const pref='meuru-auto-checkin-v1';
  const card=document.createElement('div');
  card.className='card stack';
  card.innerHTML='<strong>Check-in ao abrir o QR</strong><label style="display:flex;align-items:center;gap:12px;font-size:14px"><input type="checkbox" id="autoCheckinToggle" style="width:20px;height:20px"> Registrar automaticamente ao abrir o QR code</label><p class="note">Almoço: 11h às 14h. Jantar: 17h às 20h. Para cotistas, a primeira refeição do dia é grátis e a segunda custa 1 ticket. Ative apenas se você abrir o QR na hora de comer. A abertura não confirma a leitura pela catraca.</p>';
  $('#settings .settings').prepend(card);
  $('#autoCheckinToggle').checked=localStorage.getItem(pref)==='true';
  $('#autoCheckinToggle').onchange=e=>{
    localStorage.setItem(pref,String(e.target.checked));
    toast(e.target.checked?'Check-in automático ativado.':'Check-in automático desativado.');
  };
  const original=showFullQR;
  showFullQR=function(){
    if(!state.qr)return;
    original();
    const root=$('#qrRoot .fullqr');
    if(!root||localStorage.getItem(pref)!=='true')return;
    const now=new Date();
    const minutes=now.getHours()*60+now.getMinutes();
    const meal=minutes>=660&&minutes<840?'Almoço':minutes>=1020&&minutes<1200?'Janta':null;
    const date=localDate(now);
    const info=document.createElement('small');
    info.style.fontWeight='750';
    if(!meal)info.textContent='Fora do horário do RU: check-in não registrado.';
    else if(mealFor(date,meal))info.textContent=meal+' já registrado hoje; sem desconto duplicado.';
    else{
      const delta=mealDelta(date);
      if(delta<0&&calculate().balance<=0)info.textContent='Sem tickets: check-in não registrado. Ajuste o saldo.';
      else{
        add({type:'meal',name:meal,date});
        info.textContent=meal+' registrado: '+(delta===0?'refeição grátis.':'1 ticket descontado.');
      }
    }
    root.insertBefore(info,root.querySelector('#leaveQR'));
  };
})();
