import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// MATRIX360 — HYBRID INTELLIGENCE OS v3.1 — MOBILE FIRST
// ═══════════════════════════════════════════════════════════════════════════

const MODEL = "claude-sonnet-4-20250514";
const TODAY = new Date("2026-05-11");
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
const daysFrom = (d) => Math.ceil((new Date(d)-TODAY)/(1000*60*60*24));
const addDays = (n) => { const d=new Date(TODAY); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };

const C = {
  bg:"#f0f4f2", surface:"#ffffff", border:"#dde8e0",
  text:"#0d1a12", textMid:"#2d4437", textSoft:"#5a7a68", textFaint:"#8aa898",
  teal:"#0a7c55", tealBg:"#e6f4ef", tealMid:"#b3d9cc",
  red:"#8a1a2e", redBg:"#fdf0f2",
  amber:"#7a4e08", amberBg:"#fdf3e3",
  blue:"#1a4a8a", blueBg:"#e8f0f9",
  purple:"#5a1a8a", purpleBg:"#f3ecfa",
  green:"#1a6a2a", greenBg:"#e6f4eb",
  shadow:"0 1px 3px rgba(0,0,0,0.07)", shadowMd:"0 4px 20px rgba(0,0,0,0.12)",
};

const COPILOTS = {
  patent:     { id:"patent",    label:"Patent & IP",       icon:"📄", color:"#7a4e08", bg:"#fdf3e3", avatar:"⚖",  title:"IP Strategy Advisor",
    brief:`You are the Matrix360 Patent & IP Co-Pilot — specialist IP strategy advisor. HIOF V5.4 patent filed in Ramjit Ray's personal name as inventor. 20 claims, 4 independent claims, dual-use PFS(c) Brier-score calibration (Claim 3) is strongest. David is the US patent attorney. India absolute novelty rules apply — May 15 launch risk is critical. Corporate assignment to Delaware is a separate step. Speak like a trusted patent attorney who also understands the business.` },
  platform:   { id:"platform",  label:"Platform & Tech",   icon:"⚙",  color:"#1a4a8a", bg:"#e8f0f9", avatar:"🔧", title:"Engineering Advisor",
    brief:`You are the Matrix360 Platform & Tech Co-Pilot — senior engineering advisor. Full HIOF V5.4 architecture: Kafka Signal Bus (102), LangGraph 7 agents, Pinecone vector DB, LlamaIndex RAG, FastAPI WebSocket, OPA governance, DSPy CLLE. Four sector dashboards complete: Arjas Steel, VitalGrain, Sharma Precision, MSME. Hiring pipeline: Lead AI Engineer and Data Engineer are critical path. RAGAS target 85%+. Speak like a senior CTO who has shipped production AI systems.` },
  gtm:        { id:"gtm",       label:"Revenue & GTM",     icon:"📈", color:"#0a7c55", bg:"#e6f4ef", avatar:"🎯", title:"Growth Advisor",
    brief:`You are the Matrix360 Revenue & GTM Co-Pilot — B2B enterprise sales strategist. Auto Components cluster (Pune, Gurgaon, Chennai) is primary target. 5-touch outreach sequence and 8-post content calendar ready. ICP: Founder-CFO, Ops Head, Startup COO/CFO. Pilot strategy: 3-month, 50% price, case study in return. Discovery call framework: 3 questions, no pitch. Speak like a seasoned B2B SaaS sales leader.` },
  governance: { id:"governance",label:"Governance & Legal", icon:"🔒", color:"#8a1a2e", bg:"#fdf0f2", avatar:"🛡", title:"Compliance Advisor",
    brief:`You are the Matrix360 Governance & Legal Co-Pilot — vCISO and compliance specialist. Critical gaps: Anthropic DPA unsigned, IRP not written, client DPA template missing. SOC 2 Type II programme needs vCISO to start. AES-256/TLS 1.3 encryption standard required. Delaware C Corp replacing Dubai DIFC. India PDPB and CCPA compliance required. Speak like a battle-tested vCISO.` },
  strategy:   { id:"strategy",  label:"Strategy & Capital",icon:"💼", color:"#5a1a8a", bg:"#f3ecfa", avatar:"🧭", title:"Strategic Advisor",
    brief:`You are the Matrix360 Strategy & Capital Co-Pilot — board-level strategic advisor. Three business units: Innovation Lab, Academy, Consulting. Eight sector verticals. Delaware C Corp primary entity, Dubai DIFC deprioritised (MENA instability). Investor strategy: India angels first, US seed after Delaware incorporation. Ramjit Ray: TEDx speaker, author (HI Volume I + II), Indian philosophy + AI governance thought leader. Speak like a trusted board advisor.` },
};

const DELEGATION = {
  HC:{ label:"You Only",         code:"HC", color:C.red,   bg:C.redBg,   desc:"Only you can decide and execute this." },
  HS:{ label:"AI Drafts, You Approve", code:"HS", color:C.amber, bg:C.amberBg, desc:"AI prepares the deliverable. You review and approve before it is used." },
  AI:{ label:"AI Executes",      code:"AI", color:C.teal,  bg:C.tealBg,  desc:"AI executes autonomously within governance parameters. You see the outcome." },
};

const TS = {
  waiting:   {label:"Waiting",        color:"#6b7280",bg:"#f3f4f6",dot:"#9ca3af"},
  active:    {label:"Action Needed",  color:C.amber,  bg:C.amberBg,dot:"#f59e0b"},
  inprogress:{label:"In Progress",    color:C.blue,   bg:C.blueBg, dot:"#60a5fa"},
  airunning: {label:"AI Running",     color:C.teal,   bg:C.tealBg, dot:"#14b8a6"},
  review:    {label:"Review Output",  color:C.purple, bg:C.purpleBg,dot:"#a78bfa"},
  done:      {label:"Done",           color:C.green,  bg:C.greenBg,dot:"#22c55e"},
  overdue:   {label:"Overdue",        color:C.red,    bg:C.redBg,  dot:"#ef4444"},
  blocked:   {label:"Blocked",        color:C.red,    bg:C.redBg,  dot:"#dc2626"},
};

const DS = {
  pending:  {label:"Pending",   dot:"#f59e0b",color:C.amber, bg:C.amberBg},
  approved: {label:"Approved",  dot:"#22c55e",color:C.teal,  bg:C.tealBg},
  executing:{label:"Executing", dot:"#14b8a6",color:"#1a6a6a",bg:"#e6f7f7"},
  deferred: {label:"Deferred",  dot:"#a78bfa",color:C.purple,bg:C.purpleBg},
  done:     {label:"Complete",  dot:"#9ca3af",color:C.textSoft,bg:C.bg},
  blocked:  {label:"Blocked",   dot:"#ef4444",color:C.red,   bg:C.redBg},
};

const URG = {
  critical:{label:"Critical",color:C.red,  bg:C.redBg,  rank:1},
  high:    {label:"High",    color:C.amber,bg:C.amberBg,rank:2},
  medium:  {label:"Medium",  color:C.blue, bg:C.blueBg, rank:3},
  low:     {label:"Low",     color:C.textSoft,bg:C.bg,  rank:4},
};

const DOMAINS = [
  {id:"all",label:"All",icon:"◎",color:C.textMid},
  {id:"patent",label:"Patent",icon:"📄",color:"#7a4e08"},
  {id:"platform",label:"Platform",icon:"⚙",color:C.blue},
  {id:"sector",label:"Sectors",icon:"📊",color:C.purple},
  {id:"security",label:"Security",icon:"🔒",color:C.red},
  {id:"team",label:"Team",icon:"👥",color:"#1a6a6a"},
  {id:"gtm",label:"GTM",icon:"📈",color:C.teal},
  {id:"academy",label:"Academy",icon:"🎓",color:"#6a4a1a"},
  {id:"corporate",label:"Corporate",icon:"🏢",color:"#3a3a7a"},
  {id:"investor",label:"Investor",icon:"💼",color:"#1a5a5a"},
  {id:"content",label:"Content",icon:"✍",color:"#4a1a6a"},
];

const HIOF_LAYERS = {
  "102":{label:"Signal Bus",zone:"Signal",color:C.blue},
  "200":{label:"UCII",zone:"Signal",color:C.blue},
  "300":{label:"POIM",zone:"Cognitive",color:C.purple},
  "206":{label:"Capability Gap",zone:"Cognitive",color:C.purple},
  "500":{label:"CLLE",zone:"Cognitive",color:C.purple},
  "700":{label:"Governance",zone:"Governance",color:C.teal},
  "208":{label:"Delegation Engine",zone:"Governance",color:C.teal},
  "404":{label:"Execution",zone:"Governance",color:C.teal},
  "405":{label:"Outcome + Audit",zone:"Governance",color:C.teal},
};

const DOC_TYPES=[
  {id:"patent",label:"Patent & IP",icon:"📄",color:"#7a4e08"},
  {id:"legal",label:"Legal",icon:"⚖",color:C.red},
  {id:"technical",label:"Technical",icon:"⚙",color:C.blue},
  {id:"dashboard",label:"Dashboard",icon:"📊",color:C.purple},
  {id:"compliance",label:"Compliance",icon:"🔒",color:"#0a5c3c"},
  {id:"gtm",label:"GTM & Sales",icon:"📈",color:C.teal},
  {id:"content",label:"Content",icon:"✍",color:"#4a1a6a"},
  {id:"financial",label:"Financial",icon:"💼",color:"#1a5a5a"},
  {id:"process",label:"Process",icon:"◎",color:C.textSoft},
];

const mkTask=(id,title,owner,dueDays,depId=null,notes="")=>({
  id,title,owner,dueDate:addDays(dueDays),dependsOn:depId,status:"waiting",notes,aiOutput:"",completedAt:null,
});

