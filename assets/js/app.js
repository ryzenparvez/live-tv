(function(){
"use strict";
var S=window.SITE||{},$=function(s){return document.querySelector(s)},v=$("#v"),ov=$("#ov"),root=document.documentElement;
var store={get:function(k,d){try{var x=JSON.parse(localStorage.getItem(k));return x==null?d:x}catch(e){return d}},set:function(k,x){try{localStorage.setItem(k,JSON.stringify(x))}catch(e){}}};
var LABEL={all:"All",fav:"⭐ Favorites",lsports:"🔴 Live Sports",sports:"🏆 Sports",news:"News",bangla:"Bangla",hindi:"Hindi",movies:"Movies",music:"Music",documentary:"Documentary",kids:"Cartoons",inbangla:"Indian Bangla",ent:"Entertainment",intl:"International",religious:"Religious",pak:"Pakistani"};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var ini=function(n){return n.split(/\s+/).slice(0,2).map(function(w){return w.charAt(0)}).join("").toUpperCase()};
var SERVERS=S.servers&&S.servers.length?S.servers:[{id:"own",name:"BDIX SERVER-OWN",type:"hls",data:"CH"}];
var srv=SERVERS[0],list=[],m3u={};
function load(id){srv=SERVERS.filter(function(x){return x.id===id})[0]||SERVERS[0];var s=srv;
  list=m3u[s.id]?m3u[s.id].map(function(c){c.srv=s;return c}):(window[s.data]||[]).map(function(a){return{name:a[0],cat:a[1],slug:a[2],url:a[3],logo:a[4],srv:s}})}
var cur=null,cat="all",q="",hls=null,tries=0,failed=false,favs=store.get("jsn_fav",[]);

/* theme */
var th=store.get("jsn_theme","dark");if(th)root.setAttribute("data-theme",th);
$("#theme").onclick=function(){var d=root.getAttribute("data-theme")?root.getAttribute("data-theme")==="dark":matchMedia("(prefers-color-scheme:dark)").matches;var n=d?"light":"dark";root.setAttribute("data-theme",n);store.set("jsn_theme",n)};

/* overlay */
function msg(h){ov.innerHTML=h;ov.hidden=false}
function hide(){ov.hidden=true}
function loading(){msg('<div class="spin"></div>')}
function fail(t){failed=true;msg("<p>"+(t||"চ্যানেলটি এখন চালানো যাচ্ছে না। সার্ভার চালু আছে কিনা এবং আপনি BDIX নেটওয়ার্কে আছেন কিনা দেখুন।")+'</p><button type="button" data-retry>আবার চেষ্টা করুন</button>')}
ov.addEventListener("click",function(e){if(e.target.closest("[data-retry]")&&cur)play(cur);if(e.target.closest("[data-open]")&&cur)openChannel(cur)});
v.addEventListener("playing",hide);
v.addEventListener("waiting",function(){if(!failed&&cur)loading()});

/* sticky mini player */
var pw=$(".pwrap"),pl=$("#player"),dis=false;
function chk(){var s=!tvOn&&!dis&&!v.paused&&pw.getBoundingClientRect().bottom<60;pl.classList.toggle("sticky",s);document.body.classList.toggle("stk",s)}
window.addEventListener("scroll",chk,{passive:true});v.addEventListener("play",chk);v.addEventListener("pause",chk);
$("#x").onclick=function(){if(tvOn){tvPopSet(false);return}dis=true;v.pause();pl.classList.remove("sticky")};

/* player */
var IS_APP=/JashodalTV/.test(navigator.userAgent);
function url(c){if(c.srv&&c.srv.type==="iframe")return String((!IS_APP&&c.srv.webPlayUrl)||c.srv.playUrl||"").replace("{slug}",encodeURIComponent(c.slug));return c.url||String(S.streamPattern||"").replace("{slug}",c.slug)}
function dropFrame(){var f=$("#fr");if(f)f.remove();pl.classList.remove("ifm")}
function start(){var p=v.play();if(p&&p.then)p.then(hide).catch(function(){v.muted=true;var r=v.play();if(r&&r.catch)r.catch(hide)})}
function play(c){
  cur=c;c._alt=0;failed=false;tries=0;dis=false;store.set("jsn_last",c.slug);
  try{history.replaceState(null,"","#"+encodeURIComponent(c.slug))}catch(e){}
  $("#nowName").textContent=c.name;$("#nowCat").textContent=LABEL[c.cat]||c.cat;syncFav();mark();var pc=$("#pcap");if(pc)pc.innerHTML="<b>"+esc(c.name)+"</b><small>"+esc((c.srv?c.srv.name+" · ":"")+(LABEL[c.cat]||c.cat))+" · ▲ ▼ চ্যানেল বদল · OK ফুলস্ক্রিন · Back বন্ধ</small>";
  if(hls){hls.destroy();hls=null}
  v.removeAttribute("src");v.load();
  var u=url(c);dropFrame();
  if(c.srv&&c.srv.mode==="open"){return msg("<p><b>"+esc(c.srv.name)+"</b> এর চ্যানেল তাদের নিজস্ব প্লেয়ার পেজে খোলে।</p><button type=\"button\" data-open>▶ "+esc(c.name)+" চালান</button>")}
  if(c.srv&&c.srv.type==="iframe"){
    if(!u)return msg("<p><b>সার্ভারের playUrl সেট করা হয়নি।</b><br>assets/js/config.js এ দিন।</p>");
    if(location.protocol==="https:"&&/^http:/i.test(u))return fail("সাইট HTTPS-এ চলছে কিন্তু এই সার্ভার HTTP। ব্রাউজার ব্লক করে। সাইটও HTTP-তে চালান।");
    loading();
    if(c.srv.resolve!==false&&window.fetch){
      fetch(u).then(function(r){return r.text()}).then(function(t){
        if(cur!==c)return;
        var m=/(https?:\/\/[^"'\s<>\\]+?\/embed\.html\?[^"'\s<>\\]*)/i.exec(t.replace(/\\\//g,"/"));
        if(!m){frame(c,u);return}
        var emb=m[1].replace(/&amp;/g,"&");       // চ্যানেলের নিজস্ব প্লেয়ার পেজ (ইতিমধ্যে টোকেনসহ), সরাসরি এটাই iframe-এ বসালে ব্রাউজারেও চলে
        var hu=emb.replace("embed.html","index.m3u8");
        if(!IS_APP&&c.srv.webStream){var ws=c.srv.webStream;if(typeof ws[0]==="string")ws=[ws];ws.forEach(function(p){hu=hu.replace(p[0],p[1])})}
        var reset=function(){if(hls){hls.destroy();hls=null}v.removeAttribute("src");v.load()};
        hlsStart(hu,function(){
          if(cur!==c)return;reset();
          var alt=hu.replace("index.m3u8","mono.m3u8");
          if(alt!==hu&&!c._alt){c._alt=1;tries=0;hlsStart(alt,function(){if(cur!==c)return;reset();frame(c,emb)});return}
          frame(c,emb)});
      }).catch(function(){frame(c,u)});
    }else frame(c,u);
    return}
  if(!c.url&&/YOUR-SERVER|^$/.test(u)){return msg("<p><b>স্ট্রিম সার্ভার সেট করা হয়নি।</b><br>assets/js/config.js ফাইলে streamPattern এ আপনার সার্ভারের ঠিকানা দিন।</p>")}
  if(location.protocol==="https:"&&/^http:/i.test(u)){return fail("সাইট HTTPS-এ চলছে কিন্তু স্ট্রিম HTTP। ব্রাউজার এটি ব্লক করে। সাইট ও স্ট্রিম একই ধরনের (দুটোই HTTP বা দুটোই HTTPS) রাখুন।")}
  loading();hlsStart(u);
}
function openChannel(c){store.set("jsn_last",c.slug);var u=url(c);if(!u)return;if(IS_APP&&window.JashodalApp&&JashodalApp.openPlayer){JashodalApp.openPlayer(u);return}if(IS_APP)location.href=u;else window.open(u,"_blank")}
function frame(c,u){if(cur!==c)return;dropFrame();pl.classList.add("ifm");var fr=document.createElement("iframe");fr.id="fr";fr.setAttribute("allow","autoplay; fullscreen; encrypted-media");fr.setAttribute("allowfullscreen","");fr.tabIndex=-1;fr.onload=function(){hide()};fr.src=u;pl.insertBefore(fr,ov)}
function hlsStart(u,onFail){
  var bad=onFail||function(t){fail(t)};
  if(window.Hls&&Hls.isSupported()){
    hls=new Hls({maxBufferLength:30,liveSyncDurationCount:3});
    hls.on(Hls.Events.MANIFEST_PARSED,start);
    hls.on(Hls.Events.ERROR,function(e,d){
      if(!d.fatal)return;
      if(d.type===Hls.ErrorTypes.NETWORK_ERROR&&tries++<3){setTimeout(function(){if(hls)hls.startLoad()},1500)}
      else if(d.type===Hls.ErrorTypes.MEDIA_ERROR&&tries++<3){hls.recoverMediaError()}
      else bad();
    });
    hls.loadSource(u);hls.attachMedia(v);
  }else if(v.canPlayType("application/vnd.apple.mpegurl")){
    v.src=u;v.addEventListener("loadedmetadata",start,{once:true});v.addEventListener("error",function(){bad()},{once:true});
  }else bad("প্লেয়ার লাইব্রেরি (hls.js) লোড হয়নি। assets/vendor/hls.min.js ফাইলটি রাখুন অথবা ইন্টারনেট চালু করে পেজ রিফ্রেশ করুন।");
}

/* favourites */
function syncFav(){$("#fav").classList.toggle("y",!!cur&&favs.indexOf(cur.slug)>-1)}
function toggleFav(s){var i=favs.indexOf(s);if(i>-1)favs.splice(i,1);else favs.push(s);store.set("jsn_fav",favs);syncFav();grid()}
$("#fav").onclick=function(){if(cur)toggleFav(cur.slug)};

/* pip */
if(document.pictureInPictureEnabled){var pb=$("#pip");pb.hidden=false;pb.onclick=function(){(document.pictureInPictureElement?document.exitPictureInPicture():v.requestPictureInPicture()).catch(function(){})}}

/* render */
function tabs(){var ks=["all","fav"];list.forEach(function(c){if(ks.indexOf(c.cat)<0)ks.push(c.cat)});$("#tabs").innerHTML=ks.map(function(k){return'<button class="tab'+(k===cat?" on":"")+'" type="button" data-k="'+esc(k)+'">'+esc(LABEL[k]||k)+"</button>"}).join("")}
function servers(){var b=$("#servers");if(!b)return;b.hidden=SERVERS.length<2;b.innerHTML=SERVERS.map(function(s){return'<button class="srv'+(s===srv?" on":"")+'" type="button" data-id="'+esc(s.id)+'">'+esc(s.name)+"</button>"}).join("")}
$("#servers").addEventListener("click",function(e){var b=e.target.closest(".srv");if(!b)return;var id=b.getAttribute("data-id");store.set("jsn_server",id);load(id);cat="all";q="";$("#q").value="";[].forEach.call(document.querySelectorAll(".srv"),function(x){x.classList.toggle("on",x===b)});tabs();grid()});
function grid(){
  var t=q.trim().toLowerCase();
  var r=list.filter(function(c){return(cat==="all"||(cat==="fav"?favs.indexOf(c.slug)>-1:c.cat===cat))&&c.name.toLowerCase().indexOf(t)>-1});
  shown=r;var tt=$("#tvtitle");if(tt)tt.textContent=(LABEL[cat]||cat)+" Channels";$("#count").textContent=r.length+" টি চ্যানেল";
  $("#grid").innerHTML=r.length?r.map(function(c){return'<div class="ch'+(cur&&cur.slug===c.slug?" on":"")+'" role="button" tabindex="0" data-s="'+esc(c.slug)+'"><button class="heart'+(favs.indexOf(c.slug)>-1?" y":"")+'" type="button" aria-label="প্রিয় তালিকা" data-f="'+esc(c.slug)+'">♥</button><div class="lg">'+(c.logo?'<img src="'+esc(c.logo)+'" alt="'+esc(ini(c.name))+'" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.textContent=this.alt">':esc(ini(c.name)))+"</div><span>"+esc(c.name)+"</span></div>"}).join(""):'<p class="empty">'+(cat==="fav"?"প্রিয় তালিকা খালি। কার্ডের ♥ চাপুন।":"কোনো চ্যানেল পাওয়া যায়নি।")+"</p>";
}
function mark(){[].forEach.call(document.querySelectorAll(".ch"),function(e){e.classList.toggle("on",!!cur&&e.getAttribute("data-s")===cur.slug)})}
function pick(el){var s=el.getAttribute("data-s"),c=list.filter(function(x){return x.slug===s})[0];if(c&&c.srv&&c.srv.mode==="open"){openChannel(c);return}if(c){if(tvOn){play(c);tvPopSet(true)}else{play(c);$(".pwrap").scrollIntoView({behavior:"smooth",block:"start"})}}}
$("#grid").addEventListener("click",function(e){var f=e.target.closest("[data-f]");if(f){toggleFav(f.getAttribute("data-f"));return}var c=e.target.closest(".ch");if(c)pick(c)});
$("#grid").addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")&&e.target.classList.contains("ch")){e.preventDefault();pick(e.target)}});
$("#tabs").addEventListener("click",function(e){var b=e.target.closest(".tab");if(b){cat=b.getAttribute("data-k");tabs();grid()}});
$("#q").addEventListener("input",function(e){q=e.target.value;grid()});

/* TV mode: Roarzone-style app (sidebar + channel grid + popup player), remote control */
var tvOn=false,tvPop=false,tvFs=false,tvT=0,info=$("#tvinfo"),FOC="#tvx,.tab,.srv,.sbox,.ch",shown=[];
function qa(s){return[].slice.call(document.querySelectorAll(s))}
function showInfo(){if(!cur)return;info.innerHTML="<b>"+(list.indexOf(cur)+1)+"</b>"+esc(cur.name)+"<small>↑ ↓ চ্যানেল বদল &nbsp; OK বা Back চাপলে কার্ডে ফিরুন</small>";info.classList.add("on");clearTimeout(tvT);tvT=setTimeout(function(){info.classList.remove("on")},3500)}
function focusCur(){var e=document.querySelector(".ch.on")||document.querySelector(".ch")||document.querySelector(".tab");if(e)e.focus()}
function stopPlay(){failed=true;dropFrame();if(hls){hls.destroy();hls=null}v.pause();v.removeAttribute("src");v.load();hide()}
function tvPopSet(on){tvPop=on;tvFs=false;var b=document.body;b.classList.toggle("tvp",on);b.classList.remove("tvfs");info.classList.remove("on");
  if(on){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}else{stopPlay();setTimeout(focusCur,60)}}
function tvFsSet(on){tvFs=on;document.body.classList.toggle("tvfs",on);if(on)showInfo();else info.classList.remove("on")}
function tvSet(on){
  tvOn=on;tvPop=false;tvFs=false;var b=document.body,sb=$(".sbox");b.classList.remove("tvp","tvfs");b.classList.toggle("tv",on);v.controls=!on;
  if(on){stopPlay();sb.setAttribute("tabindex","0");cat="all";q="";$("#q").value="";tabs();grid();setTimeout(focusCur,80);
    if(!/JashodalTV/.test(navigator.userAgent))try{var r=document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();if(r&&r.catch)r.catch(function(){})}catch(e){}}
  else{sb.removeAttribute("tabindex");try{var x=document.fullscreenElement&&document.exitFullscreen();if(x&&x.catch)x.catch(function(){})}catch(e){}if(cur)play(cur)}
  try{if(window.JashodalApp&&JashodalApp.setTvMode)JashodalApp.setTvMode(!!on)}catch(e){}
  chk();
}
function kc(e){var k=e.keyCode,n=e.key;
  if(k===38)return"up";if(k===40)return"down";if(k===37)return"left";if(k===39)return"right";
  if(k===13||n==="Enter")return"ok";
  if(k===27||k===8||k===10009||k===461||n==="GoBack"||n==="BrowserBack"||n==="XF86Back")return"back";
  if(k===33||k===427||n==="ChannelUp")return"chup";if(k===34||k===428||n==="ChannelDown")return"chdn";
  if(k===179||k===415||k===19||n==="MediaPlayPause")return"pp";
  if(k===36||n==="ContextMenu"||n==="Menu")return"menu";return""}
function step(d){var L=shown.length?shown:list;if(!L.length)return;var i=L.indexOf(cur);if(i<0)i=0;play(L[(i+d+L.length)%L.length]);if(tvFs)showInfo()}
function spatial(a,d){
  var r=a.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,g=$("#grid").getBoundingClientRect(),best=null,bs=1e9;
  qa(FOC).forEach(function(b){
    if(b===a)return;var q=b.getBoundingClientRect();if(!q.width||!q.height)return;
    if(b.classList.contains("ch")&&(q.bottom<g.top+4||q.top>g.bottom-4))return;
    var dx=q.left+q.width/2-cx,dy=q.top+q.height/2-cy,p,o;
    if(d==="up"){if(dy>=-4)return;p=-dy;o=Math.abs(dx)}
    else if(d==="down"){if(dy<=4)return;p=dy;o=Math.abs(dx)}
    else if(d==="left"){if(dx>=-4)return;p=-dx;o=Math.abs(dy)}
    else{if(dx<=4)return;p=dx;o=Math.abs(dy)}
    var s=p+o*3;if(s<bs){bs=s;best=b}});
  return best}
document.addEventListener("keydown",function(e){
  if(!tvOn)return;
  var a=document.activeElement,ek=e.keyCode;
  if(a&&a.id==="q"){
    if(ek===27||ek===13||ek===38||ek===40||ek===10009||ek===461){e.preventDefault();e.stopPropagation();a.blur();var sb=$(".sbox");sb.focus();if(ek===40||ek===38){var n0=spatial(sb,ek===40?"down":"up");if(n0)n0.focus()}}
    return}
  var k=kc(e);if(!k)return;
  e.preventDefault();e.stopPropagation();
  if(k==="pp"){if(tvPop){if(v.paused)start();else v.pause()}return}
  if(tvFs){if(k==="up"||k==="chup")step(1);else if(k==="down"||k==="chdn")step(-1);else tvFsSet(false);return}
  if(tvPop){if(k==="up"||k==="chup")step(1);else if(k==="down"||k==="chdn")step(-1);else if(k==="ok")tvFsSet(true);else if(k==="back"||k==="menu")tvPopSet(false);return}
  if(!a||qa(FOC).indexOf(a)<0){focusCur();return}
  if(k==="ok"){
    if(a.classList.contains("ch"))pick(a);
    else if(a.classList.contains("sbox"))$("#q").focus();
    else{var kk=a.getAttribute("data-k");a.click();if(kk!==null){var t=qa(".tab").filter(function(x){return x.getAttribute("data-k")===kk})[0];if(t)t.focus()}}
    return}
  if(k==="back"||k==="menu")return;
  var n=spatial(a,k==="chup"?"up":k==="chdn"?"down":k);if(n)n.focus();
},true);
v.addEventListener("click",function(){if(tvOn&&tvPop)tvFsSet(!tvFs)});
pw.addEventListener("click",function(e){if(tvOn&&tvPop&&!tvFs&&e.target===pw)tvPopSet(false)});
$("#tvbtn").onclick=function(){tvSet(true)};
$("#tvx").onclick=function(){tvSet(false)};
window.tvBack=function(){if(!tvOn)return false;if(tvFs){tvFsSet(false);return true}if(tvPop){tvPopSet(false);return true}return false};

/* m3u playlist (optional) */
function m3uFetch(u){return fetch(u).then(function(r){return r.text()}).then(function(t){var out=[],m=null;t.split(/\r?\n/).forEach(function(l){l=l.trim();
  if(l.indexOf("#EXTINF")===0){m={name:l.split(",").slice(1).join(",").trim()||"Channel",logo:(/tvg-logo="([^"]*)"/.exec(l)||[])[1],cat:((/group-title="([^"]*)"/.exec(l)||[])[1]||"other").toLowerCase()}}
  else if(l&&l.charAt(0)!=="#"&&m){m.url=l;m.slug=(m.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"ch")+"-"+out.length;out.push(m);m=null}});return out})}

function init(){
  $("#apps").innerHTML=[["মোবাইল অ্যাপ",S.mobileApp],["টিভি অ্যাপ",S.tvApp]].filter(function(a){return a[1]}).map(function(a){return'<a class="btn" href="'+esc(a[1])+'">'+a[0]+"</a>"}).join("");
  var go=function(){
    load(store.get("jsn_server",S.defaultServer||SERVERS[0].id));servers();tabs();grid();
    var h="";try{h=decodeURIComponent(location.hash.slice(1))}catch(e){}
    var by=function(s){return list.filter(function(c){return c.slug===s})[0]};
    var f=by(h)||by(store.get("jsn_last",""))||list[0];
    if(f)play(f);else $("#nowName").textContent="কোনো চ্যানেল নেই";
    if(/[?&]tv=1/.test(location.search)||/SmartTV|Tizen|Web0S|WebOS|HbbTV|BRAVIA|Android TV|AFTT|AFTM|AFTS|CrKey/i.test(navigator.userAgent))tvSet(true);
  };
  var jobs=SERVERS.filter(function(s){return s.playlistUrl}).map(function(s){return m3uFetch(s.playlistUrl).then(function(p){if(p.length)m3u[s.id]=p}).catch(function(){})});
  if(jobs.length)Promise.all(jobs).then(go);else go();
}
window.addEventListener("load",init);
})();
