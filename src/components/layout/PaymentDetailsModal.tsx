"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Building2, Linkedin, CheckCircle2, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: UserDetails) => void;
  initialEmail?: string;
  courseTitle: string;
}

export interface UserDetails {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  linkedin?: string;
  couponCode?: string;
}

export default function PaymentDetailsModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialEmail,
  courseTitle 
}: PaymentDetailsModalProps) {
  const [formData, setFormData] = useState<UserDetails>({
    fullName: "",
    email: initialEmail || "",
    phone: "",
    company: "",
    linkedin: "",
    couponCode: ""
  });

  const [errors, setErrors] = useState<Partial<UserDetails>>({});

  const validate = () => {
    const newErrors: Partial<UserDetails> = {};
    if (!formData.fullName) newErrors.fullName = "Name is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.company) newErrors.company = "Company/Designation is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" 
            onClick={onClose}
          ></motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0f172a] rounded-[32px] overflow-hidden border border-white/10 shadow-3xl"
          >
            {/* Header */}
            <div className="relative p-8 pb-0">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="mb-6">
                <span className="text-[10px] font-black text-[#00e5ff] uppercase tracking-[0.2em] mb-2 block">One last step</span>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Secure Your Seat for <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#6366f1]">
                    {courseTitle.split(":")[0]}
                  </span>
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest ml-1 mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full bg-white/[0.03] border ${errors.fullName ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 text-sm text-white focus:border-[#00e5ff]/50 outline-none transition-all`}
                    />
                  </div>
                </div>

                {/* Email (Read Only if provided) */}
                <div>
                  <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest ml-1 mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-white/[0.01] border border-white/5 rounded-2xl p-4 text-sm text-[#475569] cursor-not-allowed outline-none"
                  />
                </div>

                {/* Phone & Company Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest ml-1 mb-1.5 block">Phone Number</label>
                    <div className="relative group">
                      <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#00e5ff] transition-colors" />
                      <input
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full bg-white/[0.03] border ${errors.phone ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 pl-10 text-sm text-white focus:border-[#00e5ff]/50 outline-none transition-all`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest ml-1 mb-1.5 block">Company/Role</label>
                    <div className="relative group">
                      <Building2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#00e5ff] transition-colors" />
                      <input
                        type="text"
                        placeholder="e.g. Manager at Google"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className={`w-full bg-white/[0.03] border ${errors.company ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 pl-10 text-sm text-white focus:border-[#00e5ff]/50 outline-none transition-all`}
                      />
                    </div>
                  </div>
                </div>

                {/* LinkedIn & Referral Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest ml-1 mb-1.5 block">LinkedIn (Optional)</label>
                    <div className="relative group">
                      <Linkedin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#00e5ff] transition-colors" />
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 pl-10 text-sm text-white focus:border-[#00e5ff]/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#475569] uppercase tracking-widest ml-1 mb-1.5 block">Invite Code (Optional)</label>
                    <div className="relative group">
                      <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#00e5ff] transition-colors" />
                      <input
                        type="text"
                        placeholder="CODE"
                        value={formData.couponCode}
                        onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 pl-10 text-sm text-white focus:border-[#00e5ff]/50 outline-none transition-all placeholder:text-[#475569] uppercase font-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 pb-2">
                <Button fullWidth size="lg" type="submit" className="h-14 tracking-widest">
                  Proceed to Payment <CheckCircle2 size={16} className="ml-2" />
                </Button>
                <p className="text-[9px] text-center text-[#475569] font-black uppercase tracking-widest mt-4">
                  By clicking proceed, you agree to MentorLeap&apos;s Terms of Service.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