const DECISIONS=[
  {id:"P001",domain:"patent",urgency:"critical",status:"pending",delegation:"HC",hiofLayer:"700",confidence:99,copilot:"patent",
   title:"Confirm India Provisional Patent Filing Date",
   stake:"India absolute novelty — public disclosure before filing voids patent permanently. May 15 is 4 days away.",
   context:"Call David today. Confirm exact India provisional filing date. If not yet filed, launch must move to soft-only (known contacts, no press).",
   capabilityGap:"No written confirmation of India filing date exists.",
   taskSchedule:[
     mkTask("P001-T1","Call David — confirm exact India provisional filing date","HC",0,null,"Do this today. Not tomorrow."),
     mkTask("P001-T2","Get written confirmation by email from David","HC",0,"P001-T1"),
     mkTask("P001-T3","If unfiled: move to soft launch immediately","HC",0,"P001-T2","Known contacts only — no press, no public social."),
     mkTask("P001-T4","If filed: confirm May 15 full launch is legally safe","HC",1,"P001-T2"),
   ]},
  {id:"P002",domain:"patent",urgency:"critical",status:"pending",delegation:"HC",hiofLayer:"700",confidence:99,copilot:"patent",
   title:"Approve HIOF V5.4 US Provisional Patent for Filing",
   stake:"Filing before May 15 secures 12-month priority window. Missing = starting US patent over.",
   context:"20 claims, 11 drawings ready. Read Claim 1 (system) and Claim 3 (dual-use PFS(c)) yourself. Patent in Ramjit Ray's personal name as inventor.",
   capabilityGap:"Your written approval is the only missing element.",
   taskSchedule:[
     mkTask("P002-T1","Read Claim 1 (system claim) — full review","HC",0,null,"Defines the entire patent scope."),
     mkTask("P002-T2","Read Claim 3 (dual-use PFS(c) Brier-score) — your strongest claim","HC",0,"P002-T1"),
     mkTask("P002-T3","Call David if any language seems incorrect","HC",0,"P002-T2"),
     mkTask("P002-T4","Send written email approval to David","HC",0,"P002-T3"),
     mkTask("P002-T5","Pay USPTO filing fee when David requests","HC",1,"P002-T4"),
     mkTask("P002-T6","Save USPTO receipt in Legal Documents folder","HC",1,"P002-T5"),
   ]},
  {id:"S001",domain:"security",urgency:"critical",status:"pending",delegation:"HC",hiofLayer:"700",confidence:99,copilot:"governance",
   title:"Sign Anthropic Enterprise DPA",
   stake:"Client data reaches Anthropic API with no contract. Enterprise security review will find this on day one.",
   context:"Go to anthropic.com/enterprise. Request and sign the Enterprise DPA. AI then updates Data Security document to name Anthropic as sub-processor and fixes encryption language.",
   capabilityGap:"DPA unsigned. Sub-processor disclosure absent from all documentation.",
   taskSchedule:[
     mkTask("S001-T1","Go to anthropic.com/enterprise — request Enterprise DPA","HC",0,null,"Takes 10 minutes. Do before anything else today."),
     mkTask("S001-T2","Review and sign the DPA","HC",0,"S001-T1","Read Section 3 (data processing) and Section 7 (sub-processors)."),
     mkTask("S001-T3","Save signed DPA in Legal/Contracts/Anthropic/","HC",0,"S001-T2"),
     mkTask("S001-T4","AI updates Data Security document — adds Anthropic as named sub-processor","AI",0,"S001-T3"),
     mkTask("S001-T5","AI generates updated Data Security document v2.1","AI",0,"S001-T4"),
   ]},
  {id:"S002",domain:"security",urgency:"critical",status:"pending",delegation:"HC",hiofLayer:"700",confidence:94,copilot:"governance",
   title:"Hire Virtual CISO on Retainer",
   stake:"SOC 2 observation clock cannot start without vCISO. Every week of delay = one week added to US enterprise market entry.",
   context:"vCISO selects Vanta/Drata, manages CPA audit, runs weekly compliance reviews. Budget: 3,000–8,000 USD/month.",
   capabilityGap:"vCISO role unfilled. SOC 2 programme blocked.",
   taskSchedule:[
     mkTask("S002-T1","AI drafts vCISO job brief and search criteria","AI",0),
     mkTask("S002-T2","Search LinkedIn — message 5 vCISO candidates","HC",1,"S002-T1","Ask: Name the CPA firm you used for SOC 2 Type II."),
     mkTask("S002-T3","Interview shortlisted candidates","HC",3,"S002-T2"),
     mkTask("S002-T4","Negotiate and execute retainer agreement","HC",5,"S002-T3"),
     mkTask("S002-T5","vCISO connects compliance platform — SOC 2 clock starts","HS",7,"S002-T4"),
   ]},
  {id:"C001",domain:"corporate",urgency:"critical",status:"pending",delegation:"HC",hiofLayer:"700",confidence:91,copilot:"strategy",
   title:"Incorporate Delaware C Corp — Primary IP and Investor Entity",
   stake:"Entity structure gates investor conversations, IP assignment, and Series A readiness.",
   context:"Delaware C Corp replaces Dubai DIFC (MENA deprioritised). India Pvt Ltd for operations. Patent in Ramjit Ray's personal name — corporate assignment is a separate legal step.",
   capabilityGap:"Neither entity incorporated. No corporate attorney engaged for US structure.",
   taskSchedule:[
     mkTask("C001-T1","AI drafts brief for US corporate attorney on Delaware C Corp for Indian founder","AI",0),
     mkTask("C001-T2","Engage US corporate attorney specialising in Delaware for Indian founders","HC",3,"C001-T1"),
     mkTask("C001-T3","Engage India corporate attorney for Pvt Ltd","HC",3,null,"Parallel track."),
     mkTask("C001-T4","Get David's advice on HIOF patent assignment: personal name → Delaware","HC",5,"C001-T2"),
     mkTask("C001-T5","Incorporate India Private Limited","HS",14,"C001-T3"),
     mkTask("C001-T6","Incorporate Delaware C Corp","HS",14,"C001-T2"),
     mkTask("C001-T7","Execute IP assignment: Ramjit Ray → Delaware C Corp","HC",21,"C001-T4,C001-T6"),
     mkTask("C001-T8","AI drafts corporate structure one-pager for investors","AI",22,"C001-T7"),
   ]},
  {id:"T001",domain:"platform",urgency:"critical",status:"pending",delegation:"HC",hiofLayer:"208",confidence:91,copilot:"platform",
   title:"Hire Lead AI / Backend Engineer",
   stake:"Entire HIOF backend — all 7 agents, signal bus, RAG pipeline — blocked without this person.",
   context:"Must have ALL of: LangGraph, Pinecone or Weaviate, Kafka, production Python, FastAPI. Take-home test mandatory.",
   capabilityGap:"No backend engineer. 0% of HIOF technical architecture buildable.",
   taskSchedule:[
     mkTask("T001-T1","AI drafts job description, LinkedIn post, and take-home test","AI",0),
     mkTask("T001-T2","Post on LinkedIn and Toptal simultaneously","HS",0,"T001-T1"),
     mkTask("T001-T3","Screen CVs — reject any missing LangGraph, Pinecone, or Kafka","HC",3,"T001-T2"),
     mkTask("T001-T4","Send take-home test to shortlisted candidates","HS",5,"T001-T3"),
     mkTask("T001-T5","Interview candidates — ask LangGraph vs LangChain question","HC",10,"T001-T4"),
     mkTask("T001-T6","Make hiring decision and negotiate offer","HC",14,"T001-T5"),
   ]},
  {id:"T002",domain:"platform",urgency:"high",status:"pending",delegation:"HC",hiofLayer:"208",confidence:88,copilot:"platform",
   title:"Hire Data Engineer",
   stake:"Kafka Signal Bus and all sector data pipelines blocked.",
   context:"Required: Kafka, Airbyte/Fivetran, Airflow, Python. Red flag: batch-only background.",
   capabilityGap:"No data engineer. Signal Bus (HIOF 102) cannot be built.",
   taskSchedule:[
     mkTask("T002-T1","AI drafts Data Engineer job description","AI",0),
     mkTask("T002-T2","Post on LinkedIn","HS",1,"T002-T1"),
     mkTask("T002-T3","Screen and interview","HC",7,"T002-T2"),
     mkTask("T002-T4","Make hiring decision","HC",14,"T002-T3"),
   ]},
  {id:"G001",domain:"gtm",urgency:"critical",status:"pending",delegation:"HC",hiofLayer:"208",confidence:85,copilot:"gtm",
   title:"Decide: May 15 Full Launch vs Soft Launch",
   stake:"Full launch with unsigned DPA and no IRP = legal exposure on day one.",
   context:"Count Phase 0 tasks done. If any incomplete, go soft launch — known contacts only, no press.",
   capabilityGap:"3 of 5 Phase 0 security tasks currently incomplete.",
   taskSchedule:[
     mkTask("G001-T1","Count completed Phase 0 security tasks","HC",0),
     mkTask("G001-T2","Decide launch type based on completion","HC",0,"G001-T1"),
     mkTask("G001-T3","AI drafts launch announcement for LinkedIn","AI",0,"G001-T2"),
     mkTask("G001-T4","If soft launch: invite 5 known contacts personally","HC",1,"G001-T2"),
     mkTask("G001-T5","If full launch: post announcement at 9am","HS",1,"G001-T2,G001-T3"),
   ]},
  {id:"G002",domain:"gtm",urgency:"high",status:"pending",delegation:"HS",hiofLayer:"208",confidence:78,copilot:"gtm",
   title:"Launch LinkedIn GTM Campaign — Auto Components",
   stake:"10 outreaches/week = 2–3 discovery calls/month = 1 pilot client/quarter.",
   context:"5-touch sequence and 8-post content calendar ready. AI schedules posts and prepares personalised messages. You review each before sending.",
   capabilityGap:"Content ready. Scheduling and personalisation pending.",
   taskSchedule:[
     mkTask("G002-T1","Review and approve the 8-post content calendar","HC",0,null,"Edit any post that doesn't sound like your voice."),
     mkTask("G002-T2","AI schedules all 8 posts on LinkedIn (3-day cadence)","AI",0,"G002-T1"),
     mkTask("G002-T3","AI identifies 10 target CFOs/COOs in Auto Components cluster","AI",0),
     mkTask("G002-T4","AI drafts personalised first-touch message for each","AI",1,"G002-T3"),
     mkTask("G002-T5","You review and approve each message before send","HC",1,"G002-T4"),
     mkTask("G002-T6","Send first-touch messages","HS",2,"G002-T5"),
     mkTask("G002-T7","AI tracks responses and updates pipeline","AI",3,"G002-T6"),
   ]},
  {id:"SD001",domain:"sector",urgency:"high",status:"pending",delegation:"HC",hiofLayer:"208",confidence:88,copilot:"gtm",
   title:"Select First Sector Dashboard for Live Deployment",
   stake:"First live dashboard = first paying client = first case study.",
   context:"Four complete: Arjas Steel, VitalGrain Food, Sharma Precision Auto, MSME. Steel recommended as first deployment.",
   capabilityGap:"No live client deployment. Product-market fit unvalidated.",
   taskSchedule:[
     mkTask("SD001-T1","AI ranks all 4 dashboards by deployment readiness","AI",0),
     mkTask("SD001-T2","Select first sector for live deployment","HC",0,"SD001-T1"),
     mkTask("SD001-T3","Identify specific pilot client in selected sector","HC",2,"SD001-T2"),
     mkTask("SD001-T4","AI drafts pilot agreement template","AI",2,"SD001-T2"),
     mkTask("SD001-T5","Sign pilot agreement with first client","HC",7,"SD001-T3,SD001-T4"),
   ]},
  {id:"I001",domain:"investor",urgency:"medium",status:"pending",delegation:"HC",hiofLayer:"208",confidence:74,copilot:"strategy",
   title:"Map 20 Target Investors — India Angels First",
   stake:"First investor conversations must happen within 60 days of first paying client.",
   context:"Strategy: India angels first (warm network), US seed after Delaware incorporation. MENA deprioritised.",
   capabilityGap:"No investor mapping done. No warm paths identified.",
   taskSchedule:[
     mkTask("I001-T1","AI researches 20 investors matching enterprise SaaS + AI governance","AI",0),
     mkTask("I001-T2","You rank and select the final 20","HC",1,"I001-T1"),
     mkTask("I001-T3","AI drafts personalised 3-sentence outreach per investor","AI",2,"I001-T2"),
     mkTask("I001-T4","Identify warm introduction paths","HC",3,"I001-T2"),
     mkTask("I001-T5","Begin outreach — warm introductions first","HC",7,"I001-T3,I001-T4"),
   ]},
  {id:"CT001",domain:"content",urgency:"high",status:"pending",delegation:"HS",hiofLayer:"208",confidence:80,copilot:"strategy",
   title:"Publish Hybrid Intelligence Volume I — LinkedIn Series",
   stake:"Book is the primary credibility asset for enterprise conversations.",
   context:"3-post series: why I wrote it, one key insight, how to get it. AI drafts, you rewrite first sentence of each.",
   capabilityGap:"Posts not drafted or scheduled.",
   taskSchedule:[
     mkTask("CT001-T1","AI drafts 3-post LinkedIn series in Ramjit Ray's voice","AI",0),
     mkTask("CT001-T2","Rewrite opening sentence of each post in your own words","HC",0,"CT001-T1"),
     mkTask("CT001-T3","Add one personal memory to Post 1 that AI cannot know","HC",0,"CT001-T2"),
     mkTask("CT001-T4","Schedule on LinkedIn (3-day cadence)","HS",1,"CT001-T3"),
   ]},
];

