import { useState, useRef } from "react";
import axios from "axios";
import { UploadCloud, Loader2, RefreshCw, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/clerk-react";

export default function Dashboard() {
  const { user } = useUser();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, loading, result, error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  const fileInputRef = useRef(null);

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setStatus("loading");
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (user?.primaryEmailAddress?.emailAddress) {
      formData.append("email", user.primaryEmailAddress.emailAddress);
      formData.append("name", user.fullName || "User");
    }

    try {
      const res = await axios.post("http://localhost:8000/api/analyze-cv", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
      setStatus("result");
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to analyze CV");
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="text-center py-10">
        <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-2xl mb-4">
          <FileText className="h-10 w-10 text-blue-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
          AI Resume Analyzer
        </h1>
        <p className="text-slate-400 mt-4 text-lg max-w-xl mx-auto">
          Upload your resume to get an instant ATS score and actionable feedback on how to improve your chances of getting hired.
        </p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* UPLOAD STATE */}
          {(status === "idle" || status === "error") && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 md:p-12 text-center"
            >
              {status === "error" && (
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-300 rounded-2xl p-16 cursor-pointer group"
              >
                <div className="bg-slate-800 p-4 rounded-full inline-block mb-4 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                  <UploadCloud className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Click to upload your CV</h3>
                <p className="text-slate-400">Only PDF format is supported</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => handleUpload(e.target.files[0])} 
                  accept=".pdf" 
                  className="hidden" 
                />
              </div>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {status === "loading" && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-20 text-center flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 rounded-full animate-pulse" />
                <Loader2 className="h-16 w-16 text-white animate-spin relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Analyzing your Resume...</h3>
              <p className="text-slate-400">Gemini 2.5 is scanning for keywords, formatting, and impact.</p>
            </motion.div>
          )}

          {/* RESULT STATE */}
          {status === "result" && result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row gap-12 items-start">
                
                {/* Score Section */}
                <div className="w-full md:w-1/3 flex flex-col items-center text-center shrink-0">
                  <h3 className="text-slate-400 font-medium mb-4 uppercase tracking-wider text-sm">Overall ATS Score</h3>
                  
                  <div className="relative mb-6">
                    {/* Glowing background based on score */}
                    <div className={`absolute inset-0 blur-2xl rounded-full opacity-30 ${
                      result.score >= 80 ? 'bg-green-500' : result.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    
                    <div className={`relative h-48 w-48 rounded-full border-[6px] flex flex-col items-center justify-center bg-slate-900 ${
                      result.score >= 80 ? 'border-green-500' : result.score >= 50 ? 'border-yellow-500' : 'border-red-500'
                    }`}>
                      <span className={`text-6xl font-black ${
                        result.score >= 80 ? 'text-green-400' : result.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {result.score}
                      </span>
                      <span className="text-slate-400 font-medium mt-1">out of 100</span>
                    </div>
                  </div>

                  <p className="text-slate-300 font-medium px-4">
                    {result.score >= 80 ? 'Excellent! Your resume is highly competitive.' 
                      : result.score >= 50 ? 'Good start, but needs some critical improvements.'
                      : 'Needs significant rewrite to pass ATS filters.'}
                  </p>
                  
                  <button 
                    onClick={reset}
                    className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors w-full justify-center"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Analyze Another CV
                  </button>
                </div>

                {/* Improvements Section */}
                <div className="w-full md:w-2/3 border-t md:border-t-0 md:border-l border-slate-800 pt-8 md:pt-0 md:pl-12">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="h-6 w-6 text-blue-400" />
                    <h3 className="text-2xl font-bold text-white">Actionable Improvements</h3>
                  </div>
                  
                  <div className="bg-slate-950 rounded-2xl p-6 md:p-8 border border-slate-800">
                    <div className="prose prose-invert prose-blue max-w-none">
                      {result.improvements.split('\n').map((line, i) => {
                        if (!line.trim()) return <br key={i} />;
                        if (line.startsWith('-') || line.startsWith('*')) {
                          return (
                            <li key={i} className="text-slate-300 mb-2 leading-relaxed">
                              {line.substring(1).trim()}
                            </li>
                          );
                        }
                        return <p key={i} className="text-slate-300 mb-4 font-medium">{line}</p>;
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
