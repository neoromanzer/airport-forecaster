import { useState, useEffect, useCallback, useRef } from "react";

// ── VELORA DESIGN TOKENS ──────────────────────────────────────────────────────
var C = {
  bg:      "#0C1A78",
  surface: "#1530A0",
  raised:  "#1B3DC8",
  hover:   "#2248D8",
  border:  "rgba(255,255,255,0.14)",
  borderS: "rgba(255,255,255,0.08)",
  textHi:  "#FFFFFF",
  textMid: "#B8D0F8",
  textLo:  "#7090C0",
  teal:    "#17C8C8",
  tealDim: "rgba(23,200,200,0.15)",
  green:   "#2ECC8A",
  amber:   "#F0A030",
  red:     "#EE4444",
};

function rc(r){ return r==="high"?C.red:r==="medium"?C.amber:C.green; }

const AIRPORTS = {
  AUH:{icao:"OMAA",name:"Abu Dhabi International",city:"Abu Dhabi",lat:24.433,lon:54.651},
  DXB:{icao:"OMDB",name:"Dubai International",city:"Dubai",lat:25.253,lon:55.364},
  DOH:{icao:"OTHH",name:"Hamad International",city:"Doha",lat:25.273,lon:51.608},
  LHR:{icao:"EGLL",name:"Heathrow",city:"London",lat:51.477,lon:-0.461},
  CDG:{icao:"LFPG",name:"Charles de Gaulle",city:"Paris",lat:49.009,lon:2.548},
  FRA:{icao:"EDDF",name:"Frankfurt",city:"Frankfurt",lat:50.038,lon:8.562},
  JFK:{icao:"KJFK",name:"JFK International",city:"New York",lat:40.641,lon:-73.778},
  LAX:{icao:"KLAX",name:"Los Angeles Intl",city:"Los Angeles",lat:33.943,lon:-118.408},
  SIN:{icao:"WSSS",name:"Changi",city:"Singapore",lat:1.359,lon:103.989},
  BOM:{icao:"VABB",name:"Chhatrapati Shivaji",city:"Mumbai",lat:19.089,lon:72.868},
  DEL:{icao:"VIDP",name:"Indira Gandhi Intl",city:"New Delhi",lat:28.556,lon:77.100},
  HKG:{icao:"VHHH",name:"Hong Kong Intl",city:"Hong Kong",lat:22.309,lon:113.915},
  NRT:{icao:"RJAA",name:"Narita Intl",city:"Tokyo",lat:35.765,lon:140.386},
  SYD:{icao:"YSSY",name:"Kingsford Smith",city:"Sydney",lat:-33.946,lon:151.177},
  JNB:{icao:"FAOR",name:"O.R. Tambo Intl",city:"Johannesburg",lat:-26.133,lon:28.242},
  CAI:{icao:"HECA",name:"Cairo International",city:"Cairo",lat:30.122,lon:31.406},
  IST:{icao:"LTFM",name:"Istanbul Airport",city:"Istanbul",lat:41.275,lon:28.752},
  AMS:{icao:"EHAM",name:"Schiphol",city:"Amsterdam",lat:52.309,lon:4.764},
  MAD:{icao:"LEMD",name:"Madrid Barajas",city:"Madrid",lat:40.472,lon:-3.561},
  FCO:{icao:"LIRF",name:"Fiumicino",city:"Rome",lat:41.800,lon:12.239},
  KWI:{icao:"OKBK",name:"Kuwait International",city:"Kuwait City",lat:29.226,lon:47.969},
  RUH:{icao:"OERK",name:"King Khalid Intl",city:"Riyadh",lat:24.958,lon:46.699},
  MCT:{icao:"OOMS",name:"Muscat International",city:"Muscat",lat:23.593,lon:58.284},
  CMB:{icao:"VCBI",name:"Bandaranaike Intl",city:"Colombo",lat:7.181,lon:79.884},
  KHI:{icao:"OPKC",name:"Jinnah International",city:"Karachi",lat:24.906,lon:67.161},
  NBO:{icao:"HKJK",name:"Jomo Kenyatta Intl",city:"Nairobi",lat:-1.319,lon:36.926},
  BCN:{icao:"LEBL",name:"El Prat",city:"Barcelona",lat:41.297,lon:2.078},
  MUC:{icao:"EDDM",name:"Munich Airport",city:"Munich",lat:48.354,lon:11.786},
  BKK:{icao:"VTBS",name:"Suvarnabhumi",city:"Bangkok",lat:13.681,lon:100.747},
  PEK:{icao:"ZBAA",name:"Beijing Capital",city:"Beijing",lat:40.080,lon:116.584},
  ICN:{icao:"RKSI",name:"Incheon International",city:"Seoul",lat:37.469,lon:126.451},
  CPT:{icao:"FACT",name:"Cape Town Intl",city:"Cape Town",lat:-33.965,lon:18.602},
  BAH:{icao:"OBBI",name:"Bahrain Intl",city:"Manama",lat:26.270,lon:50.634},
  JED:{icao:"OEJN",name:"King Abdulaziz Intl",city:"Jeddah",lat:21.680,lon:39.157},
  ADD:{icao:"HAAB",name:"Addis Ababa Bole",city:"Addis Ababa",lat:8.978,lon:38.799},
  ZRH:{icao:"LSZH",name:"Zurich Airport",city:"Zurich",lat:47.458,lon:8.548},
  GVA:{icao:"LSGG",name:"Geneva Airport",city:"Geneva",lat:46.238,lon:6.109},
  MXP:{icao:"LIMC",name:"Malpensa",city:"Milan",lat:45.630,lon:8.723},
  DPS:{icao:"WADD",name:"Ngurah Rai Intl",city:"Bali",lat:-8.748,lon:115.167},
  VIE:{icao:"LOWW",name:"Vienna International",city:"Vienna",lat:48.110,lon:16.570},
};

const AIRLINES = {
  ETD:{iata:"EY",name:"Etihad Airways"}, UAE:{iata:"EK",name:"Emirates"},
  QTR:{iata:"QR",name:"Qatar Airways"}, BAW:{iata:"BA",name:"British Airways"},
  DLH:{iata:"LH",name:"Lufthansa"}, THY:{iata:"TK",name:"Turkish Airlines"},
  AFR:{iata:"AF",name:"Air France"}, KLM:{iata:"KL",name:"KLM"},
  AAL:{iata:"AA",name:"American Airlines"}, UAL:{iata:"UA",name:"United Airlines"},
  SWR:{iata:"LX",name:"Swiss International"}, FDB:{iata:"FZ",name:"flydubai"},
  ABY:{iata:"G9",name:"Air Arabia"}, GFA:{iata:"GF",name:"Gulf Air"},
  OMA:{iata:"WY",name:"Oman Air"}, SVA:{iata:"SV",name:"Saudia"},
  AIC:{iata:"AI",name:"Air India"}, SIA:{iata:"SQ",name:"Singapore Airlines"},
  THA:{iata:"TG",name:"Thai Airways"}, CPA:{iata:"CX",name:"Cathay Pacific"},
  JAL:{iata:"JL",name:"Japan Airlines"}, QFA:{iata:"QF",name:"Qantas"},
  MSR:{iata:"MS",name:"EgyptAir"}, ETH:{iata:"ET",name:"Ethiopian Airlines"},
  KQA:{iata:"KQ",name:"Kenya Airways"}, MAS:{iata:"MH",name:"Malaysia Airlines"},
  DAL:{iata:"DL",name:"Delta Air Lines"}, VIR:{iata:"VS",name:"Virgin Atlantic"},
};

