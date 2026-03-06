import { useState } from "react";
import { APP, AppLogo } from "./AppShared";

/*─── Public Landing Page ─────────────────────────────────────*/
// Brand palette extracted from logo
const LC = {
  navy:    "#0f2557",  // deep navy primary
  navyD:  "#091a3e",  // darker navy for depth
  navyL:  "#1a3a7a",  // lighter navy
  flame:  "#e8360d",  // flame red/orange accent from logo
  flameL: "#ff5733",  // lighter flame
  gold:   "#f5a623",  // warm gold accent
  cream:  "#fdf8f3",  // warm off-white bg
  slate:  "#64748b",
};

function LandingPage({ onLogin }) {
  const [form, setForm] = useState({name:"",email:"",phone:"",type:"Mandatory Safety Inspections",message:""});
  const [submitted, setSubmitted] = useState(false);

  const sendWA = () => {
    const msg = `New Enquiry — LPG Inspection Care\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nEnquiry Type: ${form.type}\nMessage: ${form.message}`;
    window.open(`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(msg)}`, "_blank");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen" style={{background:LC.cream, fontFamily:"'Georgia', serif"}}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 border-b" style={{background:"rgba(253,248,243,0.95)", backdropFilter:"blur(12px)", borderColor:"#e5ddd5"}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AppLogo s={38}/>
            <div>
              <div className="text-base font-extrabold leading-tight tracking-tight" style={{color:LC.navy, fontFamily:"'Georgia', serif"}}>LPG Inspection Care</div>
              <div className="text-[10px] tracking-widest uppercase" style={{color:LC.flame}}>Statutory Compliance Partner</div>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            {["#services","#omcs","#contact"].map((h,i)=>
              <a key={i} href={h} className="hidden sm:inline text-xs font-semibold tracking-widest uppercase hover:opacity-70 transition" style={{color:LC.navy}}>
                {["Services","Partners","Contact"][i]}
              </a>
            )}
            <button onClick={onLogin} className="px-4 py-2 text-white text-xs font-bold tracking-widest uppercase rounded transition hover:opacity-90" style={{background:LC.flame}}>
              Staff Login
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{background:`linear-gradient(160deg, ${LC.navyD} 0%, ${LC.navy} 55%, ${LC.navyL} 100%)`}}>
        {/* Geometric texture */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize:"30px 30px"}}/>
        {/* Flame accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{background:`linear-gradient(90deg, ${LC.flame}, ${LC.gold}, ${LC.flame})`}}/>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm text-xs font-bold tracking-widest uppercase mb-8 border" style={{borderColor:LC.flame, color:LC.flame, background:"rgba(232,54,13,0.08)"}}>
              ✦ Trusted Statutory Compliance Partner
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight" style={{fontFamily:"'Georgia', serif"}}>
              Professional LPG<br/>
              Safety Inspections<br/>
              <span style={{color:LC.gold}}>For Every Home.</span>
            </h1>
            <p className="text-lg mb-10 leading-relaxed max-w-xl" style={{color:"rgba(255,255,255,0.7)"}}>
              Ensuring the safety of your family by delivering high-quality, government mandated LPG safety inspections and consumer awareness programs across Rajasthan since 2014.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="px-8 py-4 text-sm font-bold tracking-widest uppercase text-white rounded-sm text-center transition hover:opacity-90" style={{background:LC.flame}}>
                Enquire Now
              </a>
              <a href="#services" className="px-8 py-4 text-sm font-bold tracking-widest uppercase rounded-sm text-center transition hover:bg-white/10 border" style={{color:"white", borderColor:"rgba(255,255,255,0.3)"}}>
                Our Services
              </a>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t" style={{borderColor:"rgba(255,255,255,0.1)", background:"rgba(0,0,0,0.2)"}}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {n:"5,00,000+", l:"Inspections Done"},
              {n:"50+",       l:"Trained Inspectors"},
              {n:"15+",       l:"Cities Covered"},
              {n:"100%",      l:"Compliance"},
            ].map((s,i)=>(
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold" style={{color:LC.gold, fontFamily:"'Georgia', serif"}}>{s.n}</div>
                <div className="text-xs tracking-widest uppercase mt-1" style={{color:"rgba(255,255,255,0.5)"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-20 sm:py-28" style={{background:LC.cream}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{color:LC.flame}}>What We Do</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{color:LC.navy, fontFamily:"'Georgia', serif"}}>Our Services</h2>
            <div className="mt-3 w-16 h-1 rounded" style={{background:LC.flame}}/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {icon:"🔍", title:"Mandatory Safety Inspections & Compliance",
               desc:"Consumer safety serves as the fundamental cornerstone of our operations. We execute mandatory LPG safety audits as stipulated by regulatory bodies. Our certified technicians perform rigorous evaluations of the entire gas connection including the regulator, safety hose, and stove assembly to ensure statutory compliance and mitigate potential hazards."},
              {icon:"🔄", title:"Dormant Connection Revival Program",
               desc:"We provide a specialized service focused on the secure reactivation of dormant LPG connections. By conducting comprehensive safety verifications and updating consumer documentation, we ensure every connection is compliant and operational, supporting OMCs in achieving their 70% active consumer coverage targets."},
              {icon:"🏕️", title:"Consumer Safety Camps & Education",
               desc:"Proactive education is vital to risk mitigation. We conduct localized LPG Safety Camps to enhance consumer awareness regarding safety protocols, equipment maintenance, and emergency procedures. These initiatives are designed to foster a culture of safety and significantly reduce the likelihood of domestic accidents."},
              {icon:"📱", title:"Digital Field Reporting & Data Management",
               desc:"To maintain high standards of accountability, our team utilizes a dedicated mobile application for field reporting. This tool enables the efficient recording of inspection results and consumer contact updates, which are subsequently synchronized with OMC systems to ensure data integrity and streamlined compliance reporting."},
              {icon:"👔", title:"Certified & Professional Field Force",
               desc:"Professionalism and consumer trust are essential to our service delivery. Our field officers are highly trained, adhere to a strict Uniform Dress Code, and carry official identification, ensuring a credible and secure experience for the consumer during every safety engagement."},
              {icon:"🤝", title:"OMC Partnership & Bulk Programmes",
               desc:"We partner directly with HPCL, IOCL, and BPCL to deliver large-scale mandatory inspection drives across districts. Our operational capacity supports high-volume campaigns with end-to-end field management, daily digital reporting, and compliance documentation aligned to OMC requirements."},
            ].map((s,i)=>(
              <div key={i} className="group bg-white rounded-sm border p-7 hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{borderColor:"#e5ddd5", borderLeftWidth:"3px", borderLeftColor: i%2===0 ? LC.flame : LC.navy}}>
                <div className="text-3xl mb-5">{s.icon}</div>
                <h3 className="font-extrabold text-base mb-3 leading-snug tracking-tight" style={{color:LC.navy, fontFamily:"'Georgia', serif"}}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{color:LC.slate}}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OMC Partners ── */}
      <section id="omcs" className="py-16 border-y" style={{background:LC.navy, borderColor:LC.navyD}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{color:LC.gold}}>Trusted Partner To Indian OMCs</div>
          <h2 className="text-2xl font-extrabold text-white mb-10" style={{fontFamily:"'Georgia', serif"}}>Working With India's Leading Oil Companies</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            {[
              {name:"HPCL", full:"Hindustan Petroleum", color:"#005baa"},
              {name:"IOCL", full:"Indian Oil Corporation", color:"#e2231a"},
              {name:"BPCL", full:"Bharat Petroleum", color:"#f7941d"},
            ].map((omc,i)=>(
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow-lg" style={{background:omc.color, fontFamily:"'Georgia', serif"}}>
                  {omc.name}
                </div>
                <div className="text-xs tracking-wide" style={{color:"rgba(255,255,255,0.5)"}}>{omc.full}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Enquiry ── */}
      <section id="contact" className="py-20 sm:py-28" style={{background:LC.cream}}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            {/* Left copy */}
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{color:LC.flame}}>Get In Touch</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{color:LC.navy, fontFamily:"'Georgia', serif"}}>Partner With Us</h2>
              <div className="w-12 h-1 rounded mb-6" style={{background:LC.flame}}/>
              <p className="text-sm leading-relaxed mb-8" style={{color:LC.slate}}>
                Whether you are an Oil Marketing Company seeking a reliable field partner, a gas agency requiring compliance drives, or a housing society looking to ensure resident safety — we are equipped to deliver at scale.
              </p>
              <div className="space-y-4">
                {[
                  {icon:"📞", label:"Phone", val:"+91-XXXXX-XXXXX"},
                  {icon:"📧", label:"Email", val:"info@lpginspectioncare.com"},
                  {icon:"📍", label:"Office", val:"Rajasthan, India"},
                  {icon:"🕐", label:"Operating Since", val:"2014"},
                ].map((c,i)=>(
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-sm flex items-center justify-center text-lg flex-shrink-0" style={{background:LC.navy}}>
                      {c.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-widest uppercase" style={{color:LC.flame}}>{c.label}</div>
                      <div className="text-sm font-semibold" style={{color:LC.navy}}>{c.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enquiry form */}
            <div className="bg-white rounded-sm border p-8 shadow-sm" style={{borderColor:"#e5ddd5"}}>
              <div className="text-base font-extrabold mb-6" style={{color:LC.navy, fontFamily:"'Georgia', serif"}}>Send an Enquiry</div>
              {submitted ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="font-extrabold text-lg mb-2" style={{color:LC.navy}}>Message Sent!</h3>
                  <p className="text-sm" style={{color:LC.slate}}>We'll get back to you shortly on WhatsApp.</p>
                  <button onClick={()=>setSubmitted(false)} className="mt-6 text-xs font-bold tracking-widest uppercase underline" style={{color:LC.flame}}>Send Another</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    {label:"Name / Company Name", key:"name", type:"text", ph:"Your name or organisation"},
                    {label:"Email Address", key:"email", type:"email", ph:"you@company.com"},
                    {label:"Phone Number", key:"phone", type:"tel", ph:"+91 XXXXX XXXXX"},
                  ].map(f=>(
                    <div key={f.key}>
                      <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{color:LC.navy}}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.ph}
                        value={form[f.key]}
                        onChange={e=>setForm({...form,[f.key]:e.target.value})}
                        className="w-full px-4 py-3 border text-sm focus:outline-none focus:ring-2 rounded-sm"
                        style={{borderColor:"#e5ddd5", fontFamily:"inherit"}}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{color:LC.navy}}>Enquiry Type</label>
                    <select
                      value={form.type}
                      onChange={e=>setForm({...form,type:e.target.value})}
                      className="w-full px-4 py-3 border text-sm focus:outline-none rounded-sm bg-white"
                      style={{borderColor:"#e5ddd5", fontFamily:"inherit"}}
                    >
                      {["Mandatory Safety Inspections","Dormant Connection Revival","Consumer Safety Camps","OMC Partnership","General Enquiry"].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{color:LC.navy}}>Message</label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your requirements..."
                      value={form.message}
                      onChange={e=>setForm({...form,message:e.target.value})}
                      className="w-full px-4 py-3 border text-sm focus:outline-none rounded-sm resize-none"
                      style={{borderColor:"#e5ddd5", fontFamily:"inherit"}}
                    />
                  </div>
                  <button
                    onClick={sendWA}
                    disabled={!form.name||!form.phone}
                    className="w-full py-4 text-white text-sm font-bold tracking-widest uppercase rounded-sm flex items-center justify-center gap-3 transition hover:opacity-90 disabled:opacity-40"
                    style={{background:"#25D366"}}
                  >
                    <span className="text-lg">💬</span> Send WhatsApp Message
                  </button>
                  <p className="text-[10px] text-center" style={{color:LC.slate}}>Your details will be shared via WhatsApp. We respond within 24 hours.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 border-t" style={{background:LC.navyD, borderColor:LC.navy}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <AppLogo s={28}/>
            <span className="text-xs font-bold text-white tracking-wide">LPG Inspection Care</span>
          </div>
          <p className="text-[11px] tracking-wide" style={{color:"rgba(255,255,255,0.3)"}}>
            © {new Date().getFullYear()} LPG Inspection Care. Serving Rajasthan since 2014.
          </p>
          <button onClick={onLogin} className="text-xs font-bold tracking-widest uppercase underline" style={{color:LC.flame}}>Staff Login</button>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
