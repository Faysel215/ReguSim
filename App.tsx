import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  SimulationConfig, 
  SimulationStatus, 
  TimeStepData, 
  NodeEntity, 
  LinkEntity,
  AIAnalysisResult 
} from './types';
import { generatePreSimulationBrief, generatePostSimulationReport } from './services/geminiService';
import { generateNetwork, stepSimulation } from './utils/simulationEngine';
import MarketChart from './components/MarketChart';
import NetworkVis from './components/NetworkVis';
import { Play, Pause, RefreshCw, Activity, ShieldAlert, Cpu, FileText } from 'lucide-react';

const INITIAL_CONFIG: SimulationConfig = {
  tangibilityRatio: 51,
  marketLiquidity: 80,
  investorPanicSensitivity: 50,
  shockType: 'Tangibility Breach (Global)',
};

const INITIAL_DATA: TimeStepData = {
  time: 0,
  sukukIndex: 100,
  systemicRisk: 0,
  liquidity: 80,
  defaults: 0
};

const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>(INITIAL_CONFIG);
  const [status, setStatus] = useState<SimulationStatus>(SimulationStatus.IDLE);
  const [history, setHistory] = useState<TimeStepData[]>([INITIAL_DATA]);
  const [nodes, setNodes] = useState<NodeEntity[]>([]);
  const [links, setLinks] = useState<LinkEntity[]>([]);
  
  const [aiReport, setAiReport] = useState<AIAnalysisResult | null>(null);
  const [brief, setBrief] = useState<string>("");
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const requestRef = useRef<number>();
  
  // Initialize Network
  useEffect(() => {
    const { nodes, links } = generateNetwork(60);
    setNodes(nodes);
    setLinks(links);
  }, []);

  // Simulation Loop
  const tick = useCallback(() => {
    if (status !== SimulationStatus.RUNNING) return;

    setNodes(prevNodes => {
      setHistory(prevHistory => {
        const currentData = prevHistory[prevHistory.length - 1];
        
        if (currentData.time >= 100) {
          setStatus(SimulationStatus.COMPLETED);
          return prevHistory;
        }

        const { nextNodes, nextData } = stepSimulation(prevNodes, currentData, config, currentData.time);
        
        // Return accumulated history
        return [...prevHistory, nextData];
      });
      // We need to return the new nodes for the state update, but we can't access them from the setHistory closure easily
      // So we actually re-run the calculation inside setNodes or restructure.
      // To avoid double calc, let's restructure:
      return prevNodes; // Use effect to drive it? No, better to do it cleanly.
    });

    // Correct Loop Implementation
    const lastData = history[history.length - 1];
    if (lastData && lastData.time >= 100) {
       setStatus(SimulationStatus.COMPLETED);
       return;
    }

    const { nextNodes, nextData } = stepSimulation(nodes, history[history.length-1], config, history[history.length-1].time);
    setNodes(nextNodes);
    setHistory(prev => [...prev, nextData]);

    requestRef.current = requestAnimationFrame(tick);
  }, [status, config, nodes, history]);

  // Handle Animation Frame
  useEffect(() => {
    if (status === SimulationStatus.RUNNING) {
      // Throttle simulation speed
      const timer = setTimeout(() => {
         requestRef.current = requestAnimationFrame(tick);
      }, 100); // 100ms per tick
      return () => clearTimeout(timer);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [status, tick]);

  const handleStart = async () => {
    if (history.length === 1) {
       setLoadingBrief(true);
       const text = await generatePreSimulationBrief(config);
       setBrief(text);
       setLoadingBrief(false);
    }
    setStatus(SimulationStatus.RUNNING);
  };

  const handlePause = () => setStatus(SimulationStatus.PAUSED);

  const handleReset = () => {
    setStatus(SimulationStatus.IDLE);
    setHistory([INITIAL_DATA]);
    const { nodes: newNodes, links: newLinks } = generateNetwork(60);
    setNodes(newNodes);
    setLinks(newLinks);
    setAiReport(null);
    setBrief("");
  };

  // Trigger Report Generation on Completion
  useEffect(() => {
    if (status === SimulationStatus.COMPLETED && !aiReport && !generatingReport) {
      const fetchReport = async () => {
        setGeneratingReport(true);
        const result = await generatePostSimulationReport(config, history);
        setAiReport(result);
        setGeneratingReport(false);
      };
      fetchReport();
    }
  }, [status, history, config, aiReport, generatingReport]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ReguSim <span className="text-cyan-400 font-mono text-sm px-2 py-0.5 bg-cyan-950/50 rounded border border-cyan-800">BETA</span></h1>
            <p className="text-xs text-slate-400">Systemic Contagion Sandbox for Islamic Finance</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-3 py-1 bg-slate-800 rounded border border-slate-700 text-xs font-mono text-slate-400">
             V.2.0.4-QABM
           </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Sidebar: Controls */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0 h-full overflow-y-auto pr-2">
          
          {/* Status Panel */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Simulation Control</span>
              {status === SimulationStatus.RUNNING && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span></span>}
            </div>
            
            <div className="flex gap-2 mb-6">
              {status === SimulationStatus.RUNNING ? (
                <button onClick={handlePause} className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                  <Pause size={18} /> Pause
                </button>
              ) : (
                <button onClick={handleStart} disabled={status === SimulationStatus.COMPLETED} className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${status === SimulationStatus.COMPLETED ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'}`}>
                  <Play size={18} /> {status === SimulationStatus.PAUSED ? 'Resume' : 'Start Test'}
                </button>
              )}
              <button onClick={handleReset} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 transition-colors">
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="space-y-4">
               <div>
                 <label className="block text-xs font-medium text-slate-400 mb-1">Tangibility Ratio Min (%)</label>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={config.tangibilityRatio} 
                   onChange={(e) => setConfig({...config, tangibilityRatio: parseInt(e.target.value)})}
                   className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                   disabled={status !== SimulationStatus.IDLE}
                 />
                 <div className="flex justify-between text-xs text-slate-500 mt-1">
                   <span>0% (Risk High)</span>
                   <span className="text-cyan-400 font-mono">{config.tangibilityRatio}%</span>
                   <span>100% (Safe)</span>
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-medium text-slate-400 mb-1">Market Liquidity</label>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={config.marketLiquidity} 
                   onChange={(e) => setConfig({...config, marketLiquidity: parseInt(e.target.value)})}
                   className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                   disabled={status !== SimulationStatus.IDLE}
                 />
                 <div className="flex justify-between text-xs text-slate-500 mt-1">
                   <span>Frozen</span>
                   <span className="text-cyan-400 font-mono">{config.marketLiquidity}</span>
                   <span>Liquid</span>
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-medium text-slate-400 mb-1">Investor Panic Sensitivity</label>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={config.investorPanicSensitivity} 
                   onChange={(e) => setConfig({...config, investorPanicSensitivity: parseInt(e.target.value)})}
                   className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                   disabled={status !== SimulationStatus.IDLE}
                 />
                 <div className="flex justify-between text-xs text-slate-500 mt-1">
                   <span>Stoic</span>
                   <span className="text-cyan-400 font-mono">{config.investorPanicSensitivity}</span>
                   <span>Volatile</span>
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-medium text-slate-400 mb-2">Shock Scenario</label>
                 <select 
                   value={config.shockType}
                   onChange={(e) => setConfig({...config, shockType: e.target.value})}
                   disabled={status !== SimulationStatus.IDLE}
                   className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                 >
                   <option>Tangibility Breach (Global)</option>
                   <option>Major Bank Default</option>
                   <option>Sudden Fatwa Revision</option>
                   <option>Oil Price Collapse</option>
                 </select>
               </div>
            </div>
          </div>

          {/* AI Briefing */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex-1 min-h-[150px]">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-cyan-500" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Analysis</h3>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed font-mono">
              {loadingBrief ? (
                 <span className="animate-pulse">Initializing AI agents and scenario parameters...</span>
              ) : brief ? (
                brief
              ) : (
                <span className="text-slate-600 italic">Configure parameters and start simulation to receive pre-flight risk assessment.</span>
              )}
              {status === SimulationStatus.RUNNING && (
                <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-green-400">
                  > Ingesting market ticks...<br/>
                  > Monitoring network latency...<br/>
                  > Detecting contagion vectors...
                </div>
              )}
            </div>
          </div>

        </aside>

        {/* Main Content: Visualization */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          {/* Top Row: Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase">Sukuk Index</p>
              <p className="text-2xl font-bold text-white font-mono">
                {history[history.length-1].sukukIndex.toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase">Systemic Risk</p>
              <p className={`text-2xl font-bold font-mono ${history[history.length-1].systemicRisk > 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                {history[history.length-1].systemicRisk.toFixed(1)}
              </p>
            </div>
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase">Defaults</p>
              <p className="text-2xl font-bold text-white font-mono">
                {history[history.length-1].defaults} <span className="text-sm text-slate-500 font-normal">/ {nodes.length}</span>
              </p>
            </div>
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase">Step</p>
              <p className="text-2xl font-bold text-cyan-400 font-mono">
                {history[history.length-1].time} <span className="text-sm text-slate-500 font-normal">/ 100</span>
              </p>
            </div>
          </div>

          {/* Visualization Area */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-0">
             <div className="h-full min-h-[350px]">
               <NetworkVis nodes={nodes} links={links} />
             </div>
             <div className="h-full min-h-[350px]">
               <MarketChart data={history} />
             </div>
          </div>
          
          {/* Bottom Panel: AI Report (Only shows when done) */}
          {status === SimulationStatus.COMPLETED && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
               <div className="flex items-center gap-2 mb-4">
                 <ShieldAlert className="text-amber-500" />
                 <h2 className="text-lg font-bold text-white">Post-Mortem Policy Report</h2>
               </div>
               
               {generatingReport ? (
                 <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    Generating regulatory insights with Gemini 2.5...
                 </div>
               ) : aiReport ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Executive Summary</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{aiReport.summary}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Risk Assessment</h4>
                        <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-red-500 pl-3 bg-red-950/10 py-1">
                          {aiReport.riskAssessment}
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                       <h4 className="text-xs font-bold text-cyan-400 uppercase mb-3 flex items-center gap-2">
                         <FileText size={14} /> Recommended Actions
                       </h4>
                       <ul className="space-y-2">
                         {aiReport.recommendations.map((rec, i) => (
                           <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                             <span className="mt-1 w-1 h-1 bg-cyan-500 rounded-full shrink-0"></span>
                             {rec}
                           </li>
                         ))}
                       </ul>
                    </div>
                 </div>
               ) : null}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;