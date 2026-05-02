import { useState, useRef } from "react";
import axios from "axios";
import { X, UploadCloud, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function UploadCvModal({ isOpen, onClose, jobId }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState(null);
  
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus("loading");
    const formData = new FormData();
    formData.append("job_id", jobId);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/api/upload-cv", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data.candidate);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to process CV");
      setStatus("error");
    }
  };

  const resetAndClose = () => {
    setName(""); setEmail(""); setPhone(""); setFile(null);
    setStatus("idle"); setResult(null); setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {status === "success" ? "AI Evaluation Complete" : "Upload Candidate CV"}
          </h2>
          <button onClick={resetAndClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === "idle" || status === "error" ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {status === "error" && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Candidate Name</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Upload PDF Resume</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${file ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-950'}`}
              >
                <UploadCloud className={`h-10 w-10 mx-auto mb-3 ${file ? 'text-blue-400' : 'text-slate-400'}`} />
                <p className="text-sm font-medium text-white">{file ? file.name : 'Click to browse'}</p>
                <p className="text-xs text-slate-400 mt-1">Only PDF format supported</p>
                <input 
                  required
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => setFile(e.target.files[0])} 
                  accept=".pdf" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={!file}
                className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Start AI Screening
              </button>
            </div>
          </form>
        ) : status === "loading" ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Gemini AI is analyzing the CV...</h3>
            <p className="text-sm text-slate-400">Comparing skills against the job description.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              {result?.ai_score >= 75 ? (
                <div className="h-20 w-20 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-green-400">{result?.ai_score}%</span>
                </div>
              ) : result?.ai_score >= 50 ? (
                <div className="h-20 w-20 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-yellow-400">{result?.ai_score}%</span>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-red-400">{result?.ai_score}%</span>
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-1">{result?.name}</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-sm font-medium text-slate-300">
                Status: <span className="text-white capitalize">{result?.status.replace("_", " ")}</span>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mb-6">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">AI Justification</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{result?.ai_justification}</p>
            </div>

            <button onClick={resetAndClose} className="w-full bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