const INIT_DOCS=[
  {id:"d001",type:"patent",hiofLayer:"700",decisionId:"P002",title:"HIOF V5.4 USPTO Provisional Patent Package",description:"20-claim provisional: system, dual-use PFS(c), method, CRM. 11 drawings. Filed in Ramjit Ray's personal name.",tags:["patent","HIOF","USPTO","PFS(c)","Brier score"],status:"filed_pending",created:"2026-05-01",author:"Ramjit Ray + David",aiSummary:"Complete USPTO provisional filing package for HIOF V5.4 with 20 claims. Dual-use PFS(c) Brier-score calibration (Claim 3) is the strongest claim. Filed in inventor Ramjit Ray's personal name — corporate assignment to Delaware entity is a separate pending decision."},
  {id:"d002",type:"compliance",hiofLayer:"700",decisionId:"S001",title:"Data Security Specification v2.0",description:"9-layer HIOF security, AES-256/TLS 1.3, sub-processor disclosure, incident response.",tags:["security","AES-256","SOC2","Anthropic DPA"],status:"complete",created:"2026-05-10",author:"Matrix360",aiSummary:"Technical security spec defining AES-256 at rest and TLS 1.3 in transit. Currently missing signed Anthropic DPA — critical gap enterprise clients find immediately."},
  {id:"d003",type:"compliance",hiofLayer:"700",decisionId:"S002",title:"Cybersecurity Compliance Roadmap",description:"24-month SOC 2 → ISO 27001 → ISO 42001 roadmap. US enterprise market access map.",tags:["SOC2","ISO27001","compliance"],status:"complete",created:"2026-05-10",author:"Matrix360",aiSummary:"Phased compliance roadmap from zero-cost Phase 0 through SOC 2 Type II (Month 4–9). SOC 2 Type II unlocks full US large enterprise market and requires a vCISO to initiate."},
  {id:"d004",type:"technical",hiofLayer:"102",decisionId:"T001",title:"Agentic Backend Architecture",description:"Kafka Signal Bus, LangGraph 7 agents, Pinecone, LlamaIndex RAG, FastAPI WebSocket, OPA governance, DSPy CLLE.",tags:["Kafka","LangGraph","Pinecone","RAG","OPA"],status:"complete",created:"2026-05-10",author:"Matrix360",aiSummary:"Full agentic backend spec mapping all 7 HIOF agents to LangGraph. Pinecone for cognitive memory. 90-second cold-start dashboard protocol is key demo differentiator."},
  {id:"d005",type:"dashboard",hiofLayer:"106",decisionId:"SD001",title:"Arjas Steel CEO Dashboard",description:"Dual-plant, FY25 financials, SMIORE synergy, AMSPL going concern war room. Persona: Pasupuleti Anand.",tags:["Arjas Steel","steel","CEO","SMIORE"],status:"complete",created:"2026-04-20",author:"Matrix360",aiSummary:"Most advanced dashboard with verified FY25 financials and dual-plant architecture. SMIORE synergy and AMSPL going concern modules are unique differentiators. Ready for live data integration."},
  {id:"d006",type:"dashboard",hiofLayer:"106",decisionId:"SD001",title:"VitalGrain Food Processing Dashboard",description:"11 tabs, Batch Lifecycle, FEFO agent, OEE, FSSAI. ₹13.3L FEFO write-off avoidance.",tags:["VitalGrain","food","FEFO","OEE","FSSAI"],status:"complete",created:"2026-05-07",author:"Matrix360",aiSummary:"11-tab dashboard with Batch Lifecycle module tracking ₹13.3L in FEFO write-off avoidance — quantified ROI that resonates with food clients. Sector embedding fine-tuning still required."},
  {id:"d007",type:"gtm",hiofLayer:"208",decisionId:"G002",title:"LinkedIn GTM Strategy — Auto Components",description:"5-touch outreach, 8-post content calendar, ICP personas, 3-tier pricing.",tags:["LinkedIn","GTM","Auto Components","outreach"],status:"complete",created:"2026-04-30",author:"Matrix360",aiSummary:"Complete GTM package for Auto Components cluster across Pune, Gurgaon, Chennai. Content calendar and outreach sequence ready for immediate deployment. Fastest path to first paying client."},
  {id:"d008",type:"content",hiofLayer:"500",decisionId:"CT001",title:"Hybrid Intelligence Volume I",description:"Foundational book: 6-layer HIOF, CLM, hyper-personalised intelligence.",tags:["Volume I","book","HIOF","CLM"],status:"complete",created:"2026-03-01",author:"Ramjit Ray",aiSummary:"Foundation IP establishing the Hybrid Intelligence framework. Every enterprise conversation should reference this book. LinkedIn promotion series not yet published — high-value immediate action."},
];

const KEYS={dec:"m360-v4-dec",docs:"m360-v4-docs",cp:"m360-v4-cp"};
const stor={
  load:async(k)=>{try{const r=await window.storage.get(k);if(r?.value)return JSON.parse(r.value);}catch(_){}return null;},
  save:async(k,v)=>{try{await window.storage.set(k,JSON.stringify(v));}catch(_){}},
};

const getTaskStatus=(task,allTasks)=>{
  if(task.status==="done"||task.status==="blocked"||task.status==="airunning"||task.status==="review"||task.status==="inprogress") return task.status;
  if(task.dependsOn){
    const deps=task.dependsOn.split(",").map(s=>s.trim());
    if(!deps.every(depId=>allTasks.find(t=>t.id===depId)?.status==="done")) return "waiting";
  }
  if(task.dueDate&&daysFrom(task.dueDate)<0) return "overdue";
  return "active";
};

const getAllTasks=(decisions)=>decisions
  .filter(d=>d.status==="approved"||d.status==="executing")
  .flatMap(d=>(d.taskSchedule||[]).map(t=>({...t,decisionId:d.id,decisionTitle:d.title,decisionDomain:d.domain,copilot:d.copilot,effectiveStatus:getTaskStatus(t,d.taskSchedule||[])})));

