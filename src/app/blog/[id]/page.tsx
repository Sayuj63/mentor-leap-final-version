"use client";
import React, { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Reveal } from "@/components/ui/Animation";
import { fetchBlogById } from "@/lib/api";
import { useParams } from "next/navigation";
import { Loader } from "@/components/ui/Loader";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

function formatContent(content: string): string {
    const isHtml = /<[a-z][\s\S]*>/i.test(content);

    if (!isHtml) {
        // Plain text or markdown — convert to HTML
        return content
            .split("\n")
            .map((line) => {
                const trimmed = line.trim();
                if (!trimmed) return "";
                if (trimmed.startsWith("### ")) return `<h3>${trimmed.slice(4)}</h3>`;
                if (trimmed.startsWith("## ")) return `<h2>${trimmed.slice(3)}</h2>`;
                if (trimmed.startsWith("# ")) return `<h1>${trimmed.slice(2)}</h1>`;
                const withBold = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                return `<p>${withBold}</p>`;
            })
            .join("\n");
    }

    // HTML content (from mammoth / bulk import)
    // Mammoth often outputs bold-only paragraphs for headings from Google Docs.
    // Detect short bold-only paragraphs and promote them to headings.
    let html = content;

    // Remove "Tab N" markers left over from Google Docs tab export
    html = html.replace(/<h[1-6][^>]*>\s*Tab\s+\d+\s*<\/h[1-6]>/gi, "");
    html = html.replace(/<p[^>]*>\s*(?:<strong>)?\s*Tab\s+\d+\s*(?:<\/strong>)?\s*<\/p>/gi, "");

    // Convert paragraphs that are entirely bold and short (< 120 chars) into h2
    // Pattern: <p><strong>Some Heading Text</strong></p>
    html = html.replace(
        /<p>\s*<strong>((?:(?!<\/strong>).)+)<\/strong>\s*<\/p>/gi,
        (match, inner) => {
            const text = inner.replace(/<[^>]+>/g, "").trim();
            // Only promote to heading if it's short enough to be a heading
            if (text.length <= 120 && !text.endsWith(".") && !text.endsWith(",")) {
                return `<h2>${inner}</h2>`;
            }
            return match;
        }
    );

    // Convert numbered bold starts like "<p><strong>1. Title</strong>..." to h3
    html = html.replace(
        /<p>\s*<strong>(\d+\.\s*[^<]{3,80})<\/strong>/gi,
        '<p><h3>$1</h3>'
    );

    // Detect list-like consecutive short paragraphs (no period at end) and wrap in ul/li
    // This handles lines like:
    //   <p>Remote visibility</p>
    //   <p>Digital leadership</p>
    //   <p>Virtual influence</p>

    return html;
}

export default function BlogPostPage() {
    const { id } = useParams();
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBlog = async () => {
            try {
                const data = await fetchBlogById(id as string);
                setBlog(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadBlog();
    }, [id]);

    if (loading) return (
        <PageWrapper>
            <div className="h-[60vh] flex items-center justify-center">
                <Loader />
            </div>
        </PageWrapper>
    );

    if (!blog) return (
        <PageWrapper>
            <div className="px-5 py-[120px] max-w-[800px] mx-auto text-center">
                <h1 className="text-3xl font-bold mb-6 text-white">Insight Not Found</h1>
                <p className="text-[#94a3b8] mb-10 text-lg italic tracking-tight">The editorial asset you're looking for might have been archived or moved.</p>
                <Link href="/blog">
                    <button className="px-8 py-3 bg-[#00e5ff] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white transition-colors">
                        Return to Hub
                    </button>
                </Link>
            </div>
        </PageWrapper>
    );

    return (
        <PageWrapper>
            <article className="px-5 py-[100px] max-w-[900px] mx-auto z-10 relative">
                <Link href="/blog" className="inline-flex items-center gap-2 text-[#475569] hover:text-[#00e5ff] text-xs font-black uppercase tracking-widest mb-12 transition-colors group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Insights
                </Link>

                <Reveal>
                    <div className="text-[#00e5ff] text-sm font-black uppercase tracking-[0.2em] mb-4 text-center">{blog.category || 'Strategic Insight'}</div>
                    <h1 className="text-4xl md:text-6xl font-black mb-8 text-center leading-[1.1] tracking-tight">{blog.title}</h1>
                    
                    <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-8 mb-16 text-[10px] sm:text-xs text-[#475569] font-black uppercase tracking-widest border-y border-white/5 py-6">
                        <div className="flex items-center gap-2">
                            <User size={14} className="text-[#00e5ff]" />
                            <span className="text-white">{blog.author || 'Mridu Bhandari'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#00e5ff]" />
                            <span>{blog.date ? new Date(blog.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' }) : 'March 12, 2026'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-[#00e5ff]" />
                            <span>{blog.readTime || '5 Min Read'}</span>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.2}>
                    {blog.image && (
                        <div className="aspect-video w-full rounded-[40px] overflow-hidden mb-16 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                            <img src={blog.image} className="w-full h-full object-cover" alt={blog.title} />
                        </div>
                    )}
                    
                    <div
                        className="blog-content max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatContent(blog.content) }}
                    />
                </Reveal>

                {/* CTAs or Footer for Blog */}
                <div className="mt-24 p-12 rounded-[40px] bg-white/[0.02] border border-white/10 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff05] blur-3xl -mr-32 -mt-32 rounded-full"></div>
                    <h3 className="text-2xl font-black text-white mb-4 relative z-10 tracking-tight">Ready to master your communication?</h3>
                    <p className="text-[#64748b] mb-8 relative z-10 max-w-xl mx-auto italic text-lg leading-relaxed">Join my upcoming immersive bootcamp and transform the way you speak, influence, and lead.</p>
                    <Link href="/events/speak-with-impact-bootcamp">
                        <button className="px-10 py-5 bg-[#00e5ff] text-black font-black uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white hover:scale-105 transition-all shadow-[0_20px_40px_rgba(0,229,255,0.2)] relative z-10">
                            Secure Your Seat
                        </button>
                    </Link>
                </div>
            </article>
        </PageWrapper>
    );
}
