import React, { useState, useEffect } from "react";

const AgentAnt = ({ startX, startY, label, delay = 0 }) => {
    // Calculated rotation to face the center (50, 50)
    const angle = Math.atan2(50 - startY, 50 - startX) * (180 / Math.PI);

    return (
        <div
            className="absolute transition-all duration-[6000ms] linear"
            style={{
                left: `${startX}%`,
                top: `${startY}%`,
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                animation: `converge 8s linear infinite ${delay}s`,
            }}
        >
            {/* Data Orb */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee] animate-bounce" />

            {/* Ant Body */}
            <div className="relative flex flex-col items-center">
                {/* Antennae */}
                <div className="flex gap-2 -mb-1">
                    <div className="w-[1px] h-3 bg-slate-600 origin-bottom animate-[wiggle_0.5s_ease-in-out_infinite]" />
                    <div className="w-[1px] h-3 bg-slate-600 origin-bottom animate-[wiggle_0.5s_ease-in-out_infinite_reverse]" />
                </div>

                {/* Head */}
                <div className="w-3 h-3 bg-slate-800 rounded-full border border-slate-700" />

                {/* Thorax & Legs */}
                <div className="relative w-2.5 h-4 bg-slate-700 rounded-lg my-0.5">
                    {/* 6 Legs */}
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className={`absolute w-3 h-[1px] bg-slate-600 origin-center`}
                            style={{
                                top: `${20 + (i % 3) * 30}%`,
                                left: i < 3 ? "-100%" : "100%",
                                animation: `legWalk 0.3s ease-in-out infinite ${i * 0.05}s`,
                                transform: `rotate(${i < 3 ? -30 : 30}deg)`
                            }}
                        />
                    ))}
                </div>

                {/* Abdomen */}
                <div className="w-4 h-6 bg-slate-900 rounded-[40%] border border-slate-800 shadow-inner" />

                {/* Label */}
                <div className="absolute top-14 whitespace-nowrap text-[8px] font-bold tracking-tighter text-slate-500 uppercase rotate-[-angle] transform"
                    style={{ transform: `rotate(${-angle}deg)` }}>
                    {label}
                </div>
            </div>
        </div>
    );
};

const AgentColony = () => {
    const [active, setActive] = useState(false);

    useEffect(() => {
        setActive(true);
    }, []);

    const agentConfigs = [
        { startX: -10, startY: 20, label: "Resume Agent", delay: 0 },
        { startX: 110, startY: 80, label: "LinkedIn Agent", delay: 1.5 },
        { startX: 50, startY: -10, label: "Scoring Agent", delay: 3 },
        { startX: 50, startY: 110, label: "Skill Agent", delay: 4.5 },
        { startX: -10, startY: 80, label: "Cover Letter Agent", delay: 0.5 },
        { startX: 110, startY: 20, label: "Extraction Agent", delay: 2.5 },
    ];

    return (
        <div className="fixed inset-0 bg-[#020617] overflow-hidden flex items-center justify-center z-[100]">
            <style>{`
        @keyframes legWalk {
          0%, 100% { transform: rotate(15deg) scaleX(1); }
          50% { transform: rotate(-15deg) scaleX(1.2); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes converge {
          0% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--angle)) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 50%; top: 50%; scale: 0.2; opacity: 0; }
        }
        @keyframes pulse-central {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(34, 211, 238, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 0 40px rgba(34, 211, 238, 0.7); }
        }
      `}</style>

            {/* Central Core */}
            <div className="relative w-32 h-32 rounded-full flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-spin" style={{ animationDuration: '10s' }} />
                <div className="absolute inset-4 rounded-full border border-cyan-400/30 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                <div
                    className="w-16 h-16 bg-cyan-950 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)] z-10 animate-[pulse-central_2s_ease-in-out_infinite]"
                >
                    <span className="text-2xl animate-pulse">🧠</span>
                </div>

                {/* Core Glow Particle Rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                            style={{
                                animation: `spin 3s linear infinite`,
                                transform: `rotate(${i * 120}deg) translateX(60px)`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Agents */}
            {active && agentConfigs.map((config, idx) => (
                <div key={idx} style={{ '--angle': `${Math.atan2(50 - config.startY, 50 - config.startX) * (180 / Math.PI)}deg` }}>
                    <AgentAnt {...config} />
                </div>
            ))}

            {/* Processing Text */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center">
                <p className="text-cyan-400 font-bold tracking-[0.2em] uppercase text-xs animate-pulse">Orchestrating Collective Intelligence</p>
                <p className="text-slate-600 text-[10px] mt-2 italic">A swarm of agents is processing your data colony...</p>
            </div>
        </div>
    );
};

export default AgentColony;
