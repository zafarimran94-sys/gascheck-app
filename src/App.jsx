import { useState, useEffect, useRef, useCallback } from "react";

/*─── Supabase Mini Client ───────────────────────────────────*/
const SB_URL = "https://ybyvhoyiifjfvxcuaeku.supabase.co";
const SB_KEY = "sb_publishable_CeGC_3Qv1Qz14XpYMPgGyA_h3lB67mP";

function makeSB(url, key) {
  const hdr = { apikey: key, "Content-Type": "application/json" };
  let at = null, rt = null;
  try { at = localStorage.getItem("gc_at"); rt = localStorage.getItem("gc_rt"); } catch {}
  const sv = (a, r) => { at = a; rt = r; try { a ? (localStorage.setItem("gc_at", a), localStorage.setItem("gc_rt", r)) : (localStorage.removeItem("gc_at"), localStorage.removeItem("gc_rt")); } catch {} };
  const ah = () => ({ ...hdr, Authorization: `Bearer ${at || key}` });
  return {
    auth: {
      async signInWithPassword({ email, password }) {
        const r = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: "POST", headers: hdr, body: JSON.stringify({ email, password }) });
        const d = await r.json(); if (d.access_token) sv(d.access_token, d.refresh_token);
        return r.ok ? { data: d, error: null } : { data: null, error: d };
      },
      async signUp({ email, password, options }) {
        const r = await fetch(`${url}/auth/v1/signup`, { method: "POST", headers: hdr, body: JSON.stringify({ email, password, data: options?.data || {} }) });
        const d = await r.json(); return r.ok ? { data: d, error: null } : { data: null, error: d };
      },
      async getUser() {
        if (!at) return { data: { user: null } };
        let r = await fetch(`${url}/auth/v1/user`, { headers: ah() });
        if (r.ok) return { data: { user: await r.json() } };
        if (rt) { const rr = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: hdr, body: JSON.stringify({ refresh_token: rt }) }); if (rr.ok) { const rd = await rr.json(); sv(rd.access_token, rd.refresh_token); return { data: { user: rd.user } }; } }
        sv(null, null); return { data: { user: null } };
      },
      async signOut() { try { await fetch(`${url}/auth/v1/logout`, { method: "POST", headers: ah() }); } catch {} sv(null, null); }
    },
    from(table) {
      let q = "", m = "GET", b = null, sng = false;
      const c = {
        select(cols = "*") { q += `?select=${encodeURIComponent(cols)}`; return c; },
        insert(d) { m = "POST"; b = d; return c; },
        update(d) { m = "PATCH"; b = d; return c; },
        eq(col, v) { q += `${q.includes("?") ? "&" : "?"}${col}=eq.${v}`; return c; },
        order(col, { ascending = true } = {}) { q += `${q.includes("?") ? "&" : "?"}order=${col}.${ascending ? "asc" : "desc"}`; return c; },
        single() { sng = true; return c; },
        then(resolve) {
          (async () => {
            try {
              const h = { ...ah(), Prefer: "return=representation" };
              if (sng) h.Accept = "application/vnd.pgrst.object+json";
              const o = { method: m, headers: h };
              if (b && m !== "GET") o.body = JSON.stringify(b);
              let u = `${url}/rest/v1/${table}${q}`;
              if ((m === "POST" || m === "PATCH") && !q.includes("select")) u += (q.includes("?") ? "&" : "?") + "select=*";
              const r = await fetch(u, o);
              if (!r.ok) return resolve({ data: null, error: { message: await r.text() } });
              const t = await r.text();
              resolve({ data: t ? JSON.parse(t) : null, error: null });
            } catch (e) { resolve({ data: null, error: { message: e.message } }); }
          })();
        }
      };
      return c;
    }
  };
}
const sb = makeSB(SB_URL, SB_KEY);

/*─── Icons ──────────────────────────────────────────────────*/
const Ic = ({ ch, s = 20, ...p }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{ch}</svg>;
const II = {
  Back: p => <Ic {...p} ch={<><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>}/>,
  Plus: p => <Ic {...p} ch={<><path d="M12 5v14"/><path d="M5 12h14"/></>}/>,
  Search: p => <Ic {...p} ch={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>}/>,
  Pin: p => <Ic {...p} ch={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0Z"/><circle cx="12" cy="10" r="3"/></>}/>,
  Ok: p => <Ic {...p} ch={<path d="M20 6 9 17l-5-5"/>}/>,
  No: p => <Ic {...p} ch={<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>}/>,
  Cam: p => <Ic {...p} ch={<><path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></>}/>,
  Share: p => <Ic {...p} ch={<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/></>}/>,
  Print: p => <Ic {...p} ch={<><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></>}/>,
  Eye: p => <Ic {...p} ch={<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>}/>,
  User: p => <Ic {...p} ch={<><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>,
  File: p => <Ic {...p} ch={<><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7Z"/><path d="M14 2v4a2 2 0 002 2h4"/></>}/>,
  Play: p => <Ic {...p} ch={<><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></>}/>,
  Clock: p => <Ic {...p} ch={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}/>,
  Warn: p => <Ic {...p} ch={<><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></>}/>,
  QR: p => <Ic {...p} ch={<><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/></>}/>,
  Out: p => <Ic {...p} ch={<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></>}/>,
  Spin: p => <Ic {...p} ch={<path d="M21 12a9 9 0 11-6.219-8.56"/>}/>,
  Key: p => <Ic {...p} ch={<><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.3 9.3"/><path d="m18 5 3-3"/><path d="M15 8l-2 2"/></>}/>,
  Mail: p => <Ic {...p} ch={<><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></>}/>,
};

/*─── Shared Components ──────────────────────────────────────*/
const SBadge = ({ s }) => <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${{ pending:"bg-amber-100 text-amber-800","in-progress":"bg-sky-100 text-sky-800",completed:"bg-emerald-100 text-emerald-800","customer-not-reachable":"bg-red-100 text-red-800","customer-refused":"bg-rose-100 text-rose-800",rescheduled:"bg-violet-100 text-violet-800" }[s] || "bg-gray-100"}`}>{{ pending:"Pending","in-progress":"In Progress",completed:"Completed","customer-not-reachable":"Not Reachable","customer-refused":"Refused",rescheduled:"Rescheduled" }[s]||s}</span>;
const Bdg = ({ children, v }) => <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${{ outline:"border border-slate-300 text-slate-600", success:"bg-emerald-100 text-emerald-800", danger:"bg-red-100 text-red-800" }[v] || "bg-slate-800 text-white"}`}>{children}</span>;
const Tabs = ({ tabs, a, set }) => <div className="flex bg-slate-100 rounded-xl p-1 gap-1">{tabs.map(t => <button key={t.k} onClick={() => set(t.k)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${a === t.k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>{t.l}</button>)}</div>;
function Modal({ open, close, title, wide, children }) { if (!open) return null; return <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={close}><div className="absolute inset-0 bg-black/50 backdrop-blur-sm"/><div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide?"max-w-2xl":"max-w-md"} max-h-[90vh] overflow-y-auto`} onClick={e=>e.stopPropagation()}><div className="sticky top-0 bg-white rounded-t-2xl border-b px-6 py-4 flex items-center justify-between z-10"><h3 className="text-lg font-bold">{title}</h3><button onClick={close} className="p-1 rounded-full hover:bg-slate-100"><II.No s={20}/></button></div><div className="p-6">{children}</div></div></div>; }
function Toast({ msg, type, onClose }) { useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []); return <div className={`fixed top-4 right-4 z-[100] ${type==="error"?"bg-red-600":type==="success"?"bg-emerald-600":"bg-slate-800"} text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium max-w-xs`}>{msg}</div>; }

/*─── Login Screen ───────────────────────────────────────────*/
function Login({ onOk }) {
  const [em, setEm] = useState(""); const [pw, setPw] = useState(""); const [ld, setLd] = useState(false); const [err, setErr] = useState("");
  const go = async () => {
    setErr(""); setLd(true);
    const { data, error } = await sb.auth.signInWithPassword({ email: em, password: pw });
    if (error) { setErr(error.error_description || error.msg || JSON.stringify(error)); setLd(false); return; }
    onOk(data.user); setLd(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><div className="text-5xl mb-3">🔥</div><h1 className="text-3xl font-extrabold text-white tracking-tight">GasCheck</h1><p className="text-slate-400 text-sm mt-1">Gas Safety Inspection System</p></div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          {err && <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm rounded-xl px-4 py-3 mb-4">{err}</div>}
          <div className="space-y-4">
            <div><label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Email</label><input type="email" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={em} onChange={e=>setEm(e.target.value)} placeholder="you@company.com" onKeyDown={e=>e.key==="Enter"&&go()}/></div>
            <div><label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label><input type="password" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/></div>
            <button onClick={go} disabled={ld||!em||!pw} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2">{ld && <II.Spin s={18} className="animate-spin"/>}{ld?"Signing in...":"Sign In"}</button>
          </div>
        </div>
        <p className="text-center text-slate-500 text-xs mt-6">Admin & Employee — same login page</p>
      </div>
    </div>
  );
}

/*─── Data Hook ──────────────────────────────────────────────*/
function useData() {
  const [emps, setEmps] = useState([]); const [jobs, setJobs] = useState([]); const [loading, setLoading] = useState(true); const [toast, setToast] = useState(null);
  const show = (msg, type = "info") => setToast({ msg, type });
  const load = useCallback(async () => {
    setLoading(true);
    const [er, jr] = await Promise.all([ sb.from("employees").select("*").eq("is_active", true).order("name"), sb.from("jobs").select("*").order("created_at", { ascending: false }) ]);
    if (er.data) setEmps(er.data); if (jr.data) setJobs(jr.data);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  const addEmp = async (e) => { const { data, error } = await sb.from("employees").insert(e); if (error) { show(error.message, "error"); return null; } if (data?.[0]) setEmps(p => [...p, data[0]]); show("Employee added!", "success"); return data?.[0]; };
  const addJob = async (j) => { const { data, error } = await sb.from("jobs").insert(j); if (error) { show(error.message, "error"); return; } if (data?.[0]) setJobs(p => [data[0], ...p]); show("Job created!", "success"); };
  const addBulk = async (list) => { const { data, error } = await sb.from("jobs").insert(list); if (error) { show(error.message, "error"); return; } if (data) setJobs(p => [...data, ...p]); show(`${data?.length||0} jobs added!`, "success"); };
  const updJob = async (id, u) => { const { data, error } = await sb.from("jobs").update(u).eq("id", id); if (error) { show(error.message, "error"); return; } if (data?.[0]) setJobs(p => p.map(j => j.id === id ? data[0] : j)); };
  return { emps, jobs, loading, addEmp, addJob, addBulk, updJob, load, toast, setToast, show };
}

/*─── Admin: Create Employee Account Modal ───────────────────*/
function CreateEmpAccountModal({ open, close, employees, show }) {
  const [selEmp, setSelEmp] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [ld, setLd] = useState(false); const [done, setDone] = useState(null);
  const unlinked = employees.filter(e => !e.profile_id);

  const create = async () => {
    if (!selEmp || !email || !pw) return;
    const emp = employees.find(e => e.id === selEmp);
    setLd(true);
    // 1. Create auth user with role=employee
    const { data, error } = await sb.auth.signUp({ email, password: pw, options: { data: { full_name: emp.name, phone: emp.phone, role: "employee" } } });
    if (error) { show(error.error_description || error.msg || JSON.stringify(error), "error"); setLd(false); return; }
    // 2. Link employee record to new user
    const userId = data?.user?.id || data?.id;
    if (userId) {
      await sb.from("employees").update({ profile_id: userId }).eq("id", selEmp);
      await sb.from("profiles").update({ role: "employee" }).eq("id", userId);
    }
    setDone({ name: emp.name, email, pw });
    show("Employee account created!", "success");
    setLd(false);
  };

  const reset = () => { setSelEmp(""); setEmail(""); setPw(""); setDone(null); };

  return (
    <Modal open={open} close={() => { reset(); close(); }} title="Create Employee Login">
      {done ? (
        <div className="space-y-4">
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 text-center"><div className="text-4xl mb-2">✅</div><h3 className="text-lg font-bold text-emerald-800">Account Created!</h3></div>
          <div className="bg-slate-50 rounded-xl p-4 space-y-3"><div className="flex justify-between"><span className="text-slate-500 text-sm">Name:</span><span className="font-bold">{done.name}</span></div><div className="flex justify-between"><span className="text-slate-500 text-sm">Email:</span><span className="font-mono text-sm">{done.email}</span></div><div className="flex justify-between"><span className="text-slate-500 text-sm">Password:</span><span className="font-mono text-sm">{done.pw}</span></div></div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800"><p className="font-semibold mb-1">📱 Share via WhatsApp:</p><p className="text-xs">Send them the app link + these credentials</p></div>
          <button onClick={() => { const msg = `🔥 GasCheck App\n\nApp: ${window.location.origin}\n\nYour Login:\nEmail: ${done.email}\nPassword: ${done.pw}\n\nPlease login and start your work!`; window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank"); }} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 flex items-center justify-center gap-2"><II.Share s={16}/> Share on WhatsApp</button>
          <button onClick={() => { reset(); close(); }} className="w-full py-3 border-2 border-slate-200 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50">Done</button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Create a login so the employee can access the app on their phone.</p>
          <div><label className="block text-sm font-semibold mb-1">Select Employee *</label><select className="w-full px-4 py-3 border rounded-xl text-sm bg-white" value={selEmp} onChange={e => { setSelEmp(e.target.value); const emp = employees.find(x => x.id === e.target.value); if (emp) setEmail(`${emp.name.toLowerCase().replace(/\s+/g, ".")}@gascheck.app`); }}><option value="">Choose...</option>{unlinked.map(e => <option key={e.id} value={e.id}>{e.name} — {e.area}</option>)}{unlinked.length === 0 && <option disabled>All employees already have accounts</option>}</select></div>
          <div><label className="block text-sm font-semibold mb-1">Email *</label><input className="w-full px-4 py-3 border rounded-xl text-sm" value={email} onChange={e => setEmail(e.target.value)} placeholder="ramesh@gascheck.app"/><p className="text-xs text-slate-400 mt-1">Can be any email — doesn't need to be real</p></div>
          <div><label className="block text-sm font-semibold mb-1">Password *</label><input className="w-full px-4 py-3 border rounded-xl text-sm font-mono" value={pw} onChange={e => setPw(e.target.value)} placeholder="simple123"/><p className="text-xs text-slate-400 mt-1">Keep it simple — employees will use this to login</p></div>
          <button onClick={create} disabled={ld || !selEmp || !email || !pw || pw.length < 6} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center gap-2">{ld ? <II.Spin s={18} className="animate-spin"/> : <II.Key s={16}/>}{ld ? "Creating..." : "Create Login"}</button>
          {pw && pw.length < 6 && <p className="text-xs text-red-500">Password must be at least 6 characters</p>}
        </div>
      )}
    </Modal>
  );
}

/*─── Admin Dashboard ────────────────────────────────────────*/
function Admin({ emps, jobs, onAddEmp, onAddJob, onBulk, onRecon, onViewEmp, onLogout, prof, show }) {
  const [showE, setShowE] = useState(false); const [showJ, setShowJ] = useState(false); const [showAcct, setShowAcct] = useState(false);
  const [tab, setTab] = useState("jobs"); const [jTab, setJTab] = useState("single");
  const [nE, setNE] = useState({ name:"", phone:"", area:"" });
  const [nJ, setNJ] = useState({ address:"", area:"", customer_name:"", customer_phone:"", gas_company_name:"", gas_agency_name:"", assigned_to:"" });
  const [bulk, setBulk] = useState("");

  const tot = jobs.length, done = jobs.filter(j=>j.status==="completed").length, pend = jobs.filter(j=>j.status==="pending"||j.status==="in-progress").length;
  const cash = jobs.filter(j=>j.payment_type==="cash").reduce((s,j)=>s+(+j.payment_amount||0),0);
  const upi = jobs.filter(j=>j.payment_type==="upi").reduce((s,j)=>s+(+j.payment_amount||0),0);
  const eName = id => emps.find(e=>e.id===id)?.name||"—";

  const doAddE = async () => { if(nE.name&&nE.phone&&nE.area) { await onAddEmp(nE); setNE({name:"",phone:"",area:""}); setShowE(false); } };
  const doAddJ = async () => { if(nJ.address&&nJ.area&&nJ.assigned_to) { await onAddJob(nJ); setNJ({address:"",area:"",customer_name:"",customer_phone:"",gas_company_name:"",gas_agency_name:"",assigned_to:""}); setShowJ(false); } };
  const doBulk = async () => { const arr = []; bulk.trim().split("\n").forEach(l => { const [addr,area,name,eid]=l.split(",").map(s=>s.trim()); const e=emps.find(x=>x.id===eid||x.name===eid); if(addr&&area&&e) arr.push({address:addr,area,customer_name:name||null,gas_company_name:null,gas_agency_name:null,assigned_to:e.id}); }); if(arr.length){await onBulk(arr); setBulk(""); setShowJ(false);} };

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(135deg,#f8fafc,#e2e8f0)"}}>
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-30"><div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"><div><h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">🔥 GasCheck Admin</h1><p className="text-sm text-slate-500">Welcome, {prof?.full_name||"Admin"}</p></div><div className="flex gap-2 flex-wrap"><button onClick={onRecon} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"><II.File s={16}/>Reconciliation</button><button onClick={onLogout} className="p-2.5 border border-slate-300 rounded-xl hover:bg-slate-100 transition"><II.Out s={16}/></button></div></div></header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[{l:"Total Jobs",v:tot,g:"from-blue-500 to-blue-600",i:"📋"},{l:"Completed",v:done,g:"from-emerald-500 to-emerald-600",i:"✅"},{l:"Cash ₹",v:`₹${cash}`,g:"from-amber-500 to-orange-500",i:"💵"},{l:"UPI ₹",v:`₹${upi}`,g:"from-violet-500 to-purple-600",i:"📱"}].map((s,i)=><div key={i} className={`bg-gradient-to-br ${s.g} rounded-2xl p-4 sm:p-5 text-white shadow-lg`}><div className="flex justify-between items-start mb-2"><span className="text-xs font-semibold uppercase tracking-wider opacity-80">{s.l}</span><span className="text-xl">{s.i}</span></div><div className="text-2xl sm:text-3xl font-extrabold">{s.v}</div>{s.l==="Completed"&&<div className="text-xs opacity-80 mt-1">Pending: {pend}</div>}</div>)}
        </div>

        <Tabs tabs={[{k:"jobs",l:`Jobs (${tot})`},{k:"employees",l:`Employees (${emps.length})`}]} a={tab} set={setTab}/>

        {tab==="jobs" && <div className="mt-4"><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">All Jobs</h2><button onClick={()=>setShowJ(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow"><II.Plus s={16}/>Create Job</button></div>
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-slate-50 border-b"><th className="text-left p-3 font-semibold text-slate-600">Address</th><th className="text-left p-3 font-semibold text-slate-600 hidden sm:table-cell">Area</th><th className="text-left p-3 font-semibold text-slate-600 hidden md:table-cell">Assigned</th><th className="text-left p-3 font-semibold text-slate-600">Status</th><th className="text-left p-3 font-semibold text-slate-600">Payment</th></tr></thead>
            <tbody>{jobs.map(j=><tr key={j.id} className="border-b border-slate-100 hover:bg-slate-50/50"><td className="p-3"><div className="font-medium text-sm">{j.address}</div>{j.customer_name&&<div className="text-xs text-slate-500">{j.customer_name}</div>}</td><td className="p-3 text-slate-600 hidden sm:table-cell">{j.area}</td><td className="p-3 text-slate-600 hidden md:table-cell">{eName(j.assigned_to)}</td><td className="p-3"><SBadge s={j.status}/></td><td className="p-3">{j.payment_amount?<div><div className="font-bold">₹{j.payment_amount}</div><div className="text-xs text-slate-500 uppercase">{j.payment_type}</div></div>:<span className="text-slate-300">—</span>}</td></tr>)}{jobs.length===0&&<tr><td colSpan={5} className="p-12 text-center text-slate-400">No jobs yet</td></tr>}</tbody></table></div></div></div>}

        {tab==="employees" && <div className="mt-4"><div className="flex justify-between items-center mb-4 flex-wrap gap-2"><h2 className="text-lg font-bold">Field Workers</h2><div className="flex gap-2"><button onClick={()=>setShowAcct(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow"><II.Key s={16}/>Create Login</button><button onClick={()=>setShowE(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow"><II.Plus s={16}/>Add Employee</button></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{emps.map(e=>{const ej=jobs.filter(j=>j.assigned_to===e.id),dn=ej.filter(j=>j.status==="completed").length,pd=ej.filter(j=>j.status==="pending"||j.status==="in-progress").length,col=ej.reduce((s,j)=>s+(+j.payment_amount||0),0); return <div key={e.id} className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition"><div className="flex items-start justify-between mb-4"><div><h3 className="font-bold text-lg">{e.name}</h3><p className="text-sm text-slate-500">{e.phone}</p><p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5"><II.Pin s={14}/>{e.area}</p></div><div className="flex flex-col items-end gap-1"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><II.User s={20} className="text-blue-500"/></div>{e.profile_id ? <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">Has Login</span> : <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-semibold">No Login</span>}</div></div><div className="grid grid-cols-3 gap-2 text-center mb-4"><div className="bg-slate-50 rounded-lg py-2"><div className="text-lg font-bold">{ej.length}</div><div className="text-[10px] text-slate-500 uppercase">Total</div></div><div className="bg-emerald-50 rounded-lg py-2"><div className="text-lg font-bold text-emerald-600">{dn}</div><div className="text-[10px] text-slate-500 uppercase">Done</div></div><div className="bg-amber-50 rounded-lg py-2"><div className="text-lg font-bold text-amber-600">{pd}</div><div className="text-[10px] text-slate-500 uppercase">Pending</div></div></div>{col>0&&<div className="text-sm text-center mb-3 font-medium">Collected: <span className="text-emerald-600 font-bold">₹{col}</span></div>}<button onClick={()=>onViewEmp(e.id)} className="w-full py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"><II.Eye s={16}/>View Screen</button></div>})}</div></div>}
      </div>

      <Modal open={showE} close={()=>setShowE(false)} title="Add Employee"><div className="space-y-4">{[{k:"name",l:"Name *",p:"Ramesh Kumar"},{k:"phone",l:"Phone *",p:"9876543210"},{k:"area",l:"Area *",p:"West Zone"}].map(f=><div key={f.k}><label className="block text-sm font-semibold mb-1">{f.l}</label><input className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={nE[f.k]} onChange={e=>setNE({...nE,[f.k]:e.target.value})} placeholder={f.p}/></div>)}<button onClick={doAddE} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700">Add Employee</button></div></Modal>

      <Modal open={showJ} close={()=>setShowJ(false)} title="Create Job" wide><Tabs tabs={[{k:"single",l:"Single"},{k:"bulk",l:"Bulk"}]} a={jTab} set={setJTab}/>{jTab==="single"?<div className="space-y-3 mt-4">{[{k:"address",l:"Address *",p:"House 21, Sector 9"},{k:"area",l:"Area *",p:"West Zone"},{k:"customer_name",l:"Customer Name",p:"Sharma ji"},{k:"customer_phone",l:"Phone",p:"9876543210"},{k:"gas_company_name",l:"Gas Company",p:"Indraprastha Gas Ltd"},{k:"gas_agency_name",l:"Gas Agency",p:"Delhi Gas Agency"}].map(f=><div key={f.k}><label className="block text-xs font-semibold text-slate-600 mb-1">{f.l}</label><input className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={nJ[f.k]} onChange={e=>setNJ({...nJ,[f.k]:e.target.value})} placeholder={f.p}/></div>)}<div><label className="block text-xs font-semibold text-slate-600 mb-1">Assign To *</label><select className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white" value={nJ.assigned_to} onChange={e=>setNJ({...nJ,assigned_to:e.target.value})}><option value="">Select...</option>{emps.map(e=><option key={e.id} value={e.id}>{e.name} — {e.area}</option>)}</select></div><button onClick={doAddJ} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 mt-2">Add Job</button></div>:<div className="space-y-3 mt-4"><p className="text-xs text-slate-500">Format: address, area, customer, employee name</p><textarea className="w-full px-3 py-2.5 border rounded-xl text-sm font-mono" rows={6} value={bulk} onChange={e=>setBulk(e.target.value)} placeholder="House 21, West Zone, Sharma ji, Ramesh Kumar"/><button onClick={doBulk} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700">Upload</button></div>}</Modal>

      <CreateEmpAccountModal open={showAcct} close={()=>setShowAcct(false)} employees={emps} show={show}/>
    </div>
  );
}

/*─── Employee Interface ─────────────────────────────────────*/
function EmpView({ emp, jobs, onStart, onBack, onLogout, isDirectLogin }) {
  const [q, setQ] = useState("");
  if (!emp) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center p-8 bg-white rounded-2xl shadow"><p className="text-slate-500 mb-4">Employee not found</p>{onBack && <button onClick={onBack} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold">Back</button>}</div></div>;
  const f = l => l.filter(j => j.address.toLowerCase().includes(q.toLowerCase())||(j.customer_name||"").toLowerCase().includes(q.toLowerCase())||(j.customer_phone||"").includes(q)||j.area.toLowerCase().includes(q.toLowerCase()));
  const pend = f(jobs.filter(j=>j.status==="pending"||j.status==="in-progress")), comp = f(jobs.filter(j=>j.status==="completed")), oth = f(jobs.filter(j=>!["pending","in-progress","completed"].includes(j.status)));

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(180deg,#1e40af 0%,#1e40af 180px,#f1f5f9 180px)"}}>
      <div className="px-4 pt-3 pb-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-start">
          <div>{onBack && <button onClick={onBack} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-3"><II.Back s={18}/>Back to Admin</button>}</div>
          {isDirectLogin && <button onClick={onLogout} className="p-2 bg-white/15 rounded-xl hover:bg-white/25 transition"><II.Out s={18} className="text-white"/></button>}
        </div>
        <h1 className="text-2xl font-extrabold text-white">Namaste, {emp.name} 🙏</h1><p className="text-blue-200 text-sm mt-1">आज के काम / Today's Work</p>
        <div className="flex gap-3 mt-4"><div className="bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 text-white"><div className="text-[11px] uppercase opacity-70">Pending</div><div className="text-2xl font-extrabold">{jobs.filter(j=>j.status==="pending"||j.status==="in-progress").length}</div></div><div className="bg-emerald-500/90 rounded-xl px-4 py-2.5 text-white"><div className="text-[11px] uppercase opacity-70">Done</div><div className="text-2xl font-extrabold">{jobs.filter(j=>j.status==="completed").length}</div></div></div>
      </div>
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="relative mb-5 -mt-1"><II.Search s={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/><input className="w-full pl-10 pr-4 py-3.5 bg-white rounded-xl border text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search / खोजें..." value={q} onChange={e=>setQ(e.target.value)}/></div>
        {pend.length>0 && <div className="mb-6"><h2 className="text-base font-bold mb-3 flex items-center gap-2"><II.Clock s={18} className="text-amber-600"/>आज जाना है / Today</h2><div className="space-y-3">{pend.map(j=><div key={j.id} className="bg-white rounded-2xl border-l-4 border-l-amber-400 shadow-sm p-4"><div className="flex flex-col sm:flex-row justify-between gap-3"><div className="flex-1"><div className="flex items-start gap-2"><II.Pin s={18} className="text-amber-600 flex-shrink-0 mt-0.5"/><div><p className="font-bold">{j.address}</p>{j.customer_name&&<p className="text-sm text-slate-500">ग्राहक: {j.customer_name}</p>}<p className="text-xs text-slate-400">Area: {j.area}</p></div></div><div className="mt-2"><SBadge s={j.status}/></div></div><div className="flex flex-col gap-2 sm:min-w-[150px]"><button onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(j.address)}`,"_blank")} className="py-3 border-2 border-blue-500 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 flex items-center justify-center gap-2"><II.Pin s={18}/>नक्शा / Map</button><button onClick={()=>onStart(j.id)} className="py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow flex items-center justify-center gap-2"><II.Play s={18}/>काम शुरू / Start</button></div></div></div>)}</div></div>}
        {pend.length===0 && !q && <div className="bg-white rounded-2xl p-10 text-center shadow-sm mb-6"><div className="text-5xl mb-3">🎉</div><h3 className="text-xl font-bold mb-1">बधाई हो! All Done!</h3><p className="text-slate-500">आज के सारे काम पूरे हो गए</p></div>}
        {oth.length>0 && <div className="mb-6"><h2 className="text-base font-bold mb-3 flex items-center gap-2"><II.Warn s={18} className="text-red-500"/>Other</h2><div className="space-y-2">{oth.map(j=><div key={j.id} className="bg-white rounded-xl border p-3 flex items-center justify-between"><div><p className="font-medium text-sm">{j.address}</p>{j.customer_name&&<p className="text-xs text-slate-500">{j.customer_name}</p>}</div><SBadge s={j.status}/></div>)}</div></div>}
        {comp.length>0 && <div><h2 className="text-base font-bold mb-3 flex items-center gap-2"><II.Ok s={18} className="text-emerald-600"/>पूरे हुए / Completed</h2><div className="space-y-2">{comp.map(j=><div key={j.id} className="bg-emerald-50/50 rounded-xl border border-emerald-200 p-3 flex items-center justify-between"><div className="flex items-start gap-2 flex-1"><II.Ok s={16} className="text-emerald-600 flex-shrink-0 mt-0.5"/><div><p className="font-medium text-sm">{j.address}</p>{j.customer_name&&<p className="text-xs text-slate-500">{j.customer_name}</p>}{j.payment_amount&&<p className="text-xs text-emerald-700 font-semibold mt-0.5">₹{j.payment_amount} ({(j.payment_type||"").toUpperCase()})</p>}</div></div>{j.receipt_number&&<Bdg v="outline">{j.receipt_number}</Bdg>}</div>)}</div></div>}
      </div>
    </div>
  );
}