const WX = {0:"CLEAR",1:"MOSTLY CLR",2:"PARTLY CLD",3:"OVERCAST",45:"FOG",48:"RIME FOG",51:"LT DRIZZLE",61:"LT RAIN",63:"RAIN",65:"HVY RAIN",71:"LT SNOW",73:"SNOW",80:"SHOWERS",95:"THUNDERSTORM"};

const RF = {
  "CTOT REGULATION":{short:"ATFM slot restriction by Network Manager.",what:"A CTOT has been assigned by EUROCONTROL NM or GCAA, constraining departure to a specific window.",why:"En-route sector capacity exceeded. Ground holding is more efficient than airborne holding.",impact:"Must depart within CTOT +5/-5 min. Missing the slot adds 20-40 min.",ref:"EUROCONTROL NM ATFM Regulations, ICAO Doc 9971 Ch.3"},
  "WEATHER":{short:"Adverse met conditions affecting operations.",what:"Significant weather at origin, en-route or destination: thunderstorms, heavy rain, low cloud or high crosswinds.",why:"Aircraft may need holding fuel uplifts, alternates or de-icing, adding turnaround time.",impact:"15-60 min for tactical avoidance; up to 3h for embedded convection.",ref:"ICAO Annex 3, Ops Spec approval minima"},
  "LATE INBOUND":{short:"Inbound aircraft delayed -- reactionary chain.",what:"The aircraft on this rotation is delayed on its inbound sector.",why:"Most short/medium-haul delays are reactionary. One missed slot cascades forward.",impact:"Typically 60-80% of inbound delay propagates outbound after turnaround.",ref:"IATA CDM Guidebook v7, Reactionary Delay Taxonomy"},
  "CREW REST":{short:"FTL rest requirements not met.",what:"Crew cumulative duty hours or rest period cannot be legally met before departure.",why:"Flight Time Limitations mandate minimum rest. Operating in breach is a safety violation.",impact:"Delay until legal rest completes. Min 10h for long-haul. May require crew swap.",ref:"EASA ORO.FTL.235, UAE GCAA ANO-OPS-001"},
  "SLOT CONSTRAINT":{short:"Slot conflict at co-ordinated airport.",what:"The airport is Level 3 slot-co-ordinated and the requested movement falls outside the allocated window.",why:"Co-ordinated airports operate at declared capacity. All movements need IATA slot approval.",impact:"Departure held until valid slot. Peak periods can add 30-90 min.",ref:"IATA Worldwide Slot Guidelines 9th Ed., EC 793/2004"},
  "WIND SHEAR":{short:"Wind shear on approach or SID.",what:"Rapid change in wind speed/direction on final approach, missed approach or departure path.",why:"Forces wider runway separation and increases go-around probability.",impact:"Runway throughput falls 20-35%. Queue delays of 10-25 min build quickly.",ref:"ICAO Doc 9817 Wind Shear Manual"},
  "LOW VISIBILITY":{short:"LVP active -- CAT II/III ops in force.",what:"Visibility below 550m RVR or ceiling below 200ft. Low Visibility Procedures activated.",why:"ILS critical areas must be protected, requiring greater separation on final.",impact:"Capacity reduced 30-50%. Typically 25-35 movements/hr vs 45-55 in VMC.",ref:"ICAO Doc 9365, EASA CS-AWO"},
  "HIGH LOAD":{short:"High pax load -- late boarding close.",what:"Load factor exceeds 95%. Check-in, baggage and boarding are under pressure.",why:"High-density flights take longer to board and require more load planning time.",impact:"Boarding close delays 8-15 min, rippling into taxi queue.",ref:"IATA AHM 810 Ground Operations"},
  "ATC RESTRICTION":{short:"En-route or terminal flow restriction.",what:"ATC issued a miles-in-trail or flow restriction on the departure route.",why:"Sector overload or adjacent airport traffic requires spacing management.",impact:"Ground delay absorbs restriction. Typical hold: 10-30 min.",ref:"ICAO Doc 4444 PANS-ATM Ch.3"},
  "GATE CONFLICT":{short:"Stand occupied -- outbound blocked.",what:"Inbound has not vacated the assigned stand, or ground equipment is blocking access.",why:"Peak hour congestion at hubs frequently causes stand conflicts.",impact:"Remote parking adds 15-20 min, or aircraft held on apron.",ref:"IATA AHM 730 Apron Management"},
};

const GLOSSARY = [
  {term:"EOBT",def:"Estimated Off-Block Time -- initial airline estimate of push-back from stand."},
  {term:"TOBT",def:"Target Off-Block Time -- agreed push-back time confirmed by airline, handler and CDM system."},
  {term:"TSAT",def:"Target Start-Up Approval Time -- ATC engine-start approval. Derived as TOBT minus taxi-out time."},
  {term:"CTOT",def:"Calculated Take-Off Time -- ATFM slot by Network Manager when flow control is active."},
  {term:"TTOT",def:"Target Take-Off Time -- expected wheels-up. Computed as TOBT plus taxi-out duration."},
  {term:"STA", def:"Scheduled Time of Arrival -- published OAG/SSIM schedule time."},
  {term:"ETA", def:"Estimated Time of Arrival -- updated from flight progress, winds and routing."},
  {term:"ELDT",def:"Estimated Landing Time -- predicted touchdown at threshold (ETA minus 2 min)."},
  {term:"EGTT",def:"Estimated Gate Time -- predicted in-blocks at stand. ELDT plus airport taxi-in time."},
];

const CDM_SRC = [
  {m:"TSAT",f:"TOBT - Taxi-Out",      src:"ICAO Doc 9971 S3.4 / EUROCONTROL A-CDM Manual v5"},
  {m:"TTOT",f:"TOBT + Taxi-Out",      src:"EUROCONTROL A-CDM Manual v5, Figure 3-2"},
  {m:"CTOT",f:"TTOT + ATFM Offset",   src:"EUROCONTROL NM ATFM Regulations / CFMU slot allocation"},
  {m:"ELDT",f:"ETA - 2 min",          src:"ICAO Doc 4444 PANS-ATM S8.9.3"},
  {m:"EGTT",f:"ELDT + Taxi-In",       src:"Airport ATMAP/AODB ground movement data (default 10 min)"},
  {m:"ETA", f:"STA + AI delay offset",src:"AI inference from OpenSky ADS-B + Open-Meteo weather"},
];

