import { useState, useRef, useCallback, useEffect } from "react";

const API = "http://localhost:5000/api";

/* ═══════════════════════════════════════════════════════════════
   LANGUAGE CONTENT
═══════════════════════════════════════════════════════════════ */
const L = {
  ar: {
    dir:"rtl", font:"'Amiri',serif",
    hero: "نظام التعرف الضوئي على الكتابة اليدوية متعدد اللغات",
    sub:  "استخراج إجابات الطلاب بدقة مع الحفاظ التام على المحتوى الأصلي",
    badge:"متعدد اللغات · ذكاء اصطناعي",
    tab1:"استخراج النص", tab2:"تصحيح الامتحان", tab3:"معلومات النظام",
    drop_idle:"اسحب وأفلت صورة ورقة الإجابة هنا",
    drop_active:"أفلت الملف هنا",
    btn_choose:"اختر ملفاً",
    btn_extract:"استخراج النص",
    btn_processing:"جاري الاستخراج...",
    btn_grade:"تصحيح الإجابات",
    btn_grading:"جاري التصحيح...",
    btn_copy:"نسخ النص",
    btn_copied:"تم النسخ ✓",
    btn_new:"ورقة جديدة",
    result_title:"النص المستخرج",
    result_sub:"مستخرج كما هو — دون تعديل أو تصحيح أو توقع",
    grade_title:"نتائج التصحيح",
    qa_ph:"أدخل الأسئلة والإجابات النموذجية لتصحيح الورقة...",
    err:"خطأ في الاتصال بالخادم. تأكد من تشغيل الخادم على المنفذ 5000.",
    steps:["تصحيح هندسي","إزالة ضوضاء","تجزئة","تعرف ضوئي","تنظيف ذكي"],
    sdesc:["DocTr","معالجة صورة","مخطط الأعمدة","ResNet50V2","Gemini"],
    stat_acc:"دقة النموذج", stat_cer:"معدل خطأ الحرف",
    stat_samp:"عينة تدريبية", stat_lang:"لغات مدعومة",
    integrity:"سلامة المحتوى محمية",
    i1:"لا تصحيح إملائي", i2:"لا إعادة صياغة", i3:"لا هلوسة",
    info:[
      {ic:"📐", t:"التصحيح الهندسي",
       b:"DocTr (محول صور الوثائق) يُصحح انحراف الصفحة والتشوهات الهندسية قبل المعالجة"},
      {ic:"🧠", t:"نموذج ResNet50V2",
       b:"مُدرَّب على 108,619 عينة من مجموعة KHATT العربية — دقة 97% — معدل خطأ حرفي 3%"},
      {ic:"✨", t:"التنظيف بالذكاء الاصطناعي",
       b:"Gemini Flash يُنسِّق النص المُستخرج فقط، دون أي تغيير في المضمون أو التهجئة"},
      {ic:"🔗", t:"الحفاظ على التوافق",
       b:"يُحافظ النظام على التوافق بين إجابات الطلاب وأسئلتهم المقابلة في الورقة"},
    ],
  },
  fr: {
    dir:"ltr", font:"'Crimson Pro',serif",
    hero: "Système OCR Multilingue pour Examens Manuscrits",
    sub:  "Extraction précise des réponses étudiantes avec préservation totale du contenu original",
    badge:"Multilingue · IA",
    tab1:"Extraire le texte", tab2:"Corriger l'examen", tab3:"Informations",
    drop_idle:"Glissez-déposez une feuille d'examen scannée",
    drop_active:"Déposez le fichier ici",
    btn_choose:"Choisir un fichier",
    btn_extract:"Extraire le texte",
    btn_processing:"Traitement...",
    btn_grade:"Corriger les réponses",
    btn_grading:"Correction en cours...",
    btn_copy:"Copier",
    btn_copied:"Copié ✓",
    btn_new:"Nouvelle feuille",
    result_title:"Texte extrait",
    result_sub:"Extrait tel quel — sans modification, correction ou prédiction",
    grade_title:"Résultats de correction",
    qa_ph:"Entrez les questions avec leurs réponses modèles...",
    err:"Erreur de connexion au serveur. Vérifiez que le serveur tourne sur le port 5000.",
    steps:["Correction géo.","Débruitage","Segmentation","Reconnaissance","Nettoyage IA"],
    sdesc:["DocTr","Traitement img","Histogramme","ResNet50V2","Gemini"],
    stat_acc:"Précision", stat_cer:"Taux d'erreur",
    stat_samp:"Échantillons", stat_lang:"Langues",
    integrity:"Intégrité du contenu préservée",
    i1:"Pas de correction", i2:"Pas de reformulation", i3:"Pas d'hallucination",
    info:[
      {ic:"📐", t:"Correction géométrique",
       b:"DocTr redresse les pages déformées et corrige les distorsions géométriques"},
      {ic:"🧠", t:"Modèle ResNet50V2",
       b:"Entraîné sur 108 619 échantillons KHATT — précision 97% — CER 3%"},
      {ic:"✨", t:"Nettoyage IA",
       b:"Gemini Flash formate uniquement le texte extrait sans modifier le contenu"},
      {ic:"🔗", t:"Alignement Q&R",
       b:"Le système maintient l'alignement entre les réponses et les questions correspondantes"},
    ],
  },
  en: {
    dir:"ltr", font:"'DM Serif Display',serif",
    hero: "Multilingual Handwritten Exam OCR Solution",
    sub:  "High-accuracy extraction of student answers with strict preservation of original content",
    badge:"Multilingual · AI-Powered",
    tab1:"Extract Text", tab2:"Grade Exam", tab3:"System Info",
    drop_idle:"Drag & drop a scanned answer sheet here",
    drop_active:"Drop the file here",
    btn_choose:"Choose File",
    btn_extract:"Extract Text",
    btn_processing:"Processing...",
    btn_grade:"Grade Answers",
    btn_grading:"Grading...",
    btn_copy:"Copy Text",
    btn_copied:"Copied ✓",
    btn_new:"New Sheet",
    result_title:"Extracted Text",
    result_sub:"Extracted as-is — no modification, correction, or prediction",
    grade_title:"Grading Results",
    qa_ph:"Enter questions with their model answers for grading...",
    err:"Backend connection error. Ensure the server is running on port 5000.",
    steps:["Geo Correction","Denoising","Segmentation","OCR","AI Cleanup"],
    sdesc:["DocTr","Image proc.","Histogram","ResNet50V2","Gemini"],
    stat_acc:"Accuracy", stat_cer:"Char Error Rate",
    stat_samp:"Training Samples", stat_lang:"Languages",
    integrity:"Content Integrity Preserved",
    i1:"No spell correction", i2:"No rephrasing", i3:"No hallucination",
    info:[
      {ic:"📐", t:"Geometric Correction",
       b:"DocTr (Document Image Transformer) corrects page skew and geometric distortions before processing"},
      {ic:"🧠", t:"ResNet50V2 Model",
       b:"Trained on 108,619 KHATT Arabic samples — 97% accuracy — 3% Character Error Rate"},
      {ic:"✨", t:"AI Cleanup",
       b:"Gemini Flash formats only the extracted text without modifying any content or spelling"},
      {ic:"🔗", t:"Q&A Alignment",
       b:"The system preserves alignment between student answers and their corresponding exam questions"},
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function toB64(file) {
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result.split(",")[1]);
    r.onerror=rej;
    r.readAsDataURL(file);
  });
}