// ── NAV CONFIG ────────────────────────────────────────────────────────────────
const VIEWS=[
  {id:"ops",     label:"Operations", icon:"⚡"},
  {id:"decisions",label:"Decisions", icon:"◉"},
  {id:"copilots",label:"Co-Pilots",  icon:"💬"},
  {id:"docs",    label:"Documents",  icon:"📚"},
  {id:"learn",   label:"Learning",   icon:"◎"},
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App(){
  const[decisions,setDecisions]=useState(DECISIONS);
  const[docs,setDocs]=useState(INIT_DOCS);
  const[cpMemory,setCpMemory]=useState({});
  const[loaded,setLoaded]=useState(false);
  const[view,setView]=useState("ops");
  const[saving,setSaving]=useState(false);
  const[saveOk,setSaveOk]=useState(false);

  useEffect(()=>{
    Promise.all([stor.load(KEYS.dec),stor.load(KEYS.docs),stor.load(KEYS.cp)])
      .then(([d,dc,cp])=>{
        if(d?.length) setDecisions(d);
        if(dc?.length) setDocs(dc);
        if(cp) setCpMemory(cp);
        setLoaded(true);
      });
  },[]);

  useEffect(()=>{
    if(!loaded)return;
    setSaving(true);
    const t=setTimeout(async()=>{
      await stor.save(KEYS.dec,decisions);
      await stor.save(KEYS.docs,docs);
      await stor.save(KEYS.cp,cpMemory);
      setSaving(false);setSaveOk(true);setTimeout(()=>setSaveOk(false),1500);
    },800);
    return()=>clearTimeout(t);
  },[decisions,docs,cpMemory,loaded]);

  const updDec=useCallback((id,patch)=>setDecisions(p=>p.map(d=>d.id===id?{...d,...patch}:d)),[]);
  const updTask=useCallback((decId,tid,patch)=>setDecisions(p=>p.map(d=>d.id===decId?{...d,taskSchedule:(d.taskSchedule||[]).map(t=>t.id===tid?{...t,...patch}:t)}:d)),[]);
  const approveDec=useCallback((id)=>setDecisions(p=>p.map(d=>{
    if(d.id!==id)return d;
    const ts=(d.taskSchedule||[]).map((t,i)=>({...t,status:i===0&&!t.dependsOn?"active":"waiting"}));
    return{...d,status:"approved",taskSchedule:ts};
  })),[]);

  const allTasks=getAllTasks(decisions);
  const overdue=allTasks.filter(t=>t.effectiveStatus==="overdue");
  const needAction=allTasks.filter(t=>t.effectiveStatus==="active"||t.effectiveStatus==="review");
  const aiRunning=allTasks.filter(t=>t.effectiveStatus==="airunning");
  const pendingDecs=decisions.filter(d=>d.status==="pending");
  const criticalDecs=decisions.filter(d=>d.urgency==="critical"&&d.status==="pending");

  const sharedProps={decisions,docs,setDocs,cpMemory,setCpMemory,allTasks,overdue,needAction,aiRunning,pendingDecs,criticalDecs,updDec,updTask,approveDec};

  return(
    <div style={{fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",background:C.bg,minHeight:"100vh",color:C.text,paddingBottom:64}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        button{cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;}
        select,input,textarea{font-family:inherit;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#b3d9cc;border-radius:3px;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
        @keyframes slideUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .su{animation:slideUp 0.2s ease;}
        .pulse{animation:pulse 1.5s ease-in-out infinite;}
      `}</style>

      {/* TOP BAR — minimal on mobile */}
      <div style={{background:C.surface,borderBottom:`2px solid ${C.teal}`,padding:"0 14px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200,boxShadow:C.shadow}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,background:C.teal,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace",flexShrink:0}}>M3</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.text,lineHeight:1.1}}>Matrix360</div>
            <div style={{fontSize:8,color:C.textFaint,letterSpacing:"0.1em",fontFamily:"'DM Mono',monospace"}}>HIOF V5.4</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {overdue.length>0&&<span style={{background:C.redBg,color:C.red,border:`1px solid ${C.red}44`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>⚠{overdue.length}</span>}
          {needAction.length>0&&<span style={{background:C.amberBg,color:C.amber,border:`1px solid ${C.amber}44`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>◉{needAction.length}</span>}
          {criticalDecs.length>0&&<span style={{background:C.redBg,color:C.red,border:`1px solid ${C.red}44`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>🔴{criticalDecs.length}</span>}
          <span style={{fontSize:10,color:saving?C.amber:saveOk?C.teal:C.textFaint,fontFamily:"'DM Mono',monospace"}}>{saving?"…":saveOk?"✓":""}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{padding:"12px 12px 0"}}>
        {view==="ops"      &&<OpsView      {...sharedProps}/>}
        {view==="decisions"&&<DecisionsView {...sharedProps} setDecisions={setDecisions}/>}
        {view==="copilots" &&<CoPilotsView  {...sharedProps}/>}
        {view==="docs"     &&<DocsView      {...sharedProps}/>}
        {view==="learn"    &&<LearnView     {...sharedProps}/>}
      </div>

      {/* BOTTOM TAB BAR — mobile-native navigation */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:200,boxShadow:"0 -2px 12px rgba(0,0,0,0.08)"}}>
        {VIEWS.map(v=>(
          <button key={v.id} onClick={()=>setView(v.id)} style={{
            flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            padding:"8px 4px 10px",background:"transparent",border:"none",
            color:view===v.id?C.teal:C.textFaint,
            borderTop:`2px solid ${view===v.id?C.teal:"transparent"}`,
            transition:"all 0.15s"
          }}>
            <span style={{fontSize:18,lineHeight:1,marginBottom:2}}>{v.icon}</span>
            <span style={{fontSize:9,fontWeight:view===v.id?700:400,letterSpacing:"0.02em"}}>{v.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OPS VIEW — live command center
// ═══════════════════════════════════════════════════════════════════════════
function OpsView({decisions,allTasks,overdue,needAction,aiRunning,pendingDecs,criticalDecs,updTask,updDec,approveDec}){
  const[runningAI,setRunningAI]=useState(null);
  const approved=decisions.filter(d=>d.status==="approved");

  const execAI=async(task)=>{
    setRunningAI(task.id);
    updTask(task.decisionId,task.id,{status:"airunning"});
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,max_tokens:800,messages:[{role:"user",content:`You are a Matrix360 AI agent. Execute this task completely for Ramjit Ray.\n\nDecision: "${task.decisionTitle}"\nTask: "${task.title}"\nNotes: ${task.notes||"none"}\n\nProduce the complete deliverable now. Production-ready. Matrix360 voice: direct, confident, no hype.`}]})});
      const data=await r.json();
      const out=data.content?.map(c=>c.text||"").join("")||"No output.";
      updTask(task.decisionId,task.id,{status:"review",aiOutput:out});
    }catch(e){updTask(task.decisionId,task.id,{status:"active",aiOutput:"Error: "+e.message});}
    setRunningAI(null);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* KPI strip */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {[
          {label:"Overdue",value:overdue.length,color:C.red,bg:C.redBg},
          {label:"Need Action",value:needAction.length,color:C.amber,bg:C.amberBg},
          {label:"Critical Decisions",value:criticalDecs.length,color:C.red,bg:C.redBg},
        ].map(k=>(
          <div key={k.label} style={{background:k.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",boxShadow:C.shadow}}>
            <div style={{fontSize:9,color:C.textFaint,marginBottom:2,fontFamily:"'DM Mono',monospace"}}>{k.label.toUpperCase()}</div>
            <div style={{fontSize:24,fontWeight:700,color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Overdue tasks */}
      {overdue.length>0&&(
        <OpsSection label={`⚠ OVERDUE — ${overdue.length}`} color={C.red}>
          {overdue.map(t=><TaskCard key={t.id} task={t} updTask={updTask} execAI={execAI} running={runningAI===t.id}/>)}
        </OpsSection>
      )}

      {/* Needs action */}
      <OpsSection label={`◉ ACTION NEEDED — ${needAction.length}`} color={C.amber}>
        {needAction.length>0
          ?needAction.map(t=><TaskCard key={t.id} task={t} updTask={updTask} execAI={execAI} running={runningAI===t.id}/>)
          :<Hint>No tasks need action right now. Approve a decision below to activate its task schedule.</Hint>
        }
      </OpsSection>

      {/* AI running */}
      {aiRunning.length>0&&(
        <OpsSection label="🤖 AI EXECUTING" color={C.teal}>
          {aiRunning.map(t=><TaskCard key={t.id} task={t} updTask={updTask} execAI={execAI} running={runningAI===t.id}/>)}
        </OpsSection>
      )}

      {/* Critical decisions awaiting approval */}
      {criticalDecs.length>0&&(
        <OpsSection label={`🔴 APPROVE THESE DECISIONS TO UNLOCK TASKS`} color={C.red}>
          {criticalDecs.map(d=><ApprovalCard key={d.id} d={d} onApprove={()=>approveDec(d.id)} onDefer={()=>updDec(d.id,{status:"deferred"})}/>)}
        </OpsSection>
      )}

      {/* Approved decision progress */}
      {approved.length>0&&(
        <OpsSection label="◉ APPROVED — TASK PROGRESS" color={C.teal}>
          {approved.map(d=>{
            const ts=d.taskSchedule||[];
            const done=ts.filter(t=>t.status==="done").length;
            const pct=ts.length?Math.round(done/ts.length*100):0;
            const dom=DOMAINS.find(x=>x.id===d.domain)||DOMAINS[0];
            return(
              <div key={d.id} style={{padding:"10px 12px",background:C.bg,borderRadius:8,border:`1px solid ${C.border}`,borderLeft:`3px solid ${dom.color}`,marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,flex:1,marginRight:8,lineHeight:1.3}}>{d.title}</div>
                  <span style={{fontSize:12,fontWeight:700,color:C.teal,fontFamily:"'DM Mono',monospace",flexShrink:0}}>{pct}%</span>
                </div>
                <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:pct===100?"#22c55e":C.teal,borderRadius:3,transition:"width 0.4s"}}/>
                </div>
                <div style={{fontSize:10,color:C.textFaint,marginTop:3}}>{done}/{ts.length} tasks complete</div>
              </div>
            );
          })}
        </OpsSection>
      )}
    </div>
  );
}

function OpsSection({label,color,children}){
  return(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",boxShadow:C.shadow}}>
      <div style={{background:color+"12",borderBottom:`1px solid ${color}33`,padding:"8px 14px"}}>
        <div style={{fontSize:10,fontWeight:700,color,fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>{label}</div>
      </div>
      <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",gap:5}}>{children}</div>
    </div>
  );
}

function TaskCard({task,updTask,execAI,running}){
  const[open,setOpen]=useState(false);
  const s=TS[task.effectiveStatus||task.status]||TS.active;
  const dl=task.dueDate?daysFrom(task.dueDate):null;
  const ownerC=task.owner==="AI"?C.teal:task.owner==="HS"?C.amber:C.red;

  return(
    <div className="su" style={{border:`1px solid ${open?C.teal:C.border}`,borderRadius:9,overflow:"hidden",background:C.surface}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 11px",cursor:"pointer",minHeight:48}} onClick={()=>setOpen(o=>!o)}>
        <div style={{width:8,height:8,borderRadius:"50%",background:s.dot,flexShrink:0,marginTop:5,...(task.effectiveStatus==="airunning"?{animation:"pulse 1.5s infinite"}:{})}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",gap:4,marginBottom:3,flexWrap:"wrap"}}>
            <span style={{fontSize:9,fontWeight:700,color:s.color,background:s.bg,padding:"1px 5px",borderRadius:3}}>{s.label}</span>
            <span style={{fontSize:9,fontWeight:700,color:ownerC,background:ownerC+"14",padding:"1px 5px",borderRadius:3}}>{task.owner==="AI"?"🤖 AI":task.owner==="HC"?"👤 You":"🤝 AI+You"}</span>
          </div>
          <div style={{fontSize:13,fontWeight:600,color:C.text,lineHeight:1.3}}>{task.title}</div>
          {task.notes&&<div style={{fontSize:11,color:C.textSoft,marginTop:2,lineHeight:1.4}}>{task.notes}</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2,flexShrink:0}}>
          {dl!==null&&<span style={{fontSize:9,fontWeight:700,color:dl<0?C.red:dl===0?C.amber:C.textFaint,fontFamily:"'DM Mono',monospace"}}>{dl<0?`${Math.abs(dl)}d late`:dl===0?"today":`${dl}d`}</span>}
          <span style={{fontSize:12,color:C.textFaint}}>{open?"▲":"▼"}</span>
        </div>
      </div>
      {open&&(
        <div style={{borderTop:`1px solid ${C.border}`,padding:"10px 11px",background:C.bg}}>
          {task.aiOutput&&<div style={{background:C.tealBg,border:`1px solid ${C.tealMid}`,borderRadius:8,padding:"10px 12px",marginBottom:10,fontSize:12,color:C.textMid,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{task.aiOutput}</div>}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {task.status!=="done"&&<Btn bg={C.teal} color="#fff" onClick={()=>updTask(task.decisionId,task.id,{status:"done",completedAt:new Date().toISOString()})}>✓ Done</Btn>}
            {task.owner==="AI"&&task.status!=="done"&&task.status!=="airunning"&&<Btn bg="#e6f7f7" color="#1a6a6a" onClick={()=>execAI(task)} disabled={running}>{running?"Running…":"🤖 Execute"}</Btn>}
            {task.status==="review"&&<Btn bg={C.purple} color="#fff" onClick={()=>updTask(task.decisionId,task.id,{status:"done",completedAt:new Date().toISOString()})}>✓ Approve Output</Btn>}
            <Btn bg="transparent" color={C.red} border onClick={()=>updTask(task.decisionId,task.id,{status:"blocked"})}>✕ Block</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function ApprovalCard({d,onApprove,onDefer}){
  const dom=DOMAINS.find(x=>x.id===d.domain)||DOMAINS[0];
  const taskCount=(d.taskSchedule||[]).length;
  return(
    <div style={{padding:"10px 12px",background:C.bg,borderRadius:9,border:`1px solid ${C.border}`,borderLeft:`3px solid ${dom.color}`,marginBottom:5}}>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:3,lineHeight:1.3}}>{d.title}</div>
      <div style={{fontSize:11,color:C.textSoft,lineHeight:1.5,marginBottom:6}}>{d.stake}</div>
      <div style={{fontSize:10,color:C.teal,marginBottom:8}}>{taskCount} tasks activate on approval · {DELEGATION[d.delegation]?.code}</div>
      <div style={{display:"flex",gap:7}}>
        <Btn bg={C.teal} color="#fff" onClick={onApprove}>✓ Approve → Activate Tasks</Btn>
        <Btn bg="transparent" color={C.textSoft} border onClick={onDefer}>Defer</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DECISIONS VIEW
// ═══════════════════════════════════════════════════════════════════════════
function DecisionsView({decisions,docs,updDec,updTask,approveDec,setDecisions}){
  const[domF,setDomF]=useState("all");
  const[stF,setStF]=useState("all");
  const[selected,setSelected]=useState(null);
  const[editTarget,setEditTarget]=useState(null); // null | decision object | "new"

  const visible=decisions.filter(d=>{
    if(domF!=="all"&&d.domain!==domF)return false;
    if(stF!=="all"&&d.status!==stF)return false;
    return true;
  }).sort((a,b)=>(URG[a.urgency]?.rank||9)-(URG[b.urgency]?.rank||9));

  const saveDecision=(dec)=>{
    setDecisions(p=>{
      const exists=p.find(d=>d.id===dec.id);
      return exists?p.map(d=>d.id===dec.id?dec:d):[...p,dec];
    });
    setEditTarget(null);
  };

  const deleteDecision=(id)=>{
    setDecisions(p=>p.filter(d=>d.id!==id));
    setSelected(null);
  };

  // Edit sheet open
  if(editTarget){
    const isNew=editTarget==="new";
    const base=isNew?{
      id:"D"+Date.now(),domain:"platform",urgency:"medium",status:"pending",
      delegation:"HC",hiofLayer:"700",confidence:75,copilot:"strategy",
      title:"",stake:"",context:"",capabilityGap:"",taskSchedule:[],learnSignal:null,
    }:{...editTarget,taskSchedule:(editTarget.taskSchedule||[]).map(t=>({...t}))};
    return <DecisionEditSheet decision={base} isNew={isNew} onSave={saveDecision} onClose={()=>setEditTarget(null)}/>;
  }

  // Detail view open
  if(selected){
    const d=decisions.find(x=>x.id===selected.id)||selected;
    return <DecDetail d={d} docs={docs} onBack={()=>setSelected(null)} onUpdate={p=>updDec(d.id,p)} onUpdateTask={(tid,patch)=>updTask(d.id,tid,patch)} onApprove={()=>approveDec(d.id)} onEdit={()=>setEditTarget(d)} onDelete={()=>deleteDecision(d.id)}/>;
  }

  return(
    <div>
      {/* Domain filter — horizontal scroll */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textMid}}>{visible.length} decisions</div>
        <button onClick={()=>setEditTarget("new")} style={{background:C.teal,color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700}}>+ Add Decision</button>
      </div>
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:8,WebkitOverflowScrolling:"touch"}}>
        {DOMAINS.map(d=>(
          <button key={d.id} onClick={()=>setDomF(d.id)} style={{
            background:domF===d.id?d.color+"18":"transparent",
            color:domF===d.id?d.color:C.textSoft,
            border:`1px solid ${domF===d.id?d.color:C.border}`,
            borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:domF===d.id?700:400,
            whiteSpace:"nowrap",flexShrink:0
          }}>{d.icon} {d.label}</button>
        ))}
      </div>
      {/* Status filter */}
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,marginBottom:10,WebkitOverflowScrolling:"touch"}}>
        {["all",...Object.keys(DS)].map(s=>(
          <button key={s} onClick={()=>setStF(s)} style={{
            background:stF===s?C.teal+"18":"transparent",color:stF===s?C.teal:C.textSoft,
            border:`1px solid ${stF===s?C.teal:C.border}`,
            borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:stF===s?700:400,whiteSpace:"nowrap",flexShrink:0
          }}>{s==="all"?"All":DS[s]?.label}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {visible.map(d=>{
          const dom=DOMAINS.find(x=>x.id===d.domain)||DOMAINS[0];
          const ts=d.taskSchedule||[];
          const done=ts.filter(t=>t.status==="done").length;
          const pct=ts.length?Math.round(done/ts.length*100):0;
          const del=DELEGATION[d.delegation]||DELEGATION.HC;
          const cp=COPILOTS[d.copilot];
          return(
            <div key={d.id} className="su" onClick={()=>setSelected(d)} style={{background:C.surface,border:`1px solid ${C.border}`,borderLeft:`5px solid ${dom.color}`,borderRadius:12,padding:"14px 14px",cursor:"pointer",boxShadow:C.shadow}}>
              <div style={{display:"flex",gap:5,marginBottom:7,flexWrap:"wrap"}}>
                <span style={{fontSize:9,fontWeight:700,color:dom.color,background:dom.color+"14",padding:"2px 7px",borderRadius:3}}>{dom.icon} {dom.label}</span>
                <span style={{fontSize:9,fontWeight:700,color:URG[d.urgency]?.color,background:URG[d.urgency]?.bg,padding:"2px 7px",borderRadius:3}}>{URG[d.urgency]?.label}</span>
                <span style={{fontSize:9,fontWeight:700,color:del.color,background:del.bg,padding:"2px 7px",borderRadius:3}}>{del.code}</span>
                <span style={{fontSize:9,fontWeight:600,color:DS[d.status]?.color,background:DS[d.status]?.bg,padding:"2px 7px",borderRadius:3}}>{DS[d.status]?.label}</span>
                {cp&&<span style={{fontSize:9,color:cp.color,background:cp.bg,padding:"2px 7px",borderRadius:3}}>💬 {cp.label}</span>}
              </div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4,lineHeight:1.3}}>{d.title}</div>
              <div style={{fontSize:12,color:C.textSoft,lineHeight:1.5,marginBottom:8}}>{d.stake}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:d.status==="pending"?10:0}}>
                <div style={{flex:1,height:4,background:C.bg,borderRadius:2,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:pct===100?"#22c55e":C.teal,borderRadius:2}}/>
                </div>
                <span style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Mono',monospace"}}>{done}/{ts.length} tasks</span>
                <span style={{fontSize:10,fontWeight:700,color:C.blue,fontFamily:"'DM Mono',monospace"}}>{d.confidence}%</span>
              </div>
              {d.status==="pending"&&(
                <div style={{display:"flex",gap:7}} onClick={e=>e.stopPropagation()}>
                  <Btn bg={C.teal} color="#fff" onClick={()=>approveDec(d.id)}>✓ Approve</Btn>
                  <Btn bg="transparent" color={C.textSoft} border onClick={()=>updDec(d.id,{status:"deferred"})}>Defer</Btn>
                  <Btn bg="transparent" color={C.teal} border onClick={()=>setSelected(d)}>Detail →</Btn>
                </div>
              )}
              {d.status!=="pending"&&<div style={{fontSize:11,color:C.teal}}>Tap for details and task schedule →</div>}
            </div>
          );
        })}
        {visible.length===0&&<SurfaceCard><Hint>No decisions match your filters.</Hint></SurfaceCard>}
      </div>
    </div>
  );
}

function DecDetail({d,docs,onBack,onUpdate,onUpdateTask,onApprove,onEdit,onDelete}){
  const[aiOut,setAiOut]=useState("");const[aiLoad,setAiLoad]=useState(false);const[aiMode,setAiMode]=useState(null);
  const[note,setNote]=useState(d.learnSignal||"");
  const dom=DOMAINS.find(x=>x.id===d.domain)||DOMAINS[0];
  const del=DELEGATION[d.delegation]||DELEGATION.HC;
  const ts=d.taskSchedule||[];
  const linkedDocs=docs.filter(doc=>doc.decisionId===d.id);

  const callAI=async(mode)=>{
    setAiMode(mode);setAiLoad(true);setAiOut("");
    const ps={
      recommend:`Advise on this Matrix360 decision:\n"${d.title}"\nStake: ${d.stake}\nContext: ${d.context}\nGap: ${d.capabilityGap}\nDelegation: ${del.label}\n\nGive: RECOMMENDATION (1 sentence), RISK IF DEFERRED (1 sentence), FIRST MOVE NOW (1 specific action).`,
      gap:`Run HIOF Capability Gap Engine (206):\n"${d.title}"\nGap stated: ${d.capabilityGap}\n\nCompute Gap=f(R,C,W): Required capability, Current capability, Gap magnitude 0-100, AI compensation, Residual human requirement.`,
      execute:ts.find(t=>t.owner==="AI")?`Execute the first AI task for "${d.title}":\nTask: "${ts.find(t=>t.owner==="AI").title}"\nNotes: ${ts.find(t=>t.owner==="AI").notes}\nProduce the complete deliverable. Production-ready. Matrix360 voice.`:"No AI tasks for this decision.",
    };
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,max_tokens:700,messages:[{role:"user",content:ps[mode]}]})});
      const data=await r.json();
      setAiOut(data.content?.map(c=>c.text||"").join("")||"No response.");
    }catch(e){setAiOut("Error: "+e.message);}
    setAiLoad(false);
  };

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:C.teal,fontSize:14,fontWeight:600,padding:"4px 0"}}>← Back</button>
        <div style={{display:"flex",gap:7}}>
          {onEdit&&<button onClick={onEdit} style={{background:C.blueBg,color:C.blue,border:`1px solid ${C.blue}44`,borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700}}>✎ Edit</button>}
          {onDelete&&<button onClick={()=>{if(window.confirm("Remove this decision? This cannot be undone."))onDelete();}} style={{background:C.redBg,color:C.red,border:`1px solid ${C.red}44`,borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700}}>✕ Remove</button>}
        </div>
      </div>
      <SurfaceCard>
        <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
          <span style={{fontSize:9,fontWeight:700,color:dom.color,background:dom.color+"14",padding:"2px 7px",borderRadius:3}}>{dom.icon} {dom.label}</span>
          <span style={{fontSize:9,fontWeight:700,color:del.color,background:del.bg,padding:"2px 7px",borderRadius:3}}>{del.label}</span>
          <span style={{fontSize:9,fontWeight:700,color:URG[d.urgency]?.color,background:URG[d.urgency]?.bg,padding:"2px 7px",borderRadius:3}}>{URG[d.urgency]?.label}</span>
          <span style={{fontSize:9,color:C.blue,background:C.blueBg,padding:"2px 7px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>HIOF {d.hiofLayer} · {d.confidence}%</span>
        </div>
        <div style={{fontSize:17,fontWeight:700,color:C.text,lineHeight:1.3,marginBottom:8}}>{d.title}</div>

        <SecLabel>WHAT IS AT STAKE</SecLabel>
        <div style={{fontSize:13,color:C.red,fontWeight:600,lineHeight:1.6,marginBottom:6}}>{d.stake}</div>
        <div style={{fontSize:13,color:C.textMid,lineHeight:1.7,marginBottom:14}}>{d.context}</div>

        <SecLabel>CAPABILITY GAP</SecLabel>
        <div style={{background:C.purpleBg,border:"1px solid #d4b3e8",borderRadius:8,padding:"10px 12px",fontSize:12,color:C.purple,marginBottom:14}}>{d.capabilityGap}</div>

        <SecLabel>AI INTELLIGENCE</SecLabel>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:aiOut?10:0}}>
          <AIBtn active={aiMode==="recommend"} loading={aiLoad&&aiMode==="recommend"} onClick={()=>callAI("recommend")} color={C.teal}>🧠 Recommend</AIBtn>
          <AIBtn active={aiMode==="gap"} loading={aiLoad&&aiMode==="gap"} onClick={()=>callAI("gap")} color={C.purple}>◈ Gap</AIBtn>
          {ts.some(t=>t.owner==="AI")&&<AIBtn active={aiMode==="execute"} loading={aiLoad&&aiMode==="execute"} onClick={()=>callAI("execute")} color="#1a6a6a">🤖 Execute</AIBtn>}
        </div>
        {aiLoad&&<div style={{background:C.bg,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`,display:"flex",gap:8,alignItems:"center",marginTop:8}}><span className="pulse" style={{width:6,height:6,borderRadius:"50%",background:C.teal,display:"inline-block"}}/>Processing…</div>}
        {aiOut&&!aiLoad&&<div style={{background:C.tealBg,border:`1px solid ${C.tealMid}`,borderRadius:8,padding:"12px 14px",fontSize:13,color:C.textMid,lineHeight:1.8,whiteSpace:"pre-wrap",marginTop:8}}>{aiOut}</div>}
      </SurfaceCard>

      {/* Task Schedule */}
      <SurfaceCard>
        <SecLabel>{`TASK SCHEDULE — ${ts.filter(t=>t.status==="done").length}/${ts.length} COMPLETE`}</SecLabel>
        {ts.length===0&&<Hint>Approve this decision to generate and activate the task schedule.</Hint>}
        {ts.map(task=>{
          const eff=d.status==="approved"?getTaskStatus(task,ts):task.status;
          const s=TS[eff]||TS.waiting;
          const ownerC=task.owner==="AI"?C.teal:task.owner==="HS"?C.amber:C.red;
          const dl=task.dueDate&&d.status==="approved"?daysFrom(task.dueDate):null;
          return(
            <div key={task.id} style={{display:"flex",gap:9,alignItems:"flex-start",padding:"9px 10px",background:eff==="done"?C.bg:C.surface,border:`1px solid ${eff==="active"||eff==="overdue"?"#f59e0b":C.border}`,borderRadius:8,marginBottom:5}}>
              <div onClick={()=>onUpdateTask(task.id,{status:task.status==="done"?"active":"done",completedAt:task.status==="done"?null:new Date().toISOString()})}
                style={{width:18,height:18,borderRadius:4,border:`2px solid ${task.status==="done"?C.teal:C.border}`,background:task.status==="done"?C.teal:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:1}}>
                {task.status==="done"&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>✓</span>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:task.status==="done"?C.textSoft:C.text,textDecoration:task.status==="done"?"line-through":"none",lineHeight:1.3}}>{task.title}</div>
                {task.notes&&<div style={{fontSize:11,color:C.textSoft,marginTop:2,lineHeight:1.4}}>{task.notes}</div>}
                {task.dependsOn&&<div style={{fontSize:9,color:C.textFaint,marginTop:2,fontFamily:"'DM Mono',monospace"}}>Needs: {task.dependsOn}</div>}
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                <span style={{fontSize:9,fontWeight:700,color:ownerC,background:ownerC+"14",padding:"1px 5px",borderRadius:3}}>{task.owner==="AI"?"🤖":task.owner==="HC"?"👤":"🤝"}</span>
                {dl!==null&&<span style={{fontSize:9,color:dl<0?C.red:dl===0?C.amber:C.textFaint,fontFamily:"'DM Mono',monospace"}}>{dl<0?`${Math.abs(dl)}d late`:dl===0?"today":`${dl}d`}</span>}
                <span style={{fontSize:8,color:s.color,background:s.bg,padding:"1px 4px",borderRadius:2}}>{s.label}</span>
              </div>
            </div>
          );
        })}
      </SurfaceCard>

      {/* Linked docs */}
      {linkedDocs.length>0&&(
        <SurfaceCard>
          <SecLabel>LINKED DOCUMENTS</SecLabel>
          {linkedDocs.map(doc=>{
            const dtype=DOC_TYPES.find(t=>t.id===doc.type)||DOC_TYPES[0];
            return(
              <div key={doc.id} style={{background:C.bg,border:`1px solid ${C.border}`,borderLeft:`3px solid ${dtype.color}`,borderRadius:8,padding:"9px 11px",marginBottom:6}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:2}}>{doc.title}</div>
                {doc.aiSummary?<div style={{fontSize:11,color:C.textSoft,fontStyle:"italic"}}>{doc.aiSummary}</div>:<div style={{fontSize:10,color:C.textFaint}}>Not yet AI-summarised</div>}
              </div>
            );
          })}
        </SurfaceCard>
      )}

      {/* Decision */}
      <SurfaceCard>
        <SecLabel>MAKE YOUR DECISION</SecLabel>
        {d.status==="pending"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <Btn bg={C.teal} color="#fff" onClick={onApprove} full>✓ Approve — Activate {ts.length} Tasks</Btn>
              <Btn bg={C.purpleBg} color={C.purple} onClick={()=>onUpdate({status:"deferred"})} full>⏸ Defer</Btn>
            </div>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Decision reasoning — trains AI to improve future recommendations…"
              style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:13,color:C.text,resize:"vertical",outline:"none",fontFamily:"inherit",minHeight:64}}/>
            {note&&<div style={{marginTop:8}}><Btn bg={C.teal} color="#fff" onClick={()=>onUpdate({learnSignal:note})}>Save → Train AI</Btn></div>}
          </>
        )}
        {d.status!=="pending"&&(
          <div>
            <div style={{background:DS[d.status]?.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:13,fontWeight:700,color:DS[d.status]?.color}}>{DS[d.status]?.label}</div>
              {d.learnSignal&&<div style={{fontSize:12,color:C.textSoft,marginTop:3,fontStyle:"italic"}}>"{d.learnSignal}"</div>}
            </div>
            <Btn bg="transparent" color={C.textSoft} border onClick={()=>onUpdate({status:"pending"})}>↩ Reopen</Btn>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CO-PILOTS VIEW
// ═══════════════════════════════════════════════════════════════════════════
function CoPilotsView({decisions,docs,allTasks,cpMemory,setCpMemory}){
  const[activeCp,setActiveCp]=useState("patent");
  const cp=COPILOTS[activeCp];
  const mem=cpMemory[activeCp]||{messages:[],trained:0};
  const setMem=useCallback((patch)=>setCpMemory(p=>({...p,[activeCp]:{...(p[activeCp]||{messages:[],trained:0}),...patch}})),[activeCp,setCpMemory]);

  const domainDecs=decisions.filter(d=>d.copilot===activeCp||d.domain===activeCp);
  const domainTasks=allTasks.filter(t=>t.copilot===activeCp||t.decisionDomain===activeCp);
  const summarisedDocs=docs.filter(d=>d.aiSummary);

  const quickPrompts={
    patent:["Risk to India patent if we launch May 15?","Explain Claim 3 (PFS(c)) for an investor","Should we assign patent to Delaware now or wait?","Strongest defence against Alice/Mayo rejection?"],
    platform:["Correct hiring sequence for HIOF backend?","What breaks first without the Lead AI Engineer?","Explain 7-agent LangGraph architecture simply","How do we hit the 90-second cold-start target?"],
    gtm:["Which sector dashboard to pilot with first?","Fastest path to first paying client?","How to convert discovery call to pilot proposal?","What should the Auto Components outreach say?"],
    governance:["Legal exposure from unsigned Anthropic DPA?","What will the SOC 2 auditor ask first?","What must the Incident Response Policy say?","Which compliance gap blocks enterprise sales?"],
    strategy:["Delaware vs India Pvt Ltd — which first?","How does Founding Expert Programme connect to Academy?","Investor narrative connecting book, patent, dashboards?","How do we position vs McKinsey Digital?"],
  };

  return(
    <div>
      {/* Co-Pilot selector — horizontal scroll */}
      <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,marginBottom:12,WebkitOverflowScrolling:"touch"}}>
        {Object.values(COPILOTS).map(c=>(
          <button key={c.id} onClick={()=>setActiveCp(c.id)} style={{
            background:activeCp===c.id?c.color:C.surface,
            color:activeCp===c.id?"#fff":C.textSoft,
            border:`1px solid ${activeCp===c.id?c.color:C.border}`,
            borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:600,
            display:"flex",alignItems:"center",gap:6,flexShrink:0,
            boxShadow:C.shadow
          }}>
            <span>{c.avatar}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Context strip */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:12}}>
        {[
          {label:"Domain Decisions",value:domainDecs.filter(d=>d.status==="pending").length+" pending",color:cp.color},
          {label:"Active Tasks",value:domainTasks.filter(t=>t.effectiveStatus==="active").length+" active",color:cp.color},
          {label:"Training Signals",value:mem.trained+" captured",color:cp.color},
        ].map(k=>(
          <div key={k.label} style={{background:cp.bg,border:`1px solid ${cp.color}33`,borderRadius:9,padding:"8px 10px"}}>
            <div style={{fontSize:9,color:C.textFaint,marginBottom:2,fontFamily:"'DM Mono',monospace"}}>{k.label.toUpperCase()}</div>
            <div style={{fontSize:12,fontWeight:700,color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Quick prompts */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em",marginBottom:7}}>ASK YOUR {cp.label.toUpperCase()} CO-PILOT</div>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
          {(quickPrompts[activeCp]||[]).map((p,i)=>(
            <button key={i} onClick={()=>{
              const e=new CustomEvent("cpSend",{detail:p});window.dispatchEvent(e);
            }} style={{background:C.surface,border:`1px solid ${cp.color}44`,borderRadius:8,padding:"8px 12px",fontSize:12,color:C.textMid,whiteSpace:"nowrap",flexShrink:0,cursor:"pointer"}}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <DomainChat key={activeCp} cp={cp} decisions={domainDecs} allDecisions={decisions} docs={summarisedDocs} tasks={domainTasks} messages={mem.messages} trained={mem.trained} setMessages={msgs=>setMem({messages:msgs})} setTrained={n=>setMem({trained:n})}/>
    </div>
  );
}

function DomainChat({cp,decisions,allDecisions,docs,tasks,messages,trained,setMessages,setTrained}){
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  const inputRef=useRef(null);
  // Use refs so the event listener always has fresh state
  const loadingRef=useRef(false);
  const sendRef=useRef(null);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  // Build system prompt fresh at send time using current props via ref
  const buildSys=useCallback(()=>`${cp.brief}

CURRENT DOMAIN CONTEXT — ${cp.label}:
Pending decisions: ${decisions.filter(d=>d.status==="pending").map(d=>`"${d.title}" [${d.urgency}, ${d.confidence}% confidence]`).join("; ")||"none"}
Approved decisions: ${decisions.filter(d=>d.status==="approved").map(d=>d.title).join(", ")||"none"}
Done decisions: ${decisions.filter(d=>d.status==="done").map(d=>d.title).join(", ")||"none"}

ACTIVE TASKS IN THIS DOMAIN:
${tasks.filter(t=>t.effectiveStatus==="active"||t.effectiveStatus==="overdue").map(t=>`- [${t.effectiveStatus==="overdue"?"OVERDUE":"ACTIVE"}] ${t.title} (${t.owner}) — Decision: ${t.decisionTitle}`).join("\n")||"No active tasks — approve decisions to generate task schedules"}

OVERDUE TASKS: ${tasks.filter(t=>t.effectiveStatus==="overdue").length} overdue
COMPLETED TASKS: ${tasks.filter(t=>t.status==="done").length} done

DOCUMENT INTELLIGENCE (summarised docs available):
${docs.filter(d=>d.aiSummary).slice(0,6).map(d=>`[${d.type.toUpperCase()}] "${d.title}": ${d.aiSummary}`).join("\n")||"No summarised documents yet — go to Documents tab and tap 🧠 to summarise"}

Conversation history: ${messages.length} turns. Training signals from this session: ${trained||0}.

You have full operational awareness of this domain. Give direct, specific, actionable advice.`
  ,[cp,decisions,tasks,docs,messages,trained]);

  const send=useCallback(async(txt)=>{
    const msg=txt||input.trim();
    if(!msg||loadingRef.current)return;
    setInput("");
    const newMsgs=[...messages,{role:"user",content:msg,ts:Date.now()}];
    setMessages(newMsgs);
    setLoading(true);loadingRef.current=true;
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:MODEL,max_tokens:700,
          system:buildSys(), // built fresh at send time with current context
          messages:newMsgs.slice(-16).map(m=>({role:m.role,content:m.content}))
        })
      });
      const data=await r.json();
      const reply=data.content?.map(c=>c.text||"").join("")||"No response.";
      setMessages([...newMsgs,{role:"assistant",content:reply,ts:Date.now()}]);
      setTrained((trained||0)+1);
    }catch(e){
      setMessages([...newMsgs,{role:"assistant",content:"Connection error. Check your network and try again.",ts:Date.now()}]);
    }
    setLoading(false);loadingRef.current=false;
    setTimeout(()=>inputRef.current?.focus(),50);
  },[input,messages,buildSys,trained,setMessages,setTrained]);

  // Keep send ref current for the event listener
  useEffect(()=>{sendRef.current=send;},[send]);

  // Stable event listener using ref — no stale closure issues
  useEffect(()=>{
    const handler=(e)=>{if(sendRef.current)sendRef.current(e.detail);};
    window.addEventListener("cpSend",handler);
    return()=>window.removeEventListener("cpSend",handler);
  },[]); // empty deps — registers once, always calls latest send via ref

  const clear=()=>{setMessages([]);setTrained(0);};
  const fmt=(ts)=>new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

  return(
    <SurfaceCard extra={{display:"flex",flexDirection:"column"}}>
      {/* Header with reset */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:cp.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{cp.avatar}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{cp.label} Co-Pilot</div>
          <div style={{fontSize:10,color:C.textSoft}}>{cp.title} · {trained||0} training signals · {messages.length} turns</div>
        </div>
        <button onClick={clear} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 8px",fontSize:10,color:C.textFaint,cursor:"pointer",flexShrink:0}}>Reset</button>
      </div>

      {/* Context strip — what the Co-Pilot sees right now */}
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:6,marginBottom:8,WebkitOverflowScrolling:"touch"}}>
        {[
          {label:`${decisions.filter(d=>d.status==="pending").length} pending`,color:C.amber},
          {label:`${tasks.filter(t=>t.effectiveStatus==="active").length} active tasks`,color:C.teal},
          {label:`${tasks.filter(t=>t.effectiveStatus==="overdue").length} overdue`,color:tasks.filter(t=>t.effectiveStatus==="overdue").length>0?C.red:C.textFaint},
          {label:`${docs.filter(d=>d.aiSummary).length} docs in context`,color:C.purple},
        ].map((k,i)=>(
          <span key={i} style={{fontSize:9,fontWeight:700,color:k.color,background:k.color+"14",border:`1px solid ${k.color}33`,borderRadius:20,padding:"2px 8px",whiteSpace:"nowrap",flexShrink:0}}>{k.label}</span>
        ))}
      </div>

      {/* Messages area */}
      <div style={{minHeight:260,maxHeight:"40vh",overflowY:"auto",marginBottom:10,display:"flex",flexDirection:"column",gap:9}}>
        {messages.length===0&&(
          <div style={{textAlign:"center",padding:"24px 16px",color:C.textFaint}}>
            <div style={{fontSize:26,marginBottom:8}}>{cp.avatar}</div>
            <div style={{fontSize:14,fontWeight:700,color:C.textMid,marginBottom:4}}>{cp.title}</div>
            <div style={{fontSize:12,color:C.textSoft,lineHeight:1.7}}>
              I have full context: {decisions.filter(d=>d.status==="pending").length} pending decisions, {tasks.filter(t=>t.effectiveStatus==="active").length} active tasks, {docs.filter(d=>d.aiSummary).length} summarised documents. Ask me anything or tap a quick prompt above.
            </div>
          </div>
        )}
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"88%",padding:"10px 13px",background:m.role==="user"?cp.color:C.bg,color:m.role==="user"?"#fff":C.textMid,borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",fontSize:13,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{m.content}</div>
            {m.ts&&<div style={{fontSize:9,color:C.textFaint,marginTop:2}}>{fmt(m.ts)}</div>}
          </div>
        ))}
        {loading&&<div style={{background:C.bg,borderRadius:"12px 12px 12px 3px",padding:"10px 13px",display:"inline-flex",gap:4}}>{[0,1,2].map(i=><div key={i} className="pulse" style={{width:5,height:5,borderRadius:"50%",background:cp.color,animationDelay:`${i*0.15}s`}}/>)}</div>}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{display:"flex",gap:7,alignItems:"flex-end",borderTop:`1px solid ${C.border}`,paddingTop:10}}>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder={`Ask your ${cp.label} advisor… (Enter to send)`} rows={2}
          style={{flex:1,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text,resize:"none",outline:"none",fontFamily:"inherit"}}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()}
          style={{background:!loading&&input.trim()?cp.color:C.bg,color:!loading&&input.trim()?"#fff":C.textFaint,border:`1px solid ${!loading&&input.trim()?cp.color:C.border}`,borderRadius:9,padding:"10px 14px",fontSize:14,fontWeight:700,height:44,flexShrink:0}}>→</button>
      </div>
    </SurfaceCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCS VIEW
