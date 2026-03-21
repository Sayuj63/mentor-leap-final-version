"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { AdminAPI } from "@/lib/admin-api";
import { Loader } from "@/components/ui/Loader";
import { Edit2, Trash2 } from "lucide-react";


export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "webinar",
    date: "",
    price: 0,
    speaker: "Mridu Bhandari",
    seats: 50,
    zoomLink: "",
    banner: "",
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await AdminAPI.getEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch events", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      let bannerUrl = formData.banner || "";
      if (bannerFile) {
        showToast("Uploading banner...", "success");
        const uploadRes = await AdminAPI.uploadMedia(bannerFile, "mentorleap/events");
        bannerUrl = uploadRes.url;
      }

      if (isEditMode && editingEventId) {
        await AdminAPI.updateEvent(editingEventId, { ...formData, banner: bannerUrl });
        showToast("Event updated successfully!", "success");
      } else {
        await AdminAPI.createEvent({ ...formData, banner: bannerUrl });
        showToast("Event created successfully!", "success");
      }

      setIsModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (event: any) => {
    setIsEditMode(true);
    setEditingEventId(event.id);
    // Format date for the input field (expects YYYY-MM-DD)
    let formattedDate = "";
    if (event.date) {
      const d = event.date._seconds ? new Date(event.date._seconds * 1000) : new Date(event.date);
      formattedDate = d.toISOString().split('T')[0];
    }

    setFormData({
      title: event.title || "",
      description: event.description || "",
      type: event.type || "webinar",
      date: formattedDate,
      price: event.price || 0,
      speaker: event.speaker || "Mridu Bhandari",
      seats: event.seats || 50,
      zoomLink: event.zoomLink || "",
      ...({ banner: event.banner } as any)
    });
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
        await AdminAPI.deleteEvent(id);
        showToast("Event deleted", "success");
        fetchEvents();
    } catch (error: any) {
        showToast(error.message, "error");
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", type: "webinar", date: "", price: 0, speaker: "Mridu Bhandari", seats: 50, zoomLink: "", banner: "" });
    setBannerFile(null);
    setIsEditMode(false);
    setEditingEventId(null);
  };



  const formatDate = (date: any) => {
    if (!date) return "N/A";
    if (date._seconds) return new Date(date._seconds * 1000).toLocaleDateString();
    try { return new Date(date).toLocaleDateString(); } catch { return "Invalid Date"; }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Live Events Manager</h1>
          <p className="text-[#94a3b8] text-sm uppercase font-bold tracking-widest">Schedule webinars, masterclasses, and bootcamps</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>+ Schedule New Event</Button>
      </div>


      {loading ? (
        <div className="flex justify-center p-20"><Loader /></div>
      ) : (
        <Card className="!p-0 overflow-hidden bg-white/[0.02] border-white/5" hoverable={false}>
          <table className="w-full text-left">
            <thead className="bg-[#0f172a] text-[#475569] text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
              <tr>
                <th className="px-8 py-5">Event Detail</th>
                <th className="px-8 py-5">Speaker & Seats</th>
                <th className="px-8 py-5">Schedule</th>
                <th className="px-8 py-5">Market Price</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-[#475569] italic">No active events in registry.</td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-8 py-6 border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0f172a] border border-white/10 overflow-hidden">
                          {event.banner ? <img src={event.banner} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🎙</div>}
                        </div>
                        <div>
                          <div className="font-bold text-white text-base leading-tight mb-1">{event.title}</div>
                          <div className="text-[10px] text-[#00e5ff] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#00e5ff]/10 rounded inline-block">{event.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 border-b border-white/5">
                      <div className="font-semibold text-white">{event.speaker || 'Mridu Bhandari'}</div>
                      <div className="text-xs text-[#94a3b8]">{event.seats || 0} Seats Maximum</div>
                    </td>
                    <td className="px-8 py-6 border-b border-white/5 text-[#cbd5f5] font-medium">{formatDate(event.date)}</td>
                    <td className="px-8 py-6 border-b border-white/5 font-mono text-[#00e5ff] font-bold">₹{event.price || 0}</td>
                    <td className="px-8 py-6 border-b border-white/5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(event.zoomLink, '_blank')}>Join</Button>
                        <button onClick={() => handleEditClick(event)} className="p-2.5 rounded-xl bg-white/5 text-[#94a3b8] hover:text-[#00e5ff] hover:bg-[#00e5ff]/10 transition-all border border-transparent hover:border-[#00e5ff]/20">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteEvent(event.id, event.title)} className="p-2.5 rounded-xl bg-white/5 text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={isEditMode ? "Update Platform Event" : "Initialize New Event"}>
        <form onSubmit={handleFormSubmit} className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">

          <Input label="Strategic Event Title" required placeholder="e.g. Mastering Executive Presence" value={formData.title} onChange={(e: any) => setFormData({ ...formData, title: e.target.value })} />
          <Textarea label="Event Briefing / Description" required placeholder="e.g. A comprehensive 90-minute session on high-stakes communication and storytelling..." value={formData.description} onChange={(e: any) => setFormData({ ...formData, description: e.target.value })} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Target Persona (Speaker)</label>
              <Input required placeholder="e.g. Mridu Bhandari" value={formData.speaker} onChange={(e: any) => setFormData({ ...formData, speaker: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Available Seats</label>
              <Input type="number" required placeholder="50" value={formData.seats} onChange={(e: any) => setFormData({ ...formData, seats: parseInt(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Event Date</label>
              <Input type="date" required value={formData.date} onChange={(e: any) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Price (INR)</label>
              <Input type="number" required placeholder="999" value={formData.price} onChange={(e: any) => setFormData({ ...formData, price: parseInt(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Event Classification</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#00e5ff]"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="webinar" className="bg-[#0f172a]">Webinar</option>
                <option value="masterclass" className="bg-[#0f172a]">Masterclass</option>
                <option value="bootcamp" className="bg-[#0f172a]">Bootcamp</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-[#475569] font-black uppercase tracking-widest pl-1">Session Branding (Banner)</label>
              <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-[#cbd5f5] file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer" />
            </div>
          </div>

          <Input label="Zoom Link" required placeholder="https://zoom.us/j/123456789" value={formData.zoomLink} onChange={(e: any) => setFormData({ ...formData, zoomLink: e.target.value })} />

          <Button fullWidth className="h-14 !mt-8 font-black uppercase tracking-[0.2em]" disabled={isSubmitting}>
            {isSubmitting ? (isEditMode ? "Synchronizing..." : "Deploying Asset...") : (isEditMode ? "Update Event" : "Schedule Event")}
          </Button>

        </form>
      </Modal>

      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}
