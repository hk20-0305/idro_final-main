import { ShieldCheck } from "lucide-react";

export default function ReliefCalculationStandards() {
    const standards = [
        { label: "Food Supply", text: "3 food packets per person per day" },
        { label: "Water Supply", text: "5 liters of drinking water per person per day" },
        { label: "Medical Beds", text: "1 bed required for every injured person" },
        { label: "Medical Kits", text: "1 medical kit required per injured person (if medicines are marked as needed)" },
        { label: "Volunteer Deployment", text: "1 volunteer required for every 50 affected individuals" },
        { label: "Ambulance Deployment", text: "Minimum 1 ambulance if injured > 0; 2 ambulances if severity is critical and injured > 50" },
    ];

    return (
        <div className="mt-16 mb-8">
            <div className="rounded-[2rem] bg-slate-900/40 border border-slate-800/60 p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                {/* Soft Background Accent */}
                <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />

                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                        <ShieldCheck size={28} className="text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            Relief Calculation Standards
                        </h2>
                        <p className="text-slate-500 text-sm mt-0.5 font-medium italic">
                            Operational guidelines for resource prediction and allocation
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
                    {standards.map((s, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                            <div className="mt-2.5 h-2 w-2 rounded-full bg-blue-500/30 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-base font-bold text-blue-400/90 tracking-tight">
                                    {s.label}
                                </p>
                                <p className="text-lg text-slate-200 font-medium leading-relaxed">
                                    {s.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-white/5">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-3xl">
                        * These standards are derived from established disaster response protocols and are used to calibrate resource predictions. They ensure that every individual receives the necessary support based on the reported impact and severity.
                    </p>
                </div>
            </div>
        </div>
    );
}
