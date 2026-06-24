import { useState, useEffect, useCallback } from "react";

// ─── SUPABASE CONFIG ───────────────────────────────────────────────────────────
const SUPABASE_URL = "https://gixuouvqzqxridcbfxcs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpeHVvdXZxenF4cmlkY2JmeGNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjIzOTQsImV4cCI6MjA5NzY5ODM5NH0.-lHWlGc0NMlgEg6OdfEhX2L3OMpEN_6XNQ2eQ-Eqn5w";

const sb = {
  async load(profile) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?profile_id=eq.${profile}&select=*`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (!res.ok) throw new Error(`Load failed: ${res.status}`);
    const data = await res.json();
    return data?.[0] || null;
  },
  async save(profile, payload) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal,resolution=merge-duplicates",
      },
      body: JSON.stringify({ profile_id: profile, ...payload, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Save failed: ${res.status} ${err}`);
    }
  }
};

// ─── CATEGORIES ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Health", "Other"];
const CAT_ICONS = { Food:"🍕", Transport:"🚌", Entertainment:"🎮", Shopping:"🛍️", Bills:"📄", Health:"💊", Other:"📦" };

// ─── THEMES ────────────────────────────────────────────────────────────────────
const THEMES = {
  cameron: {
    name: "Cameron", emoji: "🕷️",
    pageBg: "#0a0608",
    pageBgImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40 0 L40 80 M0 40 L80 40 M0 0 L80 80 M80 0 L0 80' stroke='%23cc000015' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='40' cy='40' r='30' stroke='%23cc000010' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='40' cy='40' r='15' stroke='%23cc000010' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
    cardBg:"linear-gradient(145deg,#1a0d0d,#0d1525)", cardBorder:"#cc000030",
    tabBarBg:"#0d0608", tabBarBorder:"#cc000025",
    tabActive:"linear-gradient(135deg,#cc0000,#1a3a8f)", tabActiveColor:"#fff", tabInactiveColor:"#6b4040", tabShadow:"0 2px 14px #cc000050",
    primary:"#e63030", secondary:"#2952c4", gold:"#f5c842",
    headingColor:"#e63030", subColor:"#6b4040", mutedColor:"#4b2020", bodyText:"#f1f5f9",
    inputBg:"#0a0608", inputBorder:"#cc000040",
    xpBarGrad:"linear-gradient(90deg,#cc0000,#e63030,#f5c842)", xpBarGlow:"#e6303080", xpNumColor:"#f5c842",
    btnBg:"linear-gradient(135deg,#cc0000,#1a3a8f)", btnBgActive:"linear-gradient(135deg,#8b0000,#0d2266)", btnBorder:"#f5c84230", btnShadow:"0 4px 20px #cc000060",
    toastBg:"linear-gradient(135deg,#cc0000,#1a3a8f)", toastShadow:"0 8px 32px #cc000060", toastBorder:"#f5c84240",
    questDoneBg:"linear-gradient(135deg,#0a1f0a,#0d2a0d)", questDoneBorder:"#16a34a", questDoneColor:"#4ade80", questDoneDesc:"#16a34a",
    statsHeaderBg:"linear-gradient(135deg,#cc0000,#1a3a8f)",
    statsHeaderBgImg:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40 0 L40 80 M0 40 L80 40 M0 0 L80 80 M80 0 L0 80' stroke='%23cc000015' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
    statsEmptyColor:"#4b2020", statsCatText:"#f1f5f9", statsCatMuted:"#4b2020",
    badgeCardBg:"linear-gradient(145deg,#1a0d0d,#0d1a2e)", badgeCardLocked:"#0a0608", badgeCardLockedBorder:"#1a0d0d",
    badgeLockedText:"#2a1515", badgeLockedDesc:"#1a0d0d", badgeLockedFlavor:"Keep swinging!",
    badgeBarBg:"#0a0608", badgeBarBorder:"#cc000020", badgeBarGrad:"linear-gradient(90deg,#cc0000,#1a3a8f,#f5c842)", badgeBarShadow:"0 0 10px #cc000060", badgeCountColor:"#6b4040",
    histDivider:"#1a0d0d", histCatText:"#6b4040", histEmptyColor:"#6b4040",
    catUnselBorder:"#cc000025", catUnselBg:"#0a0608", catUnselColor:"#6b4040",
    xpRowBg:"#0a0608", xpRowBorder:"#cc000020", xpRowLabelColor:"#4b2020", xpRowColors:["#e63030","#2952c4","#f5c842"],
    rarity:{
      common:  {border:"#4b5563",glow:"#4b556330",label:"Common",  color:"#9ca3af",shine:"#6b7280"},
      uncommon:{border:"#2952c4",glow:"#2952c450",label:"Uncommon",color:"#60a5fa",shine:"#93c5fd"},
      rare:    {border:"#cc0000",glow:"#cc000050",label:"Rare",    color:"#f87171",shine:"#fca5a5"},
      epic:    {border:"#f5c842",glow:"#f5c84260",label:"Epic",    color:"#fde68a",shine:"#fef3c7"},
    },
    catColors:{Food:"#e63030",Transport:"#2952c4",Entertainment:"#c026d3",Shopping:"#e8870a",Bills:"#dc2626",Health:"#16a34a",Other:"#6b7280"},
    levels:[
      {level:1,title:"Friendly Neighbor", minXP:0,   color:"#9ca3af",bg:"#1a1017",char:"🕷️"},
      {level:2,title:"Web Slinger",       minXP:500, color:"#2952c4",bg:"#0d1a3a",char:"🕸️"},
      {level:3,title:"Wall Crawler",      minXP:1500,color:"#e63030",bg:"#3a0d0d",char:"🦸"},
      {level:4,title:"Spider-Sense",      minXP:3500,color:"#f5c842",bg:"#2a1f00",char:"⚡"},
      {level:5,title:"Amazing Spider-Man",minXP:7000,color:"#e63030",bg:"#1a0a0a",char:"🕷️"},
    ],
    titleGrad:"linear-gradient(135deg,#e63030,#f5c842,#2952c4)", titleShadow:"drop-shadow(0 2px 8px #cc000060)",
    tagline:"🕸️ With great spending comes great tracking 🕸️", taglineColor:"#6b7280",
    logTabIcon:"🕷️", logBtnText:"🕸️ LOG IT & EARN XP",
    emptyIcon:"🕸️", emptyText:"Your web is empty!", emptySub:"Head to 🕷️ Log and start swinging.",
    xpPopSuffix:"🕷️", levelupPrefix:"🕷️ LEVEL UP!", earnedSuffix:"With great spending comes great tracking.",
    statsEmptyText:"Log some purchases to see your web of spending!",
  },
  hannah: {
    name: "Hannah", emoji: "🎀",
    pageBg:"#fff0f5",
    pageBgImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23ffb6c120'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%23ff69b420'/%3E%3Ccircle cx='50' cy='10' r='2' fill='%23ffb6c120'/%3E%3Ccircle cx='10' cy='50' r='2' fill='%23ff69b415'/%3E%3Ccircle cx='50' cy='50' r='2' fill='%23ffb6c120'/%3E%3C/svg%3E")`,
    cardBg:"linear-gradient(145deg,#fff5f9,#ffeef5)", cardBorder:"#ffb6c160",
    tabBarBg:"#ffe4ef", tabBarBorder:"#ffb6c180",
    tabActive:"linear-gradient(135deg,#ff69b4,#ff1493)", tabActiveColor:"#fff", tabInactiveColor:"#d4829a", tabShadow:"0 2px 14px #ff69b450",
    primary:"#ff69b4", secondary:"#ff1493", gold:"#ff69b4",
    headingColor:"#e91e8c", subColor:"#d4829a", mutedColor:"#c9a0b0", bodyText:"#4a1a2e",
    inputBg:"#fff5f9", inputBorder:"#ffb6c180",
    xpBarGrad:"linear-gradient(90deg,#ff69b4,#ff1493,#ff69b4)", xpBarGlow:"#ff69b480", xpNumColor:"#e91e8c",
    btnBg:"linear-gradient(135deg,#ff69b4,#ff1493)", btnBgActive:"linear-gradient(135deg,#c2185b,#880e4f)", btnBorder:"#ffffff60", btnShadow:"0 4px 20px #ff69b460",
    toastBg:"linear-gradient(135deg,#ff69b4,#ff1493)", toastShadow:"0 8px 32px #ff69b460", toastBorder:"#ffffff40",
    questDoneBg:"linear-gradient(135deg,#fff0f8,#ffe4ef)", questDoneBorder:"#ff69b4", questDoneColor:"#e91e8c", questDoneDesc:"#ff69b4",
    statsHeaderBg:"linear-gradient(135deg,#ff69b4,#ff1493)",
    statsHeaderBgImg:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23ffffff20'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%23ffffff15'/%3E%3Ccircle cx='50' cy='10' r='2' fill='%23ffffff20'/%3E%3C/svg%3E")`,
    statsEmptyColor:"#c9a0b0", statsCatText:"#4a1a2e", statsCatMuted:"#c9a0b0",
    badgeCardBg:"linear-gradient(145deg,#fff5f9,#ffeef5)", badgeCardLocked:"#fce4ec", badgeCardLockedBorder:"#ffb6c180",
    badgeLockedText:"#e8b4c8", badgeLockedDesc:"#f0d0dc", badgeLockedFlavor:"Keep going! ✨",
    badgeBarBg:"#ffe4ef", badgeBarBorder:"#ffb6c140", badgeBarGrad:"linear-gradient(90deg,#ff69b4,#ff1493,#ffb6c1)", badgeBarShadow:"0 0 10px #ff69b460", badgeCountColor:"#d4829a",
    histDivider:"#ffe4ef", histCatText:"#d4829a", histEmptyColor:"#d4829a",
    catUnselBorder:"#ffb6c160", catUnselBg:"#fff5f9", catUnselColor:"#d4829a",
    xpRowBg:"#fff5f9", xpRowBorder:"#ffb6c140", xpRowLabelColor:"#c9a0b0", xpRowColors:["#ff69b4","#ff1493","#e91e8c"],
    rarity:{
      common:  {border:"#d4829a",glow:"#d4829a30",label:"Common",  color:"#d4829a",shine:"#f0b8cc"},
      uncommon:{border:"#ff69b4",glow:"#ff69b440",label:"Uncommon",color:"#ff69b4",shine:"#ffb6c1"},
      rare:    {border:"#e91e8c",glow:"#e91e8c50",label:"Rare",    color:"#e91e8c",shine:"#f48fb1"},
      epic:    {border:"#c2185b",glow:"#c2185b60",label:"Epic",    color:"#c2185b",shine:"#f06292"},
    },
    catColors:{Food:"#ff69b4",Transport:"#e91e8c",Entertainment:"#c2185b",Shopping:"#ff1493",Bills:"#f06292",Health:"#f48fb1",Other:"#d4829a"},
    levels:[
      {level:1,title:"Curious Kitty",  minXP:0,   color:"#d4829a",bg:"#fff0f5",char:"🐱"},
      {level:2,title:"Sweet Saver",    minXP:500, color:"#ff69b4",bg:"#ffe4ef",char:"🎀"},
      {level:3,title:"Budget Bow",     minXP:1500,color:"#e91e8c",bg:"#fce4ec",char:"🌸"},
      {level:4,title:"Star Kitty",     minXP:3500,color:"#c2185b",bg:"#f8bbd0",char:"⭐"},
      {level:5,title:"Hello Champion", minXP:7000,color:"#e91e8c",bg:"#fce4ec",char:"👑"},
    ],
    titleGrad:"linear-gradient(135deg,#ff69b4,#e91e8c,#ff1493)", titleShadow:"drop-shadow(0 2px 8px #ff69b460)",
    tagline:"🎀 Cute budgeting for a cute person 🎀", taglineColor:"#d4829a",
    logTabIcon:"🎀", logBtnText:"🌸 LOG IT & EARN XP",
    emptyIcon:"🌸", emptyText:"Nothing here yet!", emptySub:"Head to 🎀 Log and start earning XP.",
    xpPopSuffix:"✨", levelupPrefix:"🎀 LEVEL UP!", earnedSuffix:"You're doing amazing! ✨",
    statsEmptyText:"Log some purchases to see your spending! 🌸",
  },
};

