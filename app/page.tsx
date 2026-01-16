'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Mic, Square, Activity, Radio } from 'lucide-react';

export default function Home() {
  const conversation = useConversation();
  const { status, isSpeaking } = conversation;
  
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleStart = useCallback(async () => {
    try {
      setConnectionError(null);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const response = await fetch('/api/get-signed-url');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get signed URL: ${response.status} ${errorText}`);
      }
      const { signedUrl } = await response.json();
      await conversation.startSession({ signedUrl });
    } catch (error: any) {
      console.error("Failed to start:", error);
      setConnectionError(error.message || 'Connection failed');
    }
  }, [conversation]);

  const handleStop = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-black text-white relative overflow-hidden font-mono selection:bg-cyan-500/30">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isConnected ? 'opacity-40' : 'opacity-20'}`}>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] ${isConnected ? 'bg-cyan-900/40' : 'bg-zinc-900/40'}`} />
          {isConnected && (
            <motion.div 
              animate={{ 
                scale: isSpeaking ? [1, 1.2, 1] : 1,
                opacity: isSpeaking ? 0.6 : 0.3
              }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/20 blur-[100px]"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Header */}
      <header className="z-10 w-full max-w-5xl flex justify-between items-center pt-8">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-cyan-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs tracking-[0.2em] text-zinc-500 uppercase">
            {isConnected ? 'System Online' : 'System Standby'}
          </span>
        </div>
        <div className="text-xs text-zinc-600 tracking-widest">V 1.0.4</div>
      </header>

      {/* Main Content */}
      <div className="z-10 flex-1 flex flex-col items-center justify-center gap-12 w-full">
        
        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-2xl">
            EXIT ROOM BOT
          </h1>
          <p className="text-zinc-500 tracking-[0.3em] text-sm md:text-base font-light">
            ADVANCED AI INTERFACE
          </p>
        </div>

        {/* Central Control */}
        <div className="relative group">
          {/* Outer Ring Glow */}
          <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 ${
            isConnected ? 'bg-cyan-500/30 group-hover:bg-cyan-400/40' : 'bg-zinc-800/20 group-hover:bg-zinc-700/30'
          }`} />

          <motion.button
            onClick={isConnected || isConnecting ? handleStop : handleStart}
            disabled={isConnecting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative w-72 h-72 md:w-96 md:h-96 rounded-full flex flex-col items-center justify-center
              border backdrop-blur-sm transition-all duration-500
              ${isConnected 
                ? 'border-cyan-500/50 bg-black/60 shadow-[0_0_60px_-15px_rgba(6,182,212,0.5)]' 
                : 'border-zinc-700/50 bg-black/80 hover:border-zinc-500/50 hover:bg-zinc-900/50 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]'}
            `}
          >
            {/* Animated Rings */}
            {isConnected && (
              <>
                 <motion.div
                  className="absolute inset-0 rounded-full border border-cyan-500/30"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                 />
                 <motion.div
                  className="absolute inset-4 rounded-full border border-cyan-400/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 />
              </>
            )}

            {/* Icon & Label */}
            <div className="flex flex-col items-center gap-6 z-20">
              {isConnecting ? (
                <Activity className="w-24 h-24 text-cyan-500 animate-pulse" strokeWidth={1} />
              ) : isConnected ? (
                <>
                  <motion.div
                    animate={{ scale: isSpeaking ? 1.1 : 1 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                    <Square className="w-24 h-24 text-red-500 fill-red-500/10 relative z-10" strokeWidth={1.5} />
                  </motion.div>
                  <span className="text-2xl font-bold tracking-[0.2em] text-red-500 drop-shadow-lg">
                    TERMINATE
                  </span>
                </>
              ) : (
                <>
                  <div className="relative group-hover:text-cyan-400 transition-colors">
                    <Power className={`w-32 h-32 ${isConnected ? 'text-cyan-500' : 'text-zinc-400 group-hover:text-cyan-400'}`} strokeWidth={1} />
                  </div>
                  <span className={`text-3xl font-bold tracking-[0.2em] transition-colors ${isConnected ? 'text-cyan-500' : 'text-zinc-300 group-hover:text-cyan-300'}`}>
                    INITIALIZE
                  </span>
                </>
              )}
            </div>
          </motion.button>
        </div>

        {/* Status Indicators */}
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {connectionError ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/50 border border-red-900/50 text-red-400"
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm tracking-wide font-medium">{connectionError}</span>
              </motion.div>
            ) : isConnected && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-cyan-950/30 border border-cyan-900/30 backdrop-blur-md"
              >
                {isSpeaking ? (
                  <>
                    <div className="flex gap-1 h-4 items-center">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-cyan-400 rounded-full"
                          animate={{ height: [4, 16, 4] }}
                          transition={{ 
                            duration: 0.5, 
                            repeat: Infinity, 
                            delay: i * 0.1,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-cyan-400 text-sm tracking-widest font-semibold ml-2">TRANSMITTING...</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 rounded-full bg-cyan-500/50 animate-pulse" />
                    <span className="text-cyan-500/70 text-sm tracking-widest">LISTENING</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Footer */}
      <footer className="z-10 w-full max-w-5xl flex justify-between items-end pb-4 text-xs text-zinc-800 uppercase tracking-widest">
        <div>
          SECURE CONNECTION
          <br />
          ENCRYPTED VIA ELEVENLABS
        </div>
        <div className="text-right">
          ID: {process.env.NEXT_PUBLIC_AGENT_ID || 'UNKNOWN'}
        </div>
      </footer>
    </main>
  );
}