function utcHHMM(m){var t=new Date(Date.now()+m*60000);return String(t.getUTCHours()).padStart(2,"0")+String(t.getUTCMinutes()).padStart(2,"0");}
function parseCS(cs){if(!cs)return{flight:"------",airline:"---"};var pfx=cs.slice(0,3).toUpperCase(),al=AIRLINES[pfx];return al?{flight:al.iata+cs.slice(3),airline:al.name}:{flight:cs,airline:pfx};}
function depTimes(f){var eobt=f.eobt_offset||0,taxi=f.taxi_minutes||18,tobt=eobt+(f.tobt_delta||0),tsat=tobt-taxi,ttot=tobt+taxi,ctot=f.ctot_regulated?ttot+(f.ctot_delta||0):null;return{EOBT:utcHHMM(eobt),TOBT:utcHHMM(tobt),TSAT:utcHHMM(tsat),CTOT:ctot!=null?utcHHMM(ctot):"----",TTOT:utcHHMM(ttot)};}
function arrTimes(f){var sta=f.sta_offset||0,txi=f.taxi_in_minutes||10,eta=sta+(f.eta_delta||0);return{STA:utcHHMM(sta),ETA:utcHHMM(eta),ELDT:utcHHMM(eta-2),EGTT:utcHHMM(eta-2+txi)};}
function gcPoints(lat1,lon1,lat2,lon2,n){var R=Math.PI/180,la1=lat1*R,lo1=lon1*R,la2=lat2*R,lo2=lon2*R,d=2*Math.asin(Math.sqrt(Math.pow(Math.sin((la2-la1)/2),2)+Math.cos(la1)*Math.cos(la2)*Math.pow(Math.sin((lo2-lo1)/2),2)));if(d<0.001)return[[lat1,lon1],[lat2,lon2]];var pts=[];for(var i=0;i<=n;i++){var fr=i/n,A=Math.sin((1-fr)*d)/Math.sin(d),B=Math.sin(fr*d)/Math.sin(d),x=A*Math.cos(la1)*Math.cos(lo1)+B*Math.cos(la2)*Math.cos(lo2),y=A*Math.cos(la1)*Math.sin(lo1)+B*Math.cos(la2)*Math.sin(lo2),z=A*Math.sin(la1)+B*Math.sin(la2);pts.push([Math.atan2(z,Math.sqrt(x*x+y*y))/R,Math.atan2(y,x)/R]);}return pts;}

