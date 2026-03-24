import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Activity, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Stethoscope, 
  User, 
  Clock, 
  Info,
  ArrowLeft,
  RefreshCw,
  Pill,
  HeartPulse,
  ShieldAlert,
  MessageSquare,
  Send,
  UserCircle,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SYMPTOMS } from './data';
import { diagnose, DiagnosisResult } from './diagnosisService';
import { generateTreatmentPlan, TreatmentPlan } from './planningService';
import { processChatMessage, ChatMessage } from './chatService';

export default function App() {
  const [step, setStep] = useState<'welcome' | 'input' | 'results'>('welcome');
  const [inputMode, setInputMode] = useState<'manual' | 'chat'>('manual');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);

  // Chat states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (inputMode === 'chat') {
      scrollToBottom();
    }
  }, [chatHistory, inputMode]);

  const handleSymptomToggle = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleChatSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    const response = await processChatMessage(chatHistory, userMsg, selectedSymptoms);
    
    setChatHistory(prev => [...prev, { role: 'model', text: response.message }]);
    
    // Update state based on AI detection
    if (response.detectedSymptoms.length > 0) {
      setSelectedSymptoms(prev => {
        const newSymptoms = [...prev];
        response.detectedSymptoms.forEach(id => {
          if (!newSymptoms.includes(id)) newSymptoms.push(id);
        });
        return newSymptoms;
      });
    }
    if (response.detectedAge) setAge(response.detectedAge.toString());
    if (response.detectedGender) setGender(response.detectedGender.toLowerCase());

    setIsChatLoading(false);
  };

  const handleStartDiagnosis = async () => {
    if (selectedSymptoms.length === 0 || !age) return;
    
    setLoading(true);
    const result = diagnose(selectedSymptoms);
    setDiagnosis(result);

    if (result) {
      const plan = await generateTreatmentPlan(
        result.predictedDisease.name,
        selectedSymptoms.map(id => SYMPTOMS.find(s => s.id === id)?.label || id),
        parseInt(age),
        gender
      );
      setTreatmentPlan(plan);
    }
    
    setLoading(false);
    setStep('results');
  };

  const reset = () => {
    setStep('welcome');
    setInputMode('manual');
    setSelectedSymptoms([]);
    setAge('');
    setGender('');
    setDiagnosis(null);
    setTreatmentPlan(null);
    setChatHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#141414] p-2 rounded-sm">
            <Stethoscope className="text-[#E4E3E0] w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif italic text-xl leading-tight">MediPlan AI</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Deliberative Diagnosis Agent</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-wider font-medium opacity-70">
          <span className="flex items-center gap-1"><ShieldAlert size={14} /> Educational Prototype</span>
          <span className="flex items-center gap-1"><Activity size={14} /> v1.0.4</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-12 items-center py-12"
            >
              <div>
                <h2 className="text-6xl md:text-8xl font-serif italic leading-[0.9] mb-8 tracking-tighter">
                  Intelligent <br />Care Planning.
                </h2>
                <p className="text-lg opacity-80 mb-10 max-w-md leading-relaxed">
                  A sophisticated AI-driven system designed to analyze symptoms, predict potential conditions, and generate comprehensive treatment strategies using deliberative reasoning.
                </p>
                <button 
                  onClick={() => setStep('input')}
                  className="group flex items-center gap-4 bg-[#141414] text-[#E4E3E0] px-8 py-4 rounded-full hover:scale-105 transition-transform"
                >
                  <span className="text-sm uppercase tracking-widest font-bold">Begin Assessment</span>
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="relative">
                <div className="aspect-square border border-[#141414] rounded-full flex items-center justify-center p-12 animate-pulse">
                  <div className="w-full h-full border border-[#141414] border-dashed rounded-full flex items-center justify-center">
                    <Activity size={120} strokeWidth={0.5} />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white border border-[#141414] p-4 max-w-[200px] shadow-xl">
                  <p className="text-[10px] font-mono leading-tight opacity-60 uppercase mb-2">System Status</p>
                  <p className="text-xs font-medium">Neural Engine Active. Ready for symptom processing.</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => setStep('welcome')} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="text-2xl font-serif italic">Patient Assessment</h3>
                </div>
                
                <div className="flex bg-white/50 p-1 rounded-full border border-[#141414]/10 self-start">
                  <button 
                    onClick={() => setInputMode('manual')}
                    className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${inputMode === 'manual' ? 'bg-[#141414] text-[#E4E3E0]' : 'opacity-50'}`}
                  >
                    Manual Entry
                  </button>
                  <button 
                    onClick={() => setInputMode('chat')}
                    className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${inputMode === 'chat' ? 'bg-[#141414] text-[#E4E3E0]' : 'opacity-50'}`}
                  >
                    Chat Assistant
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-12">
                {/* Left Column: Patient Info & Summary */}
                <div className="space-y-8">
                  <div className="border-b border-[#141414] pb-4">
                    <label className="text-[10px] uppercase tracking-widest font-mono opacity-50 mb-4 block">01. Patient Profile</label>
                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-bold uppercase mb-2 block">Age</label>
                        <input 
                          type="number" 
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="Years"
                          className="w-full bg-transparent border-b border-[#141414] py-2 focus:outline-none focus:border-opacity-50 text-xl font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase mb-2 block">Gender (Optional)</label>
                        <select 
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-transparent border-b border-[#141414] py-2 focus:outline-none text-lg"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-mono opacity-50 block">Selected Symptoms ({selectedSymptoms.length})</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map(id => {
                        const s = SYMPTOMS.find(sym => sym.id === id);
                        return (
                          <span key={id} className="bg-[#141414] text-[#E4E3E0] text-[10px] uppercase px-2 py-1 rounded-sm flex items-center gap-2">
                            {s?.label}
                            <button onClick={() => handleSymptomToggle(id)} className="hover:text-red-400">×</button>
                          </span>
                        );
                      })}
                      {selectedSymptoms.length === 0 && <span className="text-xs opacity-40 italic">No symptoms selected yet.</span>}
                    </div>
                  </div>

                  <div className="bg-white/30 p-4 border border-[#141414] border-dashed rounded-sm">
                    <div className="flex gap-3 items-start">
                      <Info size={16} className="mt-1 shrink-0" />
                      <p className="text-[11px] leading-relaxed opacity-70">
                        {inputMode === 'chat' 
                          ? "Describe how you're feeling in the chat. The assistant will help identify matching symptoms."
                          : "Select symptoms from the grid. You can switch to Chat mode for a conversational experience."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Input Mode Content */}
                <div className="md:col-span-2">
                  <AnimatePresence mode="wait">
                    {inputMode === 'manual' ? (
                      <motion.div
                        key="manual-grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <label className="text-[10px] uppercase tracking-widest font-mono opacity-50 mb-6 block">02. Symptom Selection</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {SYMPTOMS.map((symptom) => (
                            <button
                              key={symptom.id}
                              onClick={() => handleSymptomToggle(symptom.id)}
                              className={`
                                p-4 text-left border transition-all duration-200 flex flex-col justify-between h-24
                                ${selectedSymptoms.includes(symptom.id) 
                                  ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]' 
                                  : 'bg-white/50 border-[#141414] hover:bg-white'}
                              `}
                            >
                              <span className="text-sm font-medium">{symptom.label}</span>
                              <div className="flex justify-between items-center">
                                <span className={`text-[9px] uppercase tracking-tighter px-1.5 py-0.5 rounded-full border ${
                                  selectedSymptoms.includes(symptom.id) ? 'border-[#E4E3E0]/30' : 'border-[#141414]/30'
                                }`}>
                                  {symptom.severity}
                                </span>
                                {selectedSymptoms.includes(symptom.id) && <CheckCircle2 size={14} />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="chat-interface"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col h-[500px] bg-white border border-[#141414]"
                      >
                        <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bot size={18} />
                            <span className="text-xs uppercase tracking-widest font-bold">Symptom Assistant</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[9px] uppercase opacity-70">Online</span>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
                          {chatHistory.length === 0 && (
                            <div className="text-center py-10 space-y-4">
                              <MessageSquare className="mx-auto opacity-10" size={48} />
                              <p className="text-sm opacity-50 max-w-xs mx-auto">
                                "Hello! I'm here to help you identify your symptoms. How are you feeling today?"
                              </p>
                            </div>
                          )}
                          {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-[#141414] ${msg.role === 'user' ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-[#E4E3E0]'}`}>
                                  {msg.role === 'user' ? <UserCircle size={18} /> : <Bot size={18} />}
                                </div>
                                <div className={`p-4 rounded-sm text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-[#F5F5F5] border border-[#141414]/10'}`}>
                                  {msg.text}
                                </div>
                              </div>
                            </div>
                          ))}
                          {isChatLoading && (
                            <div className="flex justify-start">
                              <div className="flex gap-3">
                                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#E4E3E0] border border-[#141414]">
                                  <Bot size={18} />
                                </div>
                                <div className="p-4 bg-[#F5F5F5] border border-[#141414]/10 rounded-sm flex gap-1">
                                  <span className="w-1.5 h-1.5 bg-[#141414] rounded-full animate-bounce"></span>
                                  <span className="w-1.5 h-1.5 bg-[#141414] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                  <span className="w-1.5 h-1.5 bg-[#141414] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleChatSubmit} className="p-4 border-t border-[#141414] flex gap-3">
                          <input 
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Describe your symptoms..."
                            className="flex-1 bg-transparent border-b border-[#141414] py-2 focus:outline-none text-sm"
                          />
                          <button 
                            type="submit"
                            disabled={!chatInput.trim() || isChatLoading}
                            className="p-2 bg-[#141414] text-[#E4E3E0] rounded-sm disabled:opacity-30 transition-all hover:scale-110"
                          >
                            <Send size={18} />
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-12 flex justify-end">
                    <button 
                      disabled={selectedSymptoms.length === 0 || !age || loading}
                      onClick={handleStartDiagnosis}
                      className="group flex items-center gap-4 bg-[#141414] text-[#E4E3E0] px-10 py-5 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="animate-spin" size={20} />
                          <span className="text-sm uppercase tracking-widest font-bold">Processing...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm uppercase tracking-widest font-bold">Analyze Symptoms</span>
                          <ChevronRight />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && diagnosis && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-4xl font-serif italic mb-2">Diagnosis Report</h3>
                  <p className="text-xs font-mono opacity-50 uppercase tracking-widest">Case ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest hover:opacity-50 transition-opacity"
                >
                  <RefreshCw size={14} /> New Assessment
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Prediction Card */}
                <div className="bg-white border border-[#141414] p-8 space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-mono opacity-50 block mb-4">Primary Prediction</label>
                    <h4 className="text-3xl font-serif italic leading-tight">{diagnosis.predictedDisease.name}</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-[#141414] pb-2">
                      <span className="text-xs font-bold uppercase">Confidence</span>
                      <span className="text-2xl font-mono">{diagnosis.confidence}%</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-[#141414] pb-2">
                      <span className="text-xs font-bold uppercase">Risk Level</span>
                      <span className={`text-sm font-bold uppercase px-3 py-1 rounded-full ${
                        diagnosis.riskLevel === 'High' ? 'bg-red-100 text-red-600' : 
                        diagnosis.riskLevel === 'Medium' ? 'bg-orange-100 text-orange-600' : 
                        'bg-green-100 text-green-600'
                      }`}>
                        {diagnosis.riskLevel}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-xs leading-relaxed opacity-70 italic">
                      "{diagnosis.predictedDisease.description}"
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#141414] border-dotted">
                    <label className="text-[10px] uppercase tracking-widest font-mono opacity-50 block mb-3">Differential Diagnosis</label>
                    <div className="space-y-2">
                      {diagnosis.allPredictions.slice(1).map((pred, i) => (
                        <div key={i} className="flex justify-between text-[11px]">
                          <span className="opacity-70">{pred.name}</span>
                          <span className="font-mono">{pred.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Treatment Plan Card */}
                <div className="md:col-span-2 bg-[#141414] text-[#E4E3E0] p-8 rounded-sm shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity size={120} />
                  </div>
                  
                  <h4 className="text-2xl font-serif italic mb-8 flex items-center gap-3">
                    <HeartPulse className="text-red-400" />
                    Recommended Care Plan
                  </h4>

                  {!treatmentPlan ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <RefreshCw className="animate-spin opacity-30" size={40} />
                      <p className="text-xs font-mono uppercase tracking-widest opacity-50">Generating Deliberative Plan...</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <section>
                          <div className="flex items-center gap-2 mb-4">
                            <ShieldAlert size={16} className="text-orange-400" />
                            <h5 className="text-[10px] uppercase tracking-widest font-bold">Precautions</h5>
                          </div>
                          <ul className="space-y-3">
                            {treatmentPlan.precautions.map((p, i) => (
                              <li key={i} className="text-sm flex gap-3 items-start opacity-80">
                                <span className="text-[#E4E3E0]/30 font-mono text-[10px] mt-1">0{i+1}</span>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section>
                          <div className="flex items-center gap-2 mb-4">
                            <Pill size={16} className="text-blue-400" />
                            <h5 className="text-[10px] uppercase tracking-widest font-bold">Medications (General)</h5>
                          </div>
                          <ul className="space-y-3">
                            {treatmentPlan.medications.map((m, i) => (
                              <li key={i} className="text-sm flex gap-3 items-start opacity-80">
                                <span className="text-[#E4E3E0]/30 font-mono text-[10px] mt-1">0{i+1}</span>
                                {m}
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>

                      <div className="space-y-8">
                        <section>
                          <div className="flex items-center gap-2 mb-4">
                            <Activity size={16} className="text-green-400" />
                            <h5 className="text-[10px] uppercase tracking-widest font-bold">Lifestyle Advice</h5>
                          </div>
                          <ul className="space-y-3">
                            {treatmentPlan.lifestyleAdvice.map((l, i) => (
                              <li key={i} className="text-sm flex gap-3 items-start opacity-80">
                                <span className="text-[#E4E3E0]/30 font-mono text-[10px] mt-1">0{i+1}</span>
                                {l}
                              </li>
                            ))}
                          </ul>
                        </section>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-sm">
                          <p className="text-[10px] leading-relaxed opacity-50 italic">
                            This plan was generated by a deliberative agent based on typical clinical pathways for {diagnosis.predictedDisease.name}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-12 p-6 border border-[#141414] border-dotted flex gap-4 items-center bg-white/30">
                <AlertCircle className="shrink-0 opacity-50" />
                <p className="text-xs leading-relaxed opacity-60">
                  <strong className="uppercase tracking-widest text-[10px] block mb-1">Medical Disclaimer</strong>
                  This system is an educational prototype and does not replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#141414] p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-center gap-4 opacity-30">
            <Activity size={20} />
            <ShieldAlert size={20} />
            <Stethoscope size={20} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono opacity-50">
            &copy; 2026 MediPlan AI Systems &bull; Deliberative Agent Lab
          </p>
        </div>
      </footer>
    </div>
  );
}
