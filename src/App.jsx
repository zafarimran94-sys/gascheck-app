import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import LandingPage from "./LandingPage";
import { APP, AppLogo } from "./AppShared";

/*─── Config ─────────────────────────────────────────────────*/
const SB_URL = "https://ybyvhoyiifjfvxcuaeku.supabase.co";
const SB_KEY = "sb_publishable_CeGC_3Qv1Qz14XpYMPgGyA_h3lB67mP";
const FIXED_AMT = 236;
const HOSE_AMT = 190;
const PAGE_SZ = 20;

/*─── Supabase Client ────────────────────────────────────────*/
function makeSB(url, key) {
  const hdr = { apikey: key, "Content-Type": "application/json" };
  let at = null, rt = null;
  try { at = localStorage.getItem("gc_at"); rt = localStorage.getItem("gc_rt"); } catch {}
  const sv = (a, r) => { at = a; rt = r; try { a ? (localStorage.setItem("gc_at", a), localStorage.setItem("gc_rt", r)) : (localStorage.removeItem("gc_at"), localStorage.removeItem("gc_rt")); } catch {} };
  const ah = () => ({ ...hdr, Authorization: `Bearer ${at || key}` });
  return {
    auth: {
      async signInWithPassword({ email, password }) { const r = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: "POST", headers: hdr, body: JSON.stringify({ email, password }) }); const d = await r.json(); if (d.access_token) sv(d.access_token, d.refresh_token); return r.ok ? { data: d, error: null } : { data: null, error: d }; },
      async signUp({ email, password, options }) { const r = await fetch(`${url}/auth/v1/signup`, { method: "POST", headers: hdr, body: JSON.stringify({ email, password, data: options?.data || {} }) }); const d = await r.json(); return r.ok ? { data: d, error: null } : { data: null, error: d }; },
      async getUser() { if (!at) return { data: { user: null } }; let r = await fetch(`${url}/auth/v1/user`, { headers: ah() }); if (r.ok) return { data: { user: await r.json() } }; if (rt) { const rr = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: hdr, body: JSON.stringify({ refresh_token: rt }) }); if (rr.ok) { const rd = await rr.json(); sv(rd.access_token, rd.refresh_token); return { data: { user: rd.user } }; } } sv(null, null); return { data: { user: null } }; },
      async signOut() { try { await fetch(`${url}/auth/v1/logout`, { method: "POST", headers: ah() }); } catch {} sv(null, null); }
    },
    from(table) {
      let q = "", m = "GET", b = null, sng = false;
      const c = {
        select(cols = "*") { q += `?select=${encodeURIComponent(cols)}`; return c; }, insert(d) { m = "POST"; b = d; return c; }, update(d) { m = "PATCH"; b = d; return c; }, delete() { m = "DELETE"; return c; },
        eq(col, v) { q += `${q.includes("?") ? "&" : "?"}${col}=eq.${v}`; return c; }, order(col, { ascending = true } = {}) { q += `${q.includes("?") ? "&" : "?"}order=${col}.${ascending ? "asc" : "desc"}`; return c; },
        single() { sng = true; return c; },
        then(resolve) { (async () => { try { const h = { ...ah(), Prefer: "return=representation" }; if (sng) h.Accept = "application/vnd.pgrst.object+json"; const o = { method: m, headers: h }; if (b && m !== "GET") o.body = JSON.stringify(b); let u = `${url}/rest/v1/${table}${q}`; if ((m === "POST" || m === "PATCH") && !q.includes("select")) u += (q.includes("?") ? "&" : "?") + "select=*"; const r = await fetch(u, o); if (!r.ok) return resolve({ data: null, error: { message: await r.text() } }); const t = await r.text(); resolve({ data: t ? JSON.parse(t) : null, error: null }); } catch (e) { resolve({ data: null, error: { message: e.message } }); } })(); }
      }; return c;
    },
    storage: {
      async upload(bucket, path, file) {
        const h = { ...ah() }; delete h["Content-Type"];
        const fd = new FormData(); fd.append("", file);
        const r = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, { method: "POST", headers: h, body: fd });
        return r.ok ? { data: { path }, error: null } : { data: null, error: { message: await r.text() } };
      },
      getPublicUrl(bucket, path) { return `${url}/storage/v1/object/public/${bucket}/${path}`; }
    }
  };
}
const sb = makeSB(SB_URL, SB_KEY);

/*─── Photo Compression ──────────────────────────────────────*/
function compressImage(file, maxW = 800, quality = 0.7) {
  return new Promise((res) => {
    const img = new Image(); const r = new FileReader();
    r.onload = () => { img.src = r.result; };
    img.onload = () => {
      const c = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > maxW) { h = (maxW / w) * h; w = maxW; }
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      c.toBlob(blob => res(blob), "image/jpeg", quality);
    };
    r.readAsDataURL(file);
  });
}

