"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Background animation variants
  const bgVariants = {
    animate: {
      backgroundPosition: ["0% 0%", "100% 100%"],
      transition: {
        duration: 20,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/login`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Authentication Failed");
      }

      // Store token
      localStorage.setItem("sentinel_token", data.access_token);
      setIsSuccess(true);
      
      // Redirect after success animation
      setTimeout(() => {
        router.push(callback);
      }, 1500);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Dynamic Background */}
      <motion.div 
        variants={bgVariants}
        animate="animate"
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, #ff0000 0%, transparent 50%)",
          backgroundSize: "100% 100%",
        }}
      />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass-panel p-10 rounded-3xl border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-red-600 p-0.5 mb-6"
            >
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                <Shield className="w-10 h-10 text-accent" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
              Authentication Matrix
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">
              Sentinel Intelligence Node Access
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form 
                key="login-form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                {/* Username */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-accent tracking-widest pl-1">Command Identity</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-600 group-focus-within:text-accent transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                      placeholder="Username / Alias"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-accent tracking-widest pl-1">Access Protocol</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-600 group-focus-within:text-accent transition-colors" />
                    </div>
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-accent hover:text-white transition-all overflow-hidden group"
                >
                  <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                    Initialize Access <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">Access Granted</h2>
                <p className="text-gray-400 text-sm">Decrypting Intelligence Matrix...</p>
                <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 1.5 }}
                     className="h-full bg-green-500"
                   />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Footer Info */}
        <p className="mt-8 text-center text-[10px] text-gray-700 font-bold uppercase tracking-widest">
           Secure Handshake Protocol v2.6.0 // Unauthorized access is strictly logged
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
