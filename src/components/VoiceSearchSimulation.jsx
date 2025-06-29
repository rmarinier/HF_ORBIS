import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

export default function VoiceSearchSimulation({ onComplete, active }) {
  const [status, setStatus] = useState('listening');
  const [transcribedText, setTranscribedText] = useState('');
  const fullText = "J'ai besoin de pouvoir raccorder un nouveau site à internet et avec un SD-WAN.";

  useEffect(() => {
    if (!active) return;
    
    const timer1 = setTimeout(() => {
      setStatus('transcribing');
    }, 1500);

    return () => clearTimeout(timer1);
  }, [active]);

  useEffect(() => {
    if (status === 'transcribing') {
      let i = 0;
      const interval = setInterval(() => {
        setTranscribedText(fullText.substring(0, i + 1));
        i++;
        if (i >= fullText.length) {
          clearInterval(interval);
          setTimeout(() => setStatus('processing'), 1000);
        }
      }, 50);
      return () => clearInterval(interval);
    } else if (status === 'processing') {
      const timer = setTimeout(() => {
        onComplete(['sd-wan'], 'cio');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center justify-center text-white">
        {status === 'listening' && (
          <motion.div className="relative w-24 h-24">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-orange-400"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Mic size={40} />
            </div>
          </motion.div>
        )}

        {status === 'transcribing' && (
          <p className="text-xl font-medium h-16">{transcribedText}</p>
        )}
        
        {status === 'processing' && (
          <motion.div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
        )}

        <p className="mt-4 text-lg font-semibold capitalize">{status}...</p>
      </div>
    </motion.div>
  );
}