import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
    AlertTriangle, Activity, Target, MapPin, Radio, BarChart2,
    Truck, Eye, Cpu, Zap, Globe, ChevronRight, ArrowRight,
    CheckCircle, Clock, Shield, Layers
} from "lucide-react";


if (typeof document !== "undefined" && !document.getElementById("about-anim")) {
    const s = document.createElement("style");
    s.id = "about-anim";
    s.textContent = `
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes pulse-slow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .float-anim { animation: floatUp 6s ease-in-out infinite; }
        .gradient-text {
            background: linear-gradient(135deg, #34d399, #60a5fa, #a78bfa);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientShift 4s ease infinite;
        }
        .section-fade { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .section-fade.visible { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(s);
}


function useFadeIn() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

function FeatureCard({ icon: Icon, color, title, desc }) {
    return (
        <div className="group relative rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-slate-900/60 to-blue-950/60 backdrop-blur hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} bg-white/5 border border-white/10 group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
            </div>
            <h4 className="text-white font-black text-base uppercase tracking-wide mb-2">{title}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function RoadmapItem({ text, index }) {
    return (
        <div className="flex items-start gap-4 group">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-lg group-hover:scale-110 transition-transform">
                {index + 1}
            </div>
            <p className="text-slate-300 font-semibold leading-tight pt-1 group-hover:text-white transition-colors">{text}</p>
        </div>
    );
}

function ArchStep({ icon: Icon, label, color, isLast }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`flex flex-col items-center`}>
                <div className={`w-12 h-12 rounded-xl border ${color} bg-black/40 flex items-center justify-center shadow-lg`}>
                    <Icon size={20} className={color.replace("border-", "text-")} />
                </div>
                {!isLast && <div className="w-[1px] h-8 bg-gradient-to-b from-white/20 to-transparent mt-1" />}
            </div>
            <span className="text-slate-300 text-sm font-bold uppercase tracking-wide">{label}</span>
        </div>
    );
}

export default function About() {
    const navigate = useNavigate();

    const heroRef = useFadeIn();
    const problemRef = useFadeIn();
    const solutionRef = useFadeIn();
    const featuresRef = useFadeIn();
    const archRef = useFadeIn();
    const inspirationRef = useFadeIn();
    const visionRef = useFadeIn();
    const roadmapRef = useFadeIn();

    return (
        <div className="min-h-screen bg-[#030712] text-white font-sans overflow-x-hidden">

            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] right-[-5%] w-[400px] h-[400px] bg-blue-600/6 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] left-[20%] w-[350px] h-[350px] bg-indigo-600/5 rounded-full blur-[100px]" />
            </div>

            <nav className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                        <Shield size={16} className="text-white" />
                    </div>
                    <span className="text-white font-black text-lg tracking-tight">IDRO</span>
                </button>
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate("/")} className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">Home</button>
                    <button onClick={() => navigate("/active-disasters")} className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">Disasters</button>
                    <button onClick={() => navigate("/mission-control")} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">Mission Control</button>
                </div>
            </nav>

            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 space-y-32 py-20">

                <section ref={heroRef} className="section-fade flex flex-col lg:flex-row items-center gap-16">

                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            About IDRO
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight">
                            <span className="text-white">Intelligent</span>{" "}
                            <span className="gradient-text">Disaster</span>{" "}
                            <span className="text-white">Resource</span>{" "}
                            <span className="gradient-text">Optimizer</span>
                        </h1>
                        <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
                            IDRO is an AI-powered disaster response intelligence platform designed to reduce response time, eliminate resource misallocation, and improve survival outcomes during natural and man-made disasters.
                        </p>
                        <p className="text-slate-400 leading-relaxed max-w-2xl">
                            Built as a centralized command and optimization system, IDRO integrates real-time disaster alerts, automated impact assessment, and intelligent resource deployment tracking into a single operational dashboard.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <div className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-blue-400 rounded-full" />
                            <p className="text-white font-bold italic text-lg">
                                "Ensure that help reaches the right place, at the right time, with the right resources."
                            </p>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => navigate("/mission-control")} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-black rounded-xl text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-xl hover:shadow-emerald-500/30">
                                <Activity size={16} /> Enter Mission Control
                            </button>
                            <button onClick={() => navigate("/active-disasters")} className="flex items-center gap-2 px-6 py-3 border border-white/20 text-slate-300 font-black rounded-xl text-sm uppercase tracking-widest hover:border-white/40 hover:text-white transition-all">
                                <AlertTriangle size={16} /> Live Disasters
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative float-anim">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
                        <img
                            src="/img_command_center.png"
                            alt="Disaster Command Center"
                            className="relative w-full rounded-3xl shadow-2xl object-cover border border-white/10"
                            style={{ maxHeight: "420px" }}
                        />
                        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur border border-white/10 px-4 py-2 rounded-xl">
                            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">⬤ Live Operations Active</span>
                        </div>
                    </div>
                </section>

                <section ref={problemRef} className="section-fade">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-black uppercase tracking-widest mb-4">
                            <AlertTriangle size={12} /> The Global Challenge
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Why IDRO Exists</h2>
                        <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
                            Every year, disasters affect over <span className="text-white font-black">200 million people</span> globally. While emergency resources exist, inefficiencies in coordination, delayed data flow, and poor allocation strategies result in avoidable casualties.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="rounded-3xl bg-gradient-to-br from-red-950/40 via-slate-900/60 to-slate-900/60 border border-red-900/30 p-8 space-y-5">
                            <h3 className="text-red-400 font-black text-lg uppercase tracking-widest mb-6 flex items-center gap-2">
                                <AlertTriangle size={18} /> Key Challenges
                            </h3>
                            {[
                                "Delayed response time due to fragmented information",
                                "Overcrowding of relief camps in some areas while others lack aid",
                                "Lack of real-time visibility into field operations",
                                "Manual decision-making under high-pressure scenarios",
                                "Resource wastage due to poor planning",
                            ].map((c, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{c}</p>
                                </div>
                            ))}
                            <div className="mt-6 pt-6 border-t border-red-900/30">
                                <p className="text-red-400/80 text-sm italic font-semibold">
                                    Traditional systems focus on reporting disasters — not optimizing response.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { val: "200M+", label: "People affected annually", color: "from-red-900/40 to-slate-900/60 border-red-900/30 text-red-400" },
                                { val: "↑72%", label: "Cases of resource misallocation", color: "from-orange-900/30 to-slate-900/60 border-orange-900/30 text-orange-400" },
                                { val: "48hrs", label: "Avg. delay in coordinated response", color: "from-yellow-900/30 to-slate-900/60 border-yellow-900/30 text-yellow-400" },
                                { val: "↓30%", label: "Lives saved with optimized dispatch", color: "from-emerald-900/30 to-slate-900/60 border-emerald-900/30 text-emerald-400" },
                            ].map((s, i) => (
                                <div key={i} className={`rounded-2xl bg-gradient-to-br ${s.color} border p-6 flex flex-col justify-between`}>
                                    <span className={`text-4xl font-black ${s.color.split(" ").find(c => c.startsWith("text-"))}`}>{s.val}</span>
                                    <p className="text-slate-400 text-xs font-semibold mt-3 leading-snug">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        <img src="/img_flood_aerial.png" alt="Flood Disaster Aerial View" className="w-full object-cover" style={{ maxHeight: "380px" }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-8">
                            <p className="text-white font-black text-xl mb-1 uppercase tracking-tight">Real Disasters. Real People.</p>
                            <p className="text-slate-300 text-sm">IDRO was built to ensure no one is left behind in a disaster scenario.</p>
                        </div>
                    </div>
                </section>

                <section ref={solutionRef} className="section-fade">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 relative float-anim order-2 lg:order-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-emerald-500/10 rounded-3xl blur-2xl" />
                            <img
                                src="/img_dashboard.png"
                                alt="IDRO Dashboard"
                                className="relative w-full rounded-3xl shadow-2xl border border-white/10 object-cover"
                                style={{ maxHeight: "420px" }}
                            />
                        </div>

                        <div className="flex-1 space-y-6 order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-widest">
                                <Zap size={12} /> Our Solution
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">Intelligent<br /><span className="gradient-text">Optimization</span></h2>
                            <p className="text-slate-300 leading-relaxed">
                                IDRO transforms disaster management from <span className="text-white font-bold">reactive coordination</span> to <span className="text-emerald-400 font-bold">predictive intelligence</span>.
                            </p>
                            <p className="text-slate-400 leading-relaxed">
                                The platform continuously monitors disaster alerts and performs automated impact analysis using predefined severity models. Based on the affected geography, population density, and infrastructure data, IDRO recommends optimal allocation of:
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {["Medical Teams", "Relief Supplies", "Volunteers", "Emergency Transport", "Shelter Capacity", "Ground Units"].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                                        <span className="text-slate-200 text-sm font-semibold">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-slate-400 text-sm">All deployments are tracked in real time via an integrated live operations dashboard.</p>
                        </div>
                    </div>
                </section>

                <section ref={featuresRef} className="section-fade">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">
                            <Cpu size={12} /> Core Capabilities
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white">What IDRO <span className="gradient-text">Powers</span></h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <FeatureCard icon={Activity} color="text-red-400" title="Real-Time Disaster Monitoring"
                            desc="Live tracking of active disasters with geographic mapping and severity indicators. Every alert is classified and prioritized instantly." />
                        <FeatureCard icon={BarChart2} color="text-blue-400" title="AI-Based Impact Analysis"
                            desc="Automated need estimation based on disaster type, scale, and population exposure — no manual assessment required." />
                        <FeatureCard icon={Target} color="text-emerald-400" title="Smart Resource Allocation"
                            desc="Algorithm-driven distribution of resources to maximize coverage and minimize response time across all camps." />
                        <FeatureCard icon={MapPin} color="text-yellow-400" title="Deployment Status Tracking"
                            desc="Live field tracking of volunteers, relief camps, and emergency response units with real-time status updates." />
                        <FeatureCard icon={Eye} color="text-purple-400" title="Centralized Command Interface"
                            desc="A unified dashboard for decision-makers to monitor and control all operations in one single pane of glass." />
                        <FeatureCard icon={Globe} color="text-cyan-400" title="Geographic Route Mapping"
                            desc="Intelligent routing engine calculates optimal paths from NGO bases to camp locations with live progress tracking." />
                    </div>
                </section>

                <section ref={archRef} className="section-fade">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-widest">
                                <Layers size={12} /> System Architecture
                            </div>
                            <h2 className="text-4xl font-black text-white">How It All <span className="gradient-text">Works</span></h2>
                            <p className="text-slate-400 leading-relaxed">
                                IDRO is built using a modular architecture that integrates multiple data streams and services into a coherent operational system.
                            </p>
                            <div className="space-y-3 mt-6">
                                {[
                                    "Frontend Dashboard (React)",
                                    "Backend API Services (Java Spring Boot)",
                                    "Disaster Alert Data Streams",
                                    "Optimization Engine",
                                    "Real-Time Deployment Tracking Module",
                                    "Geographic Mapping Services",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 group">
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/20 flex items-center justify-center">
                                            <span className="text-cyan-400 text-[10px] font-black">{i + 1}</span>
                                        </div>
                                        <span className="text-slate-300 text-sm font-semibold group-hover:text-white transition-colors">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="rounded-3xl bg-gradient-to-br from-cyan-950/50 via-slate-900/70 to-blue-950/60 border border-cyan-900/30 p-8">
                                <p className="text-cyan-400 text-xs font-black uppercase tracking-widest mb-8">Data Flow Pipeline</p>
                                <div className="space-y-2">
                                    {[
                                        { icon: Radio, label: "Data Input — Disaster Alerts", color: "border-red-500/40" },
                                        { icon: Cpu, label: "AI Analysis — Severity & Impact", color: "border-yellow-500/40" },
                                        { icon: Target, label: "Optimization — Resource Matching", color: "border-blue-500/40" },
                                        { icon: Truck, label: "Deployment — NGO to Camp Routing", color: "border-emerald-500/40" },
                                        { icon: Eye, label: "Monitoring — Live Status Tracking", color: "border-purple-500/40" },
                                    ].map((step, i, arr) => (
                                        <ArchStep key={i} icon={step.icon} label={step.label} color={step.color} isLast={i === arr.length - 1} />
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <p className="text-slate-500 text-xs">Designed to be scalable and adaptable for city, state, and national-level disaster management authorities.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section ref={inspirationRef} className="section-fade">
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        <img src="/img_satellite.png" alt="Satellite Monitoring Center" className="w-full object-cover" style={{ maxHeight: "320px" }} />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                        <div className="absolute inset-0 flex items-center px-12">
                            <div className="max-w-xl space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-black uppercase tracking-widest">
                                    <Clock size={12} /> Inspiration Behind IDRO
                                </div>
                                <h2 className="text-4xl font-black text-white">Purpose-Driven <span className="gradient-text">Innovation</span></h2>
                                <p className="text-slate-300 leading-relaxed text-sm">
                                    IDRO was conceptualized to address recurring inefficiencies during disaster response scenarios, where coordination delays and mismanaged resources significantly impacted rescue efforts.
                                </p>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Inspired by real-world disaster challenges and the increasing need for AI-assisted governance systems, IDRO aims to bridge the gap between data availability and actionable decision-making. The platform is designed not just as a hackathon project — but as a scalable framework for intelligent disaster response infrastructure.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section ref={visionRef} className="section-fade text-center">
                    <div className="rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-blue-950/60 border border-indigo-900/30 py-16 px-8 relative overflow-hidden">
                        {/* Glows */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest">
                                <Globe size={12} /> Our Vision
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight max-w-4xl mx-auto">
                                Saving Lives Through <span className="gradient-text">Optimized Coordination</span>
                            </h2>
                            <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
                                To build a globally scalable, AI-driven disaster intelligence ecosystem that enables governments and organizations to respond <span className="text-white font-bold">faster</span>, <span className="text-emerald-400 font-bold">smarter</span>, and more efficiently — ultimately saving lives through optimized coordination.
                            </p>
                            <button onClick={() => navigate("/mission-control")} className="inline-flex items-center gap-2 mt-4 px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-black rounded-xl uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-2xl hover:shadow-emerald-500/30">
                                Experience IDRO <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>

                <section ref={roadmapRef} className="section-fade pb-12">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">
                            <ChevronRight size={12} /> Future Roadmap
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white">What's <span className="gradient-text">Next</span></h2>
                        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm">IDRO is built to evolve. Here's where we're headed.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            "Integration with government alert APIs",
                            "Machine learning–based predictive disaster modeling",
                            "Drone-based live feed integration",
                            "Mobile application for field responders",
                            "Automated relief supply chain tracking",
                            "Multi-language support for global deployment",
                        ].map((item, i) => (
                            <RoadmapItem key={i} text={item} index={i} />
                        ))}
                    </div>
                </section>

            </div>

            <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur py-8 text-center">
                <p className="text-slate-600 text-xs font-black uppercase tracking-widest">IDRO — Intelligent Disaster Resource Optimizer &nbsp;|&nbsp; Built for Emergency Command</p>
            </footer>
        </div>
    );
}
