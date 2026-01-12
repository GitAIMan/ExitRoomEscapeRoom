'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Power, Square, Activity } from 'lucide-react';

export default function Home() {
  const conversation = useConversation();
  const { status, isSpeaking } = conversation;

  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleStart = useCallback(async () => {
    try {
      setConnectionError(null);

      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Build the signed URL using our backend API
      const response = await fetch('/api/get-signed-url');
      if (!response.ok) throw new Error('Failed to get signed URL');
      const { signedUrl } = await response.json();

      // Start the conversation
      await conversation.startSession({
        signedUrl,
        // Optional: onMessage to debug or drive viz?
      });

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
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-black text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80" />

      {/* Header */}
      <div className="z-10 mt-12 mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 uppercase drop-shadow-lg">
          Exit Room Bot
        </h1>
        <div className="text-sm md:text-base text-cyan-500/80 mt-4 tracking-[0.5em] font-light">SYSTEM READY</div>
      </div>

      {/* Main Control Area */}
      <div className="z-10 relative flex-1 flex items-center justify-center">
        <motion.button
          onClick={isConnected || isConnecting ? handleStop : handleStart}
          disabled={isConnecting}
          className={`
            relative w-64 h-64 rounded-full flex items-center justify-center
            transition-all duration-500 border-4
            ${isConnected
              ? 'border-red-900/50 bg-red-950/20 hover:bg-red-900/30'
              : 'border-cyan-900/50 bg-cyan-950/20 hover:bg-cyan-900/30'}
            ${isConnecting ? 'opacity-50 cursor-wait' : ''}
          `}
          animate={{
            scale: isSpeaking ? 1.05 : 1,
            boxShadow: isSpeaking
              ? '0 0 50px -10px rgba(50, 255, 255, 0.3)'
              : isConnected
                ? '0 0 30px -10px rgba(255, 50, 50, 0.2)'
                : '0 0 0px 0px rgba(0,0,0,0)'
          }}
        >
          {/* Inner Visualizer Ring (Pseudo) */}
          {isConnected && (
            <motion.div
              className={`absolute inset-0 rounded-full border-2 ${isSpeaking ? 'border-cyan-400/50' : 'border-red-500/20'}`}
              animate={{
                scale: isSpeaking ? [1, 1.1, 1] : 1,
                opacity: isSpeaking ? 0.8 : 0.2
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          )}

          {/* Icon / Text */}
          <div className="flex flex-col items-center gap-4">
            {isConnecting ? (
              <Activity className="w-12 h-12 text-zinc-400 animate-pulse" />
            ) : isConnected ? (
              <>
                <Square className="w-16 h-16 text-red-500 fill-red-500/20" />
                <span className="text-xl font-bold tracking-widest text-red-500">STOP</span>
              </>
            ) : (
              <>
                <Power className="w-16 h-16 text-cyan-500" />
                <span className="text-xl font-bold tracking-widest text-cyan-500">START</span>
              </>
            )}
          </div>
        </motion.button>
      </div>

      {/* Status Text */}
      <div className="z-10 mt-12 h-8 text-center">
        {connectionError && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm">
            {connectionError}
          </motion.p>
        )}
        {status === 'connected' && isSpeaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-cyan-400 text-sm tracking-wide"
          >
            <Activity className="w-4 h-4 animate-bounce" />
            <span>AGENT SPEAKING...</span>
          </motion.div>
        )}
        {status === 'connected' && !isSpeaking && (
          <p className="text-zinc-600 text-sm animate-pulse">Listening...</p>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-zinc-800 text-xs">
        Powered by ElevenLabs
      </div>
    </main>
  );
}
