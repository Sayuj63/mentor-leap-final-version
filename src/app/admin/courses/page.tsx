"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { AdminAPI } from "@/lib/admin-api";
import { Course } from "@/models/Course";
import { Loader } from "@/components/ui/Loader";
import { Edit2, Trash2, History as HistoryIcon, BookOpen, Plus, Trash, ChevronDown, ChevronUp } from "lucide-react";

const difficulties = ["Beginner", "Intermediate", "Advanced", "Expert"];
const statuses = ["draft", "published", "archived"];

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: number;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}


export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyTarget, setHistoryTarget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [managingCourse, setManagingCourse] = useState<Course | null>(null);
  const [courseModules, setCourseModules] = useState<Module[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });


  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    instructor: "Mridu Bhandari",
    price: 0,
    category: "",
    difficulty: "Beginner",
    duration: "10 Hours",
    status: "published"
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [coursesData, categoriesData] = await Promise.all([
        AdminAPI.getCourses(),
        AdminAPI.getCategories()
      ]);
      setCourses(coursesData);
      setDbCategories(categoriesData);
      if (categoriesData.length > 0) {
        setFormData((prev: any) => ({ ...prev, category: categoriesData[0].name }));
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch curriculum data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (id: string, title: string) => {
    try {
      setHistoryTarget(title);
      setHistoryData([]);
      setIsHistoryModalOpen(true);
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/revisions?id=${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setHistoryData(data);
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch history", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnail) return showToast("Please upload a thumbnail", "error");

    try {
      setIsSubmitting(true);
      showToast("Uploading thumbnail...", "success");
      const uploadRes = await AdminAPI.uploadMedia(thumbnail, "mentorleap/courses");
      const thumbnailUrl = uploadRes.url;

      const courseData = {
        ...formData,
        thumbnail: thumbnailUrl,
        modules: [],
      };

      await AdminAPI.createCourse(courseData);
      showToast("Course created successfully!", "success");
      setIsModalOpen(false);
      resetForm();
      fetchInitialData();
    } catch (error: any) {
      showToast(error.message || "Failed to create course", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      setIsSubmitting(true);
      let thumbnailUrl = editingCourse.thumbnail;

      if (thumbnail) {
        showToast("Uploading new thumbnail...", "success");
        const uploadRes = await AdminAPI.uploadMedia(thumbnail, "mentorleap/courses");
        thumbnailUrl = uploadRes.url;
      }

      const updateData = {
        ...formData,
        thumbnail: thumbnailUrl
      };

      await AdminAPI.updateCourse(editingCourse.id!, updateData);
      showToast("Course updated successfully!", "success");
      setIsEditModalOpen(false);
      fetchInitialData();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Permanently delete ${title}?`)) return;
    try {
      await AdminAPI.deleteCourse(id);
      setCourses(courses.filter(c => c.id !== id));
      showToast("Course deleted", "success");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructor: "Mridu Bhandari",
      price: 0,
      category: dbCategories[0]?.name || "",
      difficulty: "Beginner",
      duration: "10 Hours",
      status: "published"
    });
    setThumbnail(null);
    setEditingCourse(null);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      price: course.price,
      category: course.category,
      difficulty: course.difficulty || "Beginner",
      duration: course.duration || "10 Hours",
      status: course.status || "published"
    });
    setIsEditModalOpen(true);
  };

  const openContentEditor = (course: Course) => {
    setManagingCourse(course);
    setCourseModules(course.modules || []);
    setIsContentModalOpen(true);
  };

  const handleSaveContent = async () => {
    if (!managingCourse) return;
    try {
      setIsSubmitting(true);
      await AdminAPI.updateCourse(managingCourse.id!, { modules: courseModules });
      showToast("Curriculum updated successfully", "success");
      setIsContentModalOpen(false);
      fetchInitialData();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: `mod_${Date.now()}`,
      title: "New Module",
      lessons: []
    };
    setCourseModules([...courseModules, newModule]);
  };

  const updateModuleTitle = (modId: string, title: string) => {
    setCourseModules(courseModules.map(m => m.id === modId ? { ...m, title } : m));
  };

  const removeModule = (modId: string) => {
    setCourseModules(courseModules.filter(m => m.id !== modId));
  };

  const addLesson = (modId: string) => {
    setCourseModules(courseModules.map(m => {
      if (m.id === modId) {
        const newLesson: Lesson = {
          id: `les_${Date.now()}`,
          title: "New Lesson",
          videoUrl: "",
          duration: 10
        };
        return { ...m, lessons: [...m.lessons, newLesson] };
      }
      return m;
    }));
  };

  const updateLesson = (modId: string, lessonId: string, data: Partial<Lesson>) => {
    setCourseModules(courseModules.map(m => {
      if (m.id === modId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...data } : l)
        };
      }
      return m;
    }));
  };

  const removeLesson = (modId: string, lessonId: string) => {
    setCourseModules(courseModules.map(m => {
      if (m.id === modId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
      }
      return m;
    }));
  };


  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-2">Curriculum Control</h1>
          <p className="text-[#94a3b8] text-[10px] md:text-sm uppercase font-bold tracking-widest">{courses.length} Courses across {dbCategories.length} Professional Categories</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row gap-2 bg-white/5 p-2 sm:p-1 rounded-xl border border-white/10 flex-1 lg:flex-none">
            <select
              className="bg-transparent text-xs text-[#cbd5f5] px-3 py-2 outline-none border-b sm:border-b-0 sm:border-r border-white/10"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {dbCategories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <input
              placeholder="Search database..."
              className="bg-transparent rounded-lg px-4 py-2 text-xs text-white outline-none focus:text-[#00e5ff] transition-all w-full sm:w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="w-full sm:w-auto">+ Initialize Course</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader /></div>
      ) : (
        <Card className="!p-0 bg-white/[0.02] border-white/5 shadow-2xl relative overflow-hidden" hoverable={false}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[900px]">
            <thead className="bg-[#0f172a] text-[#475569] text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
              <tr>
                <th className="px-8 py-5">Course Detail</th>
                <th className="px-8 py-5">Difficulty</th>
                <th className="px-8 py-5">Market Price</th>
                <th className="px-8 py-5">Lifecycle</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-[#475569] italic font-medium">No results found in current registry.</td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-8 py-6 border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0f172a] border border-white/10 overflow-hidden flex-shrink-0 shadow-inner">
                          {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-all" />}
                        </div>
                        <div>
                          <div className="font-bold text-white text-base leading-tight mb-0.5">{course.title}</div>
                          <div className="text-[10px] text-[#475569] font-bold uppercase tracking-widest">{course.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-b border-white/5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${course.difficulty === 'Expert' ? 'text-red-400 bg-red-400/10' :
                        course.difficulty === 'Advanced' ? 'text-amber-400 bg-amber-400/10' :
                          course.difficulty === 'Intermediate' ? 'text-blue-400 bg-blue-400/10' :
                            'text-green-400 bg-green-400/10'
                        }`}>
                        {course.difficulty || 'Beginner'}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-b border-white/5 font-mono text-[#00e5ff] font-bold">₹{course.price.toLocaleString()}</td>
                    <td className="px-8 py-6 border-b border-white/5">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${course.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        course.status === 'archived' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-white/5 text-[#94a3b8] border-white/10'
                        }`}>
                        {course.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-8 py-6 border-b border-white/5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button onClick={() => fetchHistory(course.id!, course.title)} className="p-2.5 rounded-xl bg-white/5 text-[#94a3b8] hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 transition-all border border-transparent hover:border-[#00e5ff]/20" title="Revision History">
                          <HistoryIcon size={16} />
                        </button>
                        <button onClick={() => openContentEditor(course)} className="p-2.5 rounded-xl bg-white/5 text-[#94a3b8] hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 transition-all border border-transparent hover:border-[#00e5ff]/20" title="Manage Curriculum">
                          <BookOpen size={16} />
                        </button>
                        <button onClick={() => openEdit(course)} className="p-2.5 rounded-xl bg-white/5 text-[#94a3b8] hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 transition-all border border-transparent hover:border-[#00e5ff]/20" title="Edit Properties">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteCourse(course.id!, course.title)} className="p-2.5 rounded-xl bg-white/5 text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20" title="Delete Course">
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

      {/* REVISION HISTORY MODAL */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={`Revision History: ${historyTarget}`}>
        <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {historyData.length === 0 ? (
            <div className="text-center py-10 text-[#475569] italic">No revisions found for this asset.</div>
          ) : (
            historyData.map((rev, i) => (
              <div key={rev.id} className="p-4 rounded-xl bg-white/5 border border-white/5 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] flex items-center justify-center text-[10px] font-bold">{historyData.length - i}</div>
                  <div>
                    <div className="text-xs font-bold text-white">System Synchronized</div>
                    <div className="text-[10px] text-[#475569] font-medium">
                      {rev.timestamp ? new Date(rev.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] bg-black/20 p-2 rounded border border-white/5 text-[#94a3b8] font-mono leading-relaxed">
                  Authorized by Administrator (UID: ...{rev.adminUid?.slice(-6)})
                </div>
              </div>
            ))
          )}
        </div>
        <Button fullWidth className="mt-8" variant="outline" onClick={() => setIsHistoryModalOpen(false)}>Close Archive</Button>
      </Modal>

      {/* CREATE MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title="Initialize New Course">
        <form onSubmit={handleCreateCourse} className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <Input label="Course Strategic Title" required value={formData.title} onChange={(e: any) => setFormData({ ...formData, title: e.target.value })} />
          <Textarea label="Executive Curriculum Summary" required value={formData.description} onChange={(e: any) => setFormData({ ...formData, description: e.target.value })} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Target Category</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00e5ff]"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {dbCategories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Difficulty Tier</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00e5ff]"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Price (INR)" type="number" required value={formData.price} onChange={(e: any) => setFormData({ ...formData, price: parseInt(e.target.value) })} />
            <Input label="Duration" placeholder="e.g. 15 Hours" required value={formData.duration} onChange={(e: any) => setFormData({ ...formData, duration: e.target.value })} />
            <div className="space-y-2">
              <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Status</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00e5ff]"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Course Thumbnail</label>
            <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-[#cbd5f5] file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer" />
          </div>

          <Button fullWidth className="h-14 !mt-8 font-black uppercase tracking-[0.2em]" disabled={isSubmitting}>
            {isSubmitting ? "Processing Asset..." : "Deploy to Curriculum"}
          </Button>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => !isSubmitting && setIsEditModalOpen(false)} title="Update Live Curriculum">
        <form onSubmit={handleUpdateCourse} className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <Input label="Update Strategic Title" required value={formData.title} onChange={(e: any) => setFormData({ ...formData, title: e.target.value })} />
          <Textarea label="Update Summary" required value={formData.description} onChange={(e: any) => setFormData({ ...formData, description: e.target.value })} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Update Category</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00e5ff]"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {dbCategories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Difficulty Adjustment</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00e5ff]"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Update Price" type="number" required value={formData.price} onChange={(e: any) => setFormData({ ...formData, price: parseInt(e.target.value) })} />
            <Input label="Update Duration" required value={formData.duration} onChange={(e: any) => setFormData({ ...formData, duration: e.target.value })} />
            <div className="space-y-2">
              <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Live Status</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00e5ff]"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Update Thumbnail (Optional)</label>
            {editingCourse?.thumbnail && !thumbnail && (
              <div className="mb-2 w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                <img src={editingCourse.thumbnail} alt="Current" className="w-full h-full object-cover" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-[#cbd5f5] file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer" />
          </div>

          <Button fullWidth className="h-14 !mt-8 font-black uppercase tracking-[0.2em]" disabled={isSubmitting}>
            {isSubmitting ? "Synchronizing Changes..." : "Commit Asset Updates"}
          </Button>
        </form>
      </Modal>

      {/* CURRICULUM EDITOR MODAL */}
      <Modal isOpen={isContentModalOpen} onClose={() => !isSubmitting && setIsContentModalOpen(false)} title={`Manage Curriculum: ${managingCourse?.title}`}>
        <div className="space-y-8 pt-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          {courseModules.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-[#475569] text-sm mb-4 italic">No modules initialized for this course.</p>
              <Button variant="outline" onClick={addModule}>+ Initialize First Module</Button>
            </div>
          )}

          {courseModules.map((mod, modIdx) => (
            <div key={mod.id} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">{modIdx + 1}</div>
                <input
                  className="flex-1 bg-transparent border-none text-white font-bold text-lg outline-none focus:text-[#00e5ff]"
                  value={mod.title}
                  onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                  placeholder="Module Title..."
                />
                <button onClick={() => removeModule(mod.id)} className="p-2 text-[#475569] hover:text-red-400 transition-colors">
                  <Trash size={16} />
                </button>
              </div>

              <div className="pl-12 space-y-3">
                {mod.lessons.map((lesson, lesIdx) => (
                  <div key={lesson.id} className="flex flex-col gap-3 p-4 rounded-2xl bg-black/20 border border-white/5 group">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-[#475569]">{lesIdx + 1}.</span>
                      <input
                        className="flex-1 bg-transparent border-none text-white text-sm font-semibold outline-none focus:text-[#00e5ff]"
                        value={lesson.title}
                        onChange={(e) => updateLesson(mod.id, lesson.id, { title: e.target.value })}
                        placeholder="Lesson Title..."
                      />
                      <button onClick={() => removeLesson(mod.id, lesson.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[#475569] hover:text-red-400 transition-all">
                        <Trash size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-[1fr_100px] gap-3">
                      <input
                        className="bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-[#cbd5f5] outline-none focus:border-[#00e5ff]/30"
                        value={lesson.videoUrl}
                        onChange={(e) => updateLesson(mod.id, lesson.id, { videoUrl: e.target.value })}
                        placeholder="Video URL (Cloudinary index or Direct Link)"
                      />
                      <div className="relative">
                         <input
                           type="number"
                           className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-[#cbd5f5] outline-none focus:border-[#00e5ff]/30 pr-8"
                           value={lesson.duration}
                           onChange={(e) => updateLesson(mod.id, lesson.id, { duration: parseInt(e.target.value) || 0 })}
                         />
                         <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#475569] font-bold">m</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addLesson(mod.id)}
                  className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-[10px] font-black uppercase tracking-widest text-[#475569] hover:text-[#00e5ff] hover:border-[#00e5ff]/30 transition-all"
                >
                  + Add Lesson to Module
                </button>
              </div>
            </div>
          ))}

          {courseModules.length > 0 && (
            <Button fullWidth variant="outline" onClick={addModule}>+ Add New Module</Button>
          )}

          <Button fullWidth className="h-14 !mt-12 font-black uppercase tracking-[0.2em]" disabled={isSubmitting} onClick={handleSaveContent}>
            {isSubmitting ? "Deploying Curriculum..." : "Commit Curriculum Changes"}
          </Button>
        </div>
      </Modal>


      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}
