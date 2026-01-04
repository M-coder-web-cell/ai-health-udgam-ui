import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Brain, Search, AlertTriangle, CheckCircle, AlertCircle, 
  X, ChevronRight, Activity, Zap, FileText, ArrowRight, Loader2, ScanLine, Image as ImageIcon
} from 'lucide-react';

// --- Types ---
interface UserProfile {
  allergies?: string[];
  conditions?: string[];
  goals?: string[];
}

interface ProductData {
  product_name?: string | null;
  company_name?: string | null;
  IngredientList: string[];
  NutritionFacts: Record<string, string>;
  MarketingClaims: string[];
}

interface AgentResponse {
  user_query: string;
  user_profile?: UserProfile;
  image_data?: string | null; // Base64 string for preview
  product_json?: ProductData | null;
  plan?: string;
  search_needed?: boolean;
  search_queries?: string[];
  search_results?: string;
  final_verdict?: 'SAFE' | 'CAUTION' | 'AVOID';
  reasoning?: string;
  next_suggestion?: string[];
  conversation_summary?: string;
}

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  agentResponse?: AgentResponse;
  timestamp: Date;
  isStreaming?: boolean;
}

// --- Components ---

const ThinkingIndicator = ({ step }: { step: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-md w-fit"
  >
    <div className="relative flex items-center justify-center w-4 h-4">
      <motion.span 
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-[1.5px] border-zinc-700 border-t-zinc-300 rounded-full"
      />
    </div>
    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{step}</span>
  </motion.div>
);

const VerdictBadge = ({ verdict }: { verdict: 'SAFE' | 'CAUTION' | 'AVOID' }) => {
  const config = {
    SAFE: { color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/20', icon: CheckCircle },
    CAUTION: { color: 'text-amber-400', bg: 'bg-amber-400/5', border: 'border-amber-400/20', icon: AlertTriangle },
    AVOID: { color: 'text-rose-500', bg: 'bg-rose-500/5', border: 'border-rose-500/20', icon: AlertCircle },
  };
  
  const { color, bg, border, icon: Icon } = config[verdict];

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative overflow-hidden rounded-xl border ${border} ${bg} p-6`}
    >
      <div className="relative z-10 flex flex-row gap-5 items-center">
        <div className={`p-3 rounded-full bg-black/20 border ${border}`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <div>
          <h2 className={`text-4xl font-black tracking-tighter ${color} mb-1`}>
            {verdict}
          </h2>
          <p className="text-zinc-400 text-xs font-medium tracking-wide uppercase">AI Health Assessment</p>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Application ---

const DrishtiAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentProcessLog, setCurrentProcessLog] = useState<string>('');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentProcessLog]);

  // Handle Image Selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Trigger the AI flow with the image
        simulateAgentFlow("Analyze this label", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

// --- MOCK BACKEND SIMULATION (HARDCODED "AVOID" SCENARIO) ---
  const simulateAgentFlow = async (query: string, imageData: string | null) => {
    setIsProcessing(true);
    
    // 1. Add User Message
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: userMsgId,
      type: 'user',
      content: query || "Scanning uploaded label...",
      timestamp: new Date()
    }]);

    // 2. Initialize Agent Placeholder
    const agentMsgId = (Date.now() + 1).toString();
    const initialResponse: AgentResponse = { 
        user_query: query,
        image_data: imageData // Keeps the preview if you uploaded one
    };
    
    setMessages(prev => [...prev, {
      id: agentMsgId,
      type: 'agent',
      content: '',
      agentResponse: initialResponse,
      timestamp: new Date(),
      isStreaming: true
    }]);

    const updateAgentMsg = (updates: Partial<AgentResponse>) => {
      setMessages(prev => prev.map(m => 
        m.id === agentMsgId 
          ? { ...m, agentResponse: { ...m.agentResponse!, ...updates } } 
          : m
      ));
    };

    // --- SEQUENCE START (HARDCODED DEMO) ---
    
    // Step 1: Scanning
    setCurrentProcessLog("SCANNING IMAGE PIXELS...");
    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Extraction (Hardcoded "Dangerous" Product)
    setCurrentProcessLog("EXTRACTING ENTITIES VIA GEMINI 2.0...");
    await new Promise(r => setTimeout(r, 800));
    updateAgentMsg({
      product_json: {
        product_name: "Crunchy Nut & Honey Bar",
        company_name: "Nature's Fuel",
        // HARDCODED INGREDIENTS
        IngredientList: ["Whole Grain Oats", "Roasted Peanuts", "Almond Butter", "High Fructose Corn Syrup", "Soy Lecithin", "Salt"],
        NutritionFacts: { "Calories": "240", "Total Fat": "12g", "Added Sugars": "14g" },
        MarketingClaims: ["Natural Energy", "Heart Healthy"]
      }
    });

    // Step 3: Reasoning
    setCurrentProcessLog("CROSS-REFERENCING HEALTH PROFILE...");
    await new Promise(r => setTimeout(r, 1000));
    updateAgentMsg({
      // AI realizes the danger here
      plan: "⚠️ DETECTED ALLERGEN: 'Peanuts'. User profile indicates severe Peanut Allergy. Checking cross-contamination risks with 'Almond Butter'."
    });

    // Step 4: Search
    setCurrentProcessLog("VERIFYING ANAPHYLAXIS PROTOCOLS...");
    await new Promise(r => setTimeout(r, 1200));
    updateAgentMsg({
      search_needed: true,
      search_queries: ["peanut allergy severity thresholds", "Nature's Fuel manufacturing cross-contamination"],
    });

    // Step 5: Verdict (The Big Reaction)
    setCurrentProcessLog("GENERATING SAFETY VERDICT...");
    await new Promise(r => setTimeout(r, 800));
    
    updateAgentMsg({
      final_verdict: "AVOID", // This triggers the RED UI theme
      reasoning: "CRITICAL ALERT: This product contains Peanuts. Your profile lists a severe Peanut Allergy. Consuming this poses a high risk of anaphylaxis. Additionally, the 'High Fructose Corn Syrup' conflicts with your goal to reduce glycemic spikes.",
      next_suggestion: [
        "Find peanut-free alternative",
        "Report incorrect labeling",
        "View emergency protocol"
      ]
    });

    setMessages(prev => prev.map(m => m.id === agentMsgId ? { ...m, isStreaming: false } : m));
    setIsProcessing(false);
    setCurrentProcessLog('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      simulateAgentFlow(inputValue, null);
      setInputValue('');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-zinc-800">
      
      {/* Hidden Input for File Upload */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #27272a 1px, transparent 0)', backgroundSize: '40px 40px', opacity: 0.3 }} />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full" />
            </div>
            <span className="font-bold tracking-tight text-sm">DRISHTI.AI</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">BETA</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="hidden md:inline">SYSTEM: ONLINE</span>
            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Scroll Area - WIDER LAYOUT (max-w-5xl) */}
      <main className="relative z-10 max-w-5xl mx-auto pt-24 pb-40 px-6 min-h-screen flex flex-col">
        
        {/* Empty State */}
        {messages.length === 0 && !isProcessing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center mt-20"
          >
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center justify-center mb-8 shadow-2xl shadow-zinc-950">
              <Brain className="w-10 h-10 text-zinc-100" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Consumer Health <br/><span className="text-zinc-500">Decision Engine</span>
            </h1>
            <p className="text-zinc-500 max-w-md text-sm leading-relaxed mb-10">
              An AI-native co-pilot that helps you interpret food labels, understand ingredients, and make safe decisions based on your health profile.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 hover:border-zinc-600 transition-all group text-left"
              >
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 group-hover:border-zinc-700">
                  <ScanLine className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-200">Scan Food Label</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Upload image or take photo</div>
                </div>
              </button>
              <button 
                onClick={() => simulateAgentFlow("Is Ashwagandha safe for hypothyroidism?", null)}
                className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 hover:border-zinc-600 transition-all group text-left"
              >
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 group-hover:border-zinc-700">
                  <Search className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-200">Research Safety</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Check interactions</div>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Message Stream */}
        <div className="space-y-12">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'user' ? (
                <div className="bg-zinc-100 text-zinc-900 px-6 py-3.5 rounded-2xl rounded-tr-sm max-w-2xl shadow-lg font-medium text-sm">
                  {msg.content}
                </div>
              ) : (
                <div className="w-full max-w-4xl space-y-6"> {/* Increased from max-w-full to allow grid to breathe */}
                  
                  {/* AGENT RESPONSE RENDERER */}
                  {msg.agentResponse && (
                    <>
                      {/* 0. UPLOADED IMAGE PREVIEW */}
                      {msg.agentResponse.image_data && (
                        <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-zinc-800 group">
                          <img 
                            src={msg.agentResponse.image_data} 
                            alt="Uploaded Label" 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-mono bg-black/50 px-2 py-1 rounded backdrop-blur text-white border border-white/10">ANALYZED SOURCE</span>
                          </div>
                        </div>
                      )}

                      {/* 1. PRODUCT DATA (BENTO GRID - WIDER) */}
                      {msg.agentResponse.product_json && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2 bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
                             <div className="flex items-baseline justify-between mb-4">
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Detected Ingredients</h3>
                                <span className="text-[10px] font-mono text-emerald-500">OCR CONFIDENCE: 98%</span>
                             </div>
                             <div className="flex flex-wrap gap-2">
                               {msg.agentResponse.product_json.IngredientList.map((ing, i) => (
                                 <span key={i} className="px-3 py-1.5 bg-black border border-zinc-800 rounded-lg text-xs text-zinc-300 font-mono hover:border-zinc-600 transition-colors cursor-default">
                                   {ing}
                                 </span>
                               ))}
                             </div>
                          </div>
                          <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
                             <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Nutrition</h3>
                             <div className="space-y-3">
                               {Object.entries(msg.agentResponse.product_json.NutritionFacts).map(([k, v]) => (
                                 <div key={k} className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                                   <span className="text-zinc-500">{k}</span>
                                   <span className="font-mono text-zinc-200 font-bold">{v}</span>
                                 </div>
                               ))}
                             </div>
                          </div>
                        </div>
                      )}

                      {/* 2. REASONING PLAN */}
                      {msg.agentResponse.plan && (
                         <div className="flex gap-4 pl-4 border-l-2 border-zinc-800 py-1">
                           <Brain className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5" />
                           <p className="text-zinc-400 text-sm leading-relaxed font-mono">
                             {msg.agentResponse.plan}
                           </p>
                         </div>
                      )}

                      {/* 3. VERDICT (BIG REVEAL) */}
                      {msg.agentResponse.final_verdict && (
                        <VerdictBadge verdict={msg.agentResponse.final_verdict} />
                      )}

                      {/* 4. REASONING TEXT */}
                      {msg.agentResponse.reasoning && (
                        <div className="prose prose-invert prose-sm max-w-none pl-1">
                          <p className="text-zinc-300 leading-7 text-[15px]">
                            {msg.agentResponse.reasoning}
                          </p>
                        </div>
                      )}

                      
                    {/* 5. NEXT STEPS */}
                    {msg.agentResponse.next_suggestion && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {msg.agentResponse.next_suggestion.map((s, i) => (
                          <button 
                            key={i} 
                            // FIX: Call the flow directly with the suggestion string 's'
                            onClick={() => !isProcessing && simulateAgentFlow(s, null)} 
                            disabled={isProcessing}
                            className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">{s}</span>
                            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white -translate-x-2 group-hover:translate-x-0 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}
                      
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ))}
          
          {/* Active Process Log (The "Thinking" State) */}
          <AnimatePresence>
            {isProcessing && currentProcessLog && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                 <ThinkingIndicator step={currentProcessLog} />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* --- Floating Command Bar - WIDER (max-w-4xl) --- */}
      <div className="fixed bottom-8 left-0 right-0 px-6 z-50">
        <div className="max-w-4xl mx-auto">
          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onSubmit={handleSubmit}
            className={`relative flex items-center gap-3 p-2.5 rounded-2xl border bg-black/80 backdrop-blur-2xl shadow-2xl shadow-black/50 transition-all ${
              isProcessing ? 'border-zinc-800 cursor-not-allowed opacity-50' : 'border-zinc-700/50 hover:border-zinc-500/50'
            }`}
          >
            {/* Upload Trigger (Connected to Hidden Input) */}
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
              disabled={isProcessing}
            >
              <Upload className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isProcessing ? "Processing..." : "Ask Drishti regarding ingredients, symptoms..."}
              disabled={isProcessing}
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 h-10 font-medium"
            />

            <button 
              type="submit" 
              disabled={!inputValue.trim() || isProcessing}
              className="p-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-0 disabled:scale-90"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.form>
        </div>
      </div>

    </div>
  );
};

export default DrishtiAI;