// ─── QUESTS & BADGES ───────────────────────────────────────────────────────────
const QUESTS = [
  {id:"log5",   title:"First Steps",       desc:"Log 5 purchases",           xp:75,  check:(e)=>e.length>=5},
  {id:"log10",  title:"Getting Consistent",desc:"Log 10 purchases",          xp:100, check:(e)=>e.length>=10},
  {id:"allCats",title:"Category Master",   desc:"Use all 7 categories",      xp:150, check:(e)=>new Set(e.map(x=>x.category)).size>=7},
  {id:"sameDay",title:"Speed Logger",      desc:"Log 3 purchases on one day",xp:100, check:(e)=>{const d={};e.forEach(x=>{d[x.date]=(d[x.date]||0)+1;});return Object.values(d).some(v=>v>=3);}},
  {id:"week",   title:"Week Warrior",      desc:"Log on 7 different days",   xp:200, check:(e)=>new Set(e.map(x=>x.date)).size>=7},
];

const BADGES = [
  {id:"first_log",  icon:"🌱",name:"First Blood",        desc:"Log your first purchase",   rarity:"common",  check:(e)=>e.length>=1},
  {id:"log_10",     icon:"📝",name:"Scribe",             desc:"Log 10 purchases",          rarity:"common",  check:(e)=>e.length>=10},
  {id:"log_25",     icon:"📚",name:"Chronicler",         desc:"Log 25 purchases",          rarity:"uncommon",check:(e)=>e.length>=25},
  {id:"log_50",     icon:"🗂️",name:"Archivist",          desc:"Log 50 purchases",          rarity:"rare",    check:(e)=>e.length>=50},
  {id:"log_100",    icon:"📖",name:"Lorekeeper",         desc:"Log 100 purchases",         rarity:"epic",    check:(e)=>e.length>=100},
  {id:"big_spender",icon:"💸",name:"High Roller",        desc:"Single purchase over $100", rarity:"uncommon",check:(e)=>e.some(x=>x.amount>=100)},
  {id:"frugal",     icon:"🪙",name:"Penny Pincher",      desc:"5 purchases under $5",      rarity:"uncommon",check:(e)=>e.filter(x=>x.amount<5).length>=5},
  {id:"variety",    icon:"🎭",name:"Renaissance Spender",desc:"Use all 7 categories",      rarity:"rare",    check:(e)=>new Set(e.map(x=>x.category)).size>=7},
  {id:"same_day_3", icon:"⚡",name:"Speed Tracker",      desc:"3 purchases in one day",    rarity:"common",  check:(e)=>{const d={};e.forEach(x=>{d[x.date]=(d[x.date]||0)+1;});return Object.values(d).some(v=>v>=3);}},
  {id:"7_days",     icon:"🗓️",name:"Week Warrior",       desc:"Log on 7 different days",   rarity:"uncommon",check:(e)=>new Set(e.map(x=>x.date)).size>=7},
  {id:"30_days",    icon:"🌙",name:"Moon Tracker",       desc:"Log on 30 different days",  rarity:"epic",    check:(e)=>new Set(e.map(x=>x.date)).size>=30},
  {id:"foodie",     icon:"🍕",name:"Foodie",             desc:"10 Food purchases",         rarity:"uncommon",check:(e)=>e.filter(x=>x.category==="Food").length>=10},
  {id:"commuter",   icon:"🚌",name:"Commuter",           desc:"10 Transport purchases",    rarity:"uncommon",check:(e)=>e.filter(x=>x.category==="Transport").length>=10},
  {id:"entertainer",icon:"🎮",name:"Good Times",         desc:"10 Entertainment purchases",rarity:"uncommon",check:(e)=>e.filter(x=>x.category==="Entertainment").length>=10},
  {id:"xp_500",     icon:"⭐",name:"Rising Star",        desc:"Reach 500 XP",              rarity:"common",  checkXP:(xp)=>xp>=500},
  {id:"xp_1500",    icon:"🌟",name:"Shining Light",      desc:"Reach 1,500 XP",            rarity:"uncommon",checkXP:(xp)=>xp>=1500},
  {id:"xp_3500",    icon:"💫",name:"Blazing Trail",      desc:"Reach 3,500 XP",            rarity:"rare",    checkXP:(xp)=>xp>=3500},
  {id:"xp_7000",    icon:"🌠",name:"Legend",             desc:"Reach 7,000 XP",            rarity:"epic",    checkXP:(xp)=>xp>=7000},
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function getLvl(xp, levels) {
  for (let i=levels.length-1;i>=0;i--) if (xp>=levels[i].minXP) return levels[i];
  return levels[0];
}

// ─── PROFILE PICKER ────────────────────────────────────────────────────────────
function ProfilePicker({ onSelect }) {
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0a0608 0%,#1a0d1a 50%,#fff0f5 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",fontFamily:"'Segoe UI',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');`}</style>
      <div style={{fontSize:52,marginBottom:8}}>💰</div>
      <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:36,margin:"0 0 6px",background:"linear-gradient(135deg,#e63030,#ff69b4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Budget Quest</h1>
      <div style={{color:"#9ca3af",fontSize:14,marginBottom:40,fontWeight:600}}>Who's playing?</div>
      <div style={{display:"flex",gap:16,width:"100%",maxWidth:380}}>
        {[
          {id:"cameron",emoji:"🕷️",name:"Cameron",sub:"Spider-Man",bg:"linear-gradient(145deg,#1a0d0d,#0d1525)",border:"#cc000060",nameColor:"#e63030",subColor:"#6b4040",btnBg:"linear-gradient(135deg,#cc0000,#1a3a8f)",btnLabel:"Let's go! 🕸️",shadow:"0 8px 32px #cc000030"},
          {id:"hannah", emoji:"🎀",name:"Hannah", sub:"Hello Kitty",bg:"linear-gradient(145deg,#fff5f9,#ffeef5)",border:"#ff69b470",nameColor:"#e91e8c",subColor:"#d4829a",btnBg:"linear-gradient(135deg,#ff69b4,#ff1493)",btnLabel:"Let's go! 🌸",shadow:"0 8px 32px #ff69b430"},
        ].map(p=>(
          <button key={p.id} onClick={()=>onSelect(p.id)} style={{flex:1,background:p.bg,border:`2px solid ${p.border}`,borderRadius:24,padding:"28px 16px",cursor:"pointer",textAlign:"center",boxShadow:p.shadow,transition:"transform 0.15s",fontFamily:"inherit"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <div style={{fontSize:52,marginBottom:10}}>{p.emoji}</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:p.nameColor,marginBottom:6}}>{p.name}</div>
            <div style={{fontSize:12,color:p.subColor,fontWeight:600}}>{p.sub}</div>
            <div style={{marginTop:16,background:p.btnBg,borderRadius:12,padding:"10px",color:"#fff",fontWeight:800,fontSize:14,fontFamily:"'Fredoka One',cursive"}}>{p.btnLabel}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── XP BAR ────────────────────────────────────────────────────────────────────
function XPBar({xp,t}) {
  const lvl=getLvl(xp,t.levels), next=t.levels.find(l=>l.level===lvl.level+1);
  const pct=next?Math.min(100,((xp-lvl.minXP)/(next.minXP-lvl.minXP))*100):100;
  return (
    <div style={{background:lvl.bg,backgroundImage:t.pageBgImage,borderRadius:20,padding:"18px 20px",border:`2px solid ${lvl.color}50`,boxShadow:`0 4px 24px ${lvl.color}25`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:42,lineHeight:1,filter:`drop-shadow(0 0 10px ${lvl.color}90)`}}>{lvl.char}</div>
          <div>
            <div style={{color:lvl.color,fontWeight:900,fontSize:17,fontFamily:"'Fredoka One',cursive"}}>{lvl.title}</div>
            <div style={{color:`${lvl.color}88`,fontSize:12,fontWeight:600}}>Level {lvl.level}{next?` · ${(next.minXP-xp).toLocaleString()} XP to go`:" · MAX"}</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:t.xpNumColor,fontWeight:900,fontSize:22,fontFamily:"'Fredoka One',cursive"}}>{xp.toLocaleString()}</div>
          <div style={{color:`${t.xpNumColor}60`,fontSize:11,fontWeight:700,letterSpacing:1}}>TOTAL XP</div>
        </div>
      </div>
      <div style={{height:14,background:"#00000020",borderRadius:99,overflow:"hidden",border:`1px solid ${lvl.color}30`}}>
        <div style={{height:"100%",width:`${pct}%`,background:t.xpBarGrad,borderRadius:99,transition:"width 0.7s cubic-bezier(.34,1.56,.64,1)",boxShadow:t.xpBarGlow,position:"relative"}}>
          <div style={{position:"absolute",right:4,top:"50%",transform:"translateY(-50%)",width:6,height:6,borderRadius:"50%",background:"#fff",opacity:0.9}}/>
        </div>
      </div>
    </div>
  );
}

// ─── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({msg,onDone,t}) {
  useEffect(()=>{const x=setTimeout(onDone,3000);return()=>clearTimeout(x);},[]);
  return <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:t.toastBg,borderRadius:999,padding:"12px 28px",color:"#fff",fontWeight:800,fontSize:15,zIndex:9999,boxShadow:t.toastShadow,animation:"toastIn 0.4s cubic-bezier(.34,1.56,.64,1)",fontFamily:"'Fredoka One',cursive",whiteSpace:"nowrap",letterSpacing:0.5,border:`1px solid ${t.toastBorder}`}}>{msg}</div>;
}