/*─── Inspection Workflow ────────────────────────────────────*/
function Inspect({ job, onDone, onBack, onUpd }) {
  const [step, setStep] = useState("arrival"); const [jS, setJS] = useState("in-progress"); const [reason, setReason] = useState(""); const [vPhoto, setVPhoto] = useState(""); const [cl, setCl] = useState({pipe_condition:null,leak_test:null,regulator_condition:null}); const [pay, setPay] = useState({type:"",amount:"",upi:""}); const [rcpt, setRcpt] = useState(""); const [saving, setSaving] = useState(false); const pRef = useRef(null);
  const steps=["arrival","status","checklist","payment","receipt"]; const prog=((steps.indexOf(step)+1)/steps.length)*100;
  const BB = ({onClick,children,color="bg-emerald-600 hover:bg-emerald-700",disabled}) => <button onClick={onClick} disabled={disabled||saving} className={`w-full py-5 rounded-2xl font-extrabold text-lg text-white shadow-lg transition active:scale-[0.98] disabled:opacity-40 ${color}`}>{saving?<II.Spin s={20} className="animate-spin mx-auto"/>:children}</button>;
  const CO = ({label,labelEn,sel,onSel,y="ok",n="not-ok",yL="हाँ / YES",nL="नहीं / NO",emoji}) => <div className="p-4 bg-white rounded-2xl border-2 mb-3"><div className="flex items-center gap-3 mb-3"><div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-xl">{emoji}</div><div><p className="font-bold">{label}</p><p className="text-sm text-slate-500">{labelEn}</p></div></div><div className="grid grid-cols-2 gap-2"><button onClick={()=>onSel(y)} className={`py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${sel===y?"bg-emerald-600 text-white shadow":"bg-slate-100 text-slate-700 hover:bg-slate-200"}`}><II.Ok s={18}/>{yL}</button><button onClick={()=>onSel(n)} className={`py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${sel===n?"bg-red-600 text-white shadow":"bg-slate-100 text-slate-700 hover:bg-slate-200"}`}><II.No s={18}/>{nL}</button></div></div>;

  const doArrival = async () => { const now = new Date().toISOString(); const u = {status:"in-progress",arrival_time:now}; if(navigator.geolocation){navigator.geolocation.getCurrentPosition(p=>{u.gps_lat=p.coords.latitude;u.gps_lng=p.coords.longitude;onUpd(u);},()=>onUpd(u));}else onUpd(u); setStep("status"); };
  const doPhoto = e => { const f=e.target.files?.[0]; if(f){const r=new FileReader();r.onloadend=()=>setVPhoto(r.result);r.readAsDataURL(f);} };
  const doNonComplete = async () => { if(vPhoto&&reason){setSaving(true);await onUpd({status:jS,status_reason:reason,completed_time:new Date().toISOString()});setSaving(false);onBack();} };
  const doPayDone = () => { if(pay.type&&pay.amount){setRcpt(`RC${String(Math.floor(Math.random()*9999)+1).padStart(4,"0")}`);setStep("receipt");} };
  const doFinal = async () => { setSaving(true); await onDone({...cl,payment_type:pay.type,payment_amount:parseInt(pay.amount),upi_transaction_id:pay.upi||null,receipt_number:rcpt,status:"completed",completed_time:new Date().toISOString()}); setSaving(false); };
  const shareR = () => { const m=`Gas Safety Receipt\n${rcpt}\nCustomer: ${job.customer_name||"N/A"}\nAddress: ${job.address}\nAmount: ₹${pay.amount}\nPayment: ${pay.type.toUpperCase()}\nDate: ${new Date().toLocaleDateString("en-IN")}`; window.open(`https://wa.me/?text=${encodeURIComponent(m)}`,"_blank"); };

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(180deg,#059669 0%,#059669 160px,#f1f5f9 160px)"}}>
      <div className="px-4 pt-3 pb-5 max-w-2xl mx-auto"><button onClick={onBack} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-2"><II.Back s={18}/>Back / वापस</button><div className="flex items-start gap-2"><II.Pin s={20} className="text-white flex-shrink-0 mt-1"/><div><h1 className="text-lg font-extrabold text-white leading-tight">{job.address}</h1>{job.customer_name&&<p className="text-emerald-100 text-sm">ग्राहक: {job.customer_name}</p>}{job.customer_phone&&<p className="text-emerald-100 text-sm">📞 {job.customer_phone}</p>}</div></div><div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden"><div className="h-full bg-white rounded-full transition-all duration-500" style={{width:`${prog}%`}}/></div><p className="text-emerald-100 text-xs mt-1.5">Step {steps.indexOf(step)+1}/{steps.length}</p></div>
      <div className="max-w-2xl mx-auto px-4 pb-8">
        {step==="arrival"&&<div className="bg-white rounded-2xl shadow-sm p-8 text-center"><div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5"><II.Pin s={36} className="text-blue-600"/></div><h2 className="text-2xl font-extrabold mb-1">क्या आप पहुँच गए?</h2><p className="text-lg text-slate-500 mb-6">Did you reach?</p><div className="bg-slate-50 rounded-xl p-4 mb-6"><p className="text-xs text-slate-500 mb-1">Location:</p><p className="font-bold">{job.address}</p></div><BB onClick={doArrival}><span className="flex items-center justify-center gap-2"><II.Ok s={24}/>हाँ, पहुँच गया / Yes</span></BB></div>}
        {step==="status"&&<div className="bg-white rounded-2xl shadow-sm p-6"><h2 className="text-xl font-extrabold text-center mb-1">क्या हुआ?</h2><p className="text-sm text-slate-500 text-center mb-5">What happened?</p><div className="space-y-3">{[{s:"completed",e:"✅",h:"काम पूरा हुआ",n:"Work Completed"},{s:"customer-not-reachable",e:"🚫",h:"ग्राहक नहीं मिला",n:"Not Reachable"},{s:"customer-refused",e:"🙅",h:"ग्राहक ने मना किया",n:"Refused"},{s:"rescheduled",e:"📅",h:"दोबारा तय करना है",n:"Reschedule"}].map(o=><button key={o.s} onClick={()=>{setJS(o.s);if(o.s==="completed")setStep("checklist");}} className={`w-full py-5 rounded-2xl font-bold text-base flex items-center gap-4 px-5 border-2 transition ${jS===o.s&&o.s!=="completed"?"border-slate-900 bg-slate-900 text-white":"border-slate-200 hover:border-slate-400"}`}><span className="text-2xl">{o.e}</span><div className="text-left"><div>{o.h}</div><div className="text-sm opacity-70 font-normal">{o.n}</div></div></button>)}</div>
          {jS!=="completed"&&jS!=="in-progress"&&<div className="mt-6 p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-4"><div className="flex items-start gap-2"><II.Warn s={20} className="text-amber-600 flex-shrink-0 mt-0.5"/><div><p className="font-bold text-amber-900">Proof Required</p></div></div><div><input ref={pRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={doPhoto}/><button onClick={()=>pRef.current?.click()} className="w-full py-4 border-2 border-dashed border-amber-400 rounded-xl font-bold text-sm text-amber-700 hover:bg-amber-100 flex items-center justify-center gap-2"><II.Cam s={20}/>{vPhoto?"✓ Photo Taken":"Take Photo"}</button>{vPhoto&&<img src={vPhoto} alt="" className="mt-3 rounded-xl max-h-40 w-full object-cover"/>}</div><div><label className="block text-sm font-semibold text-amber-900 mb-1">Reason *</label><textarea className="w-full px-3 py-3 border border-amber-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500" rows={3} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Write reason..."/></div><BB onClick={doNonComplete} disabled={!vPhoto||!reason} color="bg-amber-600 hover:bg-amber-700">Submit & Return</BB></div>}</div>}
        {step==="checklist"&&<div><div className="text-center mb-4"><h2 className="text-xl font-extrabold">सेफ्टी चेकलिस्ट</h2><p className="text-sm text-slate-500">Safety Checklist</p></div><CO label="गैस पाइप ठीक है?" labelEn="Gas Pipe OK?" emoji="🔧" sel={cl.pipe_condition} onSel={v=>setCl({...cl,pipe_condition:v})}/><CO label="लीक टेस्ट किया?" labelEn="Leak Test?" emoji="🔍" sel={cl.leak_test} onSel={v=>setCl({...cl,leak_test:v})}/><CO label="रेगुलेटर ठीक है?" labelEn="Regulator?" emoji="⚙️" sel={cl.regulator_condition} onSel={v=>setCl({...cl,regulator_condition:v})} y="good" n="bad" yL="अच्छा / GOOD" nL="खराब / BAD"/>{cl.pipe_condition&&cl.leak_test&&cl.regulator_condition?<BB onClick={()=>setStep("payment")}>आगे बढ़ें / Continue →</BB>:<div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-sm text-amber-800"><II.Warn s={16}/>Complete all checks</div>}</div>}
        {step==="payment"&&<div className="bg-white rounded-2xl shadow-sm p-6"><div className="text-center mb-6"><div className="text-4xl mb-2">💰</div><h2 className="text-2xl font-extrabold">पेमेंट लें</h2><p className="text-slate-500">Collect Payment</p></div><div className="grid grid-cols-3 gap-3 mb-6">{[{t:"cash",e:"💵",h:"नकद",n:"CASH"},{t:"upi",e:"📱",h:"UPI",n:"UPI"},{t:"already-paid",e:"✅",h:"पहले दिया",n:"PAID"}].map(p=><button key={p.t} onClick={()=>setPay({...pay,type:p.t})} className={`py-5 rounded-2xl font-bold text-sm flex flex-col items-center gap-1 border-2 transition ${pay.type===p.t?"border-emerald-600 bg-emerald-50 text-emerald-800":"border-slate-200 hover:border-slate-400"}`}><span className="text-2xl">{p.e}</span>{p.h}<span className="text-[10px] opacity-60">{p.n}</span></button>)}</div>{pay.type==="upi"&&<div className="mb-5 p-4 bg-violet-50 border-2 border-violet-200 rounded-2xl"><button onClick={()=>setPay({...pay,upi:`UPI${Date.now()}`})} className="w-full py-4 border-2 border-violet-400 rounded-xl font-bold text-sm text-violet-700 flex items-center justify-center gap-2"><II.QR s={20}/>{pay.upi?"✓ Scanned":"Scan QR"}</button>{pay.upi&&<div className="mt-2 p-2 bg-emerald-100 rounded-lg text-xs text-emerald-800 text-center font-mono">✓ {pay.upi}</div>}</div>}{pay.type&&<div className="mb-6"><p className="font-bold text-center mb-2">Amount</p><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold text-slate-400">₹</span><input type="number" className="w-full pl-12 pr-4 py-5 border-2 rounded-2xl text-3xl font-extrabold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500" value={pay.amount} onChange={e=>setPay({...pay,amount:e.target.value})} placeholder="200"/></div></div>}{pay.type&&pay.amount&&(pay.type!=="upi"||pay.upi)&&<BB onClick={doPayDone}>रसीद बनाएं / Generate Receipt</BB>}</div>}
        {step==="receipt"&&<div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-400 overflow-hidden"><div className="bg-emerald-600 text-white p-5 text-center"><div className="text-4xl mb-1">🎉</div><h2 className="text-2xl font-extrabold">काम पूरा हुआ!</h2></div><div className="p-5"><div className="bg-slate-50 rounded-xl p-5 mb-5"><div className="flex items-center justify-between mb-4 pb-4 border-b"><div><p className="text-xs text-slate-500">Receipt</p><p className="text-2xl font-extrabold">{rcpt}</p></div><II.File s={32} className="text-slate-400"/></div><div className="space-y-2 text-sm">{[["Customer",job.customer_name||"N/A"],["Address",job.address],...(job.gas_company_name?[["Company",job.gas_company_name]]:[]),["Date",new Date().toLocaleDateString("en-IN")],["Time",new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})]].map(([l,v],i)=><div key={i} className="flex justify-between"><span className="text-slate-500">{l}:</span><span className="font-medium text-right max-w-[60%]">{v}</span></div>)}<div className="border-t pt-3 mt-3"><div className="flex justify-between text-lg"><span className="font-bold">Amount:</span><span className="font-extrabold text-emerald-600">₹{pay.amount}</span></div><div className="flex justify-between mt-1"><span className="text-slate-500">Method:</span><Bdg v="outline">{pay.type.toUpperCase()}</Bdg></div>{pay.upi&&<div className="flex justify-between mt-1"><span className="text-slate-500">UPI:</span><span className="font-mono text-xs">{pay.upi}</span></div>}</div></div></div><div className="bg-blue-50 rounded-xl p-4 mb-5"><p className="font-bold text-sm text-center mb-2">Safety Checks</p><div className="space-y-1.5 text-sm">{[["Gas Pipe",cl.pipe_condition,"ok"],["Leak Test",cl.leak_test,"ok"],["Regulator",cl.regulator_condition,"good"]].map(([l,v,ok])=><div key={l} className="flex justify-between items-center"><span className="text-slate-600">{l}:</span><Bdg v={v===ok?"success":"danger"}>{v===ok?"✓ OK":"✗ Issue"}</Bdg></div>)}</div></div><div className="space-y-3"><button onClick={shareR} className="w-full py-4 border-2 border-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-50 flex items-center justify-center gap-2"><II.Share s={18}/>WhatsApp Share</button><BB onClick={doFinal}>Complete ✓</BB></div></div></div>}
      </div>
    </div>
  );
}

/*─── Reconciliation ─────────────────────────────────────────*/
function Recon({ emps, jobs, onBack }) {
  const c=jobs.filter(j=>j.status==="completed"),p=jobs.filter(j=>j.status==="pending"||j.status==="in-progress");
  const ct=c.filter(j=>j.payment_type==="cash").reduce((s,j)=>s+(+j.payment_amount||0),0),ut=c.filter(j=>j.payment_type==="upi").reduce((s,j)=>s+(+j.payment_amount||0),0),ap=c.filter(j=>j.payment_type==="already-paid").reduce((s,j)=>s+(+j.payment_amount||0),0);
  const es=emps.map(e=>{const ej=jobs.filter(j=>j.assigned_to===e.id),ec=ej.filter(j=>j.status==="completed");return{e,tot:ej.length,done:ec.length,pend:ej.filter(j=>j.status==="pending"||j.status==="in-progress").length,cash:ec.filter(j=>j.payment_type==="cash").reduce((s,j)=>s+(+j.payment_amount||0),0),upi:ec.filter(j=>j.payment_type==="upi").reduce((s,j)=>s+(+j.payment_amount||0),0),ap:ec.filter(j=>j.payment_type==="already-paid").reduce((s,j)=>s+(+j.payment_amount||0),0),jobs:ec};});
  return (
    <div className="min-h-screen" style={{background:"linear-gradient(135deg,#4c1d95,#1e40af)"}}>
      <div className="px-4 sm:px-6 pt-4 pb-6 max-w-5xl mx-auto"><div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"><div><button onClick={onBack} className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-2"><II.Back s={18}/>Back</button><h1 className="text-2xl sm:text-3xl font-extrabold text-white">Reconciliation</h1><p className="text-violet-200 text-sm mt-1">{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p></div><button onClick={()=>window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/30"><II.Print s={16}/>Print</button></div></div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">{[{l:"Total",v:jobs.length},{l:"Done",v:c.length},{l:"Pending",v:p.length},{l:"Rate",v:`${jobs.length?Math.round(c.length/jobs.length*100):0}%`}].map((s,i)=><div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-white text-center"><div className="text-3xl font-extrabold">{s.v}</div><div className="text-xs uppercase opacity-70 mt-1">{s.l}</div></div>)}</div>
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6"><h2 className="text-lg font-bold mb-4">💰 Payments</h2><div className="space-y-3">{[{l:"Cash",v:ct,c:"bg-amber-50 text-amber-700",i:"💵"},{l:"UPI",v:ut,c:"bg-violet-50 text-violet-700",i:"📱"},{l:"Already Paid",v:ap,c:"bg-blue-50 text-blue-700",i:"✅"}].map(p=><div key={p.l} className={`flex items-center justify-between p-3.5 rounded-xl ${p.c}`}><span className="flex items-center gap-2 font-medium"><span className="text-lg">{p.i}</span>{p.l}</span><span className="text-xl font-extrabold">₹{p.v}</span></div>)}<div className="flex items-center justify-between p-4 bg-emerald-100 rounded-xl border-2 border-emerald-500"><span className="font-extrabold text-lg text-emerald-900">TOTAL</span><span className="text-2xl font-extrabold text-emerald-700">₹{ct+ut+ap}</span></div></div></div>
        <div className="bg-white rounded-2xl shadow-lg p-5"><h2 className="text-lg font-bold mb-4">👥 Employees</h2><div className="space-y-5">{es.map(s=><div key={s.e.id} className="border-2 rounded-2xl p-5"><div className="flex items-center justify-between mb-4 pb-3 border-b"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><II.User s={18} className="text-blue-500"/></div><div><h3 className="font-bold">{s.e.name}</h3><p className="text-xs text-slate-500">{s.e.phone} • {s.e.area}</p></div></div><div className="text-right"><div className="text-xl font-extrabold text-emerald-600">₹{s.cash+s.upi+s.ap}</div><div className="text-[10px] text-slate-500 uppercase">Collection</div></div></div><div className="grid grid-cols-5 gap-2 text-center mb-4">{[{v:s.tot,l:"Total",c:"bg-slate-50"},{v:s.done,l:"Done",c:"bg-emerald-50"},{v:s.pend,l:"Pend",c:"bg-amber-50"},{v:`₹${s.cash}`,l:"Cash",c:"bg-orange-50"},{v:`₹${s.upi}`,l:"UPI",c:"bg-violet-50"}].map((d,i)=><div key={i} className={`${d.c} rounded-lg py-2`}><div className="text-lg font-extrabold">{d.v}</div><div className="text-[9px] text-slate-500 uppercase">{d.l}</div></div>)}</div>{s.jobs.length>0&&<div><p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Completed:</p><div className="space-y-1.5">{s.jobs.map(j=><div key={j.id} className="flex items-center justify-between text-sm p-2.5 bg-slate-50 rounded-lg"><div><div className="font-medium">{j.address}</div><div className="text-xs text-slate-500">{j.customer_name&&`${j.customer_name} • `}{j.receipt_number}</div></div><div className="text-right"><div className="font-bold">₹{j.payment_amount}</div><Bdg v="outline">{(j.payment_type||"").toUpperCase()}</Bdg></div></div>)}</div></div>}</div>)}</div></div>
      </div>
    </div>
  );
}

/*─── Main App with Role-Based Routing ───────────────────────*/
export default function App() {
  const [user, setUser] = useState(null); const [prof, setProf] = useState(null); const [myEmpId, setMyEmpId] = useState(null);
  const [authLd, setAuthLd] = useState(true);
  const [view, setView] = useState("loading"); const [selE, setSelE] = useState(""); const [selJ, setSelJ] = useState("");
  const db = useData();

  // Resolve role after login
  const resolveRole = async (u) => {
    setUser(u);
    const { data: p } = await sb.from("profiles").select("*").eq("id", u.id).single();
    setProf(p);
    if (p?.role === "employee") {
      // Find linked employee record
      const { data: empList } = await sb.from("employees").select("*").eq("profile_id", u.id);
      if (empList?.[0]) { setMyEmpId(empList[0].id); setView("emp-direct"); }
      else { setView("emp-unlinked"); }
    } else {
      setView("admin");
    }
  };

  useEffect(() => { (async () => { const { data: { user: u } } = await sb.auth.getUser(); if (u) { await resolveRole(u); } else { setView("login"); } setAuthLd(false); })(); }, []);

  const onLogin = async u => { await resolveRole(u); };
  const onLogout = async () => { await sb.auth.signOut(); setUser(null); setProf(null); setMyEmpId(null); setView("login"); };
  const onComplete = async (jobId, upd) => { await db.updJob(jobId, upd); setView(myEmpId ? "emp-direct" : "emp"); db.load(); };

  if (authLd) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}><div className="text-center"><div className="text-5xl mb-4">🔥</div><II.Spin s={32} className="animate-spin text-blue-500 mx-auto" /><p className="text-slate-400 text-sm mt-4">Loading GasCheck...</p></div></div>;
  if (view === "login" || !user) return <Login onOk={onLogin} />;

  // Employee logged in but not linked to employee record
  if (view === "emp-unlinked") return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Account Not Linked</h2>
        <p className="text-slate-500 text-sm mb-6">Your login isn't linked to an employee record yet. Ask your admin to set this up.</p>
        <p className="text-xs text-slate-400 mb-4">Logged in as: {user.email}</p>
        <button onClick={onLogout} className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm">Logout</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {db.toast && <Toast msg={db.toast.msg} type={db.toast.type} onClose={() => db.setToast(null)} />}
      {db.loading && (view === "admin" || view === "emp-direct") && <div className="flex justify-center py-20"><II.Spin s={32} className="animate-spin text-blue-500" /></div>}

      {/* ADMIN FLOW */}
      {!db.loading && view === "admin" && <Admin emps={db.emps} jobs={db.jobs} onAddEmp={db.addEmp} onAddJob={db.addJob} onBulk={db.addBulk} onRecon={() => setView("recon")} onViewEmp={id => { setSelE(id); setView("emp"); }} onLogout={onLogout} prof={prof} show={db.show} />}
      {view === "emp" && <EmpView emp={db.emps.find(e => e.id === selE)} jobs={db.jobs.filter(j => j.assigned_to === selE)} onStart={id => { setSelJ(id); setView("inspect"); }} onBack={() => { setView("admin"); db.load(); }} />}

      {/* EMPLOYEE DIRECT LOGIN FLOW */}
      {!db.loading && view === "emp-direct" && <EmpView emp={db.emps.find(e => e.id === myEmpId)} jobs={db.jobs.filter(j => j.assigned_to === myEmpId)} onStart={id => { setSelJ(id); setView("inspect-emp"); }} onLogout={onLogout} isDirectLogin={true} />}
      {view === "inspect-emp" && <Inspect job={db.jobs.find(j => j.id === selJ)} onDone={u => onComplete(selJ, u)} onBack={() => { setView("emp-direct"); db.load(); }} onUpd={u => db.updJob(selJ, u)} />}

      {/* SHARED */}
      {view === "inspect" && <Inspect job={db.jobs.find(j => j.id === selJ)} onDone={u => onComplete(selJ, u)} onBack={() => { setView("emp"); db.load(); }} onUpd={u => db.updJob(selJ, u)} />}
      {view === "recon" && <Recon emps={db.emps} jobs={db.jobs} onBack={() => setView("admin")} />}
    </div>
  );
}
