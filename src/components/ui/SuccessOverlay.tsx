"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, PartyPopper, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "./Button";

interface SuccessOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export default function SuccessOverlay({
  isOpen,
  onClose,
  title,
  message,
  ctaText,
  onCtaClick
}: SuccessOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#020617]/95 backdrop-blur-2xl"
          ></motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative w-full max-w-xl bg-gradient-to-b from-[#0f172a] to-[#020617] rounded-[40px] p-12 border border-[#00e5ff]/20 shadow-[0_0_100px_rgba(0,229,255,0.15)] text-center overflow-hidden"
          >
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent"></div>
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00e5ff]/10 blur-[80px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#6366f1]/10 blur-[80px] rounded-full"></div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-tr from-[#00e5ff] to-[#6366f1] rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-[0_20px_40px_rgba(0,229,255,0.3)]"
            >
              <PartyPopper size={48} className="text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-[#cbd5f5] leading-relaxed mb-10 max-w-md mx-auto"
            >
              {message}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {ctaText && onCtaClick && (
                <Button 
                  onClick={onCtaClick}
                  className="px-10 h-14 rounded-full font-black uppercase tracking-widest bg-white text-[#020617] hover:bg-[#00e5ff] hover:text-white transition-all shadow-xl group"
                >
                  {ctaText} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </Button>
              )}
              <button
                onClick={onClose}
                className="text-xs font-black uppercase tracking-widest text-[#475569] hover:text-[#00e5ff] transition-colors p-4"
              >
                Close
              </button>
            </motion.div>

            <div className="mt-12 flex items-center justify-center gap-2 text-[#475569]">
              <CheckCircle2 size={14} className="text-[#00e5ff]" />
              <span className="text-[10px] font-black uppercase tracking-widest">Enrolled Successfully • MentorLeap AI</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
