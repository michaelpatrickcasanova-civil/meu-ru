// Empacota a biblioteca MIT QRCode (Kazuhiko Arase, 2009) já disponível no npm.
const fs = require('fs');
const path = require('path');
const vendor = '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/lib/node_modules/npm/node_modules/qrcode-terminal/vendor/QRCode';
const files = fs.readdirSync(vendor).filter(x=>x.endsWith('.js'));
const definitions = files.map(file=>{
  const name=path.basename(file,'.js');
  return JSON.stringify(name)+':function(require,module,exports){\n'+fs.readFileSync(path.join(vendor,file),'utf8')+'\n}';
}).join(',\n');
const output = `/* QRCode Copyright (c) 2009 Kazuhiko Arase, MIT License */
(function(){
const modules={${definitions}};
const cache={};
function load(name){const id=name.replace(/^\\.\\//,'');if(cache[id])return cache[id].exports;const module={exports:{}};cache[id]=module;modules[id]((n)=>load(n),module,module.exports);return module.exports;}
const QRCode=load('index');
window.MeuRUQrSVG=function(value){
  const qr=new QRCode(-1,1);qr.addData(String(value));qr.make();
  const n=qr.getModuleCount(),margin=4,total=n+margin*2,paths=[];
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.isDark(y,x))paths.push('M'+(x+margin)+' '+(y+margin)+'h1v1h-1z');
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+total+' '+total+'" shape-rendering="crispEdges"><rect width="'+total+'" height="'+total+'" fill="white"/><path d="'+paths.join('')+'" fill="black"/></svg>';
};
})();`;
fs.writeFileSync(path.join(__dirname,'qr-lib.js'),output);
