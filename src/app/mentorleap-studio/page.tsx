"use client";
import React, { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Reveal } from "@/components/ui/Animation";
import { SectionHeading, GradientText, Paragraph } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { fetchBlogs } from "@/lib/api";
import Link from "next/link";
import { PlayCircle } from "lucide-react";

export default function StudioPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const FALLBACK_BLOGS = [
    {
      id: "executive-presence-command-room",
      title: "Executive Presence: How to Command Any Room",
      category: "Leadership",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
      readTime: "6 Min Read"
    },
    {
      id: "pyramid-principle-leader",
      title: "The Pyramid Principle: Structuring Your Thoughts",
      category: "Communication",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
      readTime: "5 Min Read"
    },
    {
      id: "stage-fright-journalist",
      title: "Overcoming Stage Fright: A TV Journalist's View",
      category: "Public Speaking",
      image: "https://images.unsplash.com/photo-1475721027187-402ad2989a3b?w=800&q=80",
      readTime: "7 Min Read"
    }
  ];

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await fetchBlogs();
        setBlogs(data.length > 0 ? data : FALLBACK_BLOGS);
      } catch (err) {
        console.error(err);
        setBlogs(FALLBACK_BLOGS);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const featuredVideo = {
    title: "The Art of Storytelling in Business",
    category: "Featured Workshop",
    image: "https://marktaleevents.com/mentorleap/wp-content/uploads/2026/03/MriduBhandari_ProfilePic.jpg",
    duration: "12:45"
  };

  return (
    <PageWrapper>
      <section className="px-5 py-[120px] max-w-[1200px] mx-auto text-center z-10 relative">
        <Reveal>
          <SectionHeading>MentorLeap <GradientText>Studio</GradientText></SectionHeading>
          <Paragraph className="max-w-[700px] mx-auto mt-4 text-[#94a3b8]">
            A curation of masterclasses, expert interviews, and high-impact strategy sessions designed to bridge the clarity gap.
          </Paragraph>
        </Reveal>
      </section>

      <section className="px-5 pb-[120px] max-w-[1200px] mx-auto">
        {/* FEATURED CONTENT */}
        <Reveal>
          <div className="aspect-video w-full rounded-[40px] bg-[#0f172a] relative overflow-hidden group border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] mb-20">
            <img 
              src={featuredVideo.image} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" 
              alt={featuredVideo.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white/90 border border-white/20 group-hover:scale-110 group-hover:bg-[#00e5ff]/20 group-hover:border-[#00e5ff]/50 transition-all cursor-pointer shadow-2xl">
                <PlayCircle size={48} />
              </div>
            </div>

            <div className="absolute bottom-10 left-10 right-10">
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-3 py-1 rounded-full bg-[#00e5ff]/20 text-[#00e5ff] text-[10px] font-black uppercase tracking-widest">{featuredVideo.category}</span>
                 <span className="text-white/60 text-xs font-bold">{featuredVideo.duration} • Video Class</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight max-w-2xl">{featuredVideo.title}</h2>
            </div>
          </div>
        </Reveal>

        {/* ARTICLES SECTION */}
        <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
          <div>
            <h3 className="text-2xl font-black text-white">Latest Articles</h3>
            <p className="text-[#64748b] text-sm mt-1">Foundational insights for modern leadership.</p>
          </div>
          <Link href="/blog" className="text-[#00e5ff] text-xs font-black uppercase tracking-widest hover:underline underline-offset-8">Explore All</Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, i) => (
              <Reveal key={blog.id || i} delay={i * 0.1}>
                <Link href={`/blog/${blog.id}`}>
                  <Card className="h-full !p-0 bg-white/[0.02] border-white/5 hover:border-[#00e5ff]/30 transition-all group overflow-hidden border">
                    <div className="aspect-[16/10] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                      <img 
                        src={blog.image || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80"} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-8">
                      <div className="text-[#00e5ff] text-[10px] font-black uppercase tracking-widest mb-4">{blog.category || "Article"}</div>
                      <h4 className="text-xl font-bold text-white mb-4 leading-snug group-hover:text-[#00e5ff] transition-colors">{blog.title}</h4>
                      <div className="flex items-center gap-3 text-[#475569] text-[10px] font-black uppercase tracking-widest">
                        <span>{blog.readTime || "5 Min Read"}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span>Read Article</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </PageWrapper>
  );
}
