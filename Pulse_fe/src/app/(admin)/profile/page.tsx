"use client";
import React, { useEffect, useState } from "react";
import { profileService, UserProfile, UpdateProfileRequest } from "@/services/profileService";
import { authService } from "@/services/authService";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Profile Form State
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<UpdateProfileRequest>({});

  // Password Form State
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    profileService.get()
      .then((p) => {
        setProfile(p);
        setForm({ firstName: p.firstName, lastName: p.lastName, jobTitle: p.jobTitle || "", department: p.department || "", phone: p.phone || "", bio: p.bio || "", timezone: p.timezone || "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await profileService.update(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdError("Password must be at least 6 characters.");
      return;
    }

    setPwdSaving(true);
    setPwdSaved(false);
    setPwdError("");
    try {
      await authService.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      setPwdSaved(true);
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwdSaved(false), 3000);
    } catch (err: any) {
      setPwdError(err.response?.data?.message || "Failed to change password.");
    }
    setPwdSaving(false);
  };

  const updateField = (key: keyof UpdateProfileRequest, value: string) => setForm({ ...form, [key]: value });
  const updatePwdField = (key: keyof typeof pwdForm, value: string) => setPwdForm({ ...pwdForm, [key]: value });

  if (loading) return <div className="p-6 flex justify-center"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)] max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Profile</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage your personal information</p>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-brand-500 shrink-0">
            {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{profile?.firstName} {profile?.lastName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" value={form.firstName || ""} onChange={(v) => updateField("firstName", v)} />
            <Field label="Last Name" value={form.lastName || ""} onChange={(v) => updateField("lastName", v)} />
          </div>
          <Field label="Job Title" value={form.jobTitle || ""} onChange={(v) => updateField("jobTitle", v)} placeholder="e.g. Software Engineer" />
          <Field label="Department" value={form.department || ""} onChange={(v) => updateField("department", v)} placeholder="e.g. Engineering" />
          <Field label="Phone" value={form.phone || ""} onChange={(v) => updateField("phone", v)} placeholder="+84 xxx xxx xxx" />
          <Field label="Timezone" value={form.timezone || ""} onChange={(v) => updateField("timezone", v)} placeholder="e.g. Asia/Ho_Chi_Minh" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
            <textarea value={form.bio || ""} onChange={(e) => updateField("bio", e.target.value)} rows={3} placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors">
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Save Changes
          </button>
          {saved && <span className="flex items-center gap-1 text-sm text-green-500 font-medium"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Saved successfully</span>}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Security</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">Update your password</p>

        <div className="space-y-4 max-w-md">
          <PasswordField label="Current Password" value={pwdForm.currentPassword} onChange={(v) => updatePwdField("currentPassword", v)} />
          <PasswordField label="New Password" value={pwdForm.newPassword} onChange={(v) => updatePwdField("newPassword", v)} />
          <PasswordField label="Confirm New Password" value={pwdForm.confirmPassword} onChange={(v) => updatePwdField("confirmPassword", v)} />
          {pwdError && <p className="text-sm text-red-500 mt-1">{pwdError}</p>}
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleChangePassword} disabled={pwdSaving || !pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-white dark:bg-white/[0.05] dark:hover:bg-white/[0.1] rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors border border-gray-200 dark:border-white/10">
            {pwdSaving && <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />}
            Change Password
          </button>
          {pwdSaved && <span className="flex items-center gap-1 text-sm text-green-500 font-medium"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Password updated</span>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
    </div>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input type="password" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
    </div>
  );
}
