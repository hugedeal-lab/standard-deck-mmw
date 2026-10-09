
var zip=null, fname='deck.pptx', logN=0;
function log(m){var e=document.getElementById('log');if(!logN)e.textContent='';logN++;e.textContent+=new Date().toISOString().slice(11,19)+'  '+m+'\n';e.scrollTop=e.scrollHeight;}
log('Page loaded. In iframe: '+(window.self!==window.top)+'. JSZip loaded: '+(typeof JSZip!=='undefined'));
window.addEventListener('error',function(e){log('Page error: '+e.message)});
function mark(id,ok,msg){var e=document.getElementById(id);e.className=ok?'ok':'bad';e.textContent=e.textContent.replace(/^(\d\.).*$/, '$1 ')+msg;}
function esc(s){return String(s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function topN(m,n){return Object.keys(m).sort(function(a,b){return m[b]-m[a]}).slice(0,n).map(function(k){return esc(k)+' ('+m[k]+')'}).join(', ')||'none'}
async function analyze(z){
  var slides=Object.keys(z.files).filter(function(p){return /^ppt\/slides\/slide\d+\.xml$/.test(p)});
  var fonts={},colors={},layouts={},lorem=0,annot=0,pics=0,charts=0;
  for(var i=0;i<slides.length;i++){
    var x=await z.file(slides[i]).async('string');
    (x.match(/typeface="([^"]+)"/g)||[]).forEach(function(m){var f=m.slice(10,-1);if(f.charAt(0)!=='+')fonts[f]=(fonts[f]||0)+1});
    (x.match(/srgbClr val="([0-9A-Fa-f]{6})"/g)||[]).forEach(function(m){var c='#'+m.slice(13,19).toUpperCase();colors[c]=(colors[c]||0)+1});
    if(/lorem ipsum/i.test(x))lorem++; if(/CB297B/i.test(x))annot++;
    pics+=(x.match(/<p:pic>/g)||[]).length; charts+=(x.match(/graphicData uri="[^"]*chart"/g)||[]).length;
    var rp=slides[i].replace('slides/','slides/_rels/')+'.rels', r=z.file(rp)?await z.file(rp).async('string'):'';
    var lm=r.match(/Target="\.\.\/slideLayouts\/(slideLayout\d+\.xml)"/);
    if(lm&&z.file('ppt/slideLayouts/'+lm[1])){var lx=await z.file('ppt/slideLayouts/'+lm[1]).async('string');var nm=(lx.match(/<p:cSld name="([^"]*)"/)||[])[1]||'(unnamed)';layouts[nm]=(layouts[nm]||0)+1}
  }
  return {slides:slides,fonts:fonts,colors:colors,layouts:layouts,lorem:lorem,annot:annot,pics:pics,charts:charts};
}
async function load(f){
  if(!f){log('No file in the event');return;}
  log('Reading '+f.name+' ('+f.size+' bytes)'); fname=f.name||'deck.pptx'; mark('s1',true,'File received: '+fname+' ('+Math.round(f.size/1024)+' KB)');
  try{zip=await JSZip.loadAsync(await f.arrayBuffer());var a=await analyze(zip);
    mark('s2',true,'Opened: '+a.slides.length+' slides');
    document.getElementById('report').innerHTML='<table><tr><th>What</th><th>Found</th></tr>'+
      '<tr><td>Slide layouts used</td><td>'+topN(a.layouts,12)+'</td></tr>'+
      '<tr><td>Fonts</td><td>'+topN(a.fonts,10)+'</td></tr>'+
      '<tr><td>Colours (top 12)</td><td>'+topN(a.colors,12)+'</td></tr>'+
      '<tr><td>Pictures / native charts</td><td>'+a.pics+' / '+a.charts+'</td></tr>'+
      '<tr><td>Slides with "Lorem ipsum"</td><td>'+a.lorem+'</td></tr>'+
      '<tr><td>Slides with #CB297B template annotations</td><td>'+a.annot+'</td></tr></table>';
    document.getElementById('fix').disabled=false;
  }catch(e){mark('s2',false,'Could not open the file: '+e.message);log('Open failed: '+e.message)}
}
document.getElementById('fix').onclick=async function(){
  try{var n=0,paths=Object.keys(zip.files).filter(function(p){return /^ppt\/(slides|slideLayouts|slideMasters)\/[^/]+\.xml$/.test(p)});
    for(var i=0;i<paths.length;i++){var x=await zip.file(paths[i]).async('string');var y=x.replace(/typeface="(Calibri|Calibri Light|Helvetica|Helvetica Neue)"/g,function(){n++;return 'typeface="Arial"'});if(y!==x)zip.file(paths[i],y)}
    mark('s3',true,'Fix applied: '+n+' font reference'+(n===1?'':'s')+' changed to Arial');
    var blob=await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.presentationml.presentation'});
    var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fname.replace(/\.pptx$/i,'')+'_designpass_probe.pptx';
    document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},3000);
    log('Download triggered: '+a.download);mark('s4',true,'Download started: '+a.download+'. Open it in PowerPoint to confirm it opens cleanly.');
  }catch(e){mark('s3',false,'Failed: '+e.message);log('Fix/download failed: '+e.message)}
};
var drop=document.getElementById('drop'),inp=document.getElementById('file');
drop.onclick=function(){log('Drop box clicked: opening file picker');try{inp.click()}catch(e){log('File picker blocked: '+e.message)}};drop.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();inp.click()}};
inp.onchange=function(){log('Hidden picker: '+inp.files.length+' file(s)');load(inp.files[0])};
var inp2=document.getElementById('file2');inp2.onchange=function(){log('Plain picker: '+inp2.files.length+' file(s)');load(inp2.files[0])};
var dragSeen={};
['dragenter','dragover'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.add('over');if(!dragSeen[t]){dragSeen[t]=1;log(t+' reached the page (types: '+Array.prototype.join.call((e.dataTransfer&&e.dataTransfer.types)||[],', ')+')')}})});
document.addEventListener('dragover',function(e){e.preventDefault()});document.addEventListener('drop',function(e){e.preventDefault();log('drop landed outside the box')});
['dragleave','drop'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.remove('over')})});
drop.addEventListener('drop',function(e){var n=e.dataTransfer?e.dataTransfer.files.length:-1;log('drop reached the box: '+n+' file(s)');if(n>0)load(e.dataTransfer.files[0]);else log('The drop carried no file -- the host is likely stripping it.')});
