"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
} from "react-icons/fa6";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordCard() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.currentPassword) {
      toast.error("Current password is required.");
      return false;
    }

    if (!form.newPassword) {
      toast.error("New password is required.");
      return false;
    }

    if (form.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return false;
    }

    if (form.currentPassword === form.newPassword) {
      toast.error("New password must be different from current password.");
      return false;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Confirm password does not match.");
      return false;
    }

    return true;
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const result = await authClient.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        revokeOtherSessions: true,
      });

      if (result?.error) {
        const errorMessage =
          result.error.message ||
          result.error.statusText ||
          result.error.code ||
          "Password change failed.";

        throw new Error(errorMessage);
      }

      toast.success("Password updated successfully.");

      setForm(initialForm);
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (error) {
      console.error("CHANGE_PASSWORD_ERROR:", error);
      toast.error(error?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100";

  const labelClass = "mb-1.5 block text-sm font-bold text-slate-700";

  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
      

      <div className="border-b border-slate-100 p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-red-600">
          Account Security
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-950">
          Change Password
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Update your account password. Your other active sessions will be
          revoked for better security.
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4 p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Current Password */}
          <div>
            <label className={labelClass}>Current Password</label>

            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type={showCurrent ? "text" : "password"}
                value={form.currentPassword}
                onChange={(event) =>
                  updateField("currentPassword", event.target.value)
                }
                placeholder="Current password"
                className={`${inputClass} pl-11 pr-11`}
              />

              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                aria-label="Toggle current password visibility"
              >
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className={labelClass}>New Password</label>

            <div className="relative">
              <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type={showNew ? "text" : "password"}
                value={form.newPassword}
                onChange={(event) =>
                  updateField("newPassword", event.target.value)
                }
                placeholder="Minimum 8 characters"
                className={`${inputClass} pl-11 pr-11`}
              />

              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                aria-label="Toggle new password visibility"
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className={labelClass}>Confirm New Password</label>

            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
                placeholder="Re-enter new password"
                className={`${inputClass} pl-11 pr-11`}
              />

              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Use a strong password with at least 8 characters.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating Password..." : "Update Password"}
            {!loading && <FaArrowRight />}
          </button>
        </div>
      </form>
    </div>
  );
}