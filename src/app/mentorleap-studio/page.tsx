"use client";
import PageWrapper from "@/components/layout/PageWrapper";
import { Reveal } from "@/components/ui/Animation";
import { SectionHeading, GradientText, Paragraph } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function StudioPage() {
  return (
    <PageWrapper>
      <section className="px-5 py-[100px] max-w-[1200px] mx-auto text-center">
        <Reveal>
          <SectionHeading>MentorLeap <GradientText>Studio</GradientText></SectionHeading>
          <Paragraph className="max-w-[600px] mx-auto mt-4">Exclusive interviews, video talks, and behind-the-scenes insights featuring top industry leaders.</Paragraph>
        </Reveal>
      </section>

      <section className="px-5 pb-[140px] max-w-[1200px] mx-auto">
        <Reveal>
          <div className="aspect-video w-full rounded-3xl bg-[#0f172a] flex items-center justify-center mb-16 relative overflow-hidden group border border-white/10">
            <div className="absolute inset-0 bg-[url('https://marktaleevents.com/mentorleap/wp-content/uploads/2026/03/MriduBhandari_ProfilePic.jpg')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl group-hover:scale-110 group-hover:bg-[#00e5ff]/20 transition-all cursor-pointer z-10 shadow-2xl">▶</div>
            <div className="absolute bottom-10 left-10 z-10">
               <div className="text-[#00e5ff] font-bold text-sm tracking-wider uppercase mb-2">Featured Interview</div>
               <h2 className="text-4xl font-bold">The Art of Storytelling in Tech</h2>
            </div>
          </div>
        </Reveal>

        <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-white/5">
          <p className="text-[#94a3b8] italic text-lg mb-2">New content coming soon.</p>
          <p className="text-[#475569] text-sm">We are producing exclusive video talks and interviews. Stay tuned!</p>
        </div>
      </section>
    </PageWrapper>
  );
}