// ═══════════════════════════════════════════════════════════════════════════
function DocsView({decisions,docs,setDocs}){
  const[typeF,setTypeF]=useState("all");
  const[search,setSearch]=useState("");
  const[sel,setSel]=useState(null);
  const[adding,setAdding]=useState(false);
  const[summing,setSumming]=useState(null);

  const visible=docs.filter(d=>{
    if(typeF!=="all"&&d.type!==typeF)return false;
    if(search&&!d.title.toLowerCase().includes(search.toLowerCase())&&!d.tags?.some(t=>t.toLowerCase().includes(search.toLowerCase())))return false;
    return true;
  });

  const summarise=async(doc)=>{
    setSumming(doc.id);
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,max_tokens:160,messages:[{role:"user",content:`Summarise in 2 sentences for AI context. Focus on decisions it informs and intelligence it contains.\n\nDoc: "${doc.title}"\n${doc.description}\nTags: ${doc.tags?.join(", ")}`}]})});
      const data=await r.json();
      const s=data.content?.map(c=>c.text||"").join("")||"";
      setDocs(docs.map(d=>d.id===doc.id?{...d,aiSummary:s}:d));
    }catch(e){}
    setSumming(null);
  };

  const summariseAll=async()=>{for(const d of docs.filter(x=>!x.aiSummary)){await summarise(d);}};
  const del=(id)=>{setDocs(docs.filter(d=>d.id!==id));if(sel?.id===id)setSel(null);};
  const add=(doc)=>{setDocs([...docs,{...doc,id:"d"+Date.now(),created:new Date().toISOString().slice(0,10),aiSummary:""}]);setAdding(false);};

  if(sel){
    const doc=docs.find(d=>d.id===sel.id)||sel;
    const dtype=DOC_TYPES.find(t=>t.id===doc.type)||DOC_TYPES[0];
    const dec=decisions.find(d=>d.id===doc.decisionId);
    return(
      <div>
        <button onClick={()=>setSel(null)} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:C.teal,fontSize:14,fontWeight:600,marginBottom:12,padding:"4px 0"}}>← Back to Documents</button>
        <SurfaceCard>
          <div style={{fontSize:11,fontWeight:700,color:dtype.color,marginBottom:4}}>{dtype.icon} {dtype.label}</div>
          <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8,lineHeight:1.3}}>{doc.title}</div>
          <SecLabel>DESCRIPTION</SecLabel>
          <div style={{fontSize:13,color:C.textMid,lineHeight:1.7,marginBottom:12}}>{doc.description}</div>
          <SecLabel>AI SUMMARY — CO-PILOT CONTEXT</SecLabel>
          {doc.aiSummary
            ?<div style={{background:C.tealBg,border:`1px solid ${C.tealMid}`,borderRadius:8,padding:"10px 12px",fontSize:13,color:C.textMid,lineHeight:1.7,fontStyle:"italic",marginBottom:12}}>{doc.aiSummary}</div>
            :<div style={{background:C.bg,border:"1px dashed "+C.border,borderRadius:8,padding:"14px",textAlign:"center",marginBottom:12}}>
              <div style={{fontSize:12,color:C.textFaint,marginBottom:8}}>Not yet summarised — Co-Pilots cannot reference this document</div>
              <Btn bg={C.purple} color="#fff" onClick={()=>summarise(doc)} disabled={!!summing}>{summing===doc.id?"Generating…":"🧠 Generate Summary"}</Btn>
            </div>
          }
          {dec&&<><SecLabel>LINKED DECISION</SecLabel><div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",borderLeft:`3px solid ${C.teal}`}}><div style={{fontSize:12,fontWeight:700,color:C.text}}>{dec.title}</div><div style={{fontSize:11,color:DS[dec.status]?.color,fontWeight:600,marginTop:2}}>{DS[dec.status]?.label}</div></div></>}
          <SecLabel>TAGS</SecLabel>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>{doc.tags?.map(t=><span key={t} style={{fontSize:10,background:C.bg,border:`1px solid ${C.border}`,color:C.textSoft,padding:"2px 8px",borderRadius:20,fontFamily:"'DM Mono',monospace"}}>{t}</span>)}</div>
          <Btn bg={C.redBg} color={C.red} onClick={()=>del(doc.id)} full>Remove Document</Btn>
        </SurfaceCard>
      </div>
    );
  }

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {[
          {label:"Total Documents",value:docs.length,color:C.teal,bg:C.tealBg},
          {label:"AI Summarised",value:docs.filter(d=>d.aiSummary).length,color:C.purple,bg:C.purpleBg},
        ].map(k=><div key={k.label} style={{background:k.bg,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 12px"}}><div style={{fontSize:9,color:C.textFaint,marginBottom:2,fontFamily:"'DM Mono',monospace"}}>{k.label.toUpperCase()}</div><div style={{fontSize:22,fontWeight:700,color:k.color}}>{k.value}</div></div>)}
      </div>

      <div style={{display:"flex",gap:7,marginBottom:10}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search…" style={{flex:1,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:C.text,background:C.bg,outline:"none"}}/>
        <Btn bg={C.teal} color="#fff" onClick={()=>setAdding(true)}>+ Add</Btn>
        <Btn bg={C.purpleBg} color={C.purple} onClick={summariseAll}>🧠 All</Btn>
      </div>

      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,marginBottom:10,WebkitOverflowScrolling:"touch"}}>
        <button onClick={()=>setTypeF("all")} style={{background:typeF==="all"?C.teal+"18":"transparent",color:typeF==="all"?C.teal:C.textSoft,border:`1px solid ${typeF==="all"?C.teal:C.border}`,borderRadius:20,padding:"4px 10px",fontSize:11,whiteSpace:"nowrap",flexShrink:0}}>All</button>
        {DOC_TYPES.map(t=><button key={t.id} onClick={()=>setTypeF(t.id)} style={{background:typeF===t.id?t.color+"18":"transparent",color:typeF===t.id?t.color:C.textSoft,border:`1px solid ${typeF===t.id?t.color:C.border}`,borderRadius:20,padding:"4px 10px",fontSize:11,whiteSpace:"nowrap",flexShrink:0}}>{t.icon} {t.label}</button>)}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {visible.map(doc=>{
          const dtype=DOC_TYPES.find(t=>t.id===doc.type)||DOC_TYPES[0];
          const dec=decisions.find(d=>d.id===doc.decisionId);
          return(
            <div key={doc.id} className="su" onClick={()=>setSel(doc)} style={{background:C.surface,border:`1px solid ${C.border}`,borderLeft:`5px solid ${dtype.color}`,borderRadius:10,padding:"12px 13px",cursor:"pointer",boxShadow:C.shadow}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",gap:5,marginBottom:5,flexWrap:"wrap"}}>
                    <span style={{fontSize:9,fontWeight:700,color:dtype.color,background:dtype.color+"14",padding:"1px 6px",borderRadius:3}}>{dtype.icon} {dtype.label}</span>
                    {doc.aiSummary&&<span style={{fontSize:9,color:C.purple,background:C.purpleBg,padding:"1px 6px",borderRadius:3}}>🧠 In Co-Pilots</span>}
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:3,lineHeight:1.3}}>{doc.title}</div>
                  {doc.aiSummary
                    ?<div style={{fontSize:11,color:C.textSoft,lineHeight:1.5,fontStyle:"italic"}}>{doc.aiSummary.slice(0,100)}…</div>
                    :<div style={{fontSize:11,color:C.textFaint}}>Not yet summarised — tap to generate</div>}
                  {dec&&<div style={{fontSize:10,color:C.teal,marginTop:4}}>🔗 {dec.title}</div>}
                </div>
                <button onClick={e=>{e.stopPropagation();summarise(doc);}} disabled={!!summing} style={{background:C.purpleBg,border:"1px solid #d4b3e8",borderRadius:5,padding:"4px 7px",fontSize:10,color:C.purple,flexShrink:0}}>{summing===doc.id?"…":"🧠"}</button>
              </div>
            </div>
          );
        })}
        {visible.length===0&&<SurfaceCard><Hint>No documents match.</Hint></SurfaceCard>}
      </div>

      {adding&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setAdding(false)}>
          <AddDocSheet decisions={decisions} onSave={add} onClose={()=>setAdding(false)}/>
        </div>
      )}
    </div>
  );
}