/*─── Icons ──────────────────────────────────────────────────*/
const Ic = ({ ch, s = 20, ...p }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{ch}</svg>;
const II = {
  Back: p=><Ic {...p} ch={<><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>}/>, Plus: p=><Ic {...p} ch={<><path d="M12 5v14"/><path d="M5 12h14"/></>}/>,
  Search: p=><Ic {...p} ch={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>}/>, Pin: p=><Ic {...p} ch={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0Z"/><circle cx="12" cy="10" r="3"/></>}/>,
  Ok: p=><Ic {...p} ch={<path d="M20 6 9 17l-5-5"/>}/>, No: p=><Ic {...p} ch={<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>}/>,
  Cam: p=><Ic {...p} ch={<><path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></>}/>,
  Share: p=><Ic {...p} ch={<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/></>}/>,
  Print: p=><Ic {...p} ch={<><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></>}/>,
  Eye: p=><Ic {...p} ch={<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>}/>,
  User: p=><Ic {...p} ch={<><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>,
  File: p=><Ic {...p} ch={<><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7Z"/><path d="M14 2v4a2 2 0 002 2h4"/></>}/>,
  Play: p=><Ic {...p} ch={<><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></>}/>,
  Clock: p=><Ic {...p} ch={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}/>,
  Warn: p=><Ic {...p} ch={<><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></>}/>,
  QR: p=><Ic {...p} ch={<><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/></>}/>,
  Out: p=><Ic {...p} ch={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></>}/>,
  Spin: p=><Ic {...p} ch={<path d="M21 12a9 9 0 11-6.219-8.56"/>}/>,
  Key: p=><Ic {...p} ch={<><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.3 9.3"/><path d="m18 5 3-3"/><path d="M15 8l-2 2"/></>}/>,
  Edit: p=><Ic {...p} ch={<><path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></>}/>,
  Pdf: p=><Ic {...p} ch={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></>}/>,
  Trash: p=><Ic {...p} ch={<><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></>}/>,
  Filter: p=><Ic {...p} ch={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>}/>,
  Map: p=><Ic {...p} ch={<><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" x2="8" y1="2" y2="18"/><line x1="16" x2="16" y1="6" y2="22"/></>}/>,
  Phone: p=><Ic {...p} ch={<><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></>}/>,
  ChevL: p=><Ic {...p} ch={<path d="m15 18-6-6 6-6"/>}/>,
  ChevR: p=><Ic {...p} ch={<path d="m9 18 6-6-6-6"/>}/>,
};

// Logo component using uploaded image

/*─── Theme ──────────────────────────────────────────────────*/
const C = { pri: "#0f2557", priL: "#1e3a5f", red: "#dc2626", bg: "#f0f4f8" };

/*─── Shared ─────────────────────────────────────────────────*/
const statusMap = { pending:"PENDING",completed:"COMPLETED","customer-not-reachable":"NOT REACHABLE","customer-refused":"REFUSED",rescheduled:"RESCHEDULED" };
const statusColor = { pending:"bg-amber-100 text-amber-800 border-amber-300",completed:"bg-emerald-100 text-emerald-800 border-emerald-300","customer-not-reachable":"bg-red-100 text-red-800 border-red-300","customer-refused":"bg-rose-100 text-rose-800 border-rose-300",rescheduled:"bg-violet-100 text-violet-800 border-violet-300" };
const SBadge = ({ s }) => <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide border ${statusColor[s]||"bg-gray-100 border-gray-200"}`}>{statusMap[s]||s}</span>;
const Bdg = ({ children, v }) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${{outline:"border border-slate-300 text-slate-600",success:"bg-emerald-100 text-emerald-800",danger:"bg-red-100 text-red-800"}[v]||"bg-slate-800 text-white"}`}>{children}</span>;
const Tabs = ({ tabs, a, set }) => <div className="flex bg-white rounded-lg p-1 gap-1 border border-slate-200">{tabs.map(t=><button key={t.k} onClick={()=>set(t.k)} className={`flex-1 py-2.5 px-3 rounded-md text-sm font-semibold transition ${a===t.k?"text-white shadow-sm":"text-slate-500"}`} style={a===t.k?{background:C.pri}:{}}>{t.l}</button>)}</div>;
function Modal({open,close,title,wide,children}){if(!open)return null;return<div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={close}><div className="absolute inset-0 bg-black/50 backdrop-blur-sm"/><div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide?"max-w-2xl":"max-w-md"} max-h-[90vh] overflow-y-auto`} onClick={e=>e.stopPropagation()}><div className="sticky top-0 bg-white rounded-t-2xl border-b px-6 py-4 flex items-center justify-between z-10"><h3 className="text-lg font-bold">{title}</h3><button onClick={close} className="p-1.5 rounded-lg hover:bg-slate-100"><II.No s={18}/></button></div><div className="p-6">{children}</div></div></div>;}
function Toast({msg,type,onClose}){useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t);},[]);return<div className={`fixed top-4 right-4 z-[100] ${type==="error"?"bg-red-600":type==="success"?"bg-emerald-600":"bg-slate-800"} text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium max-w-xs`}>{msg}</div>;}
function Confirm({open,close,title,msg,onOk,danger}){if(!open)return null;return<Modal open close={close} title={title}><p className="text-sm text-slate-600 mb-6">{msg}</p><div className="flex gap-3"><button onClick={close} className="flex-1 py-3 border border-slate-200 rounded-lg font-semibold text-sm">Cancel</button><button onClick={()=>{onOk();close();}} className={`flex-1 py-3 text-white rounded-lg font-semibold text-sm ${danger?"bg-red-600":"bg-blue-600"}`}>{danger?"Delete":"Confirm"}</button></div></Modal>;}
const Inp=({label,required,...p})=><div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}{required&&<span className="text-red-500 ml-0.5">*</span>}</label><input className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...p}/></div>;
const Sel=({label,required,children,...p})=><div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}{required&&<span className="text-red-500 ml-0.5">*</span>}</label><select className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" {...p}>{children}</select></div>;
function Pager({page,setPage,total}){const pages=Math.ceil(total/PAGE_SZ);if(pages<=1)return null;return<div className="flex items-center justify-center gap-2 mt-4"><button onClick={()=>setPage(Math.max(0,page-1))} disabled={page===0} className="p-2 rounded-lg border disabled:opacity-30 hover:bg-slate-50"><II.ChevL s={18}/></button><span className="text-sm font-medium text-slate-600">{page+1} / {pages}</span><button onClick={()=>setPage(Math.min(pages-1,page+1))} disabled={page>=pages-1} className="p-2 rounded-lg border disabled:opacity-30 hover:bg-slate-50"><II.ChevR s={18}/></button></div>;}

/*─── Login ──────────────────────────────────────────────────*/
function Login({onOk,onBack}){
  const[em,setEm]=useState("");const[pw,setPw]=useState("");const[ld,setLd]=useState(false);const[err,setErr]=useState("");
  const go=async()=>{setErr("");setLd(true);const{data,error}=await sb.auth.signInWithPassword({email:em,password:pw});if(error){setErr(error.error_description||error.msg||JSON.stringify(error));setLd(false);return;}onOk(data.user);setLd(false);};
  return(
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:`linear-gradient(135deg,${C.pri} 0%,#1a3a7a 50%,${C.pri} 100%)`}}>
      <div className="w-full max-w-sm"><div className="text-center mb-8"><AppLogo s={56} className="mx-auto mb-4"/><h1 className="text-2xl font-extrabold text-white tracking-tight">{APP}</h1><p className="text-blue-200/60 text-sm mt-1">Safety Inspection Management</p></div>
        <div className="bg-white rounded-2xl p-6 shadow-2xl">{err&&<div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{err}</div>}<div className="space-y-4"><Inp label="Email" type="email" value={em} onChange={e=>setEm(e.target.value)} placeholder="you@company.com" onKeyDown={e=>e.key==="Enter"&&go()}/><Inp label="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/><button onClick={go} disabled={ld||!em||!pw} className="w-full py-3.5 text-white rounded-lg font-bold text-sm transition disabled:opacity-40 hover:opacity-90" style={{background:C.pri}}>{ld&&<II.Spin s={18} className="animate-spin inline mr-2"/>}{ld?"Signing in...":"Sign In"}</button></div></div>
        {onBack&&<button onClick={onBack} className="w-full mt-4 text-center text-blue-200/60 text-sm hover:text-white transition flex items-center justify-center gap-1"><II.Back s={16}/>Back to Home</button>}</div>
    </div>
  );
}

/*─── Data Hook ──────────────────────────────────────────────*/
function useData(){
  const[emps,setEmps]=useState([]);const[jobs,setJobs]=useState([]);const[loading,setLoading]=useState(false);const[toast,setToast]=useState(null);
  const show=(msg,type="info")=>setToast({msg,type});
  const load=useCallback(async()=>{setLoading(true);const[er,jr]=await Promise.all([sb.from("employees").select("*").eq("is_active",true).order("name"),sb.from("jobs").select("*").order("created_at",{ascending:false})]);if(er.data)setEmps(er.data);if(jr.data)setJobs(jr.data);setLoading(false);},[]);
  const addEmp=async e=>{const{data,error}=await sb.from("employees").insert(e);if(error){show(error.message,"error");return null;}if(data?.[0])setEmps(p=>[...p,data[0]]);show("Employee added!","success");return data?.[0];};
  const addJob=async j=>{const{data,error}=await sb.from("jobs").insert(j);if(error){show(error.message,"error");return;}if(data?.[0])setJobs(p=>[data[0],...p]);show("Job created!","success");};
  const addBulk=async list=>{const{data,error}=await sb.from("jobs").insert(list);if(error){show(error.message,"error");return;}if(data)setJobs(p=>[...data,...p]);show(`${data?.length||0} jobs added!`,"success");};
  const updJob=async(id,u)=>{const{data,error}=await sb.from("jobs").update(u).eq("id",id);if(error){show(error.message,"error");return;}if(data?.[0])setJobs(p=>p.map(j=>j.id===id?data[0]:j));};
  const delJob=async id=>{const{error}=await sb.from("jobs").delete().eq("id",id);if(error){show(error.message,"error");return;}setJobs(p=>p.filter(j=>j.id!==id));show("Job deleted","success");};
  const delEmp=async id=>{const{error}=await sb.from("employees").update({is_active:false}).eq("id",id);if(error){show(error.message,"error");return;}setEmps(p=>p.filter(e=>e.id!==id));show("Employee removed","success");};
  return{emps,jobs,loading,addEmp,addJob,addBulk,updJob,delJob,delEmp,load,toast,setToast,show};
}

/*─── Job Form (create/edit) ─────────────────────────────────*/
function JobForm({job,emps,onSave,isEdit}){
  const[f,setF]=useState(job?{address:job.address||"",area:job.area||"",customer_name:job.customer_name||"",customer_phone:job.customer_phone||"",consumer_id:job.consumer_id||"",gas_company_name:job.gas_company_name||"",gas_agency_name:job.gas_agency_name||"",assigned_to:job.assigned_to||""}:{address:"",area:"",customer_name:"",customer_phone:"",consumer_id:"",gas_company_name:"",gas_agency_name:"",assigned_to:""});
  const[ld,setLd]=useState(false);
  const go=async()=>{if(!f.address||!f.assigned_to)return;setLd(true);await onSave(f);setLd(false);};
  return(<div className="space-y-3">
    <Inp label="Address" required value={f.address} onChange={e=>setF({...f,address:e.target.value})} placeholder="Full address with landmark"/>
    <div className="grid grid-cols-2 gap-3"><Inp label="Customer Name" value={f.customer_name} onChange={e=>setF({...f,customer_name:e.target.value})} placeholder="Sharma ji"/><Inp label="Customer Phone" value={f.customer_phone} onChange={e=>setF({...f,customer_phone:e.target.value})} placeholder="9876543210"/></div>
    <div className="grid grid-cols-2 gap-3"><Inp label="CUID (Consumer ID)" value={f.consumer_id} onChange={e=>setF({...f,consumer_id:e.target.value})} placeholder="100234567"/><Inp label="Area" value={f.area} onChange={e=>setF({...f,area:e.target.value})} placeholder="Rohini"/></div>
    <div className="grid grid-cols-2 gap-3"><Inp label="Gas Company" value={f.gas_company_name} onChange={e=>setF({...f,gas_company_name:e.target.value})} placeholder="IGL"/><Inp label="Gas Agency" value={f.gas_agency_name} onChange={e=>setF({...f,gas_agency_name:e.target.value})} placeholder="Delhi Gas Agency"/></div>
    <Sel label="Assign To" required value={f.assigned_to} onChange={e=>setF({...f,assigned_to:e.target.value})}><option value="">Select employee...</option>{emps.map(e=><option key={e.id} value={e.id}>{e.name} — {e.area}</option>)}</Sel>
    <button onClick={go} disabled={ld||!f.address||!f.assigned_to} className="w-full py-3 text-white rounded-lg font-semibold text-sm disabled:opacity-40 mt-2" style={{background:C.pri}}>{ld?<II.Spin s={18} className="animate-spin inline mr-2"/>:null}{isEdit?"Save Changes":"Create Job"}</button>
  </div>);
}

/*─── Create Employee Account ────────────────────────────────*/
function CreateEmpAccountModal({open,close,employees,show}){
  const[selEmp,setSelEmp]=useState("");const[email,setEmail]=useState("");const[pw,setPw]=useState("");const[ld,setLd]=useState(false);const[done,setDone]=useState(null);
  const unlinked=employees.filter(e=>!e.profile_id);
  const create=async()=>{if(!selEmp||!email||!pw)return;const emp=employees.find(e=>e.id===selEmp);setLd(true);const{data,error}=await sb.auth.signUp({email,password:pw,options:{data:{full_name:emp.name,phone:emp.phone,role:"employee"}}});if(error){show(error.error_description||error.msg||JSON.stringify(error),"error");setLd(false);return;}const userId=data?.user?.id||data?.id;if(userId){await sb.from("employees").update({profile_id:userId}).eq("id",selEmp);await sb.from("profiles").update({role:"employee"}).eq("id",userId);}setDone({name:emp.name,email,pw});show("Account created!","success");setLd(false);};
  const reset=()=>{setSelEmp("");setEmail("");setPw("");setDone(null);};
  return(<Modal open={open} close={()=>{reset();close();}} title="Create Employee Login">
    {done?<div className="space-y-4"><div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-5 text-center"><h3 className="text-lg font-bold text-emerald-800">Account Created!</h3></div><div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">{[["Name",done.name],["Email",done.email],["Password",done.pw]].map(([l,v])=><div key={l} className="flex justify-between"><span className="text-slate-500">{l}:</span><span className="font-mono font-medium">{v}</span></div>)}</div><button onClick={()=>{const msg=`${APP}\n\nApp: ${window.location.origin}\n\nLogin:\nEmail: ${done.email}\nPassword: ${done.pw}`;window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");}} className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2"><II.Share s={16}/>Share on WhatsApp</button><button onClick={()=>{reset();close();}} className="w-full py-3 border border-slate-200 rounded-lg text-sm font-semibold">Done</button></div>
    :<div className="space-y-4"><Sel label="Employee" required value={selEmp} onChange={e=>{setSelEmp(e.target.value);const emp=employees.find(x=>x.id===e.target.value);if(emp)setEmail(`${emp.name.toLowerCase().replace(/\s+/g,".")}@lpginspection.app`);}}><option value="">Choose...</option>{unlinked.map(e=><option key={e.id} value={e.id}>{e.name} — {e.area}</option>)}{unlinked.length===0&&<option disabled>All have accounts</option>}</Sel><Inp label="Email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ramesh@lpginspection.app"/><Inp label="Password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="simple123"/>{pw&&pw.length<6&&<p className="text-xs text-red-500">Min 6 characters</p>}<button onClick={create} disabled={ld||!selEmp||!email||pw.length<6} className="w-full py-3 text-white rounded-lg font-semibold text-sm disabled:opacity-40" style={{background:C.pri}}>{ld?<II.Spin s={18} className="animate-spin inline mr-2"/>:<II.Key s={16} className="inline mr-2"/>}{ld?"Creating...":"Create Login"}</button></div>}
  </Modal>);
}

/*─── Admin Dashboard ────────────────────────────────────────*/
function Admin({emps,jobs,onAddEmp,onAddJob,onBulk,onUpdJob,onDelJob,onDelEmp,onRecon,onViewEmp,onLogout,prof,show}){
  const[showE,setShowE]=useState(false);const[showJ,setShowJ]=useState(false);const[showAcct,setShowAcct]=useState(false);const[editJob,setEditJob]=useState(null);const[delT,setDelT]=useState(null);const[delE,setDelE]=useState(null);
  const[tab,setTab]=useState("jobs");const[jTab,setJTab]=useState("single");const[nE,setNE]=useState({name:"",phone:"",area:""});const[bulk,setBulk]=useState("");
  const[auditEmp,setAuditEmp]=useState("");const[auditSt,setAuditSt]=useState("");const[auditGps,setAuditGps]=useState("");const[auditPhoto,setAuditPhoto]=useState("");const[lightbox,setLightbox]=useState(null);const[auditPg,setAuditPg]=useState(0);
  const[pg,setPg]=useState(0);const[q,setQ]=useState("");const[fAg,setFAg]=useState("");const[fDC,setFDC]=useState("");const[fDA,setFDA]=useState("");const[fEmp,setFEmp]=useState("");const[fSt,setFSt]=useState("");const[showF,setShowF]=useState(false);
  const[sel,setSel]=useState(new Set());const[assignTo,setAssignTo]=useState("");const[assigning,setAssigning]=useState(false);const[bulkDel,setBulkDel]=useState(false);
  const csvRef=useRef(null);

  const agencies=useMemo(()=>[...new Set(jobs.map(j=>j.gas_agency_name).filter(Boolean))].sort(),[jobs]);
  const filtered=useMemo(()=>{let r=jobs;if(q){const ql=q.toLowerCase();r=r.filter(j=>(j.address||"").toLowerCase().includes(ql)||(j.customer_name||"").toLowerCase().includes(ql)||(j.customer_phone||"").includes(ql)||(j.consumer_id||"").toLowerCase().includes(ql)||(j.area||"").toLowerCase().includes(ql));}if(fAg)r=r.filter(j=>j.gas_agency_name===fAg);if(fDC)r=r.filter(j=>j.completed_time&&j.completed_time.startsWith(fDC));if(fDA)r=r.filter(j=>j.created_at&&j.created_at.startsWith(fDA));if(fEmp)r=r.filter(j=>j.assigned_to===fEmp);if(fSt)r=r.filter(j=>j.status===fSt);return r;},[jobs,q,fAg,fDC,fDA,fEmp,fSt]);
  const paged=filtered.slice(pg*PAGE_SZ,(pg+1)*PAGE_SZ);
  const tot=jobs.length,done=jobs.filter(j=>j.status==="completed").length,pend=jobs.filter(j=>j.status==="pending").length;
  const cash=jobs.filter(j=>j.payment_type==="cash").reduce((s,j)=>s+(+j.payment_amount||0),0);
  const upi=jobs.filter(j=>j.payment_type==="upi").reduce((s,j)=>s+(+j.payment_amount||0),0);
  const eName=id=>emps.find(e=>e.id===id)?.name||"—";
  const unassigned=filtered.filter(j=>!j.assigned_to);
  const doAddE=async()=>{if(nE.name&&nE.phone){await onAddEmp(nE);setNE({name:"",phone:"",area:""});setShowE(false);}};

  const parseCsvLine=(line)=>{
    const fields=[];let cur="";let inQ=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch==='"'){
        if(inQ&&line[i+1]==='"'){cur+='"';i++;}  // escaped quote ""
        else inQ=!inQ;
      } else if(ch===','&&!inQ){
        fields.push(cur.trim());cur="";
      } else {
        cur+=ch;
      }
    }
    fields.push(cur.trim());
    return fields;
  };
  const parseCsvText=(text)=>{
    const arr=[];const lines=text.trim().split(/\r?\n/);
    lines.forEach((l,i)=>{
      if(i===0&&(l.toLowerCase().includes("consumer")||l.toLowerCase().includes("name")||l.toLowerCase().includes("address")))return; // skip header
      const p=parseCsvLine(l); if(p.length<2)return;
      const[cuid,custName,addr,custPhone,gasAg,gasCo,empName]=p;
      const e=empName?emps.find(x=>x.name.toLowerCase()===empName.trim().toLowerCase()||x.id===empName.trim()):null;
      const clean=(v)=>(!v||v==="0"||v==="-")?null:v.trim();if(addr||cuid)arr.push({consumer_id:clean(cuid),customer_name:clean(custName),address:clean(addr)||"",customer_phone:clean(custPhone),gas_agency_name:clean(gasAg),gas_company_name:clean(gasCo),assigned_to:e?e.id:null});
    });
    return arr;
  };

  const doBulk=async()=>{const arr=parseCsvText(bulk);if(arr.length){await onBulk(arr);setBulk("");setShowJ(false);}else show("No valid rows. Check format.","error");};

  const handleCsvFile=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>{setBulk(ev.target.result);};r.readAsText(f);e.target.value="";};

  const doAssign=async()=>{if(!assignTo||sel.size===0)return;setAssigning(true);for(const id of sel){await onUpdJob(id,{assigned_to:assignTo});}setSel(new Set());setAssignTo("");setAssigning(false);show(`${sel.size} jobs assigned!`,"success");};const doBulkDel=async()=>{const ids=[...sel];setSel(new Set());for(const id of ids){await onDelJob(id);}show(`${ids.length} job${ids.length>1?"s":""} deleted`,"success");};

  const toggleSel=id=>setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll=()=>{if(sel.size===paged.length)setSel(new Set());else setSel(new Set(paged.map(j=>j.id)));};
  const hasFilters=fAg||fDC||fDA||fEmp||fSt;

  return(
    <div className="min-h-screen" style={{background:C.bg}}>
      <header className="sticky top-0 z-30 border-b border-slate-200" style={{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(12px)"}}><div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center"><div className="flex items-center gap-3"><AppLogo s={36}/><div><h1 className="text-lg font-extrabold leading-tight" style={{color:C.pri}}>{APP}</h1><p className="text-[11px] text-slate-500">Welcome, {prof?.full_name||"Admin"}</p></div></div><div className="flex gap-2"><button onClick={onRecon} className="hidden sm:flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90" style={{background:C.pri}}><II.File s={16}/>Reconciliation</button><button onClick={onRecon} className="sm:hidden p-2 text-white rounded-lg" style={{background:C.pri}}><II.File s={18}/></button><button onClick={onLogout} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"><II.Out s={18} className="text-slate-500"/></button></div></div></header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">{[{l:"Total",v:tot,bg:C.pri,click:()=>{setFSt("");setTab("jobs");}},{l:"Done",v:done,bg:"#059669",click:()=>{setFSt("completed");setTab("jobs");setPg(0);showF||setShowF(false);}},{l:"Cash",v:`₹${cash}`,bg:"#b45309",click:null},{l:"UPI",v:`₹${upi}`,bg:"#7c3aed",click:null}].map((s,i)=><div key={i} onClick={s.click||undefined} className={`rounded-xl p-4 text-white ${s.click?"cursor-pointer hover:opacity-90 active:scale-95 transition":""}`} style={{background:s.bg}}><div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{s.l}</div><div className="text-2xl font-extrabold mt-1">{s.v}</div>{s.l==="Done"&&<div className="text-xs opacity-60">Pending: {pend}{fSt==="completed"?" · filtered ✓":""}</div>}</div>)}</div>
        <Tabs tabs={[{k:"jobs",l:`Jobs (${filtered.length})`},{k:"employees",l:`Team (${emps.length})`},{k:"audit",l:"Audit"}]} a={tab} set={t=>{setTab(t);setAuditPg(0);}}/>

        {tab==="jobs"&&<div className="mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="flex gap-2 flex-1 w-full sm:w-auto"><div className="relative flex-1"><II.Search s={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white" placeholder="Search jobs..." value={q} onChange={e=>{setQ(e.target.value);setPg(0);}}/></div><button onClick={()=>setShowF(!showF)} className={`p-2.5 border rounded-lg transition ${hasFilters?"bg-blue-50 border-blue-300":"border-slate-200 hover:bg-slate-50"}`}><II.Filter s={18} className={hasFilters?"text-blue-600":"text-slate-400"}/></button></div>
            <button onClick={()=>setShowJ(true)} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-semibold shadow hover:opacity-90 whitespace-nowrap" style={{background:C.pri}}><II.Plus s={16}/>Create Job</button>
          </div>
          {showF&&<div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Gas Agency</label><select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={fAg} onChange={e=>{setFAg(e.target.value);setPg(0);}}><option value="">All Agencies</option>{agencies.map(a=><option key={a}>{a}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Assigned Employee</label><select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={fEmp} onChange={e=>{setFEmp(e.target.value);setPg(0);}}><option value="">All Employees</option>{emps.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Status</label><select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={fSt} onChange={e=>{setFSt(e.target.value);setPg(0);}}><option value="">All Statuses</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="customer-not-reachable">Not Reachable</option><option value="customer-refused">Refused</option><option value="rescheduled">Rescheduled</option></select></div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Date Completed</label><input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={fDC} onChange={e=>{setFDC(e.target.value);setPg(0);}}/></div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Date Added</label><input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={fDA} onChange={e=>{setFDA(e.target.value);setPg(0);}}/></div>
            {hasFilters&&<div className="flex items-end"><button onClick={()=>{setFAg("");setFDC("");setFDA("");setFEmp("");setFSt("");}} className="text-xs text-red-600 font-semibold underline">Clear all filters</button></div>}
          </div>}
          {sel.size>0&&<div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3"><div className="flex items-center justify-between mb-2"><p className="text-sm font-semibold text-blue-800">{sel.size} job{sel.size>1?"s":""} selected</p><button onClick={()=>setSel(new Set())} className="text-xs text-slate-400 hover:text-slate-600">✕ Clear</button></div><div className="flex flex-wrap gap-2"><select className="px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white min-w-[160px] flex-1" value={assignTo} onChange={e=>setAssignTo(e.target.value)}><option value="">Assign to...</option>{emps.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select><button onClick={doAssign} disabled={!assignTo||assigning} className="px-4 py-2 text-white rounded-lg text-sm font-semibold disabled:opacity-40 whitespace-nowrap" style={{background:C.pri}}>{assigning?"Assigning...":"Assign"}</button><button onClick={()=>setBulkDel(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap"><II.Trash s={14}/>Delete Selected</button></div></div>}
          {unassigned.length>0&&sel.size===0&&<div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 flex items-center justify-between gap-2 flex-wrap"><div className="flex items-center gap-2 text-xs text-amber-800"><II.Warn s={14}/><span className="font-semibold">{unassigned.length} unassigned job{unassigned.length>1?"s":""}.</span><span className="hidden sm:inline"> Select and bulk assign below.</span></div><button onClick={()=>setSel(new Set(unassigned.map(j=>j.id)))} className="text-xs font-bold px-3 py-1.5 rounded-lg text-white whitespace-nowrap" style={{background:"#b45309"}}>Select All Unassigned ({unassigned.length})</button></div>}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm leading-relaxed"><thead><tr className="bg-slate-50 border-b"><th className="p-3 w-10"><input type="checkbox" checked={paged.length>0&&sel.size===paged.length} onChange={toggleAll} className="rounded"/></th>{["CUID","Address","Gas Agency","Assigned","Status","GPS",""].map((h,i)=><th key={i} className={`text-left p-3 font-bold text-slate-700 text-sm uppercase tracking-wide ${i>1&&i<5?"hidden md:table-cell":""}`}>{h}</th>)}</tr></thead>
            <tbody>{paged.map(j=><tr key={j.id} className={`border-b border-slate-100 hover:bg-slate-50/50 ${sel.has(j.id)?"bg-blue-50/50":""} ${!j.assigned_to?"bg-amber-50/30":""}`}>
              <td className="p-3"><input type="checkbox" checked={sel.has(j.id)} onChange={()=>toggleSel(j.id)} className="rounded"/></td>
              <td className="p-3 align-top"><div className="inline-block bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-1 font-extrabold text-base text-indigo-800 font-mono tracking-wide">{j.consumer_id||<span className="text-slate-300 font-normal text-sm">—</span>}</div></td>
              <td className="p-3 align-top"><div className="font-semibold text-sm text-slate-900">{j.address}</div>{j.customer_name&&<div className="text-sm text-slate-800 font-semibold mt-0.5">{j.customer_name}</div>}{j.customer_phone&&<div className="text-sm text-slate-800 font-semibold mt-0.5">{j.customer_phone}</div>}</td><td className="p-3 align-top hidden md:table-cell"><div className="text-sm font-semibold text-slate-800">{j.gas_agency_name||<span className="text-slate-300">—</span>}</div>{j.gas_company_name&&<div className="text-xs text-slate-400 mt-0.5">{j.gas_company_name}</div>}</td>
              <td className="p-3 align-top hidden md:table-cell"><span className="text-base font-semibold text-slate-700">{j.assigned_to?eName(j.assigned_to):<span className="text-amber-600 font-bold">Unassigned</span>}</span></td>
              <td className="p-3 align-top hidden md:table-cell"><SBadge s={j.status}/></td>
              <td className="p-3 hidden md:table-cell">{j.gps_lat?<a href={`https://www.google.com/maps?q=${j.gps_lat},${j.gps_lng}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"><II.Map s={14}/>View</a>:<span className="text-slate-300 text-sm">—</span>}</td>
              <td className="p-3"><div className="flex gap-1"><button onClick={()=>setEditJob(j)} className="p-1.5 rounded hover:bg-slate-100"><II.Edit s={15} className="text-slate-400"/></button><button onClick={()=>setDelT(j.id)} className="p-1.5 rounded hover:bg-red-50"><II.Trash s={15} className="text-slate-400 hover:text-red-500"/></button></div></td>
            </tr>)}{paged.length===0&&<tr><td colSpan={8} className="p-12 text-center text-slate-400 text-base font-medium">{q||hasFilters?"No matching jobs":"No jobs yet"}</td></tr>}</tbody></table></div></div>
          <Pager page={pg} setPage={setPg} total={filtered.length}/>
        </div>}

        {tab==="employees"&&<div className="mt-4"><div className="flex justify-between items-center mb-4 flex-wrap gap-2"><h2 className="text-lg font-bold">Field Workers</h2><div className="flex gap-2"><button onClick={()=>setShowAcct(true)} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-semibold shadow" style={{background:C.red}}><II.Key s={16}/>Create Login</button><button onClick={()=>setShowE(true)} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-semibold shadow" style={{background:C.pri}}><II.Plus s={16}/>Add Employee</button></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{emps.map(e=>{const ej=jobs.filter(j=>j.assigned_to===e.id),dn=ej.filter(j=>j.status==="completed").length,pd=ej.filter(j=>j.status==="pending").length;return<div key={e.id} className="bg-white rounded-xl shadow-sm border p-5"><div className="flex items-start justify-between mb-3"><div><h3 className="font-bold">{e.name}</h3><p className="text-sm text-slate-500">{e.phone}</p>{e.area&&<p className="text-xs text-slate-400 mt-0.5">{e.area}</p>}</div><div className="flex items-center gap-1"><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background:"#e8edf5"}}><II.User s={16} style={{color:C.pri}}/></div><button onClick={()=>setDelE(e.id)} className="p-1.5 rounded hover:bg-red-50"><II.Trash s={15} className="text-slate-300 hover:text-red-500"/></button></div></div>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">{[{v:ej.length,l:"Total",c:"bg-slate-50"},{v:dn,l:"Done",c:"bg-emerald-50"},{v:pd,l:"Pending",c:"bg-amber-50"}].map((d,i)=><div key={i} className={`${d.c} rounded-lg py-1.5`}><div className="text-base font-bold">{d.v}</div><div className="text-[9px] text-slate-500 uppercase">{d.l}</div></div>)}</div>
            <div className="flex gap-2">{e.profile_id?<span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-semibold">Has Login</span>:<span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 rounded font-semibold">No Login</span>}<div className="flex-1"/><button onClick={()=>onViewEmp(e.id)} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"><II.Eye s={14}/>View</button></div>
          </div>})}</div></div>}

        {tab==="audit"&&(()=>{
          // compute audit-filtered list
          const auditJobs=jobs.filter(j=>{
            if(auditEmp&&j.assigned_to!==auditEmp)return false;
            if(auditSt&&j.status!==auditSt)return false;
            if(auditGps==="yes"&&(!j.gps_lat||!j.gps_lng))return false;
            if(auditGps==="no"&&j.gps_lat)return false;
            if(auditPhoto==="yes"&&!j.validation_photo_url)return false;
            if(auditPhoto==="no"&&j.validation_photo_url)return false;
            return true;
          });
          const gpsOk=auditJobs.filter(j=>j.gps_lat&&j.gps_lng).length;
          const photoOk=auditJobs.filter(j=>j.validation_photo_url).length;
          const auditPaged=auditJobs.slice(auditPg*PAGE_SZ,(auditPg+1)*PAGE_SZ);
          return(
            <div className="mt-4">
              {/* Summary badges */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  {l:"Total in view",v:auditJobs.length,bg:"bg-slate-700"},
                  {l:"GPS captured",v:`${gpsOk} / ${auditJobs.length}`,bg:gpsOk===auditJobs.length?"bg-emerald-600":"bg-amber-500"},
                  {l:"Photos uploaded",v:`${photoOk} / ${auditJobs.filter(j=>j.status!=="completed"&&j.status!=="pending").length}`,bg:photoOk===auditJobs.filter(j=>j.validation_photo_url!==undefined&&j.status!=="pending").length?"bg-emerald-600":"bg-amber-500"},
                ].map((s,i)=><div key={i} className={`${s.bg} text-white rounded-xl p-3 text-center`}><div className="text-lg font-extrabold">{s.v}</div><div className="text-[10px] uppercase opacity-60 mt-0.5">{s.l}</div></div>)}
              </div>
              {/* Filters */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Employee</label><select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={auditEmp} onChange={e=>{setAuditEmp(e.target.value);setAuditPg(0);}}><option value="">All</option>{emps.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Status</label><select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={auditSt} onChange={e=>{setAuditSt(e.target.value);setAuditPg(0);}}><option value="">All</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="customer-not-reachable">Not Reachable</option><option value="customer-refused">Refused</option><option value="rescheduled">Rescheduled</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">GPS</label><select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={auditGps} onChange={e=>{setAuditGps(e.target.value);setAuditPg(0);}}><option value="">Any</option><option value="yes">✅ Captured</option><option value="no">❌ Missing</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Proof Photo</label><select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={auditPhoto} onChange={e=>{setAuditPhoto(e.target.value);setAuditPg(0);}}><option value="">Any</option><option value="yes">✅ Uploaded</option><option value="no">❌ Missing</option></select></div>
              </div>
              {/* Lightbox */}
              {lightbox&&<div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4" onClick={()=>setLightbox(null)}><div className="relative max-w-lg w-full" onClick={e=>e.stopPropagation()}><img src={lightbox} alt="Proof" className="w-full rounded-xl shadow-2xl max-h-[80vh] object-contain bg-black"/><button onClick={()=>setLightbox(null)} className="absolute top-3 right-3 bg-white/20 text-white rounded-full p-2 hover:bg-white/40"><II.No s={18}/></button><a href={lightbox} target="_blank" rel="noreferrer" className="absolute bottom-3 right-3 bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg">Open full ↗</a></div></div>}
              {/* Table */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50 border-b text-left">{["CUID","Customer","Employee","Status","GPS","Arrival Time","Proof Photo"].map(h=><th key={h} className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody>
                      {auditPaged.map(j=>{
                        const empName=emps.find(e=>e.id===j.assigned_to)?.name||"—";
                        const hasGps=!!(j.gps_lat&&j.gps_lng);
                        const hasPhoto=!!j.validation_photo_url;
                        const arrivalFmt=j.arrival_time?new Date(j.arrival_time).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"—";
                        return(
                          <tr key={j.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="px-4 py-3"><span className="font-mono font-bold text-indigo-700 text-xs bg-indigo-50 px-2 py-1 rounded">{j.consumer_id||"—"}</span></td>
                            <td className="px-4 py-3"><div className="font-semibold text-xs text-slate-800 max-w-[160px] truncate">{j.customer_name||"—"}</div><div className="text-[10px] text-slate-400 max-w-[160px] truncate">{j.address}</div></td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">{empName}</td>
                            <td className="px-4 py-3"><SBadge s={j.status}/></td>
                            <td className="px-4 py-3">
                              {j.status==="pending"
                                ?<span className="text-xs text-slate-300">—</span>
                                :hasGps
                                  ?<a href={`https://www.google.com/maps?q=${j.gps_lat},${j.gps_lng}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline whitespace-nowrap"><II.Ok s={14}/>View Map</a>
                                  :<span className="flex items-center gap-1 text-xs font-bold text-red-500"><II.No s={14}/>Missing</span>}
                              {j.status!=="pending"&&hasGps&&<div className="text-[9px] text-slate-400 font-mono mt-0.5">{(+j.gps_lat).toFixed(4)}, {(+j.gps_lng).toFixed(4)}</div>}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{arrivalFmt}</td>
                            <td className="px-4 py-3">
                              {hasPhoto
                                ?<button onClick={()=>setLightbox(j.validation_photo_url)} className="block w-14 h-14 rounded-lg overflow-hidden border-2 border-emerald-300 hover:border-emerald-500 transition flex-shrink-0"><img src={j.validation_photo_url} alt="proof" className="w-full h-full object-cover"/></button>
                                :<span className="flex items-center gap-1 text-xs font-bold text-slate-400"><II.No s={14}/>None</span>}
                            </td>
                          </tr>
                        );
                      })}
                      {auditPaged.length===0&&<tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">No jobs match the current filters</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pager page={auditPg} setPage={setAuditPg} total={auditJobs.length}/>
            </div>
          );
        })()}
      </div>
      <Modal open={showE} close={()=>setShowE(false)} title="Add Employee"><div className="space-y-4"><Inp label="Name" required value={nE.name} onChange={e=>setNE({...nE,name:e.target.value})} placeholder="Ramesh Kumar"/><Inp label="Phone" required value={nE.phone} onChange={e=>setNE({...nE,phone:e.target.value})} placeholder="9876543210"/><Inp label="Area" value={nE.area} onChange={e=>setNE({...nE,area:e.target.value})} placeholder="Rohini"/><button onClick={doAddE} className="w-full py-3 text-white rounded-lg font-semibold text-sm" style={{background:C.pri}}>Add Employee</button></div></Modal>
      <Modal open={showJ} close={()=>setShowJ(false)} title="Create Job" wide><Tabs tabs={[{k:"single",l:"Single"},{k:"bulk",l:"Bulk Upload"}]} a={jTab} set={setJTab}/>{jTab==="single"?<div className="mt-4"><JobForm emps={emps} onSave={async f=>{await onAddJob(f);setShowJ(false);}}/></div>:<div className="mt-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800"><p className="font-semibold mb-1">CSV Format (7 columns, in order):</p><p className="font-mono">consumer_no, name, address, mobile, agency_name, gas_company, assigned_to</p><p className="mt-1 text-blue-600">• "assigned_to" = employee name (must match exactly). Leave blank to upload unassigned.<br/>• Date allotted is set automatically on upload.<br/>• First row treated as header and skipped if it contains text.</p></div>
        <div className="flex gap-2"><input ref={csvRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvFile}/><button onClick={()=>csvRef.current?.click()} className="flex-1 py-4 border-2 border-dashed border-slate-300 rounded-xl font-semibold text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2 transition"><II.File s={18}/>{bulk?"✓ File loaded — review below":"Upload CSV File"}</button></div>
        <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">Or paste CSV data directly:</label><textarea className="w-full px-3 py-3 border rounded-lg text-sm font-mono" rows={8} value={bulk} onChange={e=>setBulk(e.target.value)} placeholder={"consumer_no, name, address, mobile, agency_name, gas_company, assigned_to\n100234, Sharma Ji, House 21 Sector 5 Rohini, 9876543210, Delhi Gas Agency, IGL, Ramesh Kumar\n100235, Gupta Ji, Flat 305 East Delhi, 9876501235, East Gas Agency, BPCL, "}/></div>
        {bulk&&<div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600"><p className="font-semibold mb-1">Preview: {parseCsvText(bulk).length} valid rows found</p>{parseCsvText(bulk).filter(r=>!r.assigned_to).length>0&&<p className="text-amber-600 font-semibold">{parseCsvText(bulk).filter(r=>!r.assigned_to).length} rows without employee — will be uploaded as unassigned</p>}</div>}
        <button onClick={doBulk} disabled={!bulk} className="w-full py-3 text-white rounded-lg font-semibold text-sm disabled:opacity-40" style={{background:C.pri}}>Upload {parseCsvText(bulk).length} Jobs</button>
      </div>}</Modal>
      <Modal open={!!editJob} close={()=>setEditJob(null)} title="Edit Job" wide>{editJob&&<JobForm job={editJob} emps={emps} isEdit onSave={async f=>{await onUpdJob(editJob.id,f);setEditJob(null);}}/>}</Modal>
      <Confirm open={!!delT} close={()=>setDelT(null)} title="Delete Job" msg="Are you sure? This cannot be undone." danger onOk={()=>onDelJob(delT)}/><Confirm open={bulkDel} close={()=>setBulkDel(false)} title={`Delete ${sel.size} Job${sel.size>1?"s":""}`} msg={`Permanently delete ${sel.size} selected job${sel.size>1?"s":""}? This cannot be undone.`} danger onOk={doBulkDel}/>
      <Confirm open={!!delE} close={()=>setDelE(null)} title="Remove Employee" msg="This will deactivate the employee. Their jobs will remain." danger onOk={()=>onDelEmp(delE)}/>
      <CreateEmpAccountModal open={showAcct} close={()=>setShowAcct(false)} employees={emps} show={show}/>
    </div>
  );
}

/*─── Employee View ──────────────────────────────────────────*/
function EmpView({emp,jobs,onStart,onBack,onLogout,isDirectLogin}){
  const[q,setQ]=useState("");const[pg,setPg]=useState(0);const[sort,setSort]=useState("newest");
  if(!emp)return<div className="min-h-screen flex items-center justify-center" style={{background:C.bg}}><div className="text-center p-8 bg-white rounded-xl shadow"><p className="text-slate-500 mb-4">Employee not found</p>{onBack&&<button onClick={onBack} className="px-6 py-2 text-white rounded-lg text-sm" style={{background:C.pri}}>Back</button>}</div></div>;
  const all=useMemo(()=>{let r=[...jobs];if(q){const ql=q.toLowerCase();r=r.filter(j=>(j.address||"").toLowerCase().includes(ql)||(j.customer_name||"").toLowerCase().includes(ql)||(j.customer_phone||"").includes(ql)||(j.consumer_id||"").toLowerCase().includes(ql));}if(sort==="newest")r.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));else if(sort==="oldest")r.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));else if(sort==="status"){const o={pending:0,"customer-not-reachable":1,"customer-refused":2,rescheduled:3,completed:4};r.sort((a,b)=>(o[a.status]??9)-(o[b.status]??9));}return r;},[jobs,q,sort]);
  const pend=all.filter(j=>j.status==="pending");
  const other=all.filter(j=>j.status!=="pending");
  const shown=[...pend,...other];
  const paged=shown.slice(pg*PAGE_SZ,(pg+1)*PAGE_SZ);
  const pendC=jobs.filter(j=>j.status==="pending").length;
  const doneC=jobs.filter(j=>j.status==="completed").length;

  const JobCard=({j})=>{const isPend=j.status==="pending";return(
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isPend?"border-l-4":"border-slate-200"}`} style={isPend?{borderLeftColor:C.red}:{}}>
      <div className="p-4">
        {j.consumer_id&&<div className="mb-3 px-3 py-2 rounded-lg flex items-center gap-2" style={{background:"#eef2ff",border:"2px solid #c7d2fe"}}><span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">CUID</span><span className="text-xl font-extrabold text-indigo-800 font-mono tracking-widest">{j.consumer_id}</span></div>}
        <div className="flex items-center justify-between mb-3"><SBadge s={j.status}/><a href={`https://maps.google.com/?q=${encodeURIComponent(j.address)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{background:C.pri}}><II.Map s={14}/>नक्शा / Map</a></div>
        <div className="space-y-2">
          <div className="flex items-start gap-2"><II.Pin s={18} className="text-slate-400 flex-shrink-0 mt-0.5"/><p className="text-base font-semibold text-slate-900 leading-snug">{j.address}</p></div>
          {j.customer_name&&<div className="flex items-center gap-2"><II.User s={18} className="text-slate-400 flex-shrink-0"/><p className="text-base font-semibold text-slate-900">{j.customer_name}</p></div>}
          {j.customer_phone&&<div className="flex items-center gap-2"><II.Phone s={18} className="text-slate-400 flex-shrink-0"/><a href={`tel:${j.customer_phone}`} className="text-base font-semibold text-blue-600">{j.customer_phone}</a></div>}
          {j.gas_agency_name&&<div className="text-sm text-slate-500 font-medium mt-1">{j.gas_company_name?`${j.gas_company_name} • `:""}{j.gas_agency_name}</div>}
        </div>
        {isPend&&<button onClick={()=>onStart(j.id)} className="w-full mt-4 py-4 text-white rounded-xl font-extrabold text-base shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition" style={{background:"#059669"}}><II.Play s={20}/>काम शुरू / Start Job</button>}
        {j.status==="completed"&&j.payment_amount&&<div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center"><span className="text-sm font-semibold text-slate-500">Payment</span><span className="font-extrabold text-emerald-600 text-base">₹{j.payment_amount} <span className="text-sm font-normal text-slate-400">({(j.payment_type||"").toUpperCase()})</span></span></div>}
      </div>
    </div>
  );};

  return(
    <div className="min-h-screen" style={{background:C.bg}}>
      <div className="px-5 pt-4 pb-8" style={{background:`linear-gradient(135deg,${C.pri},#1a3a7a)`}}>
        <div className="max-w-2xl mx-auto"><div className="flex justify-between items-start mb-4">{onBack?<button onClick={onBack} className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm"><II.Back s={18}/>Admin</button>:<div/>}{isDirectLogin&&<button onClick={onLogout} className="p-2.5 bg-white/10 rounded-lg hover:bg-white/20"><II.Out s={18} className="text-white"/></button>}</div>
          <div className="flex items-center gap-3 mb-5"><AppLogo s={40}/><div><h1 className="text-xl font-extrabold text-white">Namaste, {emp.name} 🙏</h1><p className="text-blue-200/60 text-sm">आज के काम / Today's Work</p></div></div>
          <div className="flex gap-4"><div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 text-white flex-1 text-center"><div className="text-3xl font-extrabold">{pendC}</div><div className="text-xs uppercase opacity-70 font-semibold mt-0.5">Pending</div></div><div className="bg-emerald-500/90 rounded-xl px-5 py-3 text-white flex-1 text-center"><div className="text-3xl font-extrabold">{doneC}</div><div className="text-xs uppercase opacity-70 font-semibold mt-0.5">Done</div></div></div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-5 pb-10 -mt-4">
        <div className="flex gap-2 mb-5"><div className="relative flex-1"><II.Search s={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input className="w-full pl-10 pr-4 py-3.5 bg-white rounded-xl border border-slate-200 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search name, phone, CUID..." value={q} onChange={e=>{setQ(e.target.value);setPg(0);}}/></div><select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 min-w-[90px]" value={sort} onChange={e=>{setSort(e.target.value);setPg(0);}}><option value="newest">Latest ↓</option><option value="oldest">Oldest ↑</option><option value="status">Status</option></select></div>
        {paged.length===0&&!q&&<div className="bg-white rounded-xl p-12 text-center shadow-sm"><div className="text-5xl mb-3">🎉</div><h3 className="text-xl font-bold mb-1">बधाई हो! All Done!</h3><p className="text-slate-500">No pending jobs</p></div>}
        {paged.length===0&&q&&<div className="bg-white rounded-xl p-8 text-center shadow-sm"><p className="text-slate-400">No results for "{q}"</p></div>}
        <div className="space-y-3">{paged.map(j=><JobCard key={j.id} j={j}/>)}</div>
        <Pager page={pg} setPage={setPg} total={shown.length}/>
      </div>
    </div>
  );
}

/*─── Full Hindi Checklist ────────────────────────────────────*/
const checklistSections = [
  { title: "(अ) सिंगल / डी.बी.सी.", items: [
    { q: "सिलेण्डर खड़ी (सीधी) अवस्था में रखा है।", good: true },
    { q: "सिलेण्डर खुले वातावरण (धूप, ताप, वर्षा, धूल से प्रभावित) में रखा है।", good: false },
    { q: "सिलेण्डर के निकट ज्वलनशील पदार्थ / वस्तु, मिट्टी का तेल, कपड़े के थैले, कागज आदि रखे है।", good: false },
  ]},
  { title: "(ब) प्रेशर रेग्युलेटर", items: [
    { q: "क्या प्रेशर रेग्युलेटर की सही ढंग से सिलेण्डर / रबड ट्यूब के साथ लगा हुआ है।", good: true },
    { q: "क्या प्रेशर रेग्युलेटर सही अवस्था में है, रेग्युलेटर नॉब श्वास छिद्र (ब्रिदर हॉल) तथा बन्द करने की पद्धति सुचारू है।", good: true },
  ]},
  { title: "(स) रबड़ ट्यूब", items: [
    { q: "रबड ट्यूब आई.एस.आई. / बी.आई.एस. द्वारा अनुमोदित है।", good: true },
    { q: "रबड ट्यूब अच्छी हालत (क्रेक अथवा क्षतिग्रस्त नहीं) में है।", good: true },
  ]},
  { title: "(द) चुल्हा", items: [
    { q: "चुल्हा आई.एस. आई. द्वारा अनुमोदित है।", good: true },
    { q: "चूल्हा सिलेण्डर से अधिक ऊँचाई पर रखा हुआ है।", good: true },
  ]},
  { title: "(य) रसोई घर सम्बन्धी (सामान्य)", items: [
    { q: "रसोई घर में हवा के आगमन (आने-जाने) के पर्याप्त साधन है।", good: true },
    { q: "रेफ्रिजरेटर भी रसोई में रखा है।", good: false },
  ]},
  { title: "(र) शैक्षणिक (उपभोक्ता से पूछें)", items: [
    { q: "क्या उसे सही ढंग से प्रेशर रेग्युलेटर का प्रयोग (लगाना/हटाना) आता है।", good: true },
    { q: "सप्लाई लेने के पूर्व सिलेण्डर की जाँच कराने के महत्व का पता है।", good: true },
    { q: "कार्य समाप्त होने/रात को सोने से पूर्व रेग्युलेटर को बन्द किया जाता है।", good: true },
    { q: "सुरक्षा कैप के महत्व का पता है।", good: true },
  ]},
];

function FullChecklist({ onDone }) {
  const totalQ = checklistSections.reduce((s, sec) => s + sec.items.length, 0);
  const [answers, setAnswers] = useState({});
  const [tubeExpiry, setTubeExpiry] = useState({ month: "", year: "" });
  const answered = Object.keys(answers).length;
  const tubeExpiryFilled = tubeExpiry.month !== "" && tubeExpiry.year !== "";
  const allDone = answered === totalQ && tubeExpiryFilled;

  // Tube expiry status: green if expiry >= current month/year, red if past
  const now = new Date();
  const tubeExpiryStatus = (() => {
    if (!tubeExpiryFilled) return null;
    const exp = new Date(parseInt(tubeExpiry.year), parseInt(tubeExpiry.month) - 1);
    const cur = new Date(now.getFullYear(), now.getMonth());
    return exp >= cur ? "valid" : "expired";
  })();

  const toggle = (key, val) => setAnswers(p => ({ ...p, [key]: val }));

  // isGood: true if the answer given matches the "good" answer for that question
  const isGood = (val, good) => val === good;

  return (
    <div>
      <div className="text-center mb-5">
        <h2 className="text-xl font-extrabold">निरीक्षण चेकलिस्ट</h2>
        <p className="text-sm text-slate-500 mt-1">{answered}/{totalQ} answered</p>
        <div className="mt-3 bg-slate-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${totalQ ? (answered / totalQ) * 100 : 0}%` }} />
        </div>
      </div>
      {checklistSections.map((sec, si) => (
        <div key={si} className="mb-5">
          <div className="px-3 py-2 rounded-lg mb-2 text-sm font-bold text-white" style={{ background: C.pri }}>{sec.title}</div>
          <div className="space-y-2">
            {sec.items.map((item, qi) => {
              const key = `${si}-${qi}`;
              const val = answers[key];
              const good = item.good;
              // border colour: green if good answer given, red if bad answer given
              const borderCls = val != null
                ? (isGood(val, good) ? "border-emerald-300" : "border-red-300")
                : "border-slate-200";
              // YES button: green if good===true and selected, red if good===false and selected
              const yesActive = val === true;
              const yesGood = good === true;
              const noActive = val === false;
              const noGood = good === false;
              return (
                <div key={key} className={`bg-white rounded-xl border-2 p-4 transition ${borderCls}`}>
                  <p className="text-sm font-medium text-slate-800 mb-3 leading-relaxed">{qi + 1}. {item.q}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggle(key, true)}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition ${yesActive ? "text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                      style={yesActive ? { background: yesGood ? "#16a34a" : "#dc2626" } : {}}
                    ><II.Ok s={16} />हाँ</button>
                    <button
                      onClick={() => toggle(key, false)}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition ${noActive ? "text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                      style={noActive ? { background: noGood ? "#16a34a" : "#dc2626" } : {}}
                    ><II.No s={16} />नहीं</button>
                  </div>
                </div>
              );
            })}
            {/* Rubber tube expiry — shown only inside section (स) रबड़ ट्यूब = index 2 */}
            {si === 2 && (() => {
              const months = ["01","02","03","04","05","06","07","08","09","10","11","12"];
              const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
              const curYear = now.getFullYear();
              const years = Array.from({ length: 10 }, (_, i) => curYear - 2 + i);
              const borderCls = !tubeExpiryFilled ? "border-slate-200" : tubeExpiryStatus === "valid" ? "border-emerald-400" : "border-red-400";
              const statusBg = !tubeExpiryFilled ? "" : tubeExpiryStatus === "valid" ? "bg-emerald-50" : "bg-red-50";
              return (
                <div className={`bg-white rounded-xl border-2 p-4 transition ${borderCls} ${statusBg}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">📅</div>
                    <div>
                      <p className="font-bold text-base">रबड़ ट्यूब की एक्सपायरी तारीख</p>
                      <p className="text-sm text-slate-500">Rubber Tube Expiry Date</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">महीना / Month</label>
                      <select
                        className={`w-full px-3 py-3 border-2 rounded-lg text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${tubeExpiry.month ? (tubeExpiryStatus === "valid" ? "border-emerald-400 text-emerald-700" : "border-red-400 text-red-700") : "border-slate-200 text-slate-700"}`}
                        value={tubeExpiry.month}
                        onChange={e => setTubeExpiry(p => ({ ...p, month: e.target.value }))}
                      >
                        <option value="">-- Month --</option>
                        {months.map((m, i) => <option key={m} value={m}>{monthNames[i]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">साल / Year</label>
                      <select
                        className={`w-full px-3 py-3 border-2 rounded-lg text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${tubeExpiry.year ? (tubeExpiryStatus === "valid" ? "border-emerald-400 text-emerald-700" : "border-red-400 text-red-700") : "border-slate-200 text-slate-700"}`}
                        value={tubeExpiry.year}
                        onChange={e => setTubeExpiry(p => ({ ...p, year: e.target.value }))}
                      >
                        <option value="">-- Year --</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  {tubeExpiryFilled && (
                    <div className={`mt-3 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold ${tubeExpiryStatus === "valid" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                      {tubeExpiryStatus === "valid" ? <II.Ok s={16}/> : <II.Warn s={16}/>}
                      {tubeExpiryStatus === "valid" ? "✅ ट्यूब वैध है / Tube is Valid" : "❌ ट्यूब एक्सपायर हो गई है / Tube Expired"}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ))}
      {allDone ? (
        <button onClick={() => {
          const result = {};
          checklistSections.forEach((sec, si) => {
            sec.items.forEach((item, qi) => {
              result[`s${si}_q${qi}`] = answers[`${si}-${qi}`];
            });
          });
          result.yes_count = Object.values(answers).filter(v => v === true).length;
          result.no_count = Object.values(answers).filter(v => v === false).length;
          result.total = totalQ;
          result.tube_expiry_month = tubeExpiry.month;
          result.tube_expiry_year = tubeExpiry.year;
          result.tube_expiry_status = tubeExpiryStatus;
          onDone(result);
        }} className="w-full py-5 rounded-xl font-extrabold text-lg text-white shadow-lg transition active:scale-[0.98]" style={{ background: C.pri }}>
          आगे बढ़ें / Continue →
        </button>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-sm text-amber-800">
          <II.Warn s={16} />सभी प्रश्नों का उत्तर दें ({totalQ - answered + (tubeExpiryFilled ? 0 : 1)} remaining)
        </div>
      )}
    </div>
  );
}

/*─── Inspection ─────────────────────────────────────────────*/
function Inspect({job,onDone,onBack,onUpd,show}){
  const[step,setStep]=useState("arrival");const[jS,setJS]=useState("pending");const[reason,setReason]=useState("");const[vPhoto,setVPhoto]=useState(null);const[vPhotoUrl,setVPhotoUrl]=useState("");const[cl,setCl]=useState({pipe_condition:null,leak_test:null,regulator_condition:null});const[pay,setPay]=useState({type:"",upi:""});const[rcpt,setRcpt]=useState("");const[saving,setSaving]=useState(false);const[uploading,setUploading]=useState(false);const[gpsErr,setGpsErr]=useState("");const[gpsLd,setGpsLd]=useState(false);const[hoseInstalled,setHoseInstalled]=useState(false);const pRef=useRef(null);
  const totalAmt = FIXED_AMT + (hoseInstalled ? HOSE_AMT : 0);
  const steps=["arrival","status","checklist","payment","receipt"];const prog=((steps.indexOf(step)+1)/steps.length)*100;
  const BB=({onClick,children,color,disabled})=><button onClick={onClick} disabled={disabled||saving} className="w-full py-5 rounded-xl font-extrabold text-lg text-white shadow-lg transition active:scale-[0.98] disabled:opacity-40" style={{background:color||"#059669"}}>{saving?<II.Spin s={20} className="animate-spin mx-auto"/>:children}</button>;
  const CO=({label,labelEn,sel,onSel,y="ok",n="not-ok",yL="हाँ / YES",nL="नहीं / NO",emoji})=><div className="p-5 bg-white rounded-xl border-2 border-slate-200 mb-4"><div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">{emoji}</div><div><p className="font-bold text-base">{label}</p><p className="text-sm text-slate-500">{labelEn}</p></div></div><div className="grid grid-cols-2 gap-3"><button onClick={()=>onSel(y)} className={`py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${sel===y?"bg-emerald-600 text-white shadow":"bg-slate-100 text-slate-700"}`}><II.Ok s={18}/>{yL}</button><button onClick={()=>onSel(n)} className={`py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${sel===n?"text-white shadow":"bg-slate-100 text-slate-700"}`} style={sel===n?{background:C.red}:{}}><II.No s={18}/>{nL}</button></div></div>;

  const doArrival=async()=>{setGpsLd(true);setGpsErr("");if(!navigator.geolocation){setGpsErr("GPS not available");setGpsLd(false);return;}navigator.geolocation.getCurrentPosition(pos=>{const now=new Date().toISOString();onUpd({arrival_time:now,gps_lat:pos.coords.latitude,gps_lng:pos.coords.longitude});setGpsLd(false);setStep("status");},err=>{if(err.code===1)setGpsErr("Location permission denied. Enable GPS.");else setGpsErr("Could not get location. Try again.");setGpsLd(false);},{enableHighAccuracy:true,timeout:15000});};

  const doPhoto=async e=>{const f=e.target.files?.[0];if(!f)return;setUploading(true);try{const compressed=await compressImage(f);const path=`validations/${job.id}_${Date.now()}.jpg`;const{error}=await sb.storage.upload("job-photos",path,compressed);if(error){show?.("Photo upload failed","error");console.error(error);}else{const url=sb.storage.getPublicUrl("job-photos",path);setVPhotoUrl(url);setVPhoto(URL.createObjectURL(compressed));}setUploading(false);}catch(err){show?.("Photo upload failed","error");setUploading(false);}};
  const doNonComplete=async()=>{if(vPhotoUrl&&reason){setSaving(true);await onUpd({status:jS,status_reason:reason,validation_photo_url:vPhotoUrl,completed_time:new Date().toISOString()});setSaving(false);onBack();}};
  const doPayDone=()=>{setRcpt(`RC${String(Math.floor(Math.random()*9999)+1).padStart(4,"0")}`);setStep("receipt");};
  const doFinal=async()=>{setSaving(true);await onDone({payment_type:pay.type||"cash",payment_amount:totalAmt,upi_transaction_id:pay.upi||null,receipt_number:rcpt,status:"completed",completed_time:new Date().toISOString(),hose_installed:hoseInstalled});setSaving(false);};
  const shareR=()=>{const m=`${APP}\nReceipt: ${rcpt}\nCustomer: ${job.customer_name||"N/A"}\n${job.consumer_id?`CUID: ${job.consumer_id}\n`:""}Address: ${job.address}\nInspection Fee: ₹${FIXED_AMT}${hoseInstalled?`\nसुरक्षा एलपीजी होज़ (नई): ₹${HOSE_AMT}`:""}\nTotal Amount: ₹${totalAmt} (${(pay.type||"cash").toUpperCase()})\nDate: ${new Date().toLocaleDateString("en-IN")}`;window.open(`https://wa.me/?text=${encodeURIComponent(m)}`,"_blank");};
  const printR=()=>{
    const w=window.open("","_blank","width=600,height=800");
    if(!w)return;
    const checklistHtml=checklistSections.map((sec,si)=>{
      const rows=sec.items.map((item,qi)=>{
        const val=cl["s"+si+"_q"+qi];
        const good=item.good;
        const isGoodAns=(val===good);
        const ans=val===true?(isGoodAns?'<span class="good">✓ हाँ</span>':'<span class="bad">✓ हाँ</span>'):val===false?(isGoodAns?'<span class="good">✗ नहीं</span>':'<span class="bad">✗ नहीं</span>'):'<span class="na">—</span>';
        return '<tr class="'+(qi%2===0?'even':'odd')+'"><td class="qnum">'+(qi+1)+'.</td><td class="qtxt">'+item.q+'</td><td class="qans">'+ans+'</td></tr>';
      }).join("");
      return '<div class="sec"><div class="sec-hdr">'+sec.title+'</div><table class="qtable">'+rows+'</table></div>';
    }).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>Inspection Report – ${rcpt}</title><link rel="icon" type="image/png" href="https://ybyvhoyiifjfvxcuaeku.supabase.co/storage/v1/object/public/assets/SVG%20(1).png"/><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:0 auto;font-size:12px;color:#111}
      .hdr{text-align:center;border-bottom:3px solid #0f2557;padding-bottom:14px;margin-bottom:14px}
      .hdr h1{font-size:17px;color:#0f2557;font-weight:900}
      .hdr .sub{font-size:10px;color:#888;margin-top:3px}
      .rcn{text-align:center;font-size:20px;font-weight:900;color:#0f2557;letter-spacing:3px;margin:10px 0 14px}
      .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;margin-bottom:14px;padding:10px;background:#f7f9fc;border-radius:6px;border:1px solid #dde3ee}
      .info-row{display:flex;gap:4px;font-size:11px;padding:2px 0}.info-row .l{color:#666;min-width:90px}.info-row .v{font-weight:600}
      .amt{background:#f0fdf4;border:2px solid #059669;border-radius:6px;padding:10px;margin:12px 0;text-align:center}
      .amt .n{font-size:20px;font-weight:900;color:#059669}.amt .s{font-size:10px;color:#666;margin-top:2px}

      .sec{margin-bottom:14px}
      .sec-hdr{background:#0f2557;color:#fff;padding:6px 10px;font-size:11px;font-weight:700;border-radius:4px 4px 0 0}
      .qtable{width:100%;border-collapse:collapse}
      .qtable tr.even{background:#f9fafb}.qtable tr.odd{background:#fff}
      .qtable td{padding:5px 8px;vertical-align:top;border-bottom:1px solid #e5e7eb;font-size:11px}
      .qnum{width:22px;color:#888;padding-top:6px}
      .qtxt{line-height:1.5}
      .qans{width:60px;text-align:center;font-weight:700;white-space:nowrap;padding-top:6px}
      .good{color:#15803d;font-weight:700}.bad{color:#dc2626;font-weight:700}.na{color:#999}
      .unsafe{background:#fef2f2;border:2px solid #dc2626;border-radius:6px;padding:10px 14px;margin-bottom:14px;color:#dc2626;font-weight:800;font-size:12px;text-align:center}
      .ftr{text-align:center;margin-top:16px;padding-top:10px;border-top:2px dashed #ccc;font-size:9px;color:#999}
      .ftr .sig{display:flex;justify-content:space-between;margin-bottom:24px;margin-top:8px}
      .ftr .sig-box{border-top:1px solid #aaa;width:160px;text-align:center;padding-top:4px;font-size:10px;color:#555}
      @media print{body{padding:10px}button{display:none}}
    </style></head><body>
      <div class="hdr"><h1>${APP}</h1><div class="sub">Gas Safety Inspection — Completed Form / निरीक्षण प्रमाण-पत्र</div></div>
      <div class="rcn">${rcpt}</div>
      <div class="info-grid">
        ${[["Date / दिनांक",new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})],["Time / समय",new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})],["Customer / ग्राहक",job.customer_name||"N/A"],["Address / पता",job.address],job.consumer_id?["Consumer ID",job.consumer_id]:null,job.customer_phone?["Phone / फोन",job.customer_phone]:null,job.gas_company_name?["Gas Company",job.gas_company_name]:null,job.gas_agency_name?["Gas Agency",job.gas_agency_name]:null].filter(Boolean).map(([l,v])=>`<div class="info-row"><span class="l">${l}:</span><span class="v">${v}</span></div>`).join("")}
      </div>
      <div class="amt"><div class="s">Amount Paid / भुगतान</div><div class="n">₹${totalAmt}</div>${hoseInstalled?`<div class="s" style="font-size:11px;margin-top:4px">निरीक्षण शुल्क: ₹${FIXED_AMT} + सुरक्षा एलपीजी होज़: ₹${HOSE_AMT}</div>`:`<div class="s">निरीक्षण शुल्क / Inspection Fee</div>`}<div class="s">${(pay.type||"cash").toUpperCase()}${pay.upi?" • Ref: "+pay.upi:""}</div></div>

      ${(()=>{const hasBad=checklistSections.some((sec,si)=>sec.items.some((item,qi)=>{const val=cl["s"+si+"_q"+qi];return val!==undefined&&val!==item.good;}));return hasBad?'<div class="unsafe">⚠️ Unsafe Inspection: Changes / Repairs are Recommended — असुरक्षित निरीक्षण: सुधार आवश्यक है</div>':'';})()}
      <div style="font-size:13px;font-weight:800;color:#0f2557;margin-bottom:8px;border-bottom:2px solid #0f2557;padding-bottom:4px">निरीक्षण चेकलिस्ट / Inspection Checklist</div>
      ${checklistHtml}
      <div class="ftr">
        <div class="sig"><div class="sig-box">Inspector Signature<br>निरीक्षक हस्ताक्षर</div><div class="sig-box">Customer Signature<br>ग्राहक हस्ताक्षर</div></div>
        ${APP} — Gas Safety Inspection Report | Receipt: ${rcpt} | ${new Date().toLocaleDateString("en-IN")}
      </div>
    </body></html>`);
    w.document.close();
    setTimeout(()=>w.print(),400);
  };

  return(
    <div className="min-h-screen" style={{background:C.bg}}>
      <div className="px-5 pt-4 pb-6" style={{background:"linear-gradient(135deg,#059669,#047857)"}}><div className="max-w-2xl mx-auto"><button onClick={onBack} className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3"><II.Back s={18}/>Back / वापस</button><h1 className="text-lg font-extrabold text-white">{job.address}</h1>{job.customer_name&&<p className="text-emerald-100 text-sm mt-1">{job.customer_name}{job.consumer_id?` • CUID: ${job.consumer_id}`:""}</p>}<div className="mt-3 bg-white/20 rounded-full h-2.5 overflow-hidden"><div className="h-full bg-white rounded-full transition-all duration-500" style={{width:`${prog}%`}}/></div><p className="text-emerald-100 text-xs mt-1.5">Step {steps.indexOf(step)+1}/{steps.length}</p></div></div>
      <div className="max-w-2xl mx-auto px-5 pb-10 -mt-2">
        {step==="arrival"&&<div className="bg-white rounded-xl shadow-sm p-8 text-center"><AppLogo s={64} className="mx-auto mb-4"/><h2 className="text-2xl font-extrabold mb-1">क्या आप पहुँच गए?</h2><p className="text-lg text-slate-500 mb-6">Did you reach?</p><div className="bg-slate-50 rounded-xl p-4 mb-6 text-left"><p className="font-bold text-sm">{job.address}</p>{job.customer_phone&&<p className="text-sm text-slate-500 mt-1">📞 {job.customer_phone}</p>}</div>{gpsErr&&<div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 text-left">{gpsErr}</div>}<BB onClick={doArrival} disabled={gpsLd} color={C.pri}>{gpsLd?<><II.Spin s={24} className="animate-spin inline mr-2"/>Getting location...</>:"Confirm Arrival / पहुँच गया"}</BB><p className="text-xs text-slate-400 mt-3">GPS location will be recorded</p></div>}

        {step==="status"&&<div className="bg-white rounded-xl shadow-sm p-6"><h2 className="text-xl font-extrabold text-center mb-1">क्या हुआ?</h2><p className="text-sm text-slate-500 text-center mb-6">What happened?</p><div className="space-y-3">{[{s:"completed",e:"✅",h:"काम पूरा हुआ",n:"Completed"},{s:"customer-not-reachable",e:"🚫",h:"ग्राहक नहीं मिला",n:"Not Reachable"},{s:"customer-refused",e:"🙅",h:"ग्राहक ने मना किया",n:"Refused"},{s:"rescheduled",e:"📅",h:"दोबारा करना है",n:"Reschedule"}].map(o=><button key={o.s} onClick={()=>{setJS(o.s);if(o.s==="completed")setStep("checklist");}} className={`w-full py-5 rounded-xl font-bold text-base flex items-center gap-4 px-5 border-2 transition ${jS===o.s&&o.s!=="completed"?"text-white":"border-slate-200 hover:border-slate-400"}`} style={jS===o.s&&o.s!=="completed"?{background:C.pri,borderColor:C.pri}:{}}><span className="text-2xl">{o.e}</span><div className="text-left"><div>{o.h}</div><div className="text-sm opacity-70 font-normal">{o.n}</div></div></button>)}</div>
          {jS!=="completed"&&jS!=="pending"&&<div className="mt-6 p-5 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-4"><p className="font-bold text-amber-900">Proof Required</p><div><input ref={pRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={doPhoto}/><button onClick={()=>pRef.current?.click()} disabled={uploading} className="w-full py-4 border-2 border-dashed border-amber-400 rounded-xl font-bold text-sm text-amber-700 flex items-center justify-center gap-2">{uploading?<><II.Spin s={18} className="animate-spin"/>Uploading...</>:vPhoto?<>✓ Photo Uploaded</>:<><II.Cam s={20}/>{jS==="customer-not-reachable"?"घर की Photo Upload":"Refusal Form Upload"}</>}</button>{vPhoto&&<img src={vPhoto} alt="" className="mt-3 rounded-xl max-h-40 w-full object-cover"/>}</div><div><label className="block text-sm font-semibold text-amber-900 mb-1.5">Reason *</label><textarea className="w-full px-4 py-3 border border-amber-300 rounded-xl text-sm bg-white" rows={3} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Write reason..."/></div><BB onClick={doNonComplete} disabled={!vPhotoUrl||!reason} color="#b45309">Submit</BB></div>}
        </div>}

        {step==="checklist"&&<FullChecklist onDone={data=>{setCl(data);setStep("payment");}}/>}

        {step==="payment"&&<div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center mb-6"><div className="text-4xl mb-2">💰</div><h2 className="text-2xl font-extrabold">Payment</h2></div>
          {/* Suraksha LPG Hose checkbox */}
          <div className={`mb-5 rounded-xl border-2 p-4 transition cursor-pointer select-none ${hoseInstalled?"border-emerald-500 bg-emerald-50":"border-slate-200 bg-slate-50"}`} onClick={()=>setHoseInstalled(h=>!h)}>
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${hoseInstalled?"border-emerald-600 bg-emerald-600":"border-slate-300 bg-white"}`}>
                {hoseInstalled&&<II.Ok s={14} className="text-white"/>}
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-sm">सुरक्षा एलपीजी होज़ लगाई गई</p>
                <p className="text-xs text-slate-500 mt-0.5">New Suraksha LPG Hose Installed</p>
              </div>
              <div className={`text-sm font-extrabold ${hoseInstalled?"text-emerald-700":"text-slate-400"}`}>+₹{HOSE_AMT}</div>
            </div>
          </div>
          {/* Amount breakdown */}
          <div className="bg-slate-50 rounded-xl p-5 text-center mb-6">
            {hoseInstalled ? (
              <div>
                <div className="flex justify-between text-sm text-slate-500 mb-1 px-2"><span>निरीक्षण शुल्क</span><span>₹{FIXED_AMT}</span></div>
                <div className="flex justify-between text-sm text-slate-500 mb-3 px-2"><span>सुरक्षा एलपीजी होज़</span><span>₹{HOSE_AMT}</span></div>
                <div className="border-t border-slate-200 pt-3"><p className="text-xs text-slate-500 uppercase mb-1">Total Amount</p><p className="text-4xl font-extrabold" style={{color:C.pri}}>₹{totalAmt}</p></div>
              </div>
            ) : (
              <div><p className="text-xs text-slate-500 uppercase mb-1">Fixed Amount</p><p className="text-4xl font-extrabold" style={{color:C.pri}}>₹{FIXED_AMT}</p></div>
            )}
          </div>
          <p className="text-sm font-semibold text-center mb-3 text-slate-600">Payment Method</p><div className="grid grid-cols-2 gap-3 mb-6">{[{t:"cash",e:"💵",n:"CASH"},{t:"upi",e:"📱",n:"UPI"}].map(p=><button key={p.t} onClick={()=>setPay({...pay,type:p.t})} className={`py-5 rounded-xl font-bold text-sm flex flex-col items-center gap-2 border-2 transition ${pay.type===p.t?"border-emerald-600 bg-emerald-50":"border-slate-200"}`}><span className="text-2xl">{p.e}</span>{p.n}</button>)}</div>{pay.type==="upi"&&<div className="mb-5 p-4 bg-violet-50 border-2 border-violet-200 rounded-xl text-center"><p className="text-xs font-bold text-violet-700 uppercase mb-3">Scan to Pay — PhonePe</p><img src="https://en.wikipedia.org/wiki/QR_code"alt="PhonePe QR" className="w-48 h-48 mx-auto rounded-xl border border-violet-200 mb-3"/><p className="text-xs text-slate-500 mb-2">Enter Transaction ID after payment</p><input className="w-full px-3 py-2.5 border border-violet-300 rounded-lg text-sm bg-white text-center font-mono" placeholder="UPI Transaction ID" value={pay.upi} onChange={e=>setPay({...pay,upi:e.target.value})}/></div>}{pay.type&&(pay.type!=="upi"||pay.upi)&&<BB onClick={doPayDone}>Generate Receipt</BB>}
        </div>}

        {step==="receipt"&&<div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <div className="p-5 text-center border-b-2" style={{background:C.pri,borderColor:C.red}}><h2 className="text-lg font-extrabold text-white">{APP}</h2><p className="text-blue-200/60 text-xs">Gas Safety Inspection Receipt</p></div>
          <div className="p-5"><div className="text-center mb-4"><p className="text-2xl font-extrabold tracking-widest" style={{color:C.pri}}>{rcpt}</p></div>
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-4"><table className="w-full text-sm">{[["Date",new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})],["Customer",job.customer_name||"N/A"],["Address",job.address],job.consumer_id&&["CUID",job.consumer_id],job.gas_company_name&&["Company",job.gas_company_name],job.gas_agency_name&&["Agency",job.gas_agency_name]].filter(Boolean).map(([l,v],i)=><tr key={i} className={i%2===0?"bg-slate-50":""}><td className="px-3 py-2 text-slate-500 text-xs border-r w-[35%]">{l}</td><td className="px-3 py-2 font-medium text-xs">{v}</td></tr>)}</table></div>
            {hoseInstalled ? (
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-lg p-4 mb-4">
                <div className="flex justify-between text-sm text-emerald-700 mb-1 font-medium"><span>निरीक्षण शुल्क</span><span>₹{FIXED_AMT}</span></div>
                <div className="flex justify-between text-sm text-emerald-700 mb-3 font-medium"><span>सुरक्षा एलपीजी होज़ (नई)</span><span>₹{HOSE_AMT}</span></div>
                <div className="border-t border-emerald-300 pt-3 text-center">
                  <p className="text-xs text-emerald-600 uppercase font-bold mb-1">Total Paid</p>
                  <p className="text-3xl font-extrabold text-emerald-700">₹{totalAmt}</p>
                  <p className="text-xs text-emerald-600 mt-1">{(pay.type||"cash").toUpperCase()}</p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-lg p-4 text-center mb-4"><p className="text-xs text-emerald-600 uppercase font-bold mb-1">Paid</p><p className="text-3xl font-extrabold text-emerald-700">₹{FIXED_AMT}</p><p className="text-xs text-emerald-600 mt-1">{(pay.type||"cash").toUpperCase()}</p></div>
            )}
            
            <div className="grid grid-cols-2 gap-2"><button onClick={printR} className="py-3 border border-slate-200 rounded-lg text-xs font-semibold flex flex-col items-center gap-1" style={{color:C.pri}}><II.Share s={16}/>Share Receipt</button><button onClick={doFinal} disabled={saving} className="py-3 text-white rounded-lg text-xs font-semibold flex flex-col items-center gap-1" style={{background:"#059669"}}>{saving?<II.Spin s={16} className="animate-spin"/>:<II.Ok s={16}/>}Done</button></div>
          </div></div>}
      </div>
    </div>
  );
}

/*─── Reconciliation ─────────────────────────────────────────*/
function Recon({emps,jobs,onBack}){
  const today=new Date().toISOString().slice(0,10);
  const[dateFrom,setDateFrom]=useState(today);
  const[dateTo,setDateTo]=useState(today);
  const[fEmp,setFEmp]=useState("");
  const[fPay,setFPay]=useState("");

  // filter jobs by date range + employee + payment type
  const inRange=useMemo(()=>{
    const from=new Date(dateFrom+"T00:00:00");
    const to=new Date(dateTo+"T23:59:59");
    return jobs.filter(j=>{
      const d=new Date(j.created_at||j.completed_time||0);
      if(d<from||d>to)return false;
      if(fEmp&&j.assigned_to!==fEmp)return false;
      if(fPay&&j.payment_type!==fPay)return false;
      return true;
    });
  },[jobs,dateFrom,dateTo,fEmp,fPay]);

  const c=inRange.filter(j=>j.status==="completed");
  const p=inRange.filter(j=>j.status==="pending");
  const nr=inRange.filter(j=>j.status==="customer-not-reachable");
  const rf=inRange.filter(j=>j.status==="customer-refused");

  const ct=c.filter(j=>j.payment_type==="cash").reduce((s,j)=>s+(+j.payment_amount||0),0);
  const ut=c.filter(j=>j.payment_type==="upi").reduce((s,j)=>s+(+j.payment_amount||0),0);
  const ap=c.filter(j=>j.payment_type==="already-paid").reduce((s,j)=>s+(+j.payment_amount||0),0);
  const total=ct+ut+ap;
  const hoseJobs=c.filter(j=>j.hose_installed);
  const hoseRev=hoseJobs.length*HOSE_AMT;
  const avgPerJob=c.length?Math.round(total/c.length):0;
  const compRate=inRange.length?Math.round(c.length/inRange.length*100):0;

  // trendline: group completed jobs by date within range
  const isMultiDay=dateFrom!==dateTo;
  const trendData=useMemo(()=>{
    if(!isMultiDay)return[];
    const map={};
    c.forEach(j=>{
      const d=(j.completed_time||j.created_at||"").slice(0,10);
      if(!d)return;
      if(!map[d])map[d]={date:d,count:0,revenue:0};
      map[d].count++;
      map[d].revenue+=(+j.payment_amount||0);
    });
    const sorted=Object.values(map).sort((a,b)=>a.date.localeCompare(b.date));
    return sorted;
  },[c,isMultiDay]);

  const maxTrendRev=trendData.length?Math.max(...trendData.map(d=>d.revenue),1):1;
  const maxTrendCount=trendData.length?Math.max(...trendData.map(d=>d.count),1):1;

  // per-employee stats
  const es=emps.map(e=>{
    const ej=inRange.filter(j=>j.assigned_to===e.id);
    const ec=ej.filter(j=>j.status==="completed");
    const hoses=ec.filter(j=>j.hose_installed).length;
    const cash=ec.filter(j=>j.payment_type==="cash").reduce((s,j)=>s+(+j.payment_amount||0),0);
    const upi=ec.filter(j=>j.payment_type==="upi").reduce((s,j)=>s+(+j.payment_amount||0),0);
    const already=ec.filter(j=>j.payment_type==="already-paid").reduce((s,j)=>s+(+j.payment_amount||0),0);
    const rate=ej.length?Math.round(ec.length/ej.length*100):0;
    return{e,tot:ej.length,done:ec.length,pend:ej.filter(j=>j.status==="pending").length,nr:ej.filter(j=>j.status==="customer-not-reachable").length,rf:ej.filter(j=>j.status==="customer-refused").length,cash,upi,already,hoses,rate,rev:cash+upi+already};
  }).filter(s=>s.tot>0).sort((a,b)=>b.rev-a.rev);

  const fmtDate=d=>new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short"});

  return(
    <div className="min-h-screen" style={{background:C.bg}}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.pri},#1a3a7a)`}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <button onClick={onBack} className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-2"><II.Back s={18}/>Back</button>
              <h1 className="text-2xl font-extrabold text-white">Reconciliation Dashboard</h1>
              <p className="text-blue-200/60 text-sm mt-0.5">{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
            </div>
            <button onClick={()=>window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-white/15 text-white rounded-lg text-sm font-semibold hover:bg-white/25"><II.Print s={16}/>Print</button>
          </div>
          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><label className="block text-[10px] font-bold text-blue-200/70 uppercase mb-1">From</label><input type="date" className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);if(e.target.value>dateTo)setDateTo(e.target.value);}}/></div>
            <div><label className="block text-[10px] font-bold text-blue-200/70 uppercase mb-1">To</label><input type="date" className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40" value={dateTo} onChange={e=>setDateTo(e.target.value)} min={dateFrom}/></div>
            <div><label className="block text-[10px] font-bold text-blue-200/70 uppercase mb-1">Employee</label><select className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/10 text-white border border-white/20 focus:outline-none" value={fEmp} onChange={e=>setFEmp(e.target.value)}><option value="" className="text-slate-800">All Employees</option>{emps.map(e=><option key={e.id} value={e.id} className="text-slate-800">{e.name}</option>)}</select></div>
            <div><label className="block text-[10px] font-bold text-blue-200/70 uppercase mb-1">Payment</label><select className="w-full px-3 py-2.5 rounded-lg text-sm bg-white/10 text-white border border-white/20 focus:outline-none" value={fPay} onChange={e=>setFPay(e.target.value)}><option value="" className="text-slate-800">All Types</option><option value="cash" className="text-slate-800">Cash</option><option value="upi" className="text-slate-800">UPI</option><option value="already-paid" className="text-slate-800">Already Paid</option></select></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {l:"Total Jobs",v:inRange.length,sub:"in range",bg:"bg-slate-800"},
            {l:"Completed",v:c.length,sub:`${compRate}% rate`,bg:"bg-emerald-600"},
            {l:"Pending",v:p.length,sub:"active",bg:"bg-amber-500"},
            {l:"Follow-ups",v:nr.length+rf.length,sub:`${nr.length} NR · ${rf.length} refused`,bg:"bg-red-600"},
            {l:"Hose Installs",v:hoseJobs.length,sub:`₹${hoseRev} extra`,bg:"bg-violet-600"},
            {l:"Avg / Job",v:`₹${avgPerJob}`,sub:"completed",bg:C.pri},
          ].map((s,i)=>(
            <div key={i} className={`${s.bg} rounded-xl p-4 text-white`}>
              <div className="text-[10px] font-bold uppercase opacity-60 mb-1">{s.l}</div>
              <div className="text-2xl font-extrabold">{s.v}</div>
              <div className="text-[10px] opacity-50 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Collection Split + Total */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold">Collection Breakdown</h2>
            <div className="text-2xl font-extrabold text-emerald-600">₹{total}</div>
          </div>
          <div className="space-y-3">
            {[
              {l:"Cash",v:ct,icon:"💵",color:"bg-amber-400",light:"bg-amber-50",text:"text-amber-800"},
              {l:"UPI",v:ut,icon:"📱",color:"bg-violet-500",light:"bg-violet-50",text:"text-violet-800"},
              {l:"Already Paid",v:ap,icon:"✅",color:"bg-blue-400",light:"bg-blue-50",text:"text-blue-800"},
            ].map(row=>{
              const pct=total?Math.round(row.v/total*100):0;
              return(
                <div key={row.l} className={`${row.light} rounded-xl p-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`flex items-center gap-2 font-semibold text-sm ${row.text}`}><span>{row.icon}</span>{row.l}</span>
                    <span className={`font-extrabold ${row.text}`}>₹{row.v} <span className="font-normal text-xs opacity-60">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full ${row.color} rounded-full transition-all duration-500`} style={{width:`${pct}%`}}/>
                  </div>
                </div>
              );
            })}
            {hoseRev>0&&(
              <div className="bg-violet-50 rounded-xl p-3 border border-violet-200">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold text-sm text-violet-800">🔧 Suraksha Hose Add-on</span>
                  <span className="font-extrabold text-violet-700">₹{hoseRev} <span className="font-normal text-xs opacity-60">({hoseJobs.length} installs)</span></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trendline — only shown for multi-day range */}
        {isMultiDay&&trendData.length>0&&(
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-bold mb-1">Daily Trend</h2>
            <p className="text-xs text-slate-400 mb-4">{dateFrom===dateTo?"Single day":fmtDate(dateFrom)+" → "+fmtDate(dateTo)} · {trendData.length} active days</p>
            {/* Revenue bars */}
            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Revenue per day</p>
              <div className="flex items-end gap-1 h-24">
                {trendData.map((d,i)=>(
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">₹{d.revenue}</div>
                    <div className="w-full rounded-t-sm transition-all duration-300" style={{height:`${Math.max(4,(d.revenue/maxTrendRev)*88)}px`,background:C.pri}}/>
                    <span className="text-[8px] text-slate-400 leading-none">{fmtDate(d.date)}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Job count line */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Jobs completed per day</p>
              <div className="flex items-end gap-1 h-14">
                {trendData.map((d,i)=>(
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-sm bg-emerald-400 transition-all duration-300" style={{height:`${Math.max(4,(d.count/maxTrendCount)*48)}px`}}/>
                    <span className="text-[8px] font-bold text-emerald-700">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Per-Employee Table */}
        {es.length>0&&(
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-bold mb-4">By Employee</h2>
            <div className="space-y-3">
              {es.map(s=>(
                <div key={s.e.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm">{s.e.name}</h3>
                      <p className="text-xs text-slate-400">{s.e.area||"—"}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-emerald-600">₹{s.rev}</div>
                      <div className="text-[10px] text-slate-400">{s.done}/{s.tot} jobs</div>
                    </div>
                  </div>
                  {/* Completion rate bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                      <span>Completion Rate</span><span className={s.rate>=80?"text-emerald-600":s.rate>=50?"text-amber-600":"text-red-600"}>{s.rate}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{width:`${s.rate}%`,background:s.rate>=80?"#16a34a":s.rate>=50?"#d97706":"#dc2626"}}/>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 text-center">
                    {[
                      {v:s.pend,l:"Pending",c:"bg-amber-50 text-amber-700"},
                      {v:s.nr,l:"N/Reach",c:"bg-red-50 text-red-600"},
                      {v:s.rf,l:"Refused",c:"bg-rose-50 text-rose-600"},
                      {v:`₹${s.cash}`,l:"Cash",c:"bg-amber-50 text-amber-800"},
                      {v:`₹${s.upi}`,l:"UPI",c:"bg-violet-50 text-violet-700"},
                      {v:s.hoses,l:"Hoses",c:"bg-purple-50 text-purple-700"},
                    ].map((d,i)=>(
                      <div key={i} className={`${d.c} rounded-lg py-1.5 px-1`}>
                        <div className="text-xs font-bold">{d.v}</div>
                        <div className="text-[8px] uppercase opacity-60 leading-none mt-0.5">{d.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues Panel */}
        {(nr.length>0||rf.length>0)&&(
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <II.Warn s={18} className="text-red-500"/>
              <h2 className="text-base font-bold">Follow-up Required <span className="text-red-500">({nr.length+rf.length})</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{l:"Not Reachable",jobs:nr,bg:"bg-red-50",border:"border-red-200",text:"text-red-700",icon:"🚫"},
                {l:"Refused",jobs:rf,bg:"bg-rose-50",border:"border-rose-200",text:"text-rose-700",icon:"🙅"}
              ].map(g=>g.jobs.length>0&&(
                <div key={g.l} className={`${g.bg} border ${g.border} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-3"><span className="text-lg">{g.icon}</span><h3 className={`font-bold text-sm ${g.text}`}>{g.l} ({g.jobs.length})</h3></div>
                  <div className="space-y-2">
                    {g.jobs.map(j=>(
                      <div key={j.id} className="bg-white rounded-lg p-2.5">
                        <div className="font-semibold text-xs text-slate-800">{j.customer_name||"N/A"}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{j.address}</div>
                        {j.consumer_id&&<div className="text-[10px] text-indigo-500 font-mono mt-0.5">CUID: {j.consumer_id}</div>}
                        {j.status_reason&&<div className={`text-[11px] mt-1 font-semibold ${g.text}`}>↳ {j.status_reason}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {inRange.length===0&&(
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="font-bold text-slate-600 mb-1">No jobs in this range</h3>
            <p className="text-sm text-slate-400">Adjust the date filter or employee selection above</p>
          </div>
        )}
      </div>
    </div>
  );
}

/*─── Main App ───────────────────────────────────────────────*/
export default function App(){
  const[user,setUser]=useState(null);const[prof,setProf]=useState(null);const[myEmpId,setMyEmpId]=useState(null);
  const[authLd,setAuthLd]=useState(true);const[view,setView]=useState("loading");const[selE,setSelE]=useState("");const[selJ,setSelJ]=useState("");
  const db=useData();
  const resolveRole=async u=>{setUser(u);const{data:p}=await sb.from("profiles").select("*").eq("id",u.id).single();setProf(p);if(p?.role==="employee"){const{data:el}=await sb.from("employees").select("*").eq("profile_id",u.id);if(el?.[0]){setMyEmpId(el[0].id);await db.load();setView("emp-direct");}else setView("emp-unlinked");}else{await db.load();setView("admin");}};
  useEffect(()=>{(async()=>{const{data:{user:u}}=await sb.auth.getUser();if(u)await resolveRole(u);else setView("home");setAuthLd(false);})();},[]);
  const onLogin=async u=>await resolveRole(u);
  const onLogout=async()=>{await sb.auth.signOut();setUser(null);setProf(null);setMyEmpId(null);setView("home");};
  const onComplete=async(id,u)=>{await db.updJob(id,u);setView(myEmpId?"emp-direct":"emp");db.load();};

  if(authLd)return<div className="min-h-screen flex items-center justify-center" style={{background:C.pri}}><div className="text-center"><AppLogo s={56} className="mx-auto mb-4"/><II.Spin s={32} className="animate-spin text-blue-400 mx-auto"/><p className="text-blue-200/50 text-sm mt-4">Loading...</p></div></div>;

  if(view==="home")return<LandingPage onLogin={()=>setView("login")}/>;
  if(view==="login"&&!user)return<Login onOk={onLogin} onBack={()=>setView("home")}/>;
  if(!user)return<LandingPage onLogin={()=>setView("login")}/>;
  if(view==="emp-unlinked")return<div className="min-h-screen flex items-center justify-center p-4" style={{background:C.pri}}><div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center"><h2 className="text-xl font-bold mb-2">Account Not Linked</h2><p className="text-slate-500 text-sm mb-6">Contact your admin to link your account.</p><button onClick={onLogout} className="w-full py-3 text-white rounded-lg font-semibold text-sm" style={{background:C.pri}}>Logout</button></div></div>;

  return(<div className="min-h-screen" style={{background:C.bg}}>
    {db.toast&&<Toast msg={db.toast.msg} type={db.toast.type} onClose={()=>db.setToast(null)}/>}
    {db.loading&&(view==="admin"||view==="emp-direct")&&<div className="flex justify-center py-20"><II.Spin s={32} className="animate-spin" style={{color:C.pri}}/></div>}
    {!db.loading&&view==="admin"&&<Admin emps={db.emps} jobs={db.jobs} onAddEmp={db.addEmp} onAddJob={db.addJob} onBulk={db.addBulk} onUpdJob={db.updJob} onDelJob={db.delJob} onDelEmp={db.delEmp} onRecon={()=>setView("recon")} onViewEmp={id=>{setSelE(id);setView("emp");}} onLogout={onLogout} prof={prof} show={db.show}/>}
    {view==="emp"&&<EmpView emp={db.emps.find(e=>e.id===selE)} jobs={db.jobs.filter(j=>j.assigned_to===selE)} onStart={id=>{setSelJ(id);setView("inspect");}} onBack={()=>{setView("admin");db.load();}}/>}
    {!db.loading&&view==="emp-direct"&&<EmpView emp={db.emps.find(e=>e.id===myEmpId)} jobs={db.jobs.filter(j=>j.assigned_to===myEmpId)} onStart={id=>{setSelJ(id);setView("inspect-emp");}} onLogout={onLogout} isDirectLogin/>}
    {view==="inspect-emp"&&<Inspect job={db.jobs.find(j=>j.id===selJ)} onDone={u=>onComplete(selJ,u)} onBack={()=>{setView("emp-direct");db.load();}} onUpd={u=>db.updJob(selJ,u)} show={db.show}/>}
    {view==="inspect"&&<Inspect job={db.jobs.find(j=>j.id===selJ)} onDone={u=>onComplete(selJ,u)} onBack={()=>{setView("emp");db.load();}} onUpd={u=>db.updJob(selJ,u)} show={db.show}/>}
    {view==="recon"&&<Recon emps={db.emps} jobs={db.jobs} onBack={()=>setView("admin")}/>}
  </div>);
}
