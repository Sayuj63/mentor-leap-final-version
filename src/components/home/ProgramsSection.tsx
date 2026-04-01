"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { fetchEvents } from "@/lib/api";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function ProgramsSection() {
  const { ref, visible } = useInView();
  const [hovered, setHovered] = useState<number | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents().then(data => {
      // Ensure Interview to Offer Letter masterclass is always present
      const hasMasterclass = data.some((ev: any) => ev.id === "interview-to-offer-letter");
      if (!hasMasterclass) {
        data.unshift({
          id: "interview-to-offer-letter",
          title: "Interview to Offer Letter: The Ultimate Communication Masterclass",
          description: "Learn how to answer the most commonly asked interview questions with clarity, structure, and confidence. Turn interviews into offer letters.",
          price: 499,
          speaker: "Mridu Bhandari",
          date: "2026-04-30",
          banner: "/events/interview-to-offer-banner.png",
        } as any);
      }
      setEvents(data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <style>{`
        .programs-gradient-text {
          background: linear-gradient(90deg, #00e5ff, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .program-btn {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 30px;
          background: linear-gradient(90deg, #00e5ff, #6366f1);
          color: white;
          text-decoration: none;
          font-size: 14px;
          box-shadow: 0 6px 20px rgba(0,229,255,0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .program-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 10px 28px rgba(0,229,255,0.45);
        }
        .program-btn:active { transform: scale(0.97); }

        .program-li::before {
          content: "✦";
          color: #00e5ff;
          margin-right: 8px;
          font-size: 10px;
        }

        @keyframes premiumGlow {
          0%   { box-shadow: 0 0 20px rgba(99,102,241,0.2); }
          50%  { box-shadow: 0 0 40px rgba(99,102,241,0.4); }
          100% { box-shadow: 0 0 20px rgba(99,102,241,0.2); }
        }
        .premium-card-glow {
          animation: premiumGlow 3s ease-in-out infinite;
        }

        @keyframes badgePop {
          0%   { transform: scale(0.8); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .badge-pop {
          animation: badgePop 0.4s ease forwards;
        }

        .offer-line {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          font-size: 13px;
          color: #facc15;
        }
        .offer-line::before {
          content: "★";
          font-size: 11px;
        }
      `}</style>

      <section
        ref={ref}
        className="w-full px-5 text-center"
        style={{ padding: "120px 20px" }}
      >
        {/* TITLE */}
        <h2
          className="text-white font-bold mb-16"
          style={{
            fontSize: "42px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(-20px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}
        >
          Upcoming{" "}
          <span className="programs-gradient-text">MentorLeap Programs</span>
        </h2>

        {/* GRID */}
        {!loading && events.length > 0 && (
          <div
            className="mx-auto grid gap-10"
            suppressHydrationWarning
            style={{
              maxWidth: "1200px",
              gridTemplateColumns: events.length === 1 ? "1fr" : "repeat(2, 1fr)",
            }}
          >
            {events.slice(0, 2).map((event, i) => (
              <div
                key={event.id}
                className={`relative rounded-2xl text-left ${i === 1 ? "premium-card-glow" : ""}`}
                style={{
                  background: "#020617",
                  padding: "40px",
                  border: i === 1 ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.08)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(40px)",
                  transition: `opacity 0.6s ease ${0.2 + i * 0.15}s, transform 0.35s ease`,
                }}
              >
                {i === 1 && (
                  <div
                    style={{
                      top: "-12px",
                      left: "20px",
                      background: "#6366f1",
                      color: "white",
                      fontSize: "11px",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      position: "absolute",
                    }}
                  >
                    BEST SELLER
                  </div>
                )}
                {event.price === 0 && (
                  <div
                    style={{
                      top: "-12px",
                      left: "20px",
                      background: "#22c55e",
                      color: "white",
                      fontSize: "11px",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      position: "absolute",
                    }}
                  >
                    FREE
                  </div>
                )}
                <h3 className="text-white font-bold mb-2" style={{ fontSize: "22px", marginTop: "8px" }}>
                  {event.title}
                </h3>
                <p className="mb-4" style={{ color: i === 1 ? "#6366f1" : "#00e5ff", fontSize: "14px" }}>By {event.speaker || 'Mridu Bhandari'}</p>
                <p className="mb-6" style={{ color: "#cbd5f5", fontSize: "14px", lineHeight: "1.6" }}>
                  {event.description}
                </p>
                <div className="mb-4" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                <p className="font-semibold mb-3 text-white italic" style={{ fontSize: "14px" }}>
                  📅 {(() => {
                    const rawDate = event.date;
                    if (event.id === "speak-with-impact-bootcamp") return "Saturday, 28th March & Sunday, 29th March";
                    if (event.id === "interview-to-offer-letter") return "Thursday, 30th April 2026 • 7:30 - 9:00 PM IST";
                    try {
                      let d: Date | null = null;
                      if (rawDate?._seconds) d = new Date(rawDate._seconds * 1000);
                      else if (rawDate?.toDate) d = rawDate.toDate();
                      else if (rawDate) d = new Date(rawDate);
                      
                      if (d && !isNaN(d.getTime())) {
                        return d.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        });
                      }
                    } catch (e) {}
                    return "Date TBA";
                  })()}
                </p>
                <p className="font-bold mb-6" style={{ color: "white", fontSize: "20px" }}>
                  {event.price === 0 ? "FREE" : `₹${event.price}`}
                </p>
                <Link href={`/events/${event.id}`} className="program-btn">
                  {event.price === 0 ? "Register Free" : "Secure Your Seat"}
                </Link>
              </div>
            ))}
          </div>
        )}

        <div
          className="mt-16 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s",
          }}
        >
          <Link href="/courses" className="text-[#94a3b8] font-bold text-sm hover:text-[#00e5ff] transition-colors flex items-center justify-center gap-2 group">
            Check out all Professional Programs <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}