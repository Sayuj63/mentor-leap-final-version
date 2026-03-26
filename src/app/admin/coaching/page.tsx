"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { AdminAPI } from "@/lib/admin-api";
import { Loader } from "@/components/ui/Loader";
import { Mail, Phone, Calendar as CalendarIcon, CheckCircle, Clock, XCircle, Trash2 } from "lucide-react";

export default function AdminCoaching() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await AdminAPI.getCoachingRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setIsSubmitting(true);
      await AdminAPI.updateCoachingRequestStatus(id, newStatus);
      showToast(`Status updated to ${newStatus}`, "success");
      fetchRequests();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the request from ${name}?`)) return;
    try {
        const headers = { "Content-Type": "application/json" }; // AdminAPI needs a deleteCoachingRequest method too
        // Adding it to AdminAPI inline or using fetch directly
        const res = await fetch(`/api/admin/coaching-requests/${id}`, { 
            method: "DELETE",
            headers: await (AdminAPI as any).getHeaders?.() || {}
        });
        if (!res.ok) throw new Error("Delete failed");
        showToast("Request deleted", "success");
        fetchRequests();
    } catch (error: any) {
        showToast(error.message, "error");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle size={14} className="text-green-400" />;
      case "scheduled": return <Clock size={14} className="text-blue-400" />;
      case "cancelled": return <XCircle size={14} className="text-red-400" />;
      default: return <Clock size={14} className="text-amber-400" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Executive Coaching Leads</h1>
          <p className="text-[#94a3b8] text-[10px] md:text-sm uppercase font-bold tracking-widest">Manage discovery calls and 1:1 mentorship requests</p>
        </div>
        <Button onClick={fetchRequests} variant="outline" disabled={loading} className="w-full sm:w-auto">Refresh List</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader /></div>
      ) : (
        <div className="grid gap-6">
          {requests.length === 0 ? (
            <Card className="p-20 text-center text-[#475569] italic">No coaching requests found.</Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="relative bg-white/[0.02] border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">{request.name}</h3>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                        request.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        request.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        request.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {getStatusIcon(request.status)}
                        {request.status || 'pending'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#cbd5f5]">
                      <div className="flex items-center gap-2"><Mail size={14} className="text-[#475569]" /> {request.email}</div>
                      <div className="flex items-center gap-2"><Phone size={14} className="text-[#475569]" /> {request.phone}</div>
                      <div className="flex items-center gap-2"><CalendarIcon size={14} className="text-[#475569]" /> {request.date}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                      <p className="text-[10px] font-black text-[#475569] uppercase tracking-widest mb-1">Primary Coaching Goal</p>
                      <p className="text-sm text-[#94a3b8] italic">"{request.goal}"</p>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8 min-w-[160px]">
                    <p className="text-[10px] font-black text-[#475569] uppercase tracking-widest mb-2 hidden md:block text-center">Update Status</p>
                    <button onClick={() => handleStatusUpdate(request.id, 'scheduled')} className="flex-1 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase transition-all hover:bg-blue-500/20">Schedule</button>
                    <button onClick={() => handleStatusUpdate(request.id, 'completed')} className="flex-1 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-bold uppercase transition-all hover:bg-green-500/20">Complete</button>
                    <button onClick={() => handleStatusUpdate(request.id, 'cancelled')} className="flex-1 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold uppercase transition-all hover:bg-red-500/20">Cancel</button>
                    <button onClick={() => handleDeleteRequest(request.id, request.name)} className="px-4 py-2 text-[#475569] hover:text-red-400 transition-colors flex items-center justify-center gap-2 text-[10px] font-bold uppercase mt-2">
                        <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </Card>
            ) )
          )}
        </div>
      )}

      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}
