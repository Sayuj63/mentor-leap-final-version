"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { AdminAPI } from "@/lib/admin-api";
import { Shield, Users, BookOpen, Wallet, Calendar, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load stats");
      }
      const data = await res.json();
      setStats(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center p-20"><Loader /></div>;

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-10">
        <div className="flex items-center gap-4 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertTriangle size={24} />
          <div>
            <div className="font-bold">Failed to load admin stats</div>
            <div className="text-sm opacity-70 mt-1">{error}</div>
          </div>
          <button
            onClick={fetchStats}
            className="ml-auto px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-sm font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const revenueFormatted = stats?.revenue
    ? `₹${stats.revenue.toLocaleString("en-IN")}`
    : "₹0";

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#00e5ff]/10 rounded-xl md:rounded-2xl flex items-center justify-center text-[#00e5ff] flex-shrink-0">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Command Center</h1>
          <p className="text-[#94a3b8] text-xs md:text-sm">Real-time platform operations & metrics.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <Card className="!p-6 border-white/5 bg-white/[0.02] hover:border-[#00e5ff]/20 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-bold text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded">Live</span>
          </div>
          <div className="text-sm text-[#94a3b8] font-medium tracking-tight">Total Student Base</div>
          <div className="text-3xl font-black mt-1">{(stats?.users || 0).toLocaleString()}</div>
        </Card>

        <Card className="!p-6 border-white/5 bg-white/[0.02] hover:border-purple-500/20 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
              <BookOpen size={20} />
            </div>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Active</span>
          </div>
          <div className="text-sm text-[#94a3b8] font-medium tracking-tight">Active Curriculum</div>
          <div className="text-3xl font-black mt-1">{(stats?.courses || 0).toLocaleString()}</div>
        </Card>

        <Card className="!p-6 border-white/5 bg-white/[0.02] hover:border-emerald-500/20 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
              <Wallet size={20} />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              <TrendingUp size={10} className="inline mr-0.5" />
              Live
            </span>
          </div>
          <div className="text-sm text-[#94a3b8] font-medium tracking-tight">Gross Revenue</div>
          <div className="text-3xl font-black mt-1 text-emerald-400">{revenueFormatted}</div>
        </Card>

        <Card className="!p-6 border-white/5 bg-white/[0.02] hover:border-orange-500/20 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:bg-orange-500/20 transition-all">
              <Calendar size={20} />
            </div>
            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
              {stats?.events || 0} Events
            </span>
          </div>
          <div className="text-sm text-[#94a3b8] font-medium tracking-tight">Total Registrations</div>
          <div className="text-3xl font-black mt-1">{(stats?.pendingRegistrations || 0).toLocaleString()}</div>
        </Card>
      </div>

      {/* Secondary Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 !p-0 overflow-hidden min-h-[400px]">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp size={16} className="text-[#00e5ff]" />
              Recent Event Activity
            </h3>
            <a href="/admin/registrations" className="text-[10px] font-black uppercase text-[#00e5ff] tracking-widest hover:underline">View All</a>
          </div>
          
          <div className="overflow-x-auto">
            {!stats?.recentRegistrations || stats.recentRegistrations.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center text-center text-[#475569]">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Shield size={32} />
                </div>
                <p className="text-sm font-medium">Platform Activity is Normal.</p>
                <p className="text-[10px] uppercase font-bold tracking-widest mt-2">No recent registrations found</p>
              </div>
            ) : (
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-[#0f172a] text-[#475569] text-[9px] uppercase font-black tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Registrant</th>
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentRegistrations.slice(0, 5).map((reg: any) => (
                    <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm">{reg.userDetails?.fullName || "Guest"}</div>
                        <div className="text-[10px] text-[#475569]">{reg.userDetails?.email || "No email"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-[#cbd5f5] capitalize">{reg.itemId?.split('-').join(' ')}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white text-sm">₹{reg.amount || 0}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase">Success</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        <Card className="!p-8">
          <h3 className="font-bold mb-6">Quick Links</h3>
          <div className="space-y-4">
            {[
              { label: 'Manage Users', href: '/admin/users' },
              { label: 'Revenue Reports', href: '/admin/revenue' },
              { label: 'Platform Analytics', href: '/admin/analytics' },
              { label: 'Manage Events', href: '/admin/events' },
            ].map(link => (
              <a key={link.label} href={link.href} className="block w-full text-left p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-[#cbd5f5] font-bold hover:border-[#00e5ff]/30 hover:bg-white/[0.08] transition-all">
                {link.label}
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
