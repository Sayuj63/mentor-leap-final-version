"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { AdminAPI } from "@/lib/admin-api";
import { Loader } from "@/components/ui/Loader";
import { Toast } from "@/components/ui/Toast";
import { User, CreditCard, Calendar, Mail, Phone, Tag } from "lucide-react";

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await AdminAPI.getRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error(error);
      setToast({ show: true, message: "Failed to fetch registrations", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight text-white">Event Registrations</h1>
          <p className="text-[#94a3b8] text-[10px] md:text-sm uppercase font-bold tracking-widest italic">Monitor live enrollments and payment success</p>
        </div>
        <button 
          onClick={fetchRegistrations} 
          className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase transition-all border border-white/5"
        >
          Refresh Feed
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader /></div>
      ) : (
        <div className="grid gap-6">
          {registrations.length === 0 ? (
            <Card className="p-20 text-center text-[#475569] italic bg-white/5 border-white/5">No registrations found yet.</Card>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 <Card className="p-6 bg-emerald-500/10 border-emerald-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Total Revenue (Events)</p>
                    <h2 className="text-3xl font-black text-white">
                      {formatCurrency(registrations.reduce((acc, curr) => acc + (curr.amount || 0), 0))}
                    </h2>
                 </Card>
                 <Card className="p-6 bg-[#00e5ff]/10 border-[#00e5ff]/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#00e5ff] mb-2">Total Registrations</p>
                    <h2 className="text-3xl font-black text-white">{registrations.length}</h2>
                 </Card>
                 <Card className="p-6 bg-white/5 border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#475569] mb-2">Paid vs Free</p>
                    <h2 className="text-3xl font-black text-white">
                      {registrations.filter(r => (r.amount || 0) > 0).length} / {registrations.filter(r => (r.amount || 0) === 0).length}
                    </h2>
                 </Card>
              </div>

              <Card className="!p-0 bg-white/[0.02] border-white/5 relative overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left min-w-[1000px]">
                    <thead className="bg-[#0f172a] text-[#475569] text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                      <tr>
                        <th className="px-8 py-5">Registrant</th>
                        <th className="px-8 py-5">Event/Item</th>
                        <th className="px-8 py-5">Payment Status</th>
                        <th className="px-8 py-5">Amount Paid</th>
                        <th className="px-8 py-5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#94a3b8]">
                                <User size={20} />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm">{reg.userDetails?.fullName || "Guest User"}</h4>
                                <div className="flex items-center gap-3 text-[10px] text-[#475569] mt-1 font-medium">
                                   <span className="flex items-center gap-1"><Mail size={10} /> {reg.userDetails?.email || "No Email"}</span>
                                   <span className="flex items-center gap-1"><Phone size={10} /> {reg.userDetails?.phone || "No Phone"}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{reg.itemId?.split('-').join(' ')}</span>
                               <span className="text-[10px] font-black uppercase tracking-widest text-[#475569]">{reg.itemType}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              reg.paymentStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              <CreditCard size={12} />
                              {reg.paymentStatus}
                            </div>
                            <div className="text-[9px] text-[#475569] mt-2 ml-1">Via {reg.paymentGateway || 'Generic'}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-lg font-bold text-white">{formatCurrency(reg.amount || 0)}</div>
                            {reg.userDetails?.couponCode && (
                              <div className="flex items-center gap-1 text-[10px] text-[#00e5ff] font-black mt-1 uppercase tracking-widest">
                                <Tag size={10} /> {reg.userDetails.couponCode}
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-sm text-[#cbd5f5] font-medium">
                               <Calendar size={14} className="text-[#475569]" />
                               {new Date(reg.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-[10px] text-[#475569] mt-1 ml-6 uppercase font-bold tracking-widest">
                               {new Date(reg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      <Toast 
        isVisible={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
}
