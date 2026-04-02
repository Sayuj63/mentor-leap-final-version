import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/services/blogService";
import { verifyAdmin } from "@/lib/auth-server";
import mammoth from "mammoth";

/**
 * Parse a .docx file containing multiple blogs separated by "BLOG X" markers.
 * Each blog section should have:
 * - "BLOG X" as a marker (h1 or bold text)
 * - Blog title as the next heading
 * - Content follows
 */
function parseBlogsFromHtml(html: string): Array<{ title: string; content: string }> {
    const blogs: Array<{ title: string; content: string }> = [];

    // Split by BLOG markers (e.g., "BLOG 1", "BLOG 2", etc.)
    // Match patterns like <h1>BLOG 1</h1> or <p><strong>BLOG 1</strong></p> or just BLOG 1
    const blogSections = html.split(/(?=<(?:h[1-6]|p)[^>]*>\s*(?:<[^>]+>)*\s*BLOG\s+\d+)/i);

    for (const section of blogSections) {
        const trimmed = section.trim();
        if (!trimmed) continue;

        // Check if this section starts with a BLOG marker
        const blogMarkerMatch = trimmed.match(/^<(?:h[1-6]|p)[^>]*>[\s\S]*?BLOG\s+\d+[\s\S]*?<\/(?:h[1-6]|p)>/i);
        if (!blogMarkerMatch) continue;

        // Remove the BLOG marker line
        let remaining = trimmed.slice(blogMarkerMatch[0].length).trim();

        // Extract the title - first heading or first bold text after the marker
        let title = "";
        const titleMatch = remaining.match(/^<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/i) ||
            remaining.match(/^<p[^>]*>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>/i);

        if (titleMatch) {
            // Get the text content of the title (strip HTML tags)
            title = (titleMatch[2] || titleMatch[1]).replace(/<[^>]+>/g, "").trim();
            remaining = remaining.slice(titleMatch[0].length).trim();
        }

        if (!title) continue;

        // The rest is the blog content - clean it up
        const content = remaining.trim();
        if (!content) continue;

        blogs.push({ title, content });
    }

    return blogs;
}

export async function POST(req: NextRequest) {
    try {
        await verifyAdmin(req);

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith(".docx")) {
            return NextResponse.json({ error: "Only .docx files are supported" }, { status: 400 });
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Parse .docx to HTML using mammoth
        const result = await mammoth.convertToHtml({ buffer }, {
            styleMap: [
                "p[style-name='Heading 1'] => h1:fresh",
                "p[style-name='Heading 2'] => h2:fresh",
                "p[style-name='Heading 3'] => h3:fresh",
                "p[style-name='Heading 4'] => h4:fresh",
                "p[style-name='Title'] => h1:fresh",
                "p[style-name='Subtitle'] => h2:fresh",
            ]
        });

        const html = result.value;

        // Parse into individual blogs
        const parsedBlogs = parseBlogsFromHtml(html);

        if (parsedBlogs.length === 0) {
            return NextResponse.json({
                error: "No blogs found in the document. Make sure each blog is preceded by a 'BLOG 1', 'BLOG 2', etc. marker.",
                rawHtml: html.substring(0, 2000), // Send first 2000 chars for debugging
            }, { status: 400 });
        }

        // Create all blogs
        const created = [];
        const errors = [];

        for (let i = 0; i < parsedBlogs.length; i++) {
            try {
                const blog = await BlogService.createBlog({
                    title: parsedBlogs[i].title,
                    content: parsedBlogs[i].content,
                    excerpt: stripHtml(parsedBlogs[i].content).substring(0, 200) + "...",
                    category: "Leadership",
                    author: "Mridu Bhandari",
                    readTime: estimateReadTime(parsedBlogs[i].content),
                    status: "published",
                    date: new Date().toISOString(),
                    image: "",
                } as any);
                created.push({ title: parsedBlogs[i].title, id: blog.id });
            } catch (err: any) {
                errors.push({ title: parsedBlogs[i].title, error: err.message });
            }
        }

        return NextResponse.json({
            message: `Successfully created ${created.length} blog posts`,
            created,
            errors,
            total: parsedBlogs.length,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: error.message.includes("Forbidden") ? 403 : 500 }
        );
    }
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function estimateReadTime(content: string): string {
    const words = stripHtml(content).split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} Min Read`;
}
