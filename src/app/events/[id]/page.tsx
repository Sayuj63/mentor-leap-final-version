"use client";
import React, { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Reveal } from "@/components/ui/Animation";
import { Button } from "@/components/ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader } from "@/components/ui/Loader";
import { Toast } from "@/components/ui/Toast";
import { Clock, Calendar, ChevronRight, CheckCircle2, Star, ShieldCheck, Video, Mic2, MessageSquare, Target, User, Zap, Users } from "lucide-react";

// --- Specialized Content for SWI Bootcamp Event ---
const SWI_EVENT_CONTENT = {
  id: "speak-with-impact-bootcamp",
  title: "Speak With Impact: Public Speaking Bootcamp",
  category: "High-Intensity Live Bootcamp",
  description: "A two-day immersive learning experience designed to help professionals develop confident communication and structured thinking for the modern workplace. Participants will learn practical frameworks to communicate ideas clearly and influence professional conversations.",
  price: 7999,
  date: "Mar 28, 2026",
  duration: "2 Days (7 PM - 9 PM IST)",
  imageUrl: "https://images.unsplash.com/photo-1475721027187-402ad2989a3b?w=1000&q=80",
  agenda: [
    { day: "Day 1: Foundations & Confidence", time: "7:00 PM - 9:00 PM", topics: ["Overcoming Stage Fear", "First Impressions", "Executive Presence"] },
    { day: "Day 2: Structure & Storytelling", time: "7:00 PM - 9:00 PM", topics: ["The Rule of Three", "Persuasive Narrative", "Handling Q&A Like a Pro"] }
  ]
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const { user, userData } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  const isSWI = id === "speak-with-impact-bootcamp";

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) throw new Error("Event not found");
        return res.json();
      } catch (error) {
        if (isSWI) return SWI_EVENT_CONTENT;
        throw error;
      }
    }
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        router.push("/auth/login?redirect=" + id);
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ eventId: id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Registration failed");
      }
      return res.json();
    },
    onSuccess: () => {
      setToast({ show: true, message: "Successfully registered!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
    onError: (error: any) => {
      setToast({ show: true, message: error.message, type: "error" });
    }
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader /></div>;
  if (!event) return <div className="h-screen flex items-center justify-center bg-[#020617]"><div className="text-xl font-bold">Event not found</div></div>;

  const isRegistered = userData?.registeredEvents?.includes(id as string);

  return (
    <PageWrapper>
      <section className="px-5 py-[120px] max-w-[1200px] mx-auto overflow-hidden">
        <Reveal>
          <div>
            <div className="relative aspect-[21/9] w-full rounded-3xl bg-[#0f172a] border border-white/10 mb-10 overflow-hidden flex items-center justify-center shadow-2xl group">
              {event.imageUrl ? (
                <img src={event.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" alt={event.title} />
              ) : (
                <div className="text-5xl font-bold opacity-10 uppercase tracking-tighter italic">MentorLeap Masterclass</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
            </div>

            <div className="grid lg:grid-cols-[2fr_1fr] gap-16">
              <div className="space-y-10">
                <div>
                  <span className="px-4 py-1.5 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] text-xs font-bold uppercase tracking-widest mb-4 inline-block">{isSWI ? "High-Intensity Live Bootcamp" : (event.category || "Professional Development")}</span>
                  <h1 className="text-5xl font-bold mb-6 text-white leading-tight">{event.title}</h1>
                  <p className="text-[#94a3b8] text-xl leading-relaxed">{event.description}</p>
                </div>

                <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff05] blur-3xl rounded-full -mr-32 -mt-32"></div>
                  <h3 className="text-2xl font-bold text-[#00e5ff] relative z-10">{isSWI ? "Bootcamp Schedule" : "Masterclass Agenda"}</h3>
                  <div className="space-y-6 relative z-10">
                    {isSWI ? (
                      SWI_EVENT_CONTENT.agenda.map((item, i) => (
                        <div key={i} className="flex flex-col gap-4 pb-8 border-b border-white/5 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between">
                             <div className="text-[#00e5ff] font-black text-xs uppercase tracking-widest">{item.day}</div>
                             <div className="text-[#64748b] font-bold text-sm tracking-tight flex items-center gap-2">
                               <Clock size={14} className="text-[#00e5ff]" />
                               {item.time} IST
                             </div>
                          </div>
                          <div className="grid sm:grid-cols-3 gap-4">
                             {item.topics.map((topic, j) => (
                               <div key={j} className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-[#cbd5f5] font-medium flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]"></div>
                                 {topic}
                               </div>
                             ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex gap-6 items-start pb-6 border-b border-white/5">
                          <div className="text-[#00e5ff] font-bold text-lg min-w-[100px]">10:00 AM</div>
                          <div className="text-[#cbd5f5] font-medium text-lg">Foundations of Executive Presence</div>
                        </div>
                        <div className="flex gap-6 items-start pb-6 border-b border-white/5">
                          <div className="text-[#00e5ff] font-bold text-lg min-w-[100px]">12:00 PM</div>
                          <div className="text-[#cbd5f5] font-medium text-lg">Live Framework Application Workshop</div>
                        </div>
                        <div className="flex gap-6 items-start">
                          <div className="text-[#00e5ff] font-bold text-lg min-w-[100px]">02:30 PM</div>
                          <div className="text-[#cbd5f5] font-medium text-lg">High-Stakes Positioning & Hotseats</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {isSWI && (
                   <div className="grid sm:grid-cols-2 gap-6">
                      <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-5">
                        <div className="w-12 h-12 rounded-xl bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff] flex-shrink-0">
                           <Video size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-1">Live Interactive</h4>
                          <p className="text-xs text-[#64748b]">Real-time engagement with the mentor.</p>
                        </div>
                      </div>
                      <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-5">
                        <div className="w-12 h-12 rounded-xl bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff] flex-shrink-0">
                           <ShieldCheck size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-1">Instant Feedback</h4>
                          <p className="text-xs text-[#64748b]">Get corrected as you practice live.</p>
                        </div>
                      </div>
                   </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-10 border border-white/10 sticky top-32 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00e5ff] to-[#6366f1]"></div>
                  
                  <div className="text-4xl font-black mb-1 tracking-tight">
                    {event.price === 0 ? <span className="text-[#00e5ff]">FREE</span> : `₹${event.price}`}
                  </div>
                  {isSWI && <p className="text-[10px] font-black text-[#00e5ff] uppercase tracking-widest mb-10">Special Early Bird Pricing</p>}

                  {!isSWI && <div className="h-10"></div>}

                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-3 text-sm text-[#cbd5f5]">
                      <span className="text-[#475569] font-black w-14 uppercase text-[9px] tracking-widest">Date</span>
                      <span className="font-bold text-white italic">{isSWI ? "28th & 29th March '26" : (event.date ? new Date(event.date).toLocaleDateString() : "TBA")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#cbd5f5]">
                      <span className="text-[#475569] font-black w-14 uppercase text-[9px] tracking-widest">Host</span>
                      <span className="font-bold text-white">Mridu Bhandari</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#cbd5f5]">
                      <span className="text-[#475569] font-black w-14 uppercase text-[9px] tracking-widest">Link</span>
                      <span className="font-bold text-[#00e5ff]">Google Meet</span>
                    </div>
                  </div>

                  <Button
                    fullWidth
                    disabled={registerMutation.isPending || isRegistered}
                    onClick={() => registerMutation.mutate()}
                    className={isRegistered ? "bg-emerald-500 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] h-14 font-black uppercase tracking-widest" : "h-14 font-black uppercase tracking-widest shadow-[0_10px_25px_#00e5ff30]"}
                  >
                    {registerMutation.isPending ? "Processing..." : isRegistered ? "Already Registered" : "Complete Registration"}
                  </Button>

                  {!user && (
                    <p className="text-[9px] text-center text-[#475569] mt-6 font-black uppercase tracking-[0.2em]">Login required to access link</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </PageWrapper>
  );
}
