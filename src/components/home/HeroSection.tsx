"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/constants";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="w-full px-5 py-[60px] md:py-[100px] md:px-10 overflow-hidden">
        <div className="mx-auto flex flex-col md:flex-row items-center justify-between max-w-[1200px] gap-12 md:gap-20">
            {/* LEFT CONTENT */}
            <div
                className={`flex-1 flex flex-col items-center md:items-start text-center md:text-left transition-all duration-700 ease-out z-10 ${
                    visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                }`}
            >
                <div className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/20">
                    <div className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse"></div>
                    <span className="text-[#00e5ff] text-[10px] font-black uppercase tracking-[0.2em]">Mentorship</span>
                </div>

                {/* HEADING */}
                <h1 className="text-white font-black mb-5 text-[44px] md:text-[64px] leading-[1.1] tracking-tight">
                    Hello, I’m <span className="hero-gradient-text">{BRAND.founder}</span>.
                </h1>

                {/* SUBHEADING */}
                <h2 className="text-[#00e5ff] font-bold mb-6 text-[20px] md:text-[26px] tracking-tight">
                    Communication coach, Founder and Chief Mentor of {BRAND.name}.
                </h2>

                {/* PARAGRAPH */}
                <p className="mb-10 text-[#cbd5f5] text-[16px] md:text-[18px] leading-[1.7] max-w-[620px] opacity-80">
                    As a TV journalist and anchor for over 2 decades, I have moderated conversations with CEOs, policymakers and global leaders across industries.
                    Many talented professionals struggle not because they lack knowledge but because they lack clarity in communication and structured thinking.
                    {BRAND.name} aims to bridge this gap.
                </p>

                {/* CTA BUTTONS */}
                <div
                    className={`flex flex-wrap gap-4 justify-center md:justify-start transition-all duration-600 delay-500 ease-out ${
                        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                >
                    <Link
                        href="/events/speak-with-impact-bootcamp"
                        className="cta-primary text-white no-underline text-xs md:text-sm rounded-full px-8 py-4 font-black uppercase tracking-widest"
                    >
                        Secure Your Seat
                    </Link>
                    <Link
                        href="/events/speak-with-impact-bootcamp"
                        className="cta-secondary text-white no-underline text-xs md:text-sm rounded-full px-8 py-4 bg-[#0f172a] border border-white/10 font-bold"
                    >
                        Explore Bootcamp Details
                    </Link>
                    <Link
                        href="/hire-mridu-anchor"
                        className="cta-secondary no-underline text-xs md:text-sm rounded-full px-8 py-4 border border-[#00e5ff] text-[#00e5ff] font-bold"
                    >
                        Hire Mridu as Anchor
                    </Link>
                </div>
            </div>

            {/* RIGHT CONTENT (IMAGE) */}
            <div
                className={`flex-1 relative flex justify-center items-center transition-all duration-700 delay-300 ease-out ${
                    visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                }`}
            >
                <div className="hero-ai-glow" />
                <Image
                    src="https://marktaleevents.com/mentorleap/wp-content/uploads/2026/03/MriduBhandari_ProfilePic.jpg"
                    alt={BRAND.founder}
                    width={500}
                    height={620}
                    className="relative z-10 rounded-[40px] object-cover shadow-[0_40px_120px_rgba(0,0,0,0.8)] border border-white/10 group-hover:scale-[1.02] transition-transform duration-700"
                    priority
                />
            </div>
        </div>
    </section>
  );
}