// ─── BADGE CARD ────────────────────────────────────────────────────────────────
function BadgeCard({badge,unlocked,t}) {
  const r=t.rarity[badge.rarity];
  return (
    <div style={{background:unlocked?t.badgeCardBg:t.badgeCardLocked,border:`2px solid ${unlocked?r.border:t.badgeCardLockedBorder}`,borderRadius:16,padding:"14px 10px",textAlign:"center",opacity:unlocked?1:0.4,boxShadow:unlocked?`0 4px 20px ${r.glow},inset 0 1px 0 ${r.shine}20`:"none",transition:"all 0.3s",position:"relative",overflow:"hidden"}}>
      {unlocked&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${r.shine},transparent)`}}/>}
      {unlocked&&<div style={{position:"absolute",top:5,right:6,fontSize:8,fontWeight:800,color:r.color,textTransform:"uppercase",letterSpacing:0.8,background:`${r.border}25`,padding:"1px 5px",borderRadius:99}}>{r.label}</div>}
      <div style={{fontSize:28,marginBottom:6,filter:unlocked?`drop-shadow(0 2px 6px ${r.glow})`:"grayscale(1)"}}>{unlocked?badge.icon:"🔒"}</div>
      <div style={{fontSize:11,fontWeight:800,color:unlocked?t.bodyText:t.badgeLockedText,fontFamily:"'Fredoka One',cursive",marginBottom:3,lineHeight:1.2}}>{unlocked?badge.name:"???"}</div>
      <div style={{fontSize:9,color:unlocked?t.subColor:t.badgeLockedDesc,lineHeight:1.4}}>{unlocked?badge.desc:t.badgeLockedFlavor}</div>
    </div>
  );
}

// ─── SAVING INDICATOR ──────────────────────────────────────────────────────────
function SaveIndicator({status,errorMsg,t}) {
  if (status==="idle") return null;
  const map={saving:{icon:"💾",text:"Saving...",color:t.subColor},saved:{icon:"✅",text:"Saved!",color:t.questDoneColor},error:{icon:"⚠️",text:"Save failed",color:"#ef4444"}};
  const s=map[status];
  return (
    <div style={{position:"fixed",bottom:20,left:12,right:12,background:t.cardBg,border:`1px solid ${status==="error"?"#ef4444":t.cardBorder}`,borderRadius:14,padding:"10px 14px",fontSize:12,fontWeight:700,color:s.color,zIndex:999,boxShadow:"0 2px 12px #00000040"}}>
      <div>{s.icon} {s.text}</div>
      {status==="error" && errorMsg && <div style={{fontSize:10,marginTop:4,color:"#ef4444",fontWeight:500,wordBreak:"break-all",opacity:0.85}}>{errorMsg}</div>}
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function BudgetQuest() {
  const [profile, setProfile]     = useState(null);
  const [entries, setEntries]     = useState([]);
  const [xp, setXP]               = useState(0);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [unlockedBadges, setUnlockedBadges]   = useState([]);
  const [toast, setToast]         = useState(null);
  const [tab, setTab]             = useState("log");
  const [form, setForm]           = useState({amount:"",category:"Food",note:"",date:new Date().toISOString().split("T")[0]});
  const [xpAnim, setXPAnim]       = useState(null);
  const [btnActive, setBtnActive] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading]     = useState(false);

  // Load data when profile selected — always wipe state first so previous profile never bleeds through
  useEffect(() => {
    if (!profile) return;
    setEntries([]); setXP(0); setCompletedQuests([]); setUnlockedBadges([]);
    setLoading(true);
    sb.load(profile).then(data => {
      if (data) {
        setEntries(data.entries || []);
        setXP(data.xp || 0);
        setCompletedQuests(data.quests || []);
        setUnlockedBadges(data.badges || []);
      }
      setLoading(false);
    }).catch(()=>setLoading(false));
  }, [profile]);

  // Debounced save whenever state changes
  const saveData = useCallback(async (newEntries, newXP, newQuests, newBadges) => {
    setSaveStatus("saving");
    try {
      await sb.save(profile, { entries: newEntries, xp: newXP, quests: newQuests, badges: newBadges });
      setSaveStatus("saved");
      setTimeout(()=>setSaveStatus("idle"), 2000);
    } catch(e) {
      console.error("Supabase save error:", e.message);
      setSaveError(e.message);
      setSaveStatus("error");
      setTimeout(()=>{ setSaveStatus("idle"); setSaveError(""); }, 6000);
    }
  }, [profile]);

  if (!profile) return <ProfilePicker onSelect={p=>{setProfile(p);setTab("log");}}/>;

  const t = THEMES[profile];

  if (loading) return (
    <div style={{minHeight:"100vh",background:t.pageBg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"'Segoe UI',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');`}</style>
      <div style={{fontSize:52}}>{t.emoji}</div>
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:t.primary}}>Loading your progress...</div>
      <div style={{color:t.subColor,fontSize:14}}>Connecting to the cloud ☁️</div>
    </div>
  );

  const showToast = (msg) => setToast(msg);

  const addEntry = () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) return;
    setBtnActive(true); setTimeout(()=>setBtnActive(false),200);
    const entry={...form,amount:parseFloat(form.amount),id:Date.now()};
    const newEntries=[entry,...entries];

    let gained=10;
    if (form.category) gained+=5;
    const today=new Date().toISOString().split("T")[0];
    if (form.date===today) gained+=10;
    const newXP=xp+gained;

    setXPAnim(`+${gained} XP ${t.xpPopSuffix}`);
    setTimeout(()=>setXPAnim(null),1600);

    const oldLvl=getLvl(xp,t.levels).level, newLvl=getLvl(newXP,t.levels).level;
    if (newLvl>oldLvl) showToast(`${t.levelupPrefix} You're now ${getLvl(newXP,t.levels).title}!`);
    else showToast(`+${gained} XP! ${t.earnedSuffix}`);

    let questBonus=0;
    const newQuests=[...completedQuests];
    QUESTS.forEach(q=>{
      if (!completedQuests.includes(q.id)&&q.check(newEntries)){
        setTimeout(()=>showToast(`🏆 Quest: ${q.title} (+${q.xp} XP!)`),900);
        questBonus+=q.xp; newQuests.push(q.id);
      }
    });
    const finalXP=newXP+questBonus;

    const newBadgeIds=BADGES.filter(b=>{
      if (unlockedBadges.includes(b.id)) return false;
      return (b.check&&b.check(newEntries))||(b.checkXP&&b.checkXP(finalXP));
    }).map(b=>b.id);
    newBadgeIds.forEach((bid,i)=>{
      const b=BADGES.find(x=>x.id===bid);
      setTimeout(()=>showToast(`🎖️ Badge: ${b.icon} ${b.name} unlocked!`),1300+i*950);
    });
    const newBadges=[...unlockedBadges,...newBadgeIds];

    setEntries(newEntries); setXP(finalXP);
    setCompletedQuests(newQuests); setUnlockedBadges(newBadges);
    saveData(newEntries, finalXP, newQuests, newBadges);
    setForm(f=>({...f,amount:"",note:""}));
  };

  const totalSpent=entries.reduce((s,e)=>s+e.amount,0);
  const badgeCount=unlockedBadges.length;
  const byCategory=CATEGORIES.map(cat=>({
    cat,total:entries.filter(e=>e.category===cat).reduce((s,e)=>s+e.amount,0),
    count:entries.filter(e=>e.category===cat).length,
  })).filter(c=>c.count>0).sort((a,b)=>b.total-a.total);

  const rarityOrder=["epic","rare","uncommon","common"];
  const sortedBadges=[...BADGES].sort((a,b)=>{
    const aU=unlockedBadges.includes(a.id),bU=unlockedBadges.includes(b.id);
    if (aU!==bU) return aU?-1:1;
    return rarityOrder.indexOf(a.rarity)-rarityOrder.indexOf(b.rarity);
  });

  const TABS=[["log",t.logTabIcon,"Log"],["history","📜","History"],["quests","🏆","Quests"],["badges","🎖️","Badges"],["stats","📊","Stats"]];
  const inp={width:"100%",background:t.inputBg,border:`2px solid ${t.inputBorder}`,borderRadius:12,padding:"11px 14px",color:t.bodyText,fontSize:15,boxSizing:"border-box",outline:"none",fontFamily:"inherit"};
  const lbl={fontSize:11,fontWeight:800,color:t.primary,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:1};
  const card={background:t.cardBg,borderRadius:22,padding:20,border:`2px solid ${t.cardBorder}`,boxShadow:"0 4px 24px #00000015"};

  return (
    <div style={{minHeight:"100vh",background:t.pageBg,backgroundImage:t.pageBgImage,color:t.bodyText,fontFamily:"'Segoe UI',sans-serif",padding:"20px 16px 64px",maxWidth:480,margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) scale(0.8) translateY(-10px)}to{opacity:1;transform:translateX(-50%) scale(1) translateY(0)}}
        @keyframes xpPop{0%{opacity:0;transform:translateY(0) scale(0.6)}30%{opacity:1;transform:translateY(-20px) scale(1.2)}80%{opacity:1;transform:translateY(-30px) scale(1)}100%{opacity:0;transform:translateY(-40px) scale(0.9)}}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.4);}
      `}</style>

      {toast&&<Toast msg={toast} onDone={()=>setToast(null)} t={t}/>}
      <SaveIndicator status={saveStatus} errorMsg={saveError} t={t}/>

      {/* Header */}
      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{fontSize:13,fontWeight:800,color:t.secondary,letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>{t.name}'s</div>
        <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:40,margin:0,lineHeight:1,letterSpacing:2,background:t.titleGrad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",filter:t.titleShadow}}>Budget Quest</h1>
        <div style={{fontSize:13,marginTop:8,fontWeight:600,color:t.taglineColor}}>{t.tagline}</div>
        <button onClick={()=>setProfile(null)} style={{marginTop:10,background:"transparent",border:`1px solid ${t.cardBorder}`,borderRadius:99,padding:"5px 14px",color:t.subColor,fontSize:12,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>Switch profile ↩</button>
      </div>

      {/* XP Bar */}
      <div style={{marginBottom:18,position:"relative"}}>
        <XPBar xp={xp} t={t}/>
        {xpAnim&&<div style={{position:"absolute",top:8,right:12,color:t.xpNumColor,fontWeight:900,fontSize:20,fontFamily:"'Fredoka One',cursive",animation:"xpPop 1.5s ease forwards",pointerEvents:"none"}}>{xpAnim}</div>}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:5,marginBottom:20,background:t.tabBarBg,borderRadius:18,padding:5,border:`2px solid ${t.tabBarBorder}`}}>
        {TABS.map(([id,emoji,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"9px 2px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:11,background:tab===id?t.tabActive:"transparent",color:tab===id?t.tabActiveColor:t.tabInactiveColor,transition:"all 0.2s",boxShadow:tab===id?t.tabShadow:"none",position:"relative",fontFamily:"inherit"}}>
            <div style={{fontSize:16}}>{emoji}</div>
            <div>{label}</div>
            {id==="badges"&&badgeCount>0&&<span style={{position:"absolute",top:2,right:2,background:t.primary,color:"#fff",borderRadius:"50%",width:15,height:15,fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{badgeCount}</span>}
          </button>
        ))}
      </div>

      {/* LOG */}
      {tab==="log"&&(
        <div style={card}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:t.headingColor,marginBottom:16}}>{t.logTabIcon} Add a purchase</div>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <div style={{flex:1}}><label style={lbl}>Amount ($)</label><input type="number" placeholder="0.00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} style={inp}/></div>
            <div style={{flex:1}}><label style={lbl}>Date</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={inp}/></div>
          </div>
          <div style={{marginBottom:14}}>
            <label style={lbl}>Category <span style={{color:t.secondary,fontStyle:"italic",textTransform:"none",letterSpacing:0}}>+5 XP</span></label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
              {CATEGORIES.map(c=>(
                <button key={c} onClick={()=>setForm(f=>({...f,category:c}))} style={{padding:"8px 4px",borderRadius:12,border:`2px solid ${form.category===c?t.catColors[c]:t.catUnselBorder}`,background:form.category===c?`${t.catColors[c]}20`:t.catUnselBg,color:form.category===c?t.catColors[c]:t.catUnselColor,cursor:"pointer",fontSize:11,fontWeight:700,transition:"all 0.15s",boxShadow:form.category===c?`0 0 12px ${t.catColors[c]}40`:"none",fontFamily:"inherit"}}>
                  <div style={{fontSize:18}}>{CAT_ICONS[c]}</div><div>{c}</div>
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:14}}><label style={lbl}>Note (optional)</label><input type="text" placeholder="What was it for?" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} style={inp}/></div>
          <div style={{display:"flex",gap:8,marginBottom:14,background:t.xpRowBg,borderRadius:12,padding:"10px 14px",border:`1px solid ${t.xpRowBorder}`}}>
            {[["Base","10 XP",0],["Category","5 XP",1],["Today","10 XP",2]].map(([k,v,i])=>(
              <div key={k} style={{flex:1,textAlign:"center"}}>
                <div style={{fontSize:10,color:t.xpRowLabelColor,fontWeight:700}}>{k}</div>
                <div style={{fontSize:14,color:t.xpRowColors[i],fontWeight:900,fontFamily:"'Fredoka One',cursive"}}>+{v}</div>
              </div>
            ))}
          </div>
          <button onClick={addEntry} style={{width:"100%",padding:"14px",background:btnActive?t.btnBgActive:t.btnBg,border:`2px solid ${t.btnBorder}`,borderRadius:16,color:"#fff",fontWeight:900,fontSize:18,cursor:"pointer",fontFamily:"'Fredoka One',cursive",letterSpacing:1,boxShadow:t.btnShadow,transform:btnActive?"scale(0.97)":"scale(1)",transition:"all 0.15s"}}>{t.logBtnText}</button>
        </div>
      )}

      {/* HISTORY */}
      {tab==="history"&&(
        <div style={card}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:t.headingColor,marginBottom:16}}>{entries.length} purchases logged</div>
          {entries.length===0&&<div style={{textAlign:"center",padding:"32px 0",color:t.histEmptyColor}}><div style={{fontSize:40,marginBottom:10}}>{t.emptyIcon}</div><div style={{fontWeight:700}}>{t.emptyText}</div><div style={{fontSize:13,marginTop:6}}>{t.emptySub}</div></div>}
          {entries.slice(0,30).map(e=>(
            <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${t.histDivider}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:`${t.catColors[e.category]}15`,border:`2px solid ${t.catColors[e.category]}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{CAT_ICONS[e.category]}</div>
                <div><div style={{fontWeight:700,fontSize:14}}>{e.note||e.category}</div><div style={{fontSize:12,color:t.histCatText}}>{e.category} · {e.date}</div></div>
              </div>
              <div style={{color:t.xpNumColor,fontWeight:900,fontFamily:"'Fredoka One',cursive",fontSize:16}}>${e.amount.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}

      {/* QUESTS */}
      {tab==="quests"&&(
        <div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:t.headingColor,marginBottom:14}}>{completedQuests.length}/{QUESTS.length} Quests Complete</div>
          {QUESTS.map(q=>{
            const done=completedQuests.includes(q.id);
            return(
              <div key={q.id} style={{padding:"16px",borderRadius:18,background:done?t.questDoneBg:t.cardBg,border:`2px solid ${done?t.questDoneBorder:t.cardBorder}`,marginBottom:10,transition:"all 0.3s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:24}}>{done?"✅":"🔲"}</div>
                    <div><div style={{fontWeight:800,color:done?t.questDoneColor:t.bodyText,fontFamily:"'Fredoka One',cursive",fontSize:16}}>{q.title}</div><div style={{fontSize:12,color:done?t.questDoneDesc:t.subColor,marginTop:2}}>{q.desc}</div></div>
                  </div>
                  <div style={{color:t.xpNumColor,fontWeight:900,fontFamily:"'Fredoka One',cursive",fontSize:18,whiteSpace:"nowrap"}}>+{q.xp} XP</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BADGES */}
      {tab==="badges"&&(
        <div>
          <div style={{...card,padding:"14px 18px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontFamily:"'Fredoka One',cursive",color:t.headingColor,fontSize:20}}>Badge Cabinet</div><div style={{color:t.badgeCountColor,fontSize:12,marginTop:2,fontWeight:600}}>{badgeCount} of {BADGES.length} unlocked</div></div>
              <div style={{display:"flex",gap:8}}>{["common","uncommon","rare","epic"].map(r=>(<div key={r} style={{textAlign:"center"}}><div style={{width:12,height:12,borderRadius:"50%",background:t.rarity[r].border,margin:"0 auto 2px",boxShadow:`0 0 6px ${t.rarity[r].border}`}}/><div style={{fontSize:9,color:t.rarity[r].color,fontWeight:700}}>{r[0].toUpperCase()}</div></div>))}</div>
            </div>
            <div style={{height:8,background:t.badgeBarBg,borderRadius:99,marginTop:12,overflow:"hidden",border:`1px solid ${t.badgeBarBorder}`}}>
              <div style={{height:"100%",width:`${(badgeCount/BADGES.length)*100}%`,background:t.badgeBarGrad,borderRadius:99,transition:"width 0.7s cubic-bezier(.34,1.56,.64,1)",boxShadow:t.badgeBarShadow}}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {sortedBadges.map(b=><BadgeCard key={b.id} badge={b} unlocked={unlockedBadges.includes(b.id)} t={t}/>)}
          </div>
        </div>
      )}

      {/* STATS */}
      {tab==="stats"&&(
        <div>
          <div style={{background:t.statsHeaderBg,backgroundImage:t.statsHeaderBgImg,borderRadius:20,padding:"20px",marginBottom:14,textAlign:"center",boxShadow:`0 8px 32px ${t.primary}30`}}>
            <div style={{color:"#ffffff60",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Total Tracked</div>
            <div style={{color:"#fff",fontFamily:"'Fredoka One',cursive",fontSize:42,lineHeight:1}}>${totalSpent.toFixed(2)}</div>
            <div style={{color:"#ffffff90",fontSize:13,marginTop:6,fontWeight:600}}>{entries.length} purchases logged</div>
          </div>
          {byCategory.length===0&&<div style={{color:t.statsEmptyColor,textAlign:"center",padding:"24px 0",fontWeight:600}}>{t.statsEmptyText}</div>}
          {byCategory.map(({cat,total,count})=>{
            const pct=totalSpent>0?(total/totalSpent)*100:0;
            return(
              <div key={cat} style={{...card,padding:"14px 16px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>{CAT_ICONS[cat]}</span><span style={{fontWeight:800,color:t.statsCatText}}>{cat}</span><span style={{fontSize:12,color:t.statsCatMuted,fontWeight:700}}>×{count}</span></div>
                  <div style={{fontFamily:"'Fredoka One',cursive",color:t.xpNumColor,fontSize:18}}>${total.toFixed(2)}</div>
                </div>
                <div style={{height:8,background:t.badgeBarBg,borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${t.catColors[cat]}99,${t.catColors[cat]})`,borderRadius:99,boxShadow:`0 0 8px ${t.catColors[cat]}70`,transition:"width 0.5s ease"}}/>
                </div>
                <div style={{fontSize:11,color:t.statsCatMuted,marginTop:5,fontWeight:700}}>{pct.toFixed(0)}% of spending</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
