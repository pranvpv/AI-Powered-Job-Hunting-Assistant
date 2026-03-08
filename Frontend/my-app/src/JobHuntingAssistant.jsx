import { useState, useRef, useEffect } from "react";
import SequentialAgents from "./SequentialAgents";

const INDIAN_STATES = [
  "Karnataka", "Kerala", "Maharashtra", "Tamil Nadu", "Telangana", "Delhi", "Uttar Pradesh", "West Bengal", "Gujarat", "Haryana", "Andhra Pradesh", "Rajasthan", "Madhya Pradesh", "Punjab", "Remote"
];



function UploadZone({ onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [localLocation, setLocalLocation] = useState("Kochi");
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file, localLocation);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onUpload(file, localLocation);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Target Region / State</label>

        <div className="flex flex-wrap gap-2 px-1 mb-1">
          {["Kochi", "Bangalore", "Hyderabad", "Remote"].map(hub => (
            <button
              key={hub}
              onClick={() => setLocalLocation(hub)}
              className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: localLocation === hub ? "rgba(34,211,238,0.2)" : "rgba(15, 23, 42, 0.6)",
                color: localLocation === hub ? "#22d3ee" : "#64748b",
                border: `1px solid ${localLocation === hub ? "rgba(34,211,238,0.4)" : "rgba(51, 65, 85, 0.6)"}`
              }}
            >
              {hub}
            </button>
          ))}
        </div>

        <select
          value={INDIAN_STATES.includes(localLocation) ? localLocation : ""}
          onChange={(e) => setLocalLocation(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/50 transition-all font-medium appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1.25rem'
          }}
        >
          <option value="" disabled>{INDIAN_STATES.includes(localLocation) ? localLocation : "Select a State"}</option>
          {INDIAN_STATES.map(state => (
            <option key={state} value={state} className="bg-slate-950">{state}</option>
          ))}
        </select>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={handleClick}
        className="cursor-pointer border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300"
        style={{
          borderColor: dragging ? "#22d3ee" : "#334155",
          background: dragging ? "rgba(34,211,238,0.05)" : "rgba(15,23,42,0.6)",
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          className="hidden"
          accept=".pdf,.docx,.doc"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)" }}>
            📄
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-200">Drop your resume here</p>
            <p className="text-slate-500 text-sm mt-1">PDF, DOCX — or click to browse</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
            className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(34,211,238,0.15)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.3)" }}>
            Upload Resume
          </button>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onGenerate }) {
  const [expanded, setExpanded] = useState(false);
  const logo = job.logo || (job.company ? job.company.substring(0, 2).toUpperCase() : "JB");
  const tags = job.tags || [];

  return (
    <div className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.01]"
      style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.8)" }}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: "rgba(34,211,238,0.1)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)" }}>
          {logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-100">{job.title}</h3>
              <p className="text-slate-400 text-sm">{job.company}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {(job.tags || []).map(t => (
              <span key={t} className="px-2 py-0.5 rounded-lg text-xs"
                style={{ background: "rgba(34,211,238,0.08)", color: "#94a3b8", border: "1px solid rgba(51,65,85,0.6)" }}>
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {job.location && <span className="flex items-center gap-1">📍 {job.location}</span>}
              {job.type && <span className="flex items-center gap-1">� {job.type}</span>}
              {job.salary && <span className="flex items-center gap-1">💰 {job.salary}</span>}
              {job.posted && <span className="flex items-center gap-1">🕐 {job.posted}</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setExpanded(!expanded)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: "rgba(51,65,85,0.5)", color: "#94a3b8" }}>
                {expanded ? "Less" : "Analysis"}
              </button>
              <a href={job.link} target="_blank" rel="noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "rgba(34,211,238,0.9)", color: "#0f172a", textDecoration: "none" }}>
                Apply →
              </a>
            </div>
          </div>
          {expanded && (
            <div className="mt-4 pt-4 border-t text-sm text-slate-400 leading-relaxed"
              style={{ borderColor: "rgba(51,65,85,0.5)" }}>
              {job.analysis || `Check the "Resume Summary" tab for a detailed strategic breakdown of this ${job.title} match.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function App() {
  const [stage, setStage] = useState("upload"); // upload | analyzing | results
  const [activeTab, setActiveTab] = useState("jobs");
  const [applied, setApplied] = useState([]);
  const [dataReady, setDataReady] = useState(false);
  const [currentFile, setCurrentFile] = useState("");

  const [agentData, setAgentData] = useState({
    jobs: [],
    summary: "",
    analysis: "",
    error: "",
    location: ""
  });

  const [activeAgent, setActiveAgent] = useState(0);
  const agents = [
    { name: "Resume Analyzer", icon: "📄", task: "Extracting skills & experience" },
    { name: "Search Engineer", icon: "🧠", task: "Generating optimized keywords" },
    { name: "URL Configurator", icon: "🔗", task: "Framing LinkedIn search URLs" },
    { name: "LinkedIn Scraper", icon: "🔍", task: "Fetching live job listings" },
    { name: "Fit Strategist", icon: "⚖️", task: "Synthesizing scores & analysis" }
  ];

  const handleUpload = async (file, targetLocation) => {
    if (!file) return;
    setCurrentFile(file.name);
    setStage("analyzing");
    setDataReady(false);

    // Reset previous data and set location
    setAgentData({
      jobs: [],
      summary: "",
      analysis: "",
      error: "",
      location: targetLocation
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`http://127.0.0.1:8001/analyze-resume?location=${encodeURIComponent(targetLocation)}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setAgentData(prev => ({ ...prev, error: data.error }));
      } else {
        setAgentData(prev => ({
          ...prev,
          jobs: data.job_listings || [],
          summary: data.resume_summary || "",
          analysis: data.final_analysis || "",
          error: "",
          location: data.location || prev.location
        }));
      }
      setDataReady(true);
    } catch (err) {
      console.error(err);
      setAgentData(prev => ({ ...prev, error: "Cloud connection failed. Please ensure backend is running." }));
      setDataReady(true); // Still ready to show error
    }
  };

  // No tabs needed as we only show jobs

  return (
    <div className="min-h-screen text-slate-100" style={{
      background: "#020617",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        @keyframes pulse-ring { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .slide-up { animation: slide-up 0.5s ease forwards; }
        .slide-up-2 { animation: slide-up 0.5s 0.1s ease forwards; opacity:0; }
        .slide-up-3 { animation: slide-up 0.5s 0.2s ease forwards; opacity:0; }
        .slide-up-4 { animation: slide-up 0.5s 0.3s ease forwards; opacity:0; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #818cf8, transparent)", filter: "blur(80px)" }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-10 slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.3)" }}>⚡</div>
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-400">AI Career Assistant</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-100" style={{ fontFamily: "'Syne', sans-serif" }}>
            Your Job Hunt,<br />
            <span style={{ color: "#22d3ee" }}>Automated.</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Upload your resume → get matched jobs → generate cover letters → track applications</p>
        </div>

        {/* Upload Stage */}
        {stage === "upload" && (
          <div className="slide-up-2">
            <UploadZone onUpload={handleUpload} />
          </div>
        )}

        {/* Analyzing Stage */}
        {stage === "analyzing" && (
          <SequentialAgents onComplete={() => {
            if (dataReady) {
              setStage("results");
            } else {
              // If animation finishes before data, we'll wait 
              // This is handled by a listener or we can check every 500ms
              const checker = setInterval(() => {
                if (dataReady) {
                  setStage("results");
                  clearInterval(checker);
                }
              }, 500);
            }
          }} />
        )}

        {/* Results Stage */}
        {stage === "results" && (
          <div>
            {/* Active Resume Header */}
            <div className="mb-6 flex items-center justify-between p-4 rounded-2xl"
              style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.1)" }}>
              <div className="flex items-center gap-3">
                <div className="text-xl">📄</div>
                <div>
                  <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Active Search Profile</p>
                  <p className="text-sm font-semibold text-slate-200">{currentFile || "Current Resume"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{agentData.location}</span>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-3 mb-6 slide-up">
              {[
                { label: "Jobs Found", value: agentData.jobs.length || "0", icon: "🔍" },
                { label: "Matches analysed", value: Math.min(agentData.jobs.length, 3), icon: "✅" },
                { label: "Avg Match Score", value: "85%", icon: "📊" },
                { label: "Status", value: "Success", icon: "✨" },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl p-4" style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.6)" }}>
                  <div className="text-lg mb-1">{stat.icon}</div>
                  <div className="text-xl font-bold text-slate-100">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Only Jobs view exists now */}

            <div className="flex flex-col gap-3 slide-up-3">
              {agentData.error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  ⚠️ {agentData.error}
                </div>
              )}
              {agentData.jobs.length > 0 ? (
                agentData.jobs.map((job, idx) => (
                  <JobCard key={idx} job={job} />
                ))
              ) : (
                <div className="text-center py-10 text-slate-500">
                  No jobs found yet. Upload your resume to start.
                </div>
              )}
            </div>

            {/* Re-upload */}
            <button onClick={() => setStage("upload")}
              className="mt-6 text-slate-600 hover:text-slate-400 text-sm transition-all flex items-center gap-2 slide-up-4">
              ↑ Upload a different resume
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