function RFTooltip(props){
  var d=RF[props.factor]; if(!d) return null;
  return(
    <div style={{position:"fixed",left:Math.min(props.x,window.innerWidth-360),top:Math.max(props.y-10,8),zIndex:9999,background:C.surface,border:"1px solid "+C.teal,width:340,padding:"12px 14px",pointerEvents:"none",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
      <div style={{color:C.teal,fontSize:"11px",fontWeight:700,letterSpacing:"0.12em",marginBottom:6,paddingBottom:6,borderBottom:"1px solid "+C.border}}>{props.factor}</div>
      <div style={{color:C.textHi,fontSize:"12px",marginBottom:8,lineHeight:1.5}}>{d.short}</div>
      {[["WHAT",d.what],["WHY IT CAUSES DELAY",d.why]].map(function(row,i){return(
        <div key={i} style={{marginBottom:6}}>
          <div style={{color:C.textLo,fontSize:"9px",letterSpacing:"0.1em",fontWeight:700,marginBottom:2}}>{row[0]}</div>
          <div style={{color:C.textMid,fontSize:"11px",lineHeight:1.5}}>{row[1]}</div>
        </div>
      );})}
      <div style={{marginBottom:6}}>
        <div style={{color:C.amber,fontSize:"9px",letterSpacing:"0.1em",fontWeight:700,marginBottom:2}}>OPERATIONAL IMPACT</div>
        <div style={{color:C.textMid,fontSize:"11px",lineHeight:1.5}}>{d.impact}</div>
      </div>
      <div style={{borderTop:"1px solid "+C.border,paddingTop:6}}>
        <div style={{color:C.textLo,fontSize:"9px"}}>{d.ref}</div>
      </div>
    </div>
  );
}

function MapPanel(props){
  var containerRef=useRef(null),mapRef=useRef(null),routeRef=useRef([]),planeRef=useRef([]);
  var [ready,setReady]=useState(false);

  useEffect(function(){
    function build(){
      if(!containerRef.current||mapRef.current) return;
      var L=window.L;
      var map=L.map(containerRef.current,{zoomControl:true,attributionControl:true,minZoom:2,maxZoom:9});
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{attribution:"&copy; OpenStreetMap &copy; CARTO",maxZoom:9}).addTo(map);
      mapRef.current=map; setReady(true);
    }
    if(window.L){build();}
    else{
      var lk=document.createElement("link");lk.rel="stylesheet";lk.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(lk);
      var sc=document.createElement("script");sc.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";sc.onload=build;document.head.appendChild(sc);
    }
    return function(){if(mapRef.current){mapRef.current.remove();mapRef.current=null;}};
  },[]);

  useEffect(function(){
    var map=mapRef.current,L=window.L;
    if(!map||!L||!props.ap) return;
    routeRef.current.forEach(function(l){try{map.removeLayer(l);}catch(e){}});
    routeRef.current=[];
    var ap=props.ap,routes=props.routes,isDep=props.isDep,allPts=[[ap.lat,ap.lon]];
    routes.forEach(function(item){allPts.push([item.ap.lat,item.ap.lon]);});
    routes.forEach(function(item){
      var pts=gcPoints(ap.lat,ap.lon,item.ap.lat,item.ap.lon,60);
      var col=isDep?rc(item.f.risk_level):"#1A5DC8";
      var line=L.polyline(pts,{color:col,weight:2.5,opacity:0.9,dashArray:isDep?null:"6,4"}).addTo(map);
      routeRef.current.push(line);
      var fl=parseCS(item.f.callsign).flight;
      var lbl=isDep?(fl+" > "+item.f.destination_name):(fl+" < "+item.f.origin_name);
      var circ=L.circleMarker([item.ap.lat,item.ap.lon],{radius:7,fillColor:col,color:"#fff",weight:2,fillOpacity:1}).bindTooltip(lbl,{className:"vl-tip",direction:"top"}).addTo(map);
      routeRef.current.push(circ);
    });
    var hub=L.circleMarker([ap.lat,ap.lon],{radius:12,fillColor:C.raised,color:C.teal,weight:3,fillOpacity:1}).bindTooltip(props.selAP+" - "+ap.name,{className:"vl-tip",direction:"top"}).addTo(map);
    routeRef.current.push(hub);
    if(allPts.length>1){map.fitBounds(L.latLngBounds(allPts).pad(0.28));}
    else{map.setView([ap.lat,ap.lon],5);}
    setTimeout(function(){if(map)map.invalidateSize();},100);
  },[ready,props.routes,props.ap,props.isDep,props.selAP]);

  useEffect(function(){
    var map=mapRef.current,L=window.L;
    if(!map||!L||!props.ap||!ready) return;
    function clearP(){planeRef.current.forEach(function(m){try{map.removeLayer(m);}catch(e){}});planeRef.current=[];}
    function fetchP(){
      if(!mapRef.current) return;
      var b=map.getBounds();
      fetch("https://opensky-network.org/api/states/all?lamin="+b.getSouth().toFixed(2)+"&lomin="+b.getWest().toFixed(2)+"&lamax="+b.getNorth().toFixed(2)+"&lomax="+b.getEast().toFixed(2))
        .then(function(r){return r.ok?r.json():null;}).then(function(d){
          if(!d||!d.states||!mapRef.current) return;
          clearP();
          d.states.forEach(function(s){
            var lon=s[5],lat=s[6],hdg=s[10]||0,onG=s[8],cs=(s[1]||"").trim();
            if(!lat||!lon||onG) return;
            var svg='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="-7 -7 14 14"><g transform="rotate('+hdg+')"><polygon points="0,-6 2,2 0,1 -2,2" fill="#5AB0FF" opacity="0.9"/><rect x="-3.5" y="0" width="7" height="1" rx="0.5" fill="#5AB0FF" opacity="0.6"/></g></svg>';
            var m=L.marker([lat,lon],{icon:L.divIcon({html:svg,className:"",iconSize:[14,14],iconAnchor:[7,7]})}).bindTooltip(cs||"------",{className:"vl-tip",direction:"top"}).addTo(map);
            planeRef.current.push(m);
          });
        }).catch(function(){});
    }
    var t1=setTimeout(fetchP,1200),iv=setInterval(fetchP,30000);
    return function(){clearTimeout(t1);clearInterval(iv);clearP();};
  },[ready,props.ap]);

  return(
    <div style={{border:"1px solid "+C.border,borderLeft:"none",borderRight:"none"}}>
      <div style={{padding:"7px 20px",background:C.surface,borderBottom:"1px solid "+C.border,display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:3,height:16,background:C.teal,flexShrink:0,borderRadius:2}}/>
        <span style={{color:C.textHi,fontSize:"11px",fontWeight:700,letterSpacing:"0.14em"}}>{props.isDep?"DEPARTURES":"ARRIVALS"} -- ROUTE MAP</span>
        <span style={{background:C.tealDim,color:C.teal,fontSize:"9px",fontWeight:700,padding:"1px 7px",marginLeft:2}}>{props.routes.length} ROUTES</span>
        <div style={{marginLeft:"auto",display:"flex",gap:12,alignItems:"center"}}>
          {[["LOW",C.green],["MED",C.amber],["HIGH",C.red]].map(function(item,i){return(
            <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:28,height:3,background:item[1],borderRadius:2,opacity:0.9}}/>
              <span style={{color:C.textMid,fontSize:"9px",fontWeight:700}}>{item[0]}</span>
            </div>
          );})}
          <div style={{display:"flex",alignItems:"center",gap:5,marginLeft:6}}>
            <div style={{width:28,height:3,background:"#1A5DC8",borderRadius:2,opacity:0.9,borderTop:"1px dashed #1A5DC8"}}/>
            <span style={{color:C.textMid,fontSize:"9px",fontWeight:700}}>INBOUND</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,marginLeft:6}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:C.raised,border:"2px solid "+C.teal}}/>
            <span style={{color:C.textMid,fontSize:"9px",fontWeight:700}}>HUB</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,marginLeft:6}}>
            <svg width="12" height="10" viewBox="-6 -6 12 12"><polygon points="0,-5 1.5,1 0,0.5 -1.5,1" fill="#5AB0FF"/></svg>
            <span style={{color:C.textMid,fontSize:"9px",fontWeight:700}}>LIVE</span>
          </div>
        </div>
      </div>
      <div ref={containerRef} style={{width:"100%",height:420,background:"#E8EEF8"}}/>
    </div>
  );
}

