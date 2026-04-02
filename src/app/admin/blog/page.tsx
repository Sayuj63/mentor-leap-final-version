"use client";
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { AdminAPI } from "@/lib/admin-api";
import { Loader } from "@/components/ui/Loader";
import { Edit2, Trash2, FileText, Calendar, User, Upload } from "lucide-react";

export default function AdminBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Leadership",
    author: "Mridu Bhandari",
    readTime: "5 Min Read",
    status: "published"
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await AdminAPI.getBlogPosts();
      setPosts(data);
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch blog posts", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      let imageUrl = "";
      if (imageFile) {
        showToast("Uploading featured image...", "success");
        const uploadRes = await AdminAPI.uploadMedia(imageFile, "mentorleap/blog");
        imageUrl = uploadRes.url;
      }

      await AdminAPI.createBlogPost({ ...formData, image: imageUrl, date: new Date().toISOString() });
      showToast("Article published successfully!", "success");
      setIsModalOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    try {
      setIsSubmitting(true);
      await AdminAPI.updateBlogPost(editingPost.id, formData);
      showToast("Article updated", "success");
      setIsEditModalOpen(false);
      fetchPosts();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Permanently trash "${title}"?`)) return;
    try {
      await AdminAPI.deleteBlogPost(id);
      setPosts(posts.filter(p => p.id !== id));
      showToast("Article moved to trash", "success");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    try {
      setIsBulkUploading(true);
      setBulkResult(null);
      showToast("Processing document...", "success");
      const result = await AdminAPI.bulkUploadBlogs(bulkFile);
      setBulkResult(result);
      showToast(`${result.created?.length || 0} articles imported successfully!`, "success");
      fetchPosts();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsBulkUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "Leadership",
      author: "Mridu Bhandari",
      readTime: "5 Min Read",
      status: "published"
    });
    setImageFile(null);
    setEditingPost(null);
  };

  const openEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt || post.description,
      content: post.content || "",
      category: post.category || "Leadership",
      author: post.author || "Mridu Bhandari",
      readTime: post.readTime || "5 Min Read",
      status: post.status || "published"
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0"><FileText size={18} /></div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Editorial Hub</h1>
          </div>
          <p className="text-[#475569] font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] ml-0 md:ml-11">Article & Newsletter Management</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button onClick={() => { setBulkFile(null); setBulkResult(null); setIsBulkModalOpen(true); }} className="w-full sm:w-auto !bg-white/5 !text-white hover:!bg-white/10 flex items-center gap-2">
            <Upload size={16} /> Bulk Import
          </Button>
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="w-full sm:w-auto">+ Draft New Post</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader /></div>
      ) : (
        <Card className="!p-0 bg-white/[0.02] border-white/5 shadow-2xl relative overflow-hidden" hoverable={false}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[800px]">
            <thead className="bg-[#0f172a] text-[#475569] text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
              <tr>
                <th className="px-8 py-5">Article Content</th>
                <th className="px-8 py-5">Author & Metadata</th>
                <th className="px-8 py-5 center">Lifecycle</th>
                <th className="px-8 py-5 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {posts.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-8 py-20 text-center text-[#475569] italic">No published articles found. Start drafting!</td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0">
                    <td className="px-8 py-6 max-w-md">
                      <div className="font-bold text-white text-base truncate mb-1">{post.title}</div>
                      <p className="text-[10px] text-[#475569] font-bold uppercase tracking-widest">{post.category}</p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-[#cbd5f5]">
                             <User size={12} className="text-[#475569]" /> {post.author || 'Mridu Bhandari'}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#475569] font-bold">
                             <Calendar size={12} /> {post.date ? new Date(post.date).toLocaleDateString() : 'N/A'}
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${post.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-[#94a3b8] border-white/10'}`}>
                          {post.status || 'draft'}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(post)} className="p-2.5 rounded-xl bg-white/5 text-[#94a3b8] hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 transition-all border border-transparent hover:border-[#00e5ff]/20">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(post.id, post.title)} className="p-2.5 rounded-xl bg-white/5 text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title="Draft Strategic Insight">
        <form onSubmit={handleCreate} className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <Input label="Article Headline" required value={formData.title} onChange={(e: any) => setFormData({ ...formData, title: e.target.value })} />
          <Textarea label="Article Brief / Excerpt" required value={formData.excerpt} onChange={(e: any) => setFormData({ ...formData, excerpt: e.target.value })} />
          <Textarea label="Full Editorial Content (supports HTML & Markdown headings)" required value={formData.content} onChange={(e: any) => setFormData({ ...formData, content: e.target.value })} className="min-h-[200px]" />

          <div className="grid grid-cols-2 gap-4">
             <Input label="Classification (Category)" value={formData.category} onChange={(e: any) => setFormData({ ...formData, category: e.target.value })} />
             <Input label="Read Time Estimation" value={formData.readTime} onChange={(e: any) => setFormData({ ...formData, readTime: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Featured Imagery</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-[#cbd5f5] file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer" />
          </div>

          <Button fullWidth className="h-14 !mt-8 font-black uppercase tracking-[0.2em]" disabled={isSubmitting}>
            {isSubmitting ? "Syncing with CDN..." : "Deploy to Feed"}
          </Button>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => !isSubmitting && setIsEditModalOpen(false)} title="Update Editorial Asset">
        <form onSubmit={handleUpdate} className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <Input label="Update Headline" required value={formData.title} onChange={(e: any) => setFormData({ ...formData, title: e.target.value })} />
          <Textarea label="Update Brief" required value={formData.excerpt} onChange={(e: any) => setFormData({ ...formData, excerpt: e.target.value })} />
          <Textarea label="Update Content" required value={formData.content} onChange={(e: any) => setFormData({ ...formData, content: e.target.value })} className="min-h-[200px]" />
          
          <Button fullWidth className="h-14 !mt-8 font-black uppercase tracking-[0.2em]" disabled={isSubmitting}>
            {isSubmitting ? "Synchronizing Asset..." : "Commit Article Updates"}
          </Button>
        </form>
      </Modal>

      {/* BULK UPLOAD MODAL */}
      <Modal isOpen={isBulkModalOpen} onClose={() => !isBulkUploading && setIsBulkModalOpen(false)} title="Bulk Import Articles">
        <div className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h4 className="text-sm font-bold text-white mb-3">How to prepare your document</h4>
            <ol className="text-xs text-[#94a3b8] space-y-2 list-decimal list-inside">
              <li>Open your Google Doc with all blog tabs</li>
              <li>Copy all tabs into a single document</li>
              <li>Each blog should start with a <strong className="text-white">BLOG 1</strong>, <strong className="text-white">BLOG 2</strong>, etc. marker</li>
              <li>The blog title should be the heading right after the marker</li>
              <li>Download as <strong className="text-white">.docx</strong> format</li>
            </ol>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Upload .docx File</label>
            <input
              type="file"
              accept=".docx"
              onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-[#cbd5f5] file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
            />
          </div>

          {bulkFile && (
            <p className="text-xs text-[#94a3b8]">Selected: <span className="text-white font-bold">{bulkFile.name}</span></p>
          )}

          {bulkResult && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-sm font-bold text-green-400 mb-2">{bulkResult.message}</p>
              {bulkResult.created?.length > 0 && (
                <ul className="text-xs text-[#94a3b8] space-y-1">
                  {bulkResult.created.map((b: any, i: number) => (
                    <li key={i} className="truncate">&#10003; {b.title}</li>
                  ))}
                </ul>
              )}
              {bulkResult.errors?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-red-400 font-bold mb-1">Errors:</p>
                  {bulkResult.errors.map((e: any, i: number) => (
                    <p key={i} className="text-xs text-red-300">{e.title}: {e.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            fullWidth
            className="h-14 !mt-8 font-black uppercase tracking-[0.2em]"
            disabled={!bulkFile || isBulkUploading}
            onClick={handleBulkUpload}
          >
            {isBulkUploading ? "Importing Articles..." : `Import from Document`}
          </Button>
        </div>
      </Modal>

      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}
