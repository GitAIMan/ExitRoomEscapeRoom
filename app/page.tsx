'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Square, Activity } from 'lucide-react';

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white relative overflow-hidden font-sans selection:bg-cyan-500/30">

      {/* Background Ambience (Subtle) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,20,20,1)_0%,rgba(0,0,0,1)_100%)]" />
      </div>

      {/* Main Content Container */}
      <div className="z-10 flex flex-col items-center gap-16">

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black tracking-[0.1em] text-white uppercase drop-shadow-2xl text-center">
          EXITROOM BOT
        </h1>

        {/* Central Control Button */}
        <div className="relative">
          {/* Pulse Effect behind button */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full transition-all duration-1000 ${isConnected ? 'bg-cyan-500/10 blur-3xl' : 'bg-transparent'}`} />

          <motion.button
            onClick={isConnected || isConnecting ? handleStop : handleStart}
            disabled={isConnecting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative w-64 h-64 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center
              border-[3px] backdrop-blur-sm transition-all duration-300 flex-shrink-0
              ${isConnected
                ? 'border-red-500/50 bg-red-950/20 hover:bg-red-900/30 shadow-[0_0_50px_-10px_rgba(220,38,38,0.3)]'
                : 'border-cyan-500/50 bg-cyan-950/20 hover:bg-cyan-900/30 shadow-[0_0_50px_-10px_rgba(8,145,178,0.3)]'}
              ${isConnecting ? 'opacity-70 cursor-wait' : ''}
            `}
          >
            {/* Inner Ring Animation when speaking */}
            {isConnected && (
              <motion.div
                className="absolute inset-2 rounded-full border border-cyan-400/30"
                animate={{
                  scale: isSpeaking ? [1, 1.05, 1] : 1,
                  opacity: isSpeaking ? 0.8 : 0.2,
                  borderColor: isSpeaking ? 'rgba(34, 211, 238, 0.6)' : 'rgba(34, 211, 238, 0.2)'
                }}
                transition={{ duration: 0.4 }}
              />
            )}

            {/* Icon & Label */}
            <div className="flex flex-col items-center gap-5 z-20">
              {isConnecting ? (
                <Activity className="w-20 h-20 text-cyan-400 animate-pulse" strokeWidth={1.5} />
              ) : isConnected ? (
                <>
                  <Square className="w-20 h-20 text-red-500 fill-red-500/20" strokeWidth={1.5} />
                  <span className="text-3xl font-bold tracking-widest text-red-500">
                    STOP
                  </span>
                </>
              ) : (
                <>
                  <Power className="w-24 h-24 text-cyan-400" strokeWidth={1} />
                  <span className="text-3xl font-bold tracking-widest text-cyan-400">
                    START
                  </span>
                </>
              )}
            </div>
          </motion.button>
        </div>

        {/* Error Message Only (No other status text) */}
        <AnimatePresence>
          {connectionError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-500 font-mono text-sm tracking-wider bg-red-950/50 px-4 py-2 rounded border border-red-900/50"
            >
              ERROR: {connectionError}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