export default function VeloraApp(){
  var [selAP,setSelAP]=useState("AUH");
  var [search,setSearch]=useState("Abu Dhabi (AUH)");
  var [ddItems,setDdItems]=useState([]);
  var [showDD,setShowDD]=useState(false);
  var [phase,setPhase]=useState("idle");
  var [steps,setSteps]=useState([0,0,0]);
  var [weather,setWeather]=useState(null);
  var [flights,setFlights]=useState(null);
  var [tab,setTab]=useState("dep");
  var [clock,setClock]=useState("--:--:--");
  var [rfTip,setRfTip]=useState(null);

  useEffect(function(){
    function tick(){var n=new Date();setClock(String(n.getUTCHours()).padStart(2,"0")+":"+String(n.getUTCMinutes()).padStart(2,"0")+":"+String(n.getUTCSeconds()).padStart(2,"0"));}
    tick(); var id=setInterval(tick,1000); return function(){clearInterval(id);};
  },[]);

  function setStep(i,s){setSteps(function(p){var n=p.slice();n[i]=s;return n;});}

  var run=useCallback(function(iata){
    var ap=AIRPORTS[iata]; if(!ap) return;
    setPhase("running"); setSteps([1,0,0]); setFlights(null); setWeather(null);
    var now=Math.floor(Date.now()/1000),begin=now-7200;
    var safeJson=function(res){return res.ok?res.json().catch(function(){return[];}):Promise.resolve([]);};
    Promise.allSettled([
      fetch("https://opensky-network.org/api/flights/departure?airport="+ap.icao+"&begin="+begin+"&end="+now),
      fetch("https://opensky-network.org/api/flights/arrival?airport="+ap.icao+"&begin="+begin+"&end="+now)
    ]).then(function(r){
      var pD=r[0].status==="fulfilled"?safeJson(r[0].value):Promise.resolve([]);
      var pA=r[1].status==="fulfilled"?safeJson(r[1].value):Promise.resolve([]);
      return Promise.all([pD,pA]);
    }).catch(function(){return[[],[]];}).then(function(pair){
      var adsb=(Array.isArray(pair[0])&&pair[0].length>0)?{deps:pair[0].slice(0,10),arrs:(Array.isArray(pair[1])?pair[1]:[]).slice(0,10)}:null;
      setStep(0,2); setStep(1,1);
      return fetch("https://api.open-meteo.com/v1/forecast?latitude="+ap.lat+"&longitude="+ap.lon+"&current=temperature_2m,wind_speed_10m,weather_code,visibility")
        .then(function(wr){return wr.ok?wr.json():Promise.resolve(null);}).catch(function(){return null;})
        .then(function(wj){
          var wx=wj?wj.current:null; setWeather(wx); setStep(1,2); setStep(2,1);
          var wxStr=wx?(wx.temperature_2m+"C wind "+wx.wind_speed_10m+"kmh code "+wx.weather_code+" vis "+wx.visibility+"m"):"unavailable";
          var adsbStr=adsb?JSON.stringify(adsb).slice(0,1500):"UNAVAILABLE - generate realistic flights";
          var prompt="Airport: "+ap.name+" ("+iata+"/"+ap.icao+"), "+ap.city+"\nUTC: "+new Date().toUTCString()+"\nWeather: "+wxStr+"\nADS-B: "+adsbStr
            +"\n\nReturn JSON with keys deps and arrs, each an array of 8-12 objects."
            +"\nDep: callsign(ICAO), dest_icao, destination_name, delay_probability(0-100), risk_level(low/medium/high), risk_factors(array from: CTOT REGULATION,WEATHER,LATE INBOUND,CREW REST,SLOT CONSTRAINT,WIND SHEAR,LOW VISIBILITY,HIGH LOAD,ATC RESTRICTION,GATE CONFLICT), eobt_offset(-60 to 180), tobt_delta(-5 to 30), ctot_regulated(bool), ctot_delta(int), taxi_minutes(int), estimated_delay_minutes(int)."
            +"\nArr: callsign, orig_icao, origin_name, delay_probability, risk_level, risk_factors, sta_offset(-60 to 180), eta_delta(-10 to 45), taxi_in_minutes, estimated_delay_minutes."
            +"\nAirlines for "+ap.city+": ETD=EY Etihad, UAE=EK Emirates, QTR=QR Qatar, BAW=BA British, DLH=LH Lufthansa, THY=TK Turkish, GFA=GF Gulf Air, OMA=WY Oman, SVA=SV Saudia, AIC=AI India, SIA=SQ Singapore. 50pct low, 35pct medium, 15pct high risk.";
          return fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,system:"You are a flight delay prediction expert. Return ONLY valid JSON, no markdown, no code fences.",messages:[{role:"user",content:prompt}]})});
        });
    }).then(function(res){if(!res||!res.ok) throw new Error("err");return res.json();})
    .then(function(rd){var txt=(rd.content&&rd.content[0]&&rd.content[0].text)?rd.content[0].text:"";setFlights(JSON.parse(txt.replace(/```json/g,"").replace(/```/g,"").trim()));setStep(2,2);setPhase("done");})
    .catch(function(){setStep(2,3);setPhase("error");});
  },[]);

  useEffect(function(){run("AUH");},[]);

  function onSearch(v){
    setSearch(v); if(!v.trim()){setDdItems([]);setShowDD(false);return;}
    var q=v.toUpperCase();
    setDdItems(Object.entries(AIRPORTS).filter(function(e){return e[0].includes(q)||e[1].city.toUpperCase().includes(q)||e[1].name.toUpperCase().includes(q);}).slice(0,8).map(function(e){return Object.assign({iata:e[0]},e[1]);}));
    setShowDD(true);
  }
  function pick(iata){var ap=AIRPORTS[iata];setSelAP(iata);setSearch(ap?ap.city+" ("+iata+")":iata);setShowDD(false);run(iata);}
  function onRun(){if(ddItems[0])pick(ddItems[0].iata);else if(AIRPORTS[search.toUpperCase()])pick(search.toUpperCase());}

  function exportHTML(){
    var html='<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Velora Delay Predictor</title>'
      +'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>'
      +'<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"><\/script>'
      +'<script src="https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"><\/script>'
      +'<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"><\/script>'
      +'<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"><\/script>'
      +'<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js"><\/script>'
      +'<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0C1A78}</style>'
      +'</head><body><div id="root"></div>'
      +'<script type="text/babel" data-presets="react">// PASTE FULL SOURCE HERE<\/script>'
      +'</body></html>';
    var blob=new Blob([html],{type:"text/html"});
    var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="velora-delay-predictor.html";a.click();URL.revokeObjectURL(a.href);
  }

  var deps=(flights&&flights.deps?flights.deps:[]).map(function(f){return Object.assign({},f,{times:depTimes(f)});});
  var arrs=(flights&&flights.arrs?flights.arrs:[]).map(function(f){return Object.assign({},f,{times:arrTimes(f)});});
  var ap=AIRPORTS[selAP];
  var avgD=deps.length?Math.round(deps.reduce(function(s,f){return s+(f.delay_probability||0);},0)/deps.length):0;
  var avgA=arrs.length?Math.round(arrs.reduce(function(s,f){return s+(f.delay_probability||0);},0)/arrs.length):0;
  var wxDesc=(weather&&weather.weather_code!=null)?(WX[weather.weather_code]||"CODE "+weather.weather_code):"N/A";
  var apIcao=ap?ap.icao:"----",apName=ap?ap.name.toUpperCase():"---",apCity=ap?ap.city.toUpperCase():"";

  var stepCols=steps.map(function(s){return s===2?C.green:s===3?C.red:s===1?C.teal:"rgba(255,255,255,0.2)";});
  var stepLbls=steps.map(function(s){return s===2?"DONE":s===3?"ERR":s===1?"LIVE":"WAIT";});
  var stepDef=[{l:"ADS-B / OPENSKY",s:"DEP + ARR DATA"},{l:"METEO / OPEN-METEO",s:"SURFACE WEATHER"},{l:"AI ANALYSIS / CLAUDE",s:"DELAY PREDICTION"}];

  var metrics=[["AIRPORT",selAP],["ICAO",apIcao],["CITY",apCity],["DEPARTURES",String(deps.length)],["ARRIVALS",String(arrs.length)],["AVG DEP DELAY",deps.length?avgD+"%":"--"],["AVG ARR DELAY",arrs.length?avgA+"%":"--"],["CONDITIONS",wxDesc],["TEMP",weather&&weather.temperature_2m!=null?weather.temperature_2m+"C":"--"],["WIND",weather&&weather.wind_speed_10m!=null?Math.round(weather.wind_speed_10m)+" KMH":"--"],["VISIBILITY",weather&&weather.visibility!=null?Math.round(weather.visibility/1000)+" KM":"--"]];

  var depList=[],arrList=[];
  deps.forEach(function(f){var d=Object.values(AIRPORTS).find(function(a){return a.icao===f.dest_icao;});if(d)depList.push({ap:d,f:f});});
  arrs.forEach(function(f){var o=Object.values(AIRPORTS).find(function(a){return a.icao===f.orig_icao;});if(o)arrList.push({ap:o,f:f});});

  function TH(p){return <th style={{color:C.textLo,padding:"8px 10px",textAlign:"left",borderBottom:"1px solid "+C.border,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap",fontSize:"10px",background:C.surface}}>{p.c}</th>;}
  function TD(p){var b={padding:"8px 10px",borderBottom:"1px solid "+C.borderS,whiteSpace:"nowrap",verticalAlign:"middle",background:C.bg};return <td style={p.style?Object.assign({},b,p.style):b}>{p.children!==undefined?p.children:p.c}</td>;}

  function RiskTag(p){
    var lv=p.level||"low", col=rc(lv);
    return <span style={{display:"inline-block",padding:"2px 8px",fontSize:"9px",fontWeight:700,letterSpacing:"0.08em",color:col,background:"rgba(0,0,0,0.3)",border:"1px solid "+col}}>{lv.toUpperCase()}</span>;
  }
  function Bar(p){
    return(
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <div style={{width:56,height:5,background:"rgba(255,255,255,0.1)",borderRadius:3}}>
          <div style={{width:(p.pct||0)+"%",height:"100%",background:rc(p.level),borderRadius:3}}/>
        </div>
        <span style={{color:rc(p.level),fontSize:"11px",fontWeight:700,minWidth:30}}>{p.pct||0}%</span>
      </div>
    );
  }
  function Tags(p){
    return(
      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
        {(p.items||[]).map(function(t,i){
          var known=!!RF[t];
          return <span key={i}
            onMouseEnter={function(e){setRfTip({factor:t,x:e.clientX+12,y:e.clientY-8});}}
            onMouseLeave={function(){setRfTip(null);}}
            style={{fontSize:"9px",padding:"2px 7px",background:known?C.tealDim:"rgba(255,255,255,0.06)",border:"1px solid "+(known?C.teal:C.border),color:known?C.teal:C.textMid,cursor:"help"}}
          >{t}</span>;
        })}
      </div>
    );
  }

  var CSS="@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@700&display=swap');"
    +"@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}"
    +"@keyframes loadbar{0%{width:0%}60%{width:78%}100%{width:96%}}"
    +".frow:hover td{background:"+C.hover+"!important}"
    +"::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:"+C.bg+"}::-webkit-scrollbar-thumb{background:"+C.teal+"}"
    +".vl-tip{background:#1B3DC8!important;border:1px solid "+C.teal+"!important;color:#fff!important;font-size:11px!important;font-weight:700!important;padding:4px 10px!important;border-radius:2px!important;box-shadow:0 4px 16px rgba(0,0,0,0.4)!important}"
    +".vl-tip::before{display:none!important}"
    +".leaflet-attribution-flag{display:none!important}"
    +".leaflet-control-attribution{background:rgba(0,0,30,0.8)!important;color:"+C.textLo+"!important;font-size:9px!important}"
    +".leaflet-bar a{background:"+C.surface+"!important;color:"+C.textHi+"!important;border-color:"+C.border+"!important}"
    +".leaflet-bar a:hover{background:"+C.hover+"!important}";

  var depH=["#","FLIGHT","AIRLINE","DESTINATION","RISK","EOBT","TOBT","TSAT","CTOT","TTOT","TAXI","DELAY %","RISK FACTORS"];
  var arrH=["#","FLIGHT","AIRLINE","ORIGIN","RISK","STA","ETA","ELDT","EGTT","VAR","DELAY %","RISK FACTORS"];

  return(
    <div style={{background:C.bg,color:C.textHi,fontFamily:"'Barlow Condensed',Arial,sans-serif",fontSize:"13px",letterSpacing:"0.04em",minHeight:"100vh"}}>
      <style>{CSS}</style>
      {rfTip&&<RFTooltip factor={rfTip.factor} x={rfTip.x} y={rfTip.y}/>}

      {/* HEADER */}
      <div style={{background:C.raised,borderBottom:"3px solid "+C.teal,padding:"0 24px"}}>
        <div style={{display:"flex",alignItems:"center",padding:"12px 0 8px",gap:20}}>
          <div style={{flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:2}}>
              <span style={{color:C.textHi,fontSize:"28px",fontWeight:700,fontFamily:"'Barlow',Arial,sans-serif",lineHeight:1,letterSpacing:"-0.01em"}}>Velora</span>
              <svg width="14" height="14" viewBox="0 0 14 14" style={{marginBottom:12,marginLeft:2}}>
                <polygon points="7,0 14,12 0,12" fill={C.teal}/>
              </svg>
            </div>
            <div style={{color:C.teal,fontSize:"8px",letterSpacing:"0.18em",marginTop:1}}>ELEVATING EVERY JOURNEY</div>
          </div>

          <div style={{width:1,height:44,background:C.border,flexShrink:0}}/>

          <div>
            <div style={{color:C.textHi,fontSize:"18px",fontWeight:700,letterSpacing:"0.06em",lineHeight:1}}>DELAY PREDICTOR</div>
            <div style={{color:C.textMid,fontSize:"9px",letterSpacing:"0.12em",marginTop:3}}>FLIGHT OPERATIONS INTELLIGENCE  |  A-CDM METHODOLOGY</div>
          </div>

          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:18}}>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              <div style={{width:7,height:7,background:C.green,borderRadius:"50%",animation:"blink 2s infinite"}}/>
              <span style={{fontSize:"9px",color:C.green,letterSpacing:"0.12em",fontWeight:700}}>CDM ACTIVE</span>
            </div>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              <div style={{width:7,height:7,background:C.green,borderRadius:"50%"}}/>
              <span style={{fontSize:"9px",color:C.green,letterSpacing:"0.12em",fontWeight:700}}>ATFM NOMINAL</span>
            </div>
            <span style={{fontSize:"11px",color:C.textMid,fontFamily:"monospace",letterSpacing:"0.06em"}}>{clock} Z</span>
            <button onClick={exportHTML} style={{background:"rgba(255,255,255,0.08)",border:"1px solid "+C.border,color:C.textMid,padding:"4px 12px",fontFamily:"'Barlow Condensed',Arial,sans-serif",fontSize:"9px",fontWeight:700,letterSpacing:"0.1em",cursor:"pointer"}}>EXPORT HTML</button>
          </div>
        </div>

        {/* AIRPORT ROW */}
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"7px 0 10px",borderTop:"1px solid "+C.border,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <span style={{color:C.teal,fontSize:"18px",fontWeight:700,letterSpacing:"0.1em"}}>{selAP}</span>
            <span style={{color:C.border,fontSize:"16px"}}>/</span>
            <span style={{color:C.textMid,fontSize:"14px",fontWeight:600}}>{apIcao}</span>
            <div style={{width:1,height:16,background:C.border}}/>
            <span style={{color:C.textMid,fontSize:"11px"}}>{apName}</span>
            <div style={{width:1,height:16,background:C.border}}/>
            <span style={{color:C.textLo,fontSize:"10px"}}>{apCity} TMA</span>
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",position:"relative"}}>
            <div style={{position:"relative"}}>
              <input
                style={{background:"rgba(0,0,0,0.3)",border:"1px solid "+C.border,borderLeft:"3px solid "+C.teal,color:C.textHi,padding:"7px 12px",fontFamily:"'Barlow Condensed',Arial,sans-serif",fontSize:"12px",letterSpacing:"0.08em",textTransform:"uppercase",width:220,outline:"none"}}
                placeholder="IATA CODE OR CITY" value={search}
                onChange={function(e){onSearch(e.target.value);}}
                onKeyDown={function(e){if(e.key==="Enter")onRun();}}
                onFocus={function(){if(search)onSearch(search);}}
                onBlur={function(){setTimeout(function(){setShowDD(false);},150);}}
              />
              {showDD&&ddItems.length>0&&(
                <div style={{position:"absolute",top:"100%",left:0,zIndex:200,background:C.surface,border:"1px solid "+C.teal,width:290,maxHeight:220,overflowY:"auto",boxShadow:"0 12px 32px rgba(0,0,0,0.6)"}}>
                  {ddItems.map(function(it){return(
                    <div key={it.iata} onMouseDown={function(){pick(it.iata);}}
                      style={{padding:"8px 12px",borderBottom:"1px solid "+C.borderS,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}
                      onMouseEnter={function(e){e.currentTarget.style.background=C.hover;}}
                      onMouseLeave={function(e){e.currentTarget.style.background="";}}>
                      <span style={{color:C.teal,fontWeight:700,minWidth:34,fontSize:"13px"}}>{it.iata}</span>
                      <span style={{color:C.textHi,fontSize:"12px"}}>{it.city}</span>
                      <span style={{color:C.textLo,fontSize:"10px",marginLeft:"auto"}}>{it.icao}</span>
                    </div>
                  );})}
                </div>
              )}
            </div>
            <button onClick={onRun} style={{background:C.teal,border:"none",color:C.bg,padding:"8px 24px",fontFamily:"'Barlow Condensed',Arial,sans-serif",fontSize:"12px",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",cursor:"pointer"}}>RUN</button>
          </div>
        </div>
      </div>

      {/* PIPELINE */}
      <div style={{display:"flex",alignItems:"center",padding:"7px 24px",background:C.surface,borderBottom:"1px solid "+C.border,flexWrap:"wrap",rowGap:4}}>
        {stepDef.map(function(sc,i){return(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 16px",borderLeft:"2px solid "+stepCols[i],opacity:steps[i]===0?0.3:1,marginRight:8}}>
            <div style={{width:7,height:7,background:stepCols[i],borderRadius:"50%",animation:steps[i]===1?"blink 1s infinite":"none"}}/>
            <div>
              <div style={{fontSize:"10px",fontWeight:700,letterSpacing:"0.1em",color:stepCols[i]}}>{sc.l}</div>
              <div style={{fontSize:"9px",color:C.textLo}}>{sc.s}</div>
            </div>
            <span style={{marginLeft:4,fontSize:"9px",color:stepCols[i],fontWeight:700}}>{stepLbls[i]}</span>
            {i<2&&<div style={{width:24,height:1,background:C.border,marginLeft:8}}/>}
          </div>
        );})}
        <div style={{marginLeft:"auto",fontSize:"10px",letterSpacing:"0.1em",fontWeight:700,animation:phase==="running"?"blink 1s infinite":"none",color:phase==="done"?C.teal:phase==="error"?C.red:C.textMid}}>
          {phase==="running"&&"COMPUTING DELAY PREDICTIONS..."}
          {phase==="done"&&(deps.length+" DEP  "+arrs.length+" ARR  PREDICTIONS READY")}
          {phase==="error"&&"PIPELINE FAULT -- RETRY"}
        </div>
      </div>

      {/* LOADING BAR */}
      <div style={{height:3,background:C.border,position:"relative",overflow:"hidden"}}>
        {phase==="running"&&<div style={{position:"absolute",left:0,top:0,height:"100%",width:"0%",background:C.teal,animation:"loadbar 8s ease-out forwards"}}/>}
        {phase==="done"&&<div style={{position:"absolute",left:0,top:0,height:"100%",width:"100%",background:C.teal}}/>}
        {phase==="error"&&<div style={{position:"absolute",left:0,top:0,height:"100%",width:"100%",background:C.red}}/>}
      </div>

      {/* METRICS */}
      <div style={{display:"flex",background:C.bg,borderBottom:"1px solid "+C.border,overflowX:"auto"}}>
        {metrics.map(function(item,i){return(
          <div key={i} style={{padding:"10px 20px",borderRight:"1px solid "+C.border,minWidth:88,flexShrink:0}}>
            <div style={{color:C.textLo,fontSize:"9px",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:3,fontWeight:700}}>{item[0]}</div>
            <div style={{color:C.textHi,fontSize:item[1].length>6?"13px":"17px",fontWeight:700,letterSpacing:"0.02em"}}>{item[1]}</div>
          </div>
        );})}
      </div>

      {/* TABS + LEGEND */}
      <div style={{display:"flex",alignItems:"center",padding:"0 24px",borderBottom:"1px solid "+C.border,background:C.surface,flexWrap:"wrap"}}>
        <button onClick={function(){setTab("dep");}} style={{background:"none",border:"none",borderBottom:tab==="dep"?"3px solid "+C.teal:"3px solid transparent",color:tab==="dep"?C.textHi:C.textLo,padding:"11px 24px",fontFamily:"'Barlow Condensed',Arial,sans-serif",fontSize:"12px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer"}}>{"DEPARTURES ("+deps.length+")"}</button>
        <button onClick={function(){setTab("arr");}} style={{background:"none",border:"none",borderBottom:tab==="arr"?"3px solid #7AB0FF":"3px solid transparent",color:tab==="arr"?C.textHi:C.textLo,padding:"11px 24px",fontFamily:"'Barlow Condensed',Arial,sans-serif",fontSize:"12px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer"}}>{"ARRIVALS ("+arrs.length+")"}</button>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}>
          <span style={{color:C.textLo,fontSize:"9px",letterSpacing:"0.12em",marginRight:6,fontWeight:700}}>DELAY RISK</span>
          {[["LOW","< 30%","low"],["MEDIUM","30-60%","medium"],["HIGH","> 60%","high"]].map(function(item){return(
            <div key={item[2]} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderLeft:"2px solid "+rc(item[2])}}>
              <span style={{color:rc(item[2]),fontSize:"9px",fontWeight:700,letterSpacing:"0.1em"}}>{item[0]}</span>
              <span style={{color:C.textLo,fontSize:"9px"}}>{item[1]}</span>
            </div>
          );})}
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderLeft:"2px solid "+C.amber,marginLeft:2}}>
            <span style={{color:C.amber,fontSize:"9px",fontWeight:700}}>REGULATED</span>
            <span style={{color:C.textLo,fontSize:"9px"}}>CTOT</span>
          </div>
        </div>
      </div>

      {/* MAP */}
      <MapPanel ap={ap} selAP={selAP} routes={tab==="dep"?depList:arrList} isDep={tab==="dep"}/>

      {/* TABLE */}
      <div style={{overflowX:"auto"}}>
        {phase==="running"&&<div style={{padding:"48px",textAlign:"center",color:C.teal,letterSpacing:"0.12em",animation:"blink 1s infinite",fontSize:"13px",fontWeight:700}}>COMPUTING DELAY PREDICTIONS...</div>}
        {phase==="error"&&<div style={{padding:"48px",textAlign:"center",color:C.red,letterSpacing:"0.12em",fontSize:"13px",fontWeight:700}}>PIPELINE FAULT -- RETRY</div>}

        {phase==="done"&&tab==="dep"&&(
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
            <thead><tr>{depH.map(function(h){return <TH key={h} c={h}/>;})}</tr></thead>
            <tbody>{deps.map(function(f,i){var cs=parseCS(f.callsign),t=f.times;return(
              <tr key={i} className="frow">
                <TD style={{color:C.textLo,fontSize:"11px"}} c={String(i+1).padStart(2,"0")}/>
                <TD style={{color:C.teal,fontWeight:700,letterSpacing:"0.08em",fontSize:"13px"}} c={cs.flight}/>
                <TD style={{color:C.textMid}} c={cs.airline}/>
                <TD style={{color:C.textHi}} c={f.destination_name||"---"}/>
                <TD><RiskTag level={f.risk_level}/></TD>
                <TD style={{fontFamily:"monospace",color:C.textMid,fontSize:"12px"}} c={t.EOBT}/>
                <TD style={{fontFamily:"monospace",color:C.textHi,fontSize:"12px",fontWeight:600}} c={t.TOBT}/>
                <TD style={{fontFamily:"monospace",color:C.teal,fontSize:"12px",fontWeight:600}} c={t.TSAT}/>
                <TD style={{fontFamily:"monospace",color:f.ctot_regulated?C.amber:C.textLo,fontSize:"12px"}} c={t.CTOT}/>
                <TD style={{fontFamily:"monospace",color:C.green,fontSize:"12px",fontWeight:600}} c={t.TTOT}/>
                <TD style={{color:C.textLo}} c={(f.taxi_minutes||18)+"M"}/>
                <TD><Bar pct={f.delay_probability||0} level={f.risk_level||"low"}/></TD>
                <TD><Tags items={f.risk_factors}/></TD>
              </tr>
            );})}</tbody>
          </table>
        )}

        {phase==="done"&&tab==="arr"&&(
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
            <thead><tr>{arrH.map(function(h){return <TH key={h} c={h}/>;})}</tr></thead>
            <tbody>{arrs.map(function(f,i){var cs=parseCS(f.callsign),t=f.times,v=f.eta_delta||0;return(
              <tr key={i} className="frow">
                <TD style={{color:C.textLo,fontSize:"11px"}} c={String(i+1).padStart(2,"0")}/>
                <TD style={{color:C.teal,fontWeight:700,letterSpacing:"0.08em",fontSize:"13px"}} c={cs.flight}/>
                <TD style={{color:C.textMid}} c={cs.airline}/>
                <TD style={{color:C.textHi}} c={f.origin_name||"---"}/>
                <TD><RiskTag level={f.risk_level}/></TD>
                <TD style={{fontFamily:"monospace",color:C.textMid,fontSize:"12px"}} c={t.STA}/>
                <TD style={{fontFamily:"monospace",color:C.textHi,fontSize:"12px",fontWeight:600}} c={t.ETA}/>
                <TD style={{fontFamily:"monospace",color:C.teal,fontSize:"12px",fontWeight:600}} c={t.ELDT}/>
                <TD style={{fontFamily:"monospace",color:C.green,fontSize:"12px",fontWeight:600}} c={t.EGTT}/>
                <TD style={{color:v>10?C.red:v>0?C.amber:C.green,fontWeight:700,fontSize:"12px"}} c={(v>=0?"+":"")+v+"M"}/>
                <TD><Bar pct={f.delay_probability||0} level={f.risk_level||"low"}/></TD>
                <TD><Tags items={f.risk_factors}/></TD>
              </tr>
            );})}</tbody>
          </table>
        )}
      </div>

      {/* METHODOLOGY */}
      {phase==="done"&&(
        <div style={{padding:"16px 24px 20px",background:C.surface,borderTop:"1px solid "+C.border}}>
          <div style={{color:C.textLo,fontSize:"9px",fontWeight:700,letterSpacing:"0.18em",marginBottom:12,borderLeft:"3px solid "+C.teal,paddingLeft:8}}>DELAY PREDICTION -- A-CDM MILESTONE SOURCES AND METHODOLOGY</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"11px"}}>
              <thead><tr>{["MILESTONE","FORMULA","REFERENCE / SOURCE"].map(function(h){return <th key={h} style={{color:C.textLo,padding:"5px 12px",textAlign:"left",borderBottom:"1px solid "+C.border,fontWeight:700,letterSpacing:"0.1em",fontSize:"9px",whiteSpace:"nowrap"}}>{h}</th>;})}</tr></thead>
              <tbody>{CDM_SRC.map(function(row,i){return(
                <tr key={i} style={{borderBottom:"1px solid "+C.borderS}}>
                  <td style={{padding:"6px 12px",color:C.teal,fontWeight:700,letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{row.m}</td>
                  <td style={{padding:"6px 12px",color:C.textHi,fontFamily:"monospace",whiteSpace:"nowrap"}}>{row.f}</td>
                  <td style={{padding:"6px 12px",color:C.textMid,lineHeight:1.5}}>{row.src}</td>
                </tr>
              );})}</tbody>
            </table>
          </div>
          <div style={{marginTop:12,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"6px 32px"}}>
            {GLOSSARY.map(function(g,i){return(
              <div key={i} style={{display:"flex",gap:10,fontSize:"11px",alignItems:"baseline"}}>
                <span style={{color:C.teal,fontWeight:700,minWidth:38,letterSpacing:"0.08em"}}>{g.term}</span>
                <span style={{color:C.textMid}}>{g.def}</span>
              </div>
            );})}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{borderTop:"1px solid "+C.border,padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",background:C.bg}}>
        <span style={{color:C.textLo,fontSize:"9px",letterSpacing:"0.14em"}}>VELORA FLIGHT OPERATIONS INTELLIGENCE  |  A-CDM METHODOLOGY  |  OPENSKY / OPEN-METEO / ANTHROPIC</span>
        <span style={{color:C.border,fontSize:"9px"}}>v1.0</span>
      </div>
    </div>
  );
}
