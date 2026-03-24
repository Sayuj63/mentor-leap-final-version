"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
    <section
        ref={ref}
        className="w-full px-5 py-[140px] md:px-10"
    >
        <div
            className="mx-auto flex flex-col-reverse md:flex-row items-center gap-10 md:gap-20 max-w-[1300px]"
            suppressHydrationWarning
        >
            {/* LEFT CONTENT */}
            <div
                className={`flex flex-col flex-1 min-w-[300px] md:w-[45%] transition-all duration-700 ease-out ${
                    visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                }`}
            >
                {/* HEADING */}
                <h1 className="text-white font-bold mb-5 text-[48px] leading-[1.2]">
                    Hello, I’m {BRAND.founder}.
                </h1>

                {/* SUBHEADING */}
                <h2 className="text-[#00e5ff] font-medium mb-5 text-[24px]">
                    Communication coach, Founder and Chief Mentor of {BRAND.name}.
                </h2>

                {/* PARAGRAPH */}
                <p className="mb-6 text-[#cbd5f5] text-[16px] leading-[1.7]">
                    As a TV journalist and anchor for over 2 decades, I have moderated conversations with CEOs, policymakers and global leaders across industries.
                    Many talented professionals struggle not because they lack knowledge but because they lack clarity in communication and structured thinking.
                    {BRAND.name} aims to bridge this gap.
                    It is an AI-powered learning platform designed to help professionals communicate ideas with clarity, build confidence in conversations and develop leadership presence.
                </p>

                {/* CTA BUTTONS */}
                <div
                    className={`flex flex-wrap gap-4 transition-all duration-600 delay-500 ease-out ${
                        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                >
                    <Link
                        href="/events/speak-with-impact-bootcamp"
                        className="cta-primary text-white no-underline text-sm rounded-full px-6 py-3 font-bold"
                    >
                        Secure Your Seat
                    </Link>
                    <Link
                        href="/events/speak-with-impact-bootcamp"
                        className="cta-secondary text-white no-underline text-sm rounded-full px-6 py-3 bg-[#0f172a] border border-white/10"
                    >
                        Explore Bootcamp Details
                    </Link>
                    <Link
                        href="/hire-mridu-anchor"
                        className="cta-secondary no-underline text-sm rounded-full px-6 py-3 border border-[#00e5ff] text-[#00e5ff]"
                    >
                        Hire Mridu as Anchor
                    </Link>
                </div>
            </div>

            {/* RIGHT VISUAL */}
            <div
                className={`relative flex justify-center items-center flex-1 min-w-[300px] md:w-[55%] transition-all duration-700 delay-300 ease-out ${
                    visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                }`}
            >
                <div className="hero-ai-glow" />
                <Image
                    src="https://marktaleevents.com/mentorleap/wp-content/uploads/2026/03/MriduBhandari_ProfilePic.jpg"
                    alt={BRAND.founder}
                    width={420}
                    height={520}
                    className="rounded-2xl relative z-10 shadow-[0_30px_80px_rgba(0,0,0,0.5)] object-cover hover:scale-[1.02] hover:-translate-y-1 transition-all duration-400"
                    priority
                />
            </div>
        </div>
    </section>
  );
}