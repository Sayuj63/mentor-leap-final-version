"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const offerText =
  "MentorLeap Launch – 15 March 2026  •  Free Personality Development Masterclass by Mridu Bhandari (Worth ₹2999)  •  Speak with Impact Bootcamp – 28–29 March 2026 (Worth ₹7999)  •  10 Lucky Participants Get Bootcamp FREE  •  Next 50 Participants Get 50 percent Discount";

export default function OfferBanner() {
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [attendees, setAttendees] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    fetch("/api/events/speak-with-impact-bootcamp")
      .then(res => res.json())
      .then(data => {
        if (data && data.attendees) {
          setAttendees(data.attendees);
        }
      })
      .catch(err => console.error("Error fetching event data:", err));
  }, []);

  const freeSeatsLeft = Math.max(0, 10 - attendees.length);

  return (
    <>
      <style>{`
        @keyframes scrollOffer {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .ml-offer-track {
          display: flex;
          gap: 60px;
          white-space: nowrap;
          animation: scrollOffer 22s linear infinite;
          color: white;
          font-size: 14px;
        }

        .ml-offer-track.paused {
          animation-play-state: paused;
        }

        .ml-offer-track span {
          display: inline-flex;
          align-items: center;
          gap: 0;
        }

        /* highlight keywords */
        .ml-offer-track .highlight {
          background: linear-gradient(90deg, #00e5ff, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
        }

        .ml-offer-btn1 {
          padding: 8px 18px;
          border-radius: 20px;
          background: linear-gradient(90deg, #00e5ff, #6366f1);
          color: white;
          text-decoration: none;
          font-size: 13px;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(0,229,255,0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: inline-block;
        }
        .ml-offer-btn1:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 22px rgba(0,229,255,0.45);
        }
        .ml-offer-btn1:active { transform: scale(0.97); }

        .ml-offer-btn2 {
          padding: 8px 18px;
          border-radius: 20px;
          background: rgba(255,255,255,0.08);
          color: white;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 13px;
          white-space: nowrap;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
          display: inline-block;
        }
        .ml-offer-btn2:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.4);
          transform: translateY(-2px);
        }
        .ml-offer-btn2:active { transform: scale(0.97); }

        @keyframes bannerFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ml-banner-animate {
          animation: bannerFadeIn 0.5s ease 0.6s both;
        }

        @media (max-width: 768px) {
          .ml-offer-actions {
            flex-direction: row;
            justify-content: center;
            width: 100%;
          }
          .ml-banner-inner {
            flex-direction: column !important;
            gap: 12px !important;
          }
        }
      `}</style>

      <div
        className="ml-banner-animate"
        suppressHydrationWarning
        style={{
          position: "relative",
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          marginTop: "70px",
        }}
      >
        {/* subtle gradient shimmer line at top */}
        <div
          suppressHydrationWarning
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, #00e5ff55, #6366f155, transparent)",
          }}
        />

        <div
          className="ml-banner-inner"
          suppressHydrationWarning
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
          }}
        >
          {/* SCROLLING TEXT */}
          <div
            style={{ flex: 1, overflow: "hidden", cursor: "pointer" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            title="Hover to pause"
            suppressHydrationWarning
          >
            <div className={`ml-offer-track ${paused ? "paused" : ""}`} suppressHydrationWarning>
              <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-12">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
                      <span className="text-white/90 text-sm font-bold tracking-wide">
                        MentorLeap Launch – 15 March 2026
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse" />
                      <span className="text-white/90 text-sm font-bold tracking-wide">
                        Speak with Impact Bootcamp – 28–29 March 2026 (Worth ₹7999)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
                      <span className="text-white/90 text-sm font-bold tracking-wide">
                        10 Lucky Participants Get Bootcamp FREE
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 gap-y-12 ml-6 md:ml-8 relative py-4">
            {freeSeatsLeft > 0 && (
              <div className="absolute -top-3 md:-top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-50">
                <span className="text-[#00e5ff] text-[10px] font-black tracking-widest animate-bounce flex items-center gap-1.5 bg-[#020617] md:bg-[#00e5ff]/10 px-3 py-1 rounded-full border border-[#00e5ff]/20 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                  <span className="w-1 h-1 rounded-full bg-[#00e5ff] animate-pulse" />
                  {freeSeatsLeft} FREE SEATS LEFT
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Link
                href="/events/speak-with-impact-bootcamp"
                className="px-4 py-1.5 bg-[#00e5ff] text-[#020617] text-[11px] md:text-xs font-bold rounded-full hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all no-underline whitespace-nowrap"
              >
                Secure Your Seat
              </Link>
              <Link
                href="/events/speak-with-impact-bootcamp"
                className="px-4 py-1.5 bg-white/10 text-white text-[11px] md:text-xs font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all no-underline whitespace-nowrap"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}