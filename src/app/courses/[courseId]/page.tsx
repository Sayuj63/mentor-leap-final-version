"use client";
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import { Reveal, FadeIn } from "@/components/ui/Animation";
import { SectionHeading, GradientText, Paragraph } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import {
  PlayCircle,
  FileText,
  Award,
  ChevronRight,
  Star,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  BarChart,
  Users,
  Zap,
  Gift,
  Target,
  Mic2,
  BookOpen,
  MessageSquare,
  Layout,
  Video
} from "lucide-react";
import PaymentDetailsModal, { UserDetails } from "@/components/layout/PaymentDetailsModal";

// --- Specialized Content for SWI Bootcamp ---
const SWI_CONTENT = {
  id: "speak-with-impact-bootcamp",
  title: "Speak With Impact: Public Speaking Bootcamp",
  overtitle: "High-Intensity Live Bootcamp",
  description: "Transform how you communicate in high-stakes situations. A practice-driven 2-day live training designed for executive presence and instant impact.",
  duration: "2 Days (4 Hours Total)",
  dates: "28th & 29th March 2026",
  time: "7:00 PM – 9:00 PM IST",
  audience: [
    { label: "Young Professionals", desc: "Stand out in every meeting", icon: <User size={20} /> },
    { label: "Founders & Entrepreneurs", desc: "Pitch products and vision with power", icon: <Zap size={20} /> },
    { label: "Managers & Team Leads", desc: "Master leadership communication", icon: <Target size={20} /> },
    { label: "Students", desc: "Build industry-ready confidence", icon: <Users size={20} /> }
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

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  const isSWI = courseId === "speak-with-impact-bootcamp";

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        setCourse(data);
      } catch (error) {
        console.error(error);
        if (isSWI) setCourse(SWI_CONTENT); // Fallback for SWI
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourse();

    // Check auth status
    const checkAuth = async () => {
      const { auth } = await import('@/lib/firebase');
      auth.onAuthStateChanged((user: any) => {
        setUser(user);
        const params = new URLSearchParams(window.location.search);
        if (user && params.get('checkout') === 'true') {
          setShowDetailsModal(true);
        }
      });
    };
    checkAuth();
  }, [courseId, isSWI]);

  const handleEnrollInitiation = () => {
    if (!user) {
      return window.location.href = `/auth/login?redirect=/courses/${courseId}?checkout=true`;
    }
    setShowDetailsModal(true);
  };

  const processPayment = async (details: UserDetails) => {
    try {
      setEnrolling(true);
      setShowDetailsModal(false);
      const { auth } = await import('@/lib/firebase');
      const token = await auth.currentUser?.getIdToken();
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          itemId: courseId,
          userDetails: details
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.type === "redirect") {
        window.location.href = data.url;
      } else if (data.type === "free") {
        window.location.href = `/course-player/${courseId}`;
      } else if (data.type === "paid") {
        const options = {
          key: data.key,
          amount: data.amount,
          currency: "INR",
          name: "MentorLeap",
          description: `Enrollment for ${course.title}`,
          order_id: data.orderId,
          handler: async (response: any) => {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                ...response,
                itemId: courseId,
                itemType: "course"
              })
            });
            if (verifyRes.ok) window.location.href = `/course-player/${courseId}`;
            else alert("Payment verification failed. Please contact support.");
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
      alert(e.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><Loader /></div>;
  if (!course) return <div className="h-screen flex items-center justify-center bg-[#020617] text-white">Course not found</div>;

  return (
    <PageWrapper>
      {/* HERO SECTION */}
      <section className="relative px-5 pt-[160px] pb-[100px] overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-[#00e5ff0d] to-transparent pointer-events-none"></div>
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#00e5ff]/10 text-[#00e5ff] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-[#00e5ff]/20">
                {isSWI ? SWI_CONTENT.overtitle : course.category}
              </span>
              <div className="flex gap-0.5 text-[#facc15]">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.0] mb-6">
              {isSWI ? "Speak With" : course.title?.split(":")[0]} <br />
              <GradientText>{isSWI ? "Impact" : course.title?.split(":")[1] || "Masterclass"}</GradientText>
            </h1>
            <Paragraph className="text-lg text-[#94a3b8] mb-10 max-w-[550px]">
              {isSWI ? SWI_CONTENT.description : course.description}
            </Paragraph>

            <div className="flex flex-wrap gap-8 items-center text-[#cbd5f5]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Clock size={16} className="text-[#00e5ff]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-[#475569] tracking-widest">Duration</p>
                  <p className="text-sm font-bold">{isSWI ? SWI_CONTENT.duration : (course.duration || "12.5 Hours")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <BarChart size={16} className="text-[#00e5ff]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-[#475569] tracking-widest">Level</p>
                  <p className="text-sm font-bold">{isSWI ? "High Intensity" : course.difficulty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Globe size={16} className="text-[#00e5ff]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-[#475569] tracking-widest">Live On</p>
                  <p className="text-sm font-bold">{isSWI ? "28-29 March" : "Interactive"}</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="relative">
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] group">
              <img
                src={course.thumbnail || "https://images.unsplash.com/photo-1475721027187-402ad2989a3b?w=1000&q=80"}
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                alt="Course Preview"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={() => setShowTrailer(true)}
                  className="w-20 h-20 rounded-full bg-[#00e5ff] text-[#020617] flex items-center justify-center shadow-[0_0_30px_#00e5ff] hover:scale-110 transition-transform"
                >
                  <PlayCircle size={32} />
                </button>
              </div>

              <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/5 items-center justify-between hidden md:flex">
                <p className="text-xs font-bold text-white uppercase tracking-widest">Watch Trailer</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-[#00e5ff] uppercase tracking-tighter">Live Sessions</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHO IS THIS FOR? */}
      {isSWI && (
        <section className="px-5 pb-[100px] max-w-[1200px] mx-auto">
          <Reveal>
            <h3 className="text-3xl font-black mb-12 text-center">Who this <GradientText>Targeted Toward</GradientText></h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SWI_CONTENT.audience.map((item, i) => (
                <Card key={i} className="hover:border-[#00e5ff]/50 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff] mb-6 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-white">{item.label}</h4>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{item.desc}</p>
                </Card>
              ))}
            </div>
            <div className="mt-12 text-center">
              <p className="text-[#64748b] text-sm italic font-medium">&quot;Anyone who thinks well but struggles to express powerfully&quot;</p>
            </div>
          </Reveal>
        </section>
      )}

      {/* MAIN CONTENT AREA */}
      <section className="px-5 pb-[160px] max-w-[1200px] mx-auto grid lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-16">
          {/* LEARNING POINTS */}
          <Reveal>
            <Card className="!bg-white/[0.02] border-white/10 !p-10">
              <h3 className="text-2xl font-black mb-8 underline decoration-[#00e5ff]/20 underline-offset-8">What you&apos;ll <GradientText>Master</GradientText></h3>
              <div className="grid gap-x-8 gap-y-8">
                {(isSWI ? SWI_CONTENT.modules : [
                  "Advanced strategic communication frameworks",
                  "Executive presence and body language mastery",
                  "Crisis management and boardroom psychology",
                  "Personal brand architecture and scaling",
                  "High-stakes negotiation and persuasion",
                  "Vocal branding and tonality control"
                ]).map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="mt-1 w-8 h-8 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center flex-shrink-0 text-[#00e5ff] font-black text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{isSWI ? (item as any).title : item}</h4>
                      {isSWI && <p className="text-xs text-[#94a3b8] leading-relaxed">{(item as any).desc}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          {/* HOW IT WORKS */}
          {isSWI && (
            <Reveal>
              <h3 className="text-2xl font-black mb-8 tracking-tight">How the Bootcamp <GradientText>Works</GradientText></h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {SWI_CONTENT.howItWorks.map((item, i) => (
                  <Card key={i} className="!bg-white/[0.01] border-white/5 flex gap-5">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#00e5ff] flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-[#64748b]">{item.desc}</p>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-8 bg-[#00e5ff]/5 p-6 rounded-2xl border border-[#00e5ff]/10">
                 <p className="text-center text-sm font-bold text-[#00e5ff] uppercase tracking-widest">Focus: Learning by doing, not watching</p>
              </div>
            </Reveal>
          )}

          {/* BONUSES */}
          {isSWI && (
            <Reveal>
               <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#00e5ff] to-[#6366f1] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <Card className="relative bg-[#020617] !p-10 border-white/5">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                      Exclusive <GradientText>Bonuses Included</GradientText>
                      <Gift className="text-[#00e5ff]" size={24} />
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-8">
                      {SWI_CONTENT.bonuses.map((item, i) => (
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
                  </Card>
               </div>
            </Reveal>
          )}

          {/* INSTRUCTOR */}
          <Reveal>
            <h3 className="text-2xl font-black mb-8 tracking-tight">Your <GradientText>Mentor</GradientText></h3>
            <Card className="!p-8 bg-white/[0.02] border-white/10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff05] blur-3xl -mr-32 -mt-32 rounded-full"></div>
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-2 border-[#00e5ff]/20 shadow-[0_10px_30px_rgba(0,229,255,0.1)]">
                  <img
                    src="/mridu-bhandari-profile.jpg"
                    onError={(e: any) => e.target.src = "https://ui-avatars.com/api/?name=" + (course.instructor || "Mridu+Bhandari") + "&background=00e5ff&color=020617&size=200"}
                    className="w-full h-full object-cover"
                    alt={course.instructor}
                  />
                </div>
                <div className="text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h4 className="text-2xl font-black text-white">{course.instructor || "Mridu Bhandari"}</h4>
                    <ShieldCheck size={18} className="text-[#00e5ff]" />
                  </div>
                  <p className="text-[#00e5ff] text-[10px] font-black uppercase tracking-widest mb-4">Award-Winning Journalist • Communication Coach</p>
                  <Paragraph className="text-sm opacity-70 mb-6 leading-relaxed">
                    {isSWI ? SWI_CONTENT.mentorBio : `With over 20+ years of experience in high-stakes communication, ${(course.instructor || "Mridu").split(' ')[0]} has mentored 500+ professionals across Google, Amazon, and Fortune 500 companies.`}
                  </Paragraph>

                  {isSWI && (
                    <div className="mb-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#475569] mb-3">Featured On:</p>
                      <div className="flex flex-wrap gap-4 justify-center md:justify-start grayscale opacity-50 contrast-125">
                         <span className="text-xs font-black text-white">CNBC-TV18</span>
                         <span className="text-xs font-black text-white">FORBES INDIA</span>
                         <span className="text-xs font-black text-white">TIMES NETWORK</span>
                         <span className="text-xs font-black text-white">CNN-NEWS18</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-6 justify-center md:justify-start border-t border-white/5 pt-6">
                    <div className="text-center">
                      <p className="text-lg font-black text-white">Chevening</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-[#475569]">Scholar</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-white">13+</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-[#475569]">Countries</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-white">20y+</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-[#475569]">Experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>

          {/* OUTCOME */}
          {isSWI && (
            <Reveal>
              <div className="bg-[#00e5ff]/5 rounded-3xl p-10 border border-[#00e5ff]/10 text-center">
                 <h3 className="text-2xl font-black mb-8 underline decoration-[#00e5ff]/20">The <GradientText>Key Outcome</GradientText></h3>
                 <div className="grid sm:grid-cols-2 gap-6 max-w-[800px] mx-auto text-left">
                    {SWI_CONTENT.outcome.map((item, i) => (
                      <div key={i} className="flex gap-4 items-center bg-[#020617] p-4 rounded-xl border border-white/5">
                        <CheckCircle2 size={18} className="text-[#00e5ff]" />
                        <span className="text-sm font-bold text-white leading-tight">{item}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </Reveal>
          )}
        </div>

        {/* SIDEBAR STICKY CARD */}
        <div className="relative">
          <Reveal delay={0.4} className="sticky top-32">
            <Card className="!p-8 bg-[#020617] border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00e5ff] to-[#6366f1]"></div>

              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#475569] mb-4">Limited Seats Batch</h4>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-white">₹{course.price?.toLocaleString()}</span>
                <span className="text-[#475569] line-through text-sm">₹{Math.floor(course.price * 1.5).toLocaleString()}</span>
              </div>
              <p className="text-[10px] font-black text-[#00e5ff] uppercase tracking-widest mb-8">Special Early Bird Pricing</p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: <PlayCircle size={16} />, text: isSWI ? "2-Day Live Intensive Coaching" : "Lifetime Access to UHD Content" },
                  { icon: <Clock size={16} />, text: isSWI ? "7:00 PM - 9:00 PM IST" : "12+ Strategic Resource Documents" },
                  { icon: <Award size={16} />, text: "Verified Achievement Certificate" },
                  { icon: <ShieldCheck size={16} />, text: "Direct Practice & Real-time Feedback" },
                  { icon: <Zap size={16} />, text: "4 Core Coaching Frameworks" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-center text-sm text-[#cbd5f5] font-medium">
                    <span className="text-[#00e5ff]">{item.icon}</span>
                    <span className="leading-tight">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#ef4444]/5 p-4 rounded-xl border border-[#ef4444]/10 mb-6 text-center">
                 <p className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest animate-pulse">Low Seat Alert: Only 8 slots left</p>
              </div>

              <Button
                fullWidth size="lg"
                disabled={enrolling}
                className="h-14 font-black uppercase tracking-[0.2em] shadow-[0_10px_25px_#00e5ff30]"
                onClick={handleEnrollInitiation}
              >
                {enrolling ? "Processing..." : course.price === 0 ? "Enroll for Free" : "Secure Your Seat"}
              </Button>

              <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>

              <p className="text-[9px] text-center text-[#475569] font-black uppercase tracking-widest mt-6">
                🔒 Secure 256-bit SSL Enrollment
              </p>
            </Card>

            <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <h5 className="font-black text-xs uppercase tracking-widest text-[#cbd5f5] mb-4">Batch Logic</h5>
              <p className="text-xs text-[#94a3b8] mb-4 leading-relaxed">Small batches ensure high interaction and personalized attention from the mentor.</p>
              <button className="text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:text-white transition-colors">Request Group Training</button>
            </div>
          </Reveal>
        </div>
      </section>
      
      {/* DETAILS FORM MODAL */}
      <PaymentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onSubmit={processPayment}
        initialEmail={user?.email}
        courseTitle={course.title}
      />

      {/* Video Modal */}
      {showTrailer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" onClick={() => setShowTrailer(false)}></div>
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-3xl">
                <button 
                  onClick={() => setShowTrailer(false)}
                  className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    ✕
                </button>
                <iframe 
                    src={course.trailerUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"} 
                    className="w-full h-full"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
      )}
    </PageWrapper>
  );
}
