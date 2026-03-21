"use client";
import React, { useState, useEffect } from "react";
import Script from "next/script";
import PageWrapper from "@/components/layout/PageWrapper";
import { Reveal } from "@/components/ui/Animation";
import { Button } from "@/components/ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader } from "@/components/ui/Loader";
import { Toast } from "@/components/ui/Toast";
import { GradientText } from "@/components/ui/Typography";
import { 
  Clock, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Video, 
  Mic2, 
  MessageSquare, 
  Target, 
  User, 
  Zap, 
  Users, 
  Gift, 
  FileText, 
  Layout, 
  BookOpen, 
  PlayCircle, 
  BarChart, 
  Globe 
} from "lucide-react";
import PaymentDetailsModal, { UserDetails } from "@/components/layout/PaymentDetailsModal";

// --- Specialized Content for SWI Bootcamp Event ---
const SWI_EVENT_CONTENT = {
  id: "speak-with-impact-bootcamp",
  title: "Speak With Impact: Public Speaking Bootcamp",
  category: "High-Intensity Live Bootcamp",
  description: "Transform how you communicate in high-stakes situations. A practice-driven 2-day live training designed for executive presence and instant impact.",
  price: 7999,
  date: "Mar 28, 2026",
  duration: "2 Days (7 PM - 9 PM IST)",
  imageUrl: "https://images.unsplash.com/photo-1475721027187-402ad2989a3b?w=1000&q=80",
  audience: [
    { label: "Young Professionals", desc: "Stand out in every meeting", icon: <User size={20} /> },
    { label: "Founders & Entrepreneurs", desc: "Pitch products and vision with power", icon: <Zap size={20} /> },
    { label: "Managers & Team Leads", desc: "Master leadership communication", icon: <Target size={20} /> },
    { label: "Students", desc: "Build industry-ready confidence", icon: <Users size={20} /> }
  ],
  agenda: [
    { day: "Day 1: Foundations & Confidence", time: "7:00 PM - 9:00 PM", topics: ["Overcoming Stage Fear", "First Impressions", "Executive Presence"] },
    { day: "Day 2: Structure & Storytelling", time: "7:00 PM - 9:00 PM", topics: ["The Rule of Three", "Persuasive Narrative", "Handling Q&A Like a Pro"] }
  ],
  modules: [
    { title: "Speak Confidently Under Pressure", desc: "Overcome fear, think clearly in real-time, and stay composed." },
    { title: "Structure Thoughts Like a Leader", desc: "Use frameworks to stay clear, concise, and avoid rambling." },
    { title: "Master Voice & Delivery", desc: "Pauses, tone, pace, and body language (online + offline)." },
    { title: "Storytelling That Influences", desc: "Turn ideas into compelling narratives that drive decisions." },
    { title: "Build Executive Presence", desc: "Own the room, sound confident, and be taken seriously." }
  ],
  howItWorks: [
    { title: "Live Interactive Sessions", desc: "No pre-recorded boring lectures.", icon: <Video size={20} /> },
    { title: "Real-Time Practice", desc: "Build muscle memory through exercises.", icon: <Mic2 size={20} /> },
    { title: "Immediate Feedback", desc: "Get direct correction from the mentor.", icon: <MessageSquare size={20} /> },
    { title: "Safe Environment", desc: "Learn and fail fast in a supportive group.", icon: <ShieldCheck size={20} /> }
  ],
  bonuses: [
    { title: "Power Phrases Guide", desc: "Sound confident instantly.", icon: <FileText size={20} /> },
    { title: "Own the Screen Cheatsheet", desc: "Master Zoom/Online presence.", icon: <Layout size={20} /> },
    { title: "Eye Contact Mastery", desc: "Build trust through connection.", icon: <Star size={20} /> },
    { title: "Resources Access", desc: "Continued learning materials.", icon: <BookOpen size={20} /> }
  ],
  mentorBio: "Award-winning TV Journalist, Chevening Scholar, and Communication Coach with 20+ years of experience. Featured on CNBC-TV18, Forbes India, and CNN-News18. Trained leaders across 13+ countries.",
  outcome: ["Speak confidently in meetings", "Present ideas clearly", "Influence people through communication", "Handle pressure situations smoothly"]
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const { user, userData } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [isFreeSuccess, setIsFreeSuccess] = useState(false);

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

  const handleRegisterInitiation = () => {
    if (!user) {
      return router.push(`/auth/login?redirect=/events/${id}?checkout=true`);
    }
    setShowDetailsModal(true);
  };

  const processRegistration = async (details: UserDetails) => {
    try {
      setRegistering(true);
      setShowDetailsModal(false);
      const token = await user?.getIdToken() || "";
      if (!token) throw new Error("Authentication failed");
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          itemId: id,
          itemType: "event",
          userDetails: details
        })
      });
      
      const data = await res.json();
      console.log("[Checkout] API Response:", data);
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.type === "redirect") {
        console.log("[Checkout] Redirecting to:", data.url);
        window.location.href = data.url;
      } else if (data.type === "free") {
        console.log("[Checkout] Free registration success");
        setIsFreeSuccess(true);
        setToast({ 
          show: true, 
          message: "Congratulations! You are one of the first 10 people to enroll. Your seat is confirmed for free!", 
          type: "success" 
        });
        queryClient.invalidateQueries({ queryKey: ["event", id] });
      } else if (data.type === "paid") {
        console.log("[Checkout] Opening Razorpay modal with key:", data.key);
        if (!data.key) throw new Error("Razorpay Key ID is missing. Please check environment variables.");
        
        if (typeof (window as any).Razorpay === 'undefined') {
          throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
        }

        const options = {
          key: data.key,
          amount: data.amount,
          currency: "INR",
          name: "MentorLeap",
          description: `Registration for ${event.title}`,
          order_id: data.orderId,
          handler: async (response: any) => {
            console.log("[Checkout] Payment success, verifying...", response);
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                ...response,
                itemId: id,
                itemType: "event"
              })
            });
            if (verifyRes.ok) {
              console.log("[Checkout] Verification success");
              setToast({ show: true, message: "Successfully registered and paid!", type: "success" });
              queryClient.invalidateQueries({ queryKey: ["event", id] });
            } else {
              console.error("[Checkout] Verification failed");
              setToast({ show: true, message: "Payment verification failed. Please contact support.", type: "error" });
            }
          },
          modal: {
            ondismiss: function() {
              console.log("[Checkout] Modal closed by user");
              setRegistering(false);
            }
          },
          prefill: {
            name: details.fullName,
            email: user?.email,
            contact: details.phone
          },
          theme: { color: "#00e5ff" }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (e: any) {
      setToast({ show: true, message: e.message, type: "error" });
    } finally {
      setRegistering(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader /></div>;
  if (!event) return <div className="h-screen flex items-center justify-center bg-[#020617] text-white">Event not found</div>;

  const isRegistered = userData?.registeredEvents?.includes(id as string);

  return (
    <PageWrapper>
      <section className="px-5 py-[120px] max-w-[1200px] mx-auto">
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
              <div className="space-y-16">
                <div>
                  <span className="px-4 py-1.5 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] text-xs font-bold uppercase tracking-widest mb-4 inline-block">{isSWI ? "High-Intensity Live Bootcamp" : (event.category || "Professional Development")}</span>
                  <h1 className="text-5xl md:text-6xl font-black mb-6 text-white leading-tight">{event.title}</h1>
                  <p className="text-[#94a3b8] text-xl leading-relaxed max-w-2xl">{event.description}</p>
                </div>

                {/* WHO IS THIS FOR? */}
                {isSWI && (
                  <Reveal>
                    <h3 className="text-2xl font-black mb-8 underline decoration-[#00e5ff]/20 underline-offset-8">Who this is <GradientText>Targeted Toward</GradientText></h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {SWI_EVENT_CONTENT.audience.map((item, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#00e5ff]/50 transition-all group">
                          <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff] mb-4 group-hover:scale-110 transition-transform">
                            {item.icon}
                          </div>
                          <h4 className="font-bold text-white text-sm mb-1">{item.label}</h4>
                          <p className="text-[10px] text-[#64748b] leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </Reveal>
                )}

                {/* AGENDA / MASTERY */}
                <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff05] blur-3xl rounded-full -mr-32 -mt-32"></div>
                  <h3 className="text-2xl font-bold text-[#00e5ff] relative z-10">{isSWI ? "Bootcamp Schedule & Outcomes" : "Masterclass Agenda"}</h3>
                  <div className="space-y-6 relative z-10">
                    {isSWI ? (
                      <div className="space-y-10">
                        {SWI_EVENT_CONTENT.agenda.map((item, i) => (
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
                        ))}
                        
                        <div className="pt-6 grid gap-6">
                           <h4 className="text-white font-bold text-sm uppercase tracking-widest border-l-2 border-[#00e5ff] pl-4">Core Mastery Modules:</h4>
                           <div className="grid md:grid-cols-2 gap-6">
                              {SWI_EVENT_CONTENT.modules.map((m, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                  <div className="mt-1 flex-shrink-0"><CheckCircle2 size={16} className="text-[#00e5ff]" /></div>
                                  <div>
                                    <h5 className="text-white font-bold text-sm">{m.title}</h5>
                                    <p className="text-[10px] text-[#64748b]">{m.desc}</p>
                                  </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
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

                {/* HOW IT WORKS */}
                {isSWI && (
                  <Reveal>
                    <h3 className="text-2xl font-black mb-8 tracking-tight">How the Bootcamp <GradientText>Works</GradientText></h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {SWI_EVENT_CONTENT.howItWorks.map((item, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-5">
                          <div className="w-12 h-12 rounded-xl bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff] flex-shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-white mb-1">{item.title}</h4>
                            <p className="text-xs text-[#64748b]">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Reveal>
                )}

                {/* BONUSES */}
                {isSWI && (
                  <Reveal>
                     <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#00e5ff] to-[#6366f1] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-[#020617] rounded-3xl p-10 border border-white/5 overflow-hidden">
                          <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                            Exclusive <GradientText>Bonuses Included</GradientText>
                            <Gift className="text-[#00e5ff]" size={24} />
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-8">
                            {SWI_EVENT_CONTENT.bonuses.map((item, i) => (
                              <div key={i} className="flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00e5ff]">
                                  {item.icon}
                                </div>
                                <div>
                                  <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                  <p className="text-[10px] text-[#475569] font-black uppercase tracking-widest mt-0.5">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                     </div>
                  </Reveal>
                )}

                {/* INSTRUCTOR */}
                <Reveal>
                   <h3 className="text-2xl font-black mb-8 tracking-tight">Your <GradientText>Mentor</GradientText></h3>
                   <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff05] blur-3xl -mr-32 -mt-32 rounded-full"></div>
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-2 border-[#00e5ff]/20 shadow-[0_10px_30px_rgba(0,229,255,0.1)] relative z-10">
                        <img
                          src="/mridu-bhandari-profile.jpg"
                          onError={(e: any) => e.target.src = "https://ui-avatars.com/api/?name=Mridu+Bhandari&background=00e5ff&color=020617&size=200"}
                          className="w-full h-full object-cover"
                          alt="Mridu Bhandari"
                        />
                      </div>
                      <div className="flex-1 relative z-10 text-center md:text-left">
                         <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <h4 className="text-2xl font-black text-white">Mridu Bhandari</h4>
                            <ShieldCheck size={18} className="text-[#00e5ff]" />
                         </div>
                         <p className="text-[#00e5ff] text-[10px] font-black uppercase tracking-widest mb-4">Award-Winning Journalist • Communication Coach</p>
                         <p className="text-sm text-[#cbd5f5] leading-relaxed mb-6 italic opacity-80">
                            {isSWI ? SWI_EVENT_CONTENT.mentorBio : "With over 20+ years of experience in high-stakes communication, Mridu has mentored 500+ professionals across Google, Amazon, and Fortune 500 companies."}
                         </p>
                         <div className="flex gap-8 justify-center md:justify-start grayscale opacity-30 invert">
                            <span className="text-[9px] font-black text-white">CNBC-TV18</span>
                            <span className="text-[9px] font-black text-white">FORBES INDIA</span>
                            <span className="text-[9px] font-black text-white">CNN-NEWS18</span>
                         </div>
                      </div>
                   </div>
                </Reveal>
              </div>

              {/* SIDEBAR */}
              <div className="lg:sticky lg:top-32 h-fit space-y-8">
                <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00e5ff] to-[#6366f1]"></div>
                  
                  <div className="text-4xl font-black mb-1 tracking-tight">
                    {event.price === 0 ? <span className="text-[#00e5ff]">FREE</span> : `₹${event.price}`}
                  </div>
                  {isSWI && <p className="text-[10px] font-black text-[#00e5ff] uppercase tracking-widest mb-10">Limited Time Early Bird Pricing</p>}

                  {!isSWI && <div className="h-10"></div>}

                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-3 text-sm text-[#cbd5f5]">
                      <span className="text-[#475569] font-black w-14 uppercase text-[9px] tracking-widest">Date</span>
                      <span className="font-bold text-white italic">{isSWI ? "28th & 29th March '26" : (event.date ? new Date(event.date).toLocaleDateString() : "TBA")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#cbd5f5]">
                      <span className="text-[#475569] font-black w-14 uppercase text-[9px] tracking-widest">Time</span>
                      <span className="font-bold text-white italic">{isSWI ? "7:00 - 9:00 PM IST" : "Check Agenda"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#cbd5f5]">
                      <span className="text-[#475569] font-black w-14 uppercase text-[9px] tracking-widest">Link</span>
                      <span className="font-bold text-[#00e5ff]">Zoom</span>
                    </div>
                  </div>

                  <Button
                    fullWidth
                    disabled={registering || isRegistered || isFreeSuccess}
                    onClick={handleRegisterInitiation}
                    className={(isRegistered || isFreeSuccess) ? "bg-emerald-500 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] h-14 font-black uppercase tracking-widest" : "h-14 font-black uppercase tracking-widest shadow-[0_10px_25px_#00e5ff30]"}
                  >
                    {registering ? "Processing..." : (isRegistered || isFreeSuccess) ? "Seat Confirmed" : isSWI ? "Secure Your Seat" : "Complete Registration"}
                  </Button>

                  {!user && (
                    <p className="text-[9px] text-center text-[#475569] mt-6 font-black uppercase tracking-[0.2em]">Login required to access link</p>
                  )}
                  
                  <p className="text-[9px] text-center text-[#475569] font-black uppercase tracking-widest mt-6 italic">
                    🔒 SSL Secured Checkout
                  </p>
                </div>
                
                {isSWI && (
                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                     <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00e5ff]">Guaranteed Outcome</h5>
                     <p className="text-[11px] text-[#cbd5f5] leading-relaxed">
                        Master the skill of structured communication and vocal power. If you don&apos;t feel more confident in 2 days, we will provide a private 1-on-1 diagnostic session.
                     </p>
                  </div>
                )}
              </div>
            </div>
          </div>
      </section>

      {/* RAZORPAY SCRIPT */}
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload"
      />

      {/* DETAILS FORM MODAL */}
      <PaymentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onSubmit={processRegistration}
        initialEmail={user?.email || undefined}
        courseTitle={event?.title}
      />

      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </PageWrapper>
  );
}