/* ═══════════════════════════════════════════════════════════════
   MINI ICONS
═══════════════════════════════════════════════════════════════ */
const IconUp   = ()=><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconChk  = ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconShld = ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

/* ═══════════════════════════════════════════════════════════════
   PIPELINE STEP
═══════════════════════════════════════════════════════════════ */
function PStep({icon,label,desc,active,done}){
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,
      opacity:done||active?1:0.28,transition:"opacity .4s"}}>
      <div style={{width:42,height:42,borderRadius:"50%",fontSize:17,
        display:"flex",alignItems:"center",justifyContent:"center",
        background:done?"var(--g)":active?"rgba(201,168,76,.18)":"rgba(255,255,255,.05)",
        border:`2px solid ${done||active?"var(--g)":"rgba(255,255,255,.1)"}`,
        boxShadow:active?"0 0 16px rgba(201,168,76,.5)":"none",
        transition:"all .3s",position:"relative"}}>
        {done?<IconChk/>:icon}
        {active&&<div style={{position:"absolute",inset:-5,borderRadius:"50%",
          border:"2px solid var(--g)",opacity:.4,animation:"ring 1.1s ease-out infinite"}}/>}
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:9,fontWeight:700,color:done||active?"var(--g)":"var(--mut)",
          letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>{label}</div>
        <div style={{fontSize:8,color:"var(--mut)",marginTop:1}}>{desc}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function App(){
  const [lang,setLang]       = useState("ar");
  const [tab,setTab]         = useState("ocr");
  const [file,setFile]       = useState(null);
  const [preview,setPreview] = useState(null);
  const [phase,setPhase]     = useState("idle"); // idle|proc|done|grade|graded|err
  const [step,setStep]       = useState(-1);
  const [text,setText]       = useState("");
  const [timing,setTiming]   = useState(null);
  const [qa,setQa]           = useState("");
  const [grades,setGrades]   = useState("");
  const [copied,setCopied]   = useState(false);
  const [drag,setDrag]       = useState(false);
  const [ready,setReady]     = useState(false);
  const inputRef = useRef();
  const T = L[lang];
  const ICONS = ["📐","🔍","✂️","🧠","✨"];

  useEffect(()=>{ setTimeout(()=>setReady(true),100); },[]);

  const loadFile = useCallback(f=>{
    if(!f||!f.type.startsWith("image/"))return;
    setFile(f); setPreview(URL.createObjectURL(f));
    setPhase("idle"); setText(""); setGrades(""); setStep(-1); setTiming(null);
  },[]);

  const extract = async()=>{
    if(!file)return;
    setPhase("proc"); setText(""); setGrades(""); setTiming(null);
    try{
      const b64 = await toB64(file);
      for(let i=0;i<4;i++){setStep(i);await new Promise(r=>setTimeout(r,650));}
      setStep(4);
      const res  = await fetch(`${API}/ocr`,{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({image:b64,lang})});
      const data = await res.json();
      if(data.error)throw new Error(data.error);
      setText(data.text); setTiming(data.processing_time); setPhase("done");
    }catch{setPhase("err");}
    setStep(-1);
  };

  const grade = async()=>{
    if(!text)return;
    setPhase("grade");
    try{
      const res  = await fetch(`${API}/grade`,{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ocr_text:text,questions_answers:qa})});
      const data = await res.json();
      setGrades(data.grades||data.review||"—");
      setPhase("graded");
    }catch{setPhase("err");}
  };

  const reset = ()=>{
    setFile(null);setPreview(null);setPhase("idle");
    setText("");setGrades("");setStep(-1);setTiming(null);
  };

  const copy = ()=>{
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  const busy = phase==="proc"||phase==="grade";

  /* ── styles ── */
  const s = {
    app:{minHeight:"100vh",background:"radial-gradient(ellipse 70% 50% at 15% -5%,rgba(201,168,76,.07) 0%,transparent 55%),radial-gradient(ellipse 50% 35% at 85% 105%,rgba(42,157,143,.05) 0%,transparent 50%),var(--bg)",direction:T.dir,fontFamily:T.font,position:"relative",zIndex:1},
    nav:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 36px",borderBottom:"1px solid var(--border)",backdropFilter:"blur(12px)",background:"rgba(7,7,14,.88)",position:"sticky",top:0,zIndex:100,direction:"ltr"},
    hero:{textAlign:"center",padding:"60px 24px 44px",maxWidth:820,margin:"0 auto",opacity:ready?1:0,transform:ready?"none":"translateY(18px)",transition:"all .7s ease"},
    card:{background:"var(--surf)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"},
    cb:{padding:22},
    main:{maxWidth:980,margin:"0 auto",padding:"0 20px 72px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"start"},
  };

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,600;1,300&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;600&display=swap');
        :root{
          --bg:#07070e;--surf:#10101c;--surf2:#171726;
          --g:#C9A84C;--gl:#e8c96e;--gd:rgba(201,168,76,.13);
          --cream:#ede4d2;--mut:#625d7a;--text:#ddd4c2;
          --border:rgba(201,168,76,.1);
        }
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:var(--bg);color:var(--text)}
        /* NAV */
        .logo{display:flex;align-items:center;gap:9px}
        .logo-g{font-family:'Amiri',serif;font-size:28px;color:var(--g);line-height:1}
        .logo-t{font-size:11px;font-weight:700;color:var(--mut);letter-spacing:.14em;text-transform:uppercase;font-family:'JetBrains Mono',monospace}
        .lsw{display:flex;gap:4px;background:var(--surf);padding:4px;border-radius:50px;border:1px solid var(--border)}
        .lb{padding:6px 14px;border-radius:40px;border:none;cursor:pointer;font-size:11px;font-weight:700;transition:all .2s;font-family:'JetBrains Mono',monospace;background:transparent;color:var(--mut)}
        .lb.on{background:var(--g);color:#07070e;box-shadow:0 2px 9px rgba(201,168,76,.28)}
        .lb:hover:not(.on){color:var(--g)}
        /* HERO */
        .badge{display:inline-flex;align-items:center;gap:6px;padding:5px 15px;
          background:var(--gd);border:1px solid rgba(201,168,76,.2);border-radius:50px;
          font-size:10px;color:var(--g);letter-spacing:.1em;text-transform:uppercase;
          margin-bottom:22px;font-family:'JetBrains Mono',monospace}
        .bdot{width:5px;height:5px;border-radius:50%;background:var(--g);animation:blink 2s infinite}
        .hero-h{font-size:clamp(26px,4vw,46px);font-weight:700;line-height:1.22;margin-bottom:14px;
          background:linear-gradient(135deg,var(--cream),var(--gl));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .hero-s{font-size:clamp(13px,1.7vw,16px);color:var(--mut);max-width:560px;margin:0 auto;line-height:1.75;font-style:italic}
        /* STATS */
        .stats{display:flex;justify-content:center;max-width:620px;margin:36px auto 0;
          border:1px solid var(--border);border-radius:14px;overflow:hidden;direction:ltr}
        .stat{flex:1;text-align:center;padding:16px 8px;border-right:1px solid var(--border);background:var(--surf)}
        .stat:last-child{border-right:none}
        .sv{font-size:24px;font-weight:700;color:var(--g);font-family:'JetBrains Mono',monospace}
        .sl{font-size:9px;color:var(--mut);margin-top:3px;text-transform:uppercase;letter-spacing:.07em;font-family:'JetBrains Mono',monospace}
        /* CARD HEADER */
        .ch{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px}
        .cdot{width:7px;height:7px;border-radius:50%;background:var(--g);box-shadow:0 0 7px var(--g)}
        .ct{font-size:13px;font-weight:700;color:var(--cream)}
        .cs{font-size:10px;color:var(--mut);margin-top:1px}
        /* TABS */
        .tabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:18px;direction:ltr}
        .tab{padding:9px 18px;border:none;background:transparent;cursor:pointer;
          font-size:12px;font-weight:700;color:var(--mut);border-bottom:2px solid transparent;
          transition:all .2s;font-family:'JetBrains Mono',monospace;margin-bottom:-1px}
        .tab.on{color:var(--g);border-bottom-color:var(--g)}
        /* DROP ZONE */
        .dz{border:2px dashed var(--border);border-radius:11px;padding:34px 16px;
          text-align:center;cursor:pointer;transition:all .2s;color:var(--mut)}
        .dz:hover,.dz.over{border-color:rgba(201,168,76,.38);background:rgba(201,168,76,.04)}
        .dz.over{border-color:var(--g);background:var(--gd)}
        .dt{font-size:14px;color:var(--text);margin-bottom:12px}
        .ub{padding:7px 18px;background:var(--gd);border:1px solid rgba(201,168,76,.25);
          border-radius:7px;color:var(--g);font-size:12px;font-weight:700;cursor:pointer;transition:all .2s}
        .ub:hover{background:rgba(201,168,76,.2)}
        .prev{width:100%;border-radius:9px;max-height:200px;object-fit:cover;border:1px solid var(--border);margin-bottom:12px}
        .pn{font-size:10px;color:var(--mut);margin-bottom:12px;text-align:center;font-family:'JetBrains Mono',monospace}
        /* PIPELINE */
        .pipe{display:flex;align-items:flex-start;gap:2px;padding:16px 0 4px;direction:ltr}
        /* MAIN BTN */
        .pb{width:100%;padding:12px;background:linear-gradient(135deg,var(--g),var(--gl));
          border:none;border-radius:9px;color:#07070e;font-size:14px;font-weight:700;
          cursor:pointer;transition:all .2s;letter-spacing:.03em;margin-top:6px;
          font-family:'JetBrains Mono',monospace}
        .pb:disabled{opacity:.45;cursor:not-allowed}
        .pb:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(201,168,76,.3)}
        /* RESULT TEXT */
        .rt{white-space:pre-wrap;word-break:break-word;min-height:140px;max-height:300px;
          overflow-y:auto;padding:14px;background:rgba(0,0,0,.26);border-radius:9px;
          border:1px solid var(--border);line-height:1.9;color:var(--cream)}
        .rt::-webkit-scrollbar{width:3px}
        .rt::-webkit-scrollbar-thumb{background:var(--gd);border-radius:3px}
        /* BADGES */
        .ibs{display:flex;gap:6px;margin-top:11px;flex-wrap:wrap;direction:ltr}
        .ib{display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:50px;
          font-size:9px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;font-family:'JetBrains Mono',monospace}
        .ibg{background:var(--gd);color:var(--g);border:1px solid rgba(201,168,76,.2)}
        .ibt{background:rgba(42,157,143,.12);color:#2dd4bf;border:1px solid rgba(42,157,143,.2)}
        /* ACTIONS */
        .ar{display:flex;gap:8px;margin-top:12px;direction:ltr}
        .cb2{flex:1;padding:9px;background:var(--gd);border:1px solid rgba(201,168,76,.2);
          border-radius:7px;color:var(--g);font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;font-family:'JetBrains Mono',monospace}
        .cb2:hover{background:rgba(201,168,76,.19)}
        .nb{flex:1;padding:9px;background:transparent;border:1px solid var(--border);
          border-radius:7px;color:var(--mut);font-size:11px;cursor:pointer;transition:all .2s;font-family:'JetBrains Mono',monospace}
        .nb:hover{border-color:rgba(255,255,255,.17);color:var(--text)}
        /* TEXTAREA */
        .qa{width:100%;min-height:110px;padding:11px;background:rgba(0,0,0,.26);
          border:1px solid var(--border);border-radius:9px;color:var(--cream);
          font-size:12px;line-height:1.6;resize:vertical;font-family:'JetBrains Mono',monospace;margin-bottom:10px}
        .qa:focus{outline:none;border-color:rgba(201,168,76,.38)}
        /* INFO STEPS */
        .ip{display:flex;flex-direction:column;gap:10px}
        .is{display:flex;gap:11px;align-items:flex-start;padding:13px;background:rgba(0,0,0,.2);border-radius:9px;border:1px solid var(--border);direction:ltr}
        .ii{font-size:20px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:var(--gd);border-radius:7px;flex-shrink:0}
        .it{font-size:11px;font-weight:700;color:var(--cream);margin-bottom:3px;font-family:'JetBrains Mono',monospace}
        .ib2{font-size:10px;color:var(--mut);line-height:1.55}
        /* ERR */
        .err{margin-top:9px;padding:9px 12px;background:rgba(239,68,68,.09);border:1px solid rgba(239,68,68,.18);border-radius:7px;font-size:11px;color:#f87171}
        /* TIMING */
        .tm{font-size:9px;color:var(--mut);margin-bottom:7px;font-family:'JetBrains Mono',monospace;direction:ltr}
        /* BG GLYPH */
        .bgg{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
          font-family:'Amiri',serif;font-size:280px;color:rgba(201,168,76,.02);
          user-select:none;pointer-events:none;z-index:0;line-height:1}
        /* SPINNER */
        .sp{width:13px;height:13px;border:2px solid rgba(7,7,14,.3);border-top-color:#07070e;
          border-radius:50%;display:inline-block;animation:spin .7s linear infinite;
          vertical-align:middle;margin-right:6px}
        @media(max-width:680px){.main-grid{grid-template-columns:1fr!important}}
        @keyframes ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.5);opacity:0}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      <div className="bgg" aria-hidden>ض</div>
      <div style={s.app}>

        {/* ── NAV ── */}
        <nav style={s.nav}>
          <div className="logo">
            <div className="logo-g">ض</div>
            <div className="logo-t">Digital-Ḍād · OCR</div>
          </div>
          <div className="lsw">
            {["ar","fr","en"].map(l=>(
              <button key={l} className={`lb ${lang===l?"on":""}`} onClick={()=>setLang(l)}>
                {l==="ar"?"عربي":l==="fr"?"FR":"EN"}
              </button>
            ))}
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={s.hero}>
          <div className="badge"><div className="bdot"/>{T.badge}</div>
          <h1 className="hero-h">{T.hero}</h1>
          <p className="hero-s">{T.sub}</p>
          <div className="stats">
            {[[`97%`,T.stat_acc],[`3%`,T.stat_cer],[`108K`,T.stat_samp],[`3`,T.stat_lang]].map(([v,l])=>(
              <div key={l} className="stat"><div className="sv">{v}</div><div className="sl">{l}</div></div>
            ))}
          </div>
        </section>

        {/* ── MAIN ── */}
        <main style={s.main} className="main-grid">

          {/* LEFT: Upload */}
          <div style={s.card}>
            <div className="ch"><div className="cdot"/><div className="ct">{T.tab1}</div></div>
            <div style={s.cb}>
              {!preview?(
                <div className={`dz ${drag?"over":""}`}
                  onDragOver={e=>{e.preventDefault();setDrag(true)}}
                  onDragLeave={()=>setDrag(false)}
                  onDrop={e=>{e.preventDefault();setDrag(false);loadFile(e.dataTransfer.files[0])}}
                  onClick={()=>inputRef.current.click()}>
                  <div style={{color:"var(--g)",marginBottom:10,opacity:.85}}><IconUp/></div>
                  <div className="dt">{drag?T.drop_active:T.drop_idle}</div>
                  <button className="ub" onClick={e=>{e.stopPropagation();inputRef.current.click()}}>{T.btn_choose}</button>
                  <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>loadFile(e.target.files[0])}/>
                </div>
              ):(
                <>
                  <img src={preview} className="prev" alt="preview"/>
                  <div className="pn">{file.name}</div>
                </>
              )}

              {phase!=="idle"&&(
                <div className="pipe">
                  {T.steps.map((s,i)=>(
                    <PStep key={i} icon={ICONS[i]} label={s} desc={T.sdesc[i]}
                      active={step===i} done={phase==="done"||phase==="graded"||phase==="grade"||step>i}/>
                  ))}
                </div>
              )}

              <button className="pb" disabled={!file||busy} onClick={extract}>
                {phase==="proc"?<><span className="sp"/>{T.btn_processing}</>:T.btn_extract}
              </button>

              {phase==="err"&&<div className="err">{T.err}</div>}
            </div>
          </div>

          {/* RIGHT: Results / Info */}
          <div style={s.card}>
            <div className="ch"><div className="cdot"/>
              <div>
                <div className="ct">{phase==="done"||phase==="graded"||phase==="grade"?T.result_title:T.tab3}</div>
                {(phase==="done"||phase==="graded"||phase==="grade")&&<div className="cs">{T.result_sub}</div>}
              </div>
            </div>
            <div style={s.cb}>

              {/* Tabs */}
              {(phase==="done"||phase==="graded"||phase==="grade")&&(
                <div className="tabs">
                  <button className={`tab ${tab==="ocr"?"on":""}`} onClick={()=>setTab("ocr")}>{T.tab1}</button>
                  <button className={`tab ${tab==="grade"?"on":""}`} onClick={()=>setTab("grade")}>{T.tab2}</button>
                  <button className={`tab ${tab==="info"?"on":""}`} onClick={()=>setTab("info")}>{T.tab3}</button>
                </div>
              )}

              {/* OCR result */}
              {(phase==="done"||phase==="graded"||phase==="grade")&&tab==="ocr"&&(
                <>
                  {timing&&<div className="tm">⏱ {timing}s · {file?.name}</div>}
                  <div className="rt" style={{
                    fontFamily:lang==="ar"?"'Amiri',serif":"'JetBrains Mono',monospace",
                    fontSize:lang==="ar"?"17px":"12px",
                    direction:T.dir,textAlign:T.dir==="rtl"?"right":"left"
                  }}>{text}</div>
                  <div className="ibs">
                    <div className="ib ibg"><IconShld/>&nbsp;{T.integrity}</div>
                    {[T.i1,T.i2,T.i3].map(b=><div key={b} className="ib ibt"><IconChk/>&nbsp;{b}</div>)}
                  </div>
                  <div className="ar">
                    <button className="cb2" onClick={copy}>{copied?T.btn_copied:T.btn_copy}</button>
                    <button className="nb" onClick={reset}>{T.btn_new}</button>
                  </div>
                </>
              )}

              {/* Grade tab */}
              {(phase==="done"||phase==="graded"||phase==="grade")&&tab==="grade"&&(
                <>
                  <textarea className="qa" placeholder={T.qa_ph}
                    value={qa} onChange={e=>setQa(e.target.value)}/>
                  <button className="pb" style={{marginTop:0}} disabled={busy} onClick={grade}>
                    {phase==="grade"?<><span className="sp"/>{T.btn_grading}</>:T.btn_grade}
                  </button>
                  {grades&&(
                    <>
                      <div style={{marginTop:12,fontSize:11,fontWeight:700,color:"var(--g)",
                        fontFamily:"'JetBrains Mono',monospace",marginBottom:7}}>{T.grade_title}</div>
                      <div className="rt" style={{direction:"ltr",textAlign:"left",fontSize:12,
                        fontFamily:"'JetBrains Mono',monospace"}}>{grades}</div>
                    </>
                  )}
                </>
              )}

              {/* Info tab or idle state */}
              {(tab==="info"||(phase==="idle"&&tab!=="grade"))&&(
                <div className="ip">
                  {T.info.map(({ic,t,b})=>(
                    <div key={t} className="is">
                      <div className="ii">{ic}</div>
                      <div><div className="it">{t}</div><div className="ib2">{b}</div></div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