function AddDocSheet({decisions,onSave,onClose}){
  const[f,setF]=useState({title:"",type:"technical",hiofLayer:"700",decisionId:"",description:"",tags:"",status:"complete"});
  const up=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <div style={{background:C.surface,borderRadius:"16px 16px 0 0",padding:"20px 16px",width:"100%",maxWidth:600,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      <div style={{width:36,height:4,background:C.border,borderRadius:2,margin:"0 auto 16px"}}/>
      <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:14}}>Add Document to Intelligence Layer</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div><FL>Title</FL><input value={f.title} onChange={e=>up("title",e.target.value)} style={IS}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><FL>Type</FL><select value={f.type} onChange={e=>up("type",e.target.value)} style={IS}>{DOC_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}</select></div>
          <div><FL>HIOF Layer</FL><select value={f.hiofLayer} onChange={e=>up("hiofLayer",e.target.value)} style={IS}>{Object.entries(HIOF_LAYERS).map(([k,v])=><option key={k} value={k}>({k}) {v.label}</option>)}</select></div>
        </div>
        <div><FL>Linked Decision</FL><select value={f.decisionId} onChange={e=>up("decisionId",e.target.value)} style={IS}><option value="">— None —</option>{decisions.map(d=><option key={d.id} value={d.id}>{d.id}: {d.title.slice(0,38)}</option>)}</select></div>
        <div><FL>Description</FL><textarea value={f.description} onChange={e=>up("description",e.target.value)} rows={3} style={{...IS,resize:"vertical"}}/></div>
        <div><FL>Tags (comma-separated)</FL><input value={f.tags} onChange={e=>up("tags",e.target.value)} placeholder="Kafka, LangGraph, SOC2…" style={IS}/></div>
        <div style={{display:"flex",gap:8,paddingTop:4}}>
          <Btn bg="transparent" color={C.textSoft} border onClick={onClose} full>Cancel</Btn>
          <Btn bg={f.title.trim()?C.teal:"#ccc"} color="#fff" onClick={()=>{if(!f.title.trim()||!f.description.trim())return;onSave({...f,tags:f.tags.split(",").map(t=>t.trim()).filter(Boolean)});}} full>Add to Library</Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LEARNING VIEW
// ═══════════════════════════════════════════════════════════════════════════
function LearnView({decisions,allTasks}){
  const[analysis,setAnalysis]=useState("");const[loading,setLoading]=useState(false);
  const withNotes=decisions.filter(d=>d.learnSignal);
  const approved=decisions.filter(d=>d.status==="approved"||d.status==="done");

  const run=async()=>{
    setLoading(true);setAnalysis("");
    const prompt=`You are the Matrix360 CLLE (component 500) — HIOF V5.4 learning engine.

Decision history:
${decisions.map(d=>`${d.id}|"${d.title}"|${d.status}|${d.urgency}|${d.delegation}|${d.confidence}%|Note:${d.learnSignal||"none"}|Tasks:${(d.taskSchedule||[]).filter(t=>t.status==="done").length}/${(d.taskSchedule||[]).length}done`).join("\n")}

Run three-pathway CLLE analysis:

PATHWAY 501 — POIM REFINEMENT: What does the decision pattern reveal about Ramjit Ray's cognitive model and priorities?

PATHWAY 502 — AGENT ADJUSTMENT: What delegation preferences are revealed? How should AI autonomy thresholds be adjusted?

PATHWAY 503 — GRADIENT RECALIBRATION: For each delegation mode, what confidence/urgency level should trigger escalation vs autonomous execution?

PREDICTION: What decision will he most likely approve next?

SYSTEM RECOMMENDATION: How should the HIOF OS adjust its behaviour in the next 7 days?`;

    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,max_tokens:900,messages:[{role:"user",content:prompt}]})});
      const data=await r.json();
      setAnalysis(data.content?.map(c=>c.text||"").join("")||"No response.");
    }catch(e){setAnalysis("Error: "+e.message);}
    setLoading(false);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {[
          {id:"501",label:"POIM Refinement",color:C.blue},
          {id:"502",label:"Agent Adjustment",color:C.purple},
          {id:"503",label:"Gradient Recalibration",color:C.teal},
        ].map(p=>(
          <div key={p.id} style={{background:p.color+"0a",border:`1px solid ${p.color}33`,borderRadius:9,padding:"10px 11px"}}>
            <div style={{fontSize:9,fontWeight:700,color:p.color,fontFamily:"'DM Mono',monospace",marginBottom:2}}>({p.id})</div>
            <div style={{fontSize:11,fontWeight:700,color:C.text}}>{p.label}</div>
          </div>
        ))}
      </div>

      <SurfaceCard>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:C.text}}>CLLE Analysis</div>
            <div style={{fontSize:11,color:C.textSoft}}>{approved.length} approved · {withNotes.length} reasoning signals · {allTasks.length} active tasks</div>
          </div>
          <Btn bg={loading?C.bg:C.teal} color={loading?C.textFaint:"#fff"} onClick={run} disabled={loading}>{loading?"…":"Run"}</Btn>
        </div>
        {loading&&<div style={{padding:"14px",textAlign:"center"}}><span className="pulse" style={{width:8,height:8,borderRadius:"50%",background:C.teal,display:"inline-block",marginBottom:6}}/><div style={{fontSize:12,color:C.textSoft}}>Analysing decision patterns…</div></div>}
        {analysis&&!loading&&<div style={{background:C.tealBg,border:`1px solid ${C.tealMid}`,borderRadius:8,padding:"12px 14px",fontSize:13,color:C.textMid,lineHeight:1.85,whiteSpace:"pre-wrap"}}>{analysis}</div>}
        {!analysis&&!loading&&<Hint>Make decisions and add reasoning notes, then run the CLLE analysis to see the AI learn your governance philosophy.</Hint>}
      </SurfaceCard>

      {withNotes.length>0&&(
        <SurfaceCard>
          <SecLabel>REASONING SIGNALS — CLLE TRAINING DATA</SecLabel>
          {withNotes.map(d=>(
            <div key={d.id} style={{marginBottom:10,padding:"9px 11px",background:C.bg,borderRadius:8,border:`1px solid ${C.border}`,borderLeft:"3px solid "+C.teal}}>
              <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:2}}>{d.title}</div>
              <div style={{fontSize:11,color:DS[d.status]?.color,fontWeight:600,marginBottom:3}}>{DS[d.status]?.label}</div>
              <div style={{fontSize:12,color:C.textMid,fontStyle:"italic"}}>"{d.learnSignal}"</div>
            </div>
          ))}
        </SurfaceCard>
      )}
    </div>
  );
}

