import React, { useState, useEffect } from 'react';

const AGENT_DATA = [
    {
        name: "Resume Parser",
        emoji: "🔨",
        color: "#22d3ee",
        logs: [
            "Extracting semantic entities...",
            "Normalizing work history nodes...",
            "Mapping skillset to ontology...",
            "Generating JSON manifest..."
        ]
    },
    {
        name: "LinkedIn Scraper",
        emoji: "🔍",
        color: "#818cf8",
        logs: [
            "Bypassing Cloudflare protection...",
            "Analyzing search DOM structure...",
            "Hydrating job listing metadata...",
            "Storing results in cluster..."
        ]
    },
    {
        name: "Skill Analyzer",
        emoji: "⚙️",
        color: "#f472b6",
        logs: [
            "Cross-referencing technology stack...",
            "Calculating proficiency vectors...",
            "Identifying secondary skill nodes...",
            "Weighting skill significance..."
        ]
    },
    {
        name: "Job Matcher",
        emoji: "📐",
        color: "#fbbf24",
        logs: [
            "Initiating matching algorithm...",
            "Calculating cosine similarity...",
            "Sorting candidate relevance...",
            "Filtering geolocation results..."
        ]
    },
    {
        name: "Gap Detector",
        emoji: "🪚",
        color: "#f87171",
        logs: [
            "Comparing requirements delta...",
            "Flagging missing certifications...",
            "Isolating experience mismatches...",
            "Quantifying training needs..."
        ]
    }
];

const SequentialAgents = ({ onComplete }) => {
    const [currentAgentIdx, setCurrentAgentIdx] = useState(0);
    const [logStep, setLogStep] = useState(0);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        if (finished) return;

        const timer = setInterval(() => {
            setLogStep((prev) => {
                if (prev < 3) return prev + 1;

                // Agent finished logs, move to next agent after a delay
                setTimeout(() => {
                    if (currentAgentIdx < AGENT_DATA.length - 1) {
                        setCurrentAgentIdx(currentAgentIdx + 1);
                        setLogStep(0);
                    } else {
                        setFinished(true);
                        if (onComplete) onComplete();
                    }
                }, 800);
                return prev;
            });
        }, 1200);

        return () => clearInterval(timer);
    }, [currentAgentIdx, finished, onComplete]);

    const overallProgress = finished ? 100 : Math.round(((currentAgentIdx + (logStep / 4)) / AGENT_DATA.length) * 100);

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#020617',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"DM Sans", sans-serif',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999,
            overflow: 'hidden'
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono&family=DM+Sans:wght@400;700&display=swap');
        
        @keyframes gridScroll {
          from { background-position: 0 0; }
          to { background-position: 40px 40px; }
        }

        @keyframes bounce-rotate {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1.1); }
          50% { transform: translateY(-10px) rotate(5deg) scale(1.2); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes celebrate {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridScroll 10s linear infinite;
        }

        .terminal-log {
          font-family: 'DM Mono', monospace;
          background: #0f172a;
          border-radius: 8px;
          padding: 16px;
          width: 320px;
          border-left: 3px solid var(--accent);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
      `}</style>

            {/* Background */}
            <div className="grid-bg" />

            {/* Content Container */}
            <div style={{ position: 'relative', zIndex: 1, width: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                {/* Overall Progress */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                        <span>OVERALL ORCHESTRATION</span>
                        <span>{overallProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${overallProgress}%`, height: '100%', background: 'linear-gradient(90deg, #22d3ee, #818cf8)', transition: 'width 0.4s ease' }} />
                    </div>
                </div>

                {/* Finished Celebration */}
                {finished && (
                    <div style={{ animation: 'celebrate 0.6s ease forwards', textAlign: 'center', py: '40px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Intelligence Synced!</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Target data architecture complete.</p>
                    </div>
                )}

                {/* Completed Agents Stack */}
                {!finished && AGENT_DATA.slice(0, currentAgentIdx).map((agent, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid #1e293b',
                        borderRadius: '10px',
                        borderLeft: `3px solid ${agent.color}`,
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <span style={{ fontSize: '16px' }}>{agent.emoji}</span>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', flex: 1 }}>{agent.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '60px', height: '3px', background: '#064e3b', borderRadius: '1.5px', overflow: 'hidden' }}>
                                <div style={{ width: '100%', height: '100%', background: '#4ade80' }} />
                            </div>
                            <span style={{ color: '#4ade80', fontSize: '10px', fontWeight: 'bold' }}>✓ DONE</span>
                        </div>
                    </div>
                ))}

                {/* Active Agent */}
                {!finished && (
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        borderRadius: '20px',
                        padding: '24px',
                        border: '1px solid #334155',
                        marginTop: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        backdropFilter: 'blur(10px)',
                        boxShadow: `0 0 40px ${AGENT_DATA[currentAgentIdx].color}22`
                    }}>
                        <div style={{
                            fontSize: '56px',
                            animation: 'bounce-rotate 2s ease-in-out infinite',
                            filter: `drop-shadow(0 0 15px ${AGENT_DATA[currentAgentIdx].color})`
                        }}>
                            {AGENT_DATA[currentAgentIdx].emoji}
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: AGENT_DATA[currentAgentIdx].color, animation: 'blink 1s step-end infinite' }} />
                                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0' }}>{AGENT_DATA[currentAgentIdx].name}</h3>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>Agent {currentAgentIdx + 1} of {AGENT_DATA.length}</p>
                        </div>

                        <div className="terminal-log" style={{ '--accent': AGENT_DATA[currentAgentIdx].color }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {AGENT_DATA[currentAgentIdx].logs.map((log, i) => (
                                    i <= logStep && (
                                        <div key={i} style={{ animation: 'fadeIn 0.3s ease forwards', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ color: AGENT_DATA[currentAgentIdx].color, fontSize: '12px' }}>$</span>
                                            <span style={{ fontSize: '12px', color: i === logStep ? '#f8fafc' : '#64748b' }}>
                                                {log}{i === logStep && <span style={{ animation: 'blink 1s step-end infinite', marginLeft: '4px' }}>_</span>}
                                            </span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>

                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', marginBottom: '6px', color: '#64748b' }}>
                                <span>PROCESSING...</span>
                                <span>{Math.round(((logStep + 1) / 4) * 100)}%</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: '#0f172a', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${((logStep + 1) / 4) * 100}%`,
                                    height: '100%',
                                    background: AGENT_DATA[currentAgentIdx].color,
                                    transition: 'width 1s ease'
                                }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending Icons */}
                {!finished && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '16px',
                        marginTop: '24px',
                        opacity: 0.3
                    }}>
                        {AGENT_DATA.slice(currentAgentIdx + 1).map((agent, i) => (
                            <span key={i} style={{ fontSize: '20px' }}>{agent.emoji}</span>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default SequentialAgents;