// ── DECISION EDIT SHEET ───────────────────────────────────────────────────────
function DecisionEditSheet({decision,isNew,onSave,onClose}){
  const[f,setF]=useState({...decision,taskSchedule:[...(decision.taskSchedule||[])]});
  const[newTaskTitle,setNewTaskTitle]=useState("");
  const[newTaskOwner,setNewTaskOwner]=useState("HC");
  const[newTaskDays,setNewTaskDays]=useState("7");
  const[newTaskNotes,setNewTaskNotes]=useState("");
  const up=(k,v)=>setF(p=>({...p,[k]:v}));

  const addTask=()=>{
    if(!newTaskTitle.trim())return;
    const t={
      id:f.id+"-T"+(f.taskSchedule.length+1)+Date.now(),
      title:newTaskTitle.trim(),owner:newTaskOwner,
      dueDate:addDays(parseInt(newTaskDays)||7),
      dependsOn:null,status:"waiting",notes:newTaskNotes.trim(),aiOutput:"",completedAt:null,
    };
    setF(p=>({...p,taskSchedule:[...p.taskSchedule,t]}));
    setNewTaskTitle("");setNewTaskNotes("");setNewTaskDays("7");
  };

  const removeTask=(tid)=>setF(p=>({...p,taskSchedule:p.taskSchedule.filter(t=>t.id!==tid)}));
  const updateTask=(tid,patch)=>setF(p=>({...p,taskSchedule:p.taskSchedule.map(t=>t.id===tid?{...t,...patch}:t)}));

  const ownerC={HC:C.red,AI:C.teal,HS:C.amber};

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:C.teal,fontSize:14,fontWeight:600,padding:"4px 0"}}>← Cancel</button>
        <div style={{fontSize:14,fontWeight:700,color:C.text}}>{isNew?"New Decision":"Edit Decision"}</div>
        <button onClick={()=>{if(!f.title.trim())return;onSave(f);}} style={{background:f.title.trim()?C.teal:"#ccc",color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:13,fontWeight:700}}>Save</button>
      </div>

      <SurfaceCard>
        <SecLabel>CORE FIELDS</SecLabel>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div>
            <FL>Decision Title *</FL>
            <input value={f.title} onChange={e=>up("title",e.target.value)} placeholder="What decision needs to be made?" style={IS}/>
          </div>
          <div>
            <FL>What Is at Stake</FL>
            <textarea value={f.stake} onChange={e=>up("stake",e.target.value)} rows={2} placeholder="Business consequence of not deciding this…" style={{...IS,resize:"vertical"}}/>
          </div>
          <div>
            <FL>Full Context</FL>
            <textarea value={f.context} onChange={e=>up("context",e.target.value)} rows={3} placeholder="Background, options, dependencies…" style={{...IS,resize:"vertical"}}/>
          </div>
          <div>
            <FL>Capability Gap</FL>
            <textarea value={f.capabilityGap} onChange={e=>up("capabilityGap",e.target.value)} rows={2} placeholder="What is currently missing that prevents execution?" style={{...IS,resize:"vertical"}}/>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SecLabel>CLASSIFICATION</SecLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <FL>Domain</FL>
            <select value={f.domain} onChange={e=>up("domain",e.target.value)} style={IS}>
              {DOMAINS.slice(1).map(d=><option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
            </select>
          </div>
          <div>
            <FL>Urgency</FL>
            <select value={f.urgency} onChange={e=>up("urgency",e.target.value)} style={IS}>
              {Object.entries(URG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <FL>Delegation Mode</FL>
            <select value={f.delegation} onChange={e=>up("delegation",e.target.value)} style={IS}>
              {Object.entries(DELEGATION).map(([k,v])=><option key={k} value={k}>{v.code} — {v.label}</option>)}
            </select>
            <div style={{fontSize:10,color:C.textSoft,marginTop:3,lineHeight:1.4}}>{DELEGATION[f.delegation]?.desc}</div>
          </div>
          <div>
            <FL>HIOF Patent Layer</FL>
            <select value={f.hiofLayer} onChange={e=>up("hiofLayer",e.target.value)} style={IS}>
              {Object.entries(HIOF_LAYERS).map(([k,v])=><option key={k} value={k}>({k}) {v.label}</option>)}
            </select>
          </div>
          <div>
            <FL>Domain Co-Pilot</FL>
            <select value={f.copilot||"strategy"} onChange={e=>up("copilot",e.target.value)} style={IS}>
              {Object.entries(COPILOTS).map(([k,v])=><option key={k} value={k}>{v.avatar} {v.label}</option>)}
            </select>
          </div>
          <div>
            <FL>Status</FL>
            <select value={f.status} onChange={e=>up("status",e.target.value)} style={IS}>
              {Object.entries(DS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <FL>AI Confidence: {f.confidence}%</FL>
            <input type="range" min={50} max={99} value={f.confidence} onChange={e=>up("confidence",Number(e.target.value))} style={{width:"100%",accentColor:C.teal,marginTop:4}}/>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <SecLabel>TASK SCHEDULE ({f.taskSchedule.length} tasks)</SecLabel>

        {/* Existing tasks */}
        {f.taskSchedule.map((task,i)=>{
          const ownerColor=ownerC[task.owner]||C.teal;
          return(
            <div key={task.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 10px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,marginBottom:5}}>
              <div style={{flex:1,minWidth:0}}>
                <input value={task.title} onChange={e=>updateTask(task.id,{title:e.target.value})} style={{...IS,fontSize:12,marginBottom:5,padding:"5px 8px"}}/>
                <input value={task.notes||""} onChange={e=>updateTask(task.id,{notes:e.target.value})} placeholder="Notes (optional)" style={{...IS,fontSize:11,padding:"4px 8px"}}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
                <select value={task.owner} onChange={e=>updateTask(task.id,{owner:e.target.value})} style={{fontSize:10,background:ownerColor+"14",color:ownerColor,border:`1px solid ${ownerColor}44`,borderRadius:5,padding:"3px 5px",outline:"none"}}>
                  <option value="HC">👤 You</option>
                  <option value="AI">🤖 AI</option>
                  <option value="HS">🤝 AI+You</option>
                </select>
                <button onClick={()=>removeTask(task.id)} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:5,padding:"3px 7px",fontSize:10,color:C.red,cursor:"pointer"}}>✕</button>
              </div>
            </div>
          );
        })}

        {/* Add new task */}
        <div style={{background:C.tealBg,border:`1px solid ${C.tealMid}`,borderRadius:9,padding:"10px 12px",marginTop:8}}>
          <div style={{fontSize:10,color:C.teal,fontWeight:700,marginBottom:7,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em"}}>ADD TASK</div>
          <input value={newTaskTitle} onChange={e=>setNewTaskTitle(e.target.value)} placeholder="Task title…" style={{...IS,fontSize:12,marginBottom:6}}
            onKeyDown={e=>e.key==="Enter"&&addTask()}/>
          <input value={newTaskNotes} onChange={e=>setNewTaskNotes(e.target.value)} placeholder="Notes (optional)" style={{...IS,fontSize:11,marginBottom:6,padding:"6px 10px"}}/>
          <div style={{display:"flex",gap:7,alignItems:"center"}}>
            <select value={newTaskOwner} onChange={e=>setNewTaskOwner(e.target.value)} style={{...IS,flex:1,fontSize:12}}>
              <option value="HC">👤 You Only</option>
              <option value="AI">🤖 AI Executes</option>
              <option value="HS">🤝 AI+You</option>
            </select>
            <div style={{display:"flex",alignItems:"center",gap:5,flex:1}}>
              <span style={{fontSize:11,color:C.textSoft,whiteSpace:"nowrap"}}>Due in</span>
              <input type="number" value={newTaskDays} onChange={e=>setNewTaskDays(e.target.value)} style={{...IS,width:52,padding:"6px 8px",fontSize:12}} min="0" max="365"/>
              <span style={{fontSize:11,color:C.textSoft}}>days</span>
            </div>
            <button onClick={addTask} style={{background:C.teal,color:"#fff",border:"none",borderRadius:7,padding:"8px 14px",fontSize:14,fontWeight:700,flexShrink:0}}>+</button>
          </div>
          <div style={{fontSize:9,color:C.teal,marginTop:5}}>HC = You personally · AI = Agent executes · AI+You = AI drafts, you approve</div>
        </div>
      </SurfaceCard>
    </div>
  );
}

// ── SHARED MICRO-COMPONENTS ───────────────────────────────────────────────────
function SurfaceCard({children,extra={}}){return(<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 14px",boxShadow:C.shadow,marginBottom:12,...extra}}>{children}</div>);}
function SecLabel({children}){return <div style={{fontSize:9,color:C.textFaint,fontFamily:"'DM Mono',monospace",letterSpacing:"0.14em",marginBottom:7,paddingBottom:5,borderBottom:`1px solid ${C.border}`}}>{children}</div>;}
function FL({children}){return <div style={{fontSize:12,fontWeight:700,color:C.textMid,marginBottom:4}}>{children}</div>;}
function Hint({children}){return <div style={{fontSize:12,color:C.textFaint,padding:"10px 0",textAlign:"center",lineHeight:1.6}}>{children}</div>;}
function AIBtn({active,loading,onClick,color,children}){return(<button onClick={onClick} disabled={loading} style={{background:active?color+"18":C.bg,color:active?color:C.textSoft,border:`1px solid ${active?color:C.border}`,borderRadius:7,padding:"7px 12px",fontSize:12,fontWeight:600,opacity:loading?0.6:1}}>{children}</button>);}
function Btn({bg,color,onClick,children,disabled,border,full}){return(<button onClick={onClick} disabled={disabled} style={{background:bg,color,border:border?`1px solid ${color}44`:"none",borderRadius:8,padding:"9px 14px",fontSize:13,fontWeight:600,opacity:disabled?0.5:1,width:full?"100%":"auto",textAlign:"center"}}>{children}</button>);}
const IS={width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:C.text,background:C.surface,outline:"none",display:"block"};
