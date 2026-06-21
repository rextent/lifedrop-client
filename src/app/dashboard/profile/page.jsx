"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  FaCamera,
  FaCircleCheck,
  FaDroplet,
  FaEnvelope,
  FaFloppyDisk,
  FaIdCard,
  FaLocationDot,
  FaPenToSquare,
  FaRotateLeft,
  FaUser,
} from "react-icons/fa6";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialForm = {
  name: "",
  email: "",
  image: "",
  bloodGroup: "",
  districtId: "",
  district: "",
  upazila: "",
  role: "",
  status: "",
};

export default function ProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [originalForm, setOriginalForm] = useState(initialForm);

  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [filteredUpazilas, setFilteredUpazilas] = useState([]);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);

        const [districtRes, upazilaRes, profileRes] = await Promise.all([
          fetch("/districts.json"),
          fetch("/upazilas.json"),
          fetch("/api/users/profile", { cache: "no-store" }),
        ]);

        const districtJson = await districtRes.json();
        const upazilaJson = await upazilaRes.json();
        const profileData = await profileRes.json();

        if (!profileRes.ok) {
          throw new Error(profileData?.message || "Failed to load profile.");
        }

        const districtList = [...(districtJson?.[2]?.data || [])].sort(
          (a, b) => a.name.localeCompare(b.name)
        );

        const upazilaList = [...(upazilaJson?.[2]?.data || [])].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        const profile = profileData?.user || {};

        const matchedDistrict = districtList.find(
          (district) =>
            district.name?.toLowerCase() === profile.district?.toLowerCase()
        );

        const districtId = matchedDistrict?.id || "";

        const matchedUpazilas = upazilaList.filter(
          (upazila) => String(upazila.district_id) === String(districtId)
        );

        const preparedForm = {
          name: profile.name || "",
          email: profile.email || "",
          image: profile.image || "",
          bloodGroup: profile.bloodGroup || "",
          districtId,
          district: profile.district || "",
          upazila: profile.upazila || "",
          role: profile.role || "donor",
          status: profile.status || "active",
        };

        setDistricts(districtList);
        setUpazilas(upazilaList);
        setFilteredUpazilas(matchedUpazilas);
        setForm(preparedForm);
        setOriginalForm(preparedForm);
        setAvatarPreview(profile.image || "");
      } catch (error) {
        toast.error(error.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const locationText = useMemo(() => {
    if (form.upazila && form.district) return `${form.upazila}, ${form.district}`;
    if (form.district) return form.district;
    return "Location not set";
  }, [form.upazila, form.district]);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDistrictChange = (districtId) => {
    const selectedDistrict = districts.find(
      (district) => String(district.id) === String(districtId)
    );

    const matchedUpazilas = upazilas
      .filter((upazila) => String(upazila.district_id) === String(districtId))
      .sort((a, b) => a.name.localeCompare(b.name));

    setFilteredUpazilas(matchedUpazilas);

    setForm((prev) => ({
      ...prev,
      districtId,
      district: selectedDistrict?.name || "",
      upazila: "",
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP image is allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar must be less than 2MB.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return form.image;

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
      throw new Error("NEXT_PUBLIC_IMGBB_API_KEY is missing.");
    }

    const imageData = new FormData();
    imageData.append("image", avatarFile);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: imageData,
      }
    );

    const data = await response.json();

    if (!response.ok || !data?.success) {
      throw new Error("Avatar upload failed.");
    }

    return data.data.url;
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return false;
    }

    if (!form.bloodGroup) {
      toast.error("Blood group is required.");
      return false;
    }

    if (!form.district) {
      toast.error("District is required.");
      return false;
    }

    if (!form.upazila) {
      toast.error("Upazila is required.");
      return false;
    }

    return true;
  };

  const handleCancel = () => {
    setForm(originalForm);
    setAvatarPreview(originalForm.image || "");
    setAvatarFile(null);

    const matchedUpazilas = upazilas
      .filter(
        (upazila) => String(upazila.district_id) === String(originalForm.districtId)
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    setFilteredUpazilas(matchedUpazilas);
    setEditing(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const imageUrl = await uploadAvatar();

      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          image: imageUrl,
          bloodGroup: form.bloodGroup,
          district: form.district,
          upazila: form.upazila,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Profile update failed.");
      }

      const updatedForm = {
        ...form,
        name: data?.user?.name || form.name,
        image: data?.user?.image || imageUrl,
        bloodGroup: data?.user?.bloodGroup || form.bloodGroup,
        district: data?.user?.district || form.district,
        upazila: data?.user?.upazila || form.upazila,
        role: data?.user?.role || form.role,
        status: data?.user?.status || form.status,
      };

      setForm(updatedForm);
      setOriginalForm(updatedForm);
      setAvatarPreview(updatedForm.image || "");
      setAvatarFile(null);
      setEditing(false);

      toast.success("Profile updated successfully.");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-500";

  const labelClass = "mb-1.5 block text-sm font-bold text-slate-700";

  if (loading) {
    return (
      <section className="mx-auto max-w-[1050px]">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-xl bg-slate-100" />
            <div className="h-28 rounded-3xl bg-slate-100" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-16 rounded-2xl bg-slate-100" />
              <div className="h-16 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1050px] space-y-5">
      <Toaster position="top-center" />

      <form
        id="profile-form"
        onSubmit={handleSave}
        className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm"
      >
        {/* Top Action Bar */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-red-600">
              Account Settings
            </p>

            <h1 className="mt-1 text-2xl font-black text-slate-950">
              My Profile
            </h1>
          </div>

          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
            >
              <FaPenToSquare />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
              >
                <FaRotateLeft />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:opacity-60"
              >
                <FaFloppyDisk />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Compact Profile Header */}
        <div className="grid gap-5 bg-gradient-to-br from-red-600 to-rose-700 px-5 py-6 text-white lg:grid-cols-[1fr_220px] lg:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 rounded-full border-4 border-white bg-white shadow-xl">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={form.name || "User"}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-red-50 text-3xl text-red-600">
                  <FaUser />
                </div>
              )}

              {editing && (
                <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-4 border-red-600 bg-white text-red-600 shadow-lg transition hover:bg-red-50">
                  <FaCamera />
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase backdrop-blur">
                  <FaIdCard />
                  {form.role || "donor"}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase backdrop-blur">
                  <FaCircleCheck />
                  {form.status || "active"}
                </span>
              </div>

              <h2 className="truncate text-3xl font-black tracking-tight">
                {form.name || "User Name"}
              </h2>

              <p className="mt-2 flex items-center gap-2 text-sm text-red-50">
                <FaEnvelope />
                <span className="truncate">{form.email || "No email found"}</span>
              </p>

              <p className="mt-1.5 flex items-center gap-2 text-sm text-red-50">
                <FaLocationDot />
                <span className="truncate">{locationText}</span>
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur">
            <p className="text-xs font-black uppercase tracking-wide text-red-50">
              Blood Group
            </p>

            <div className="mx-auto mt-3 flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-black text-red-600 shadow-lg">
              {form.bloodGroup || "N/A"}
            </div>
          </div>
        </div>

        {/* Compact Form */}
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-950">
                Profile Details
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {editing
                  ? "Update your allowed profile information."
                  : "Click edit to update your profile information."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Name</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  disabled={!editing || saving}
                  onChange={(event) => updateField("name", event.target.value)}
                  className={`${inputClass} pl-11`}
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className={`${inputClass} pl-11`}
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Blood Group</label>
              <div className="relative">
                <FaDroplet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.bloodGroup}
                  disabled={!editing || saving}
                  onChange={(event) =>
                    updateField("bloodGroup", event.target.value)
                  }
                  className={`${inputClass} pl-11`}
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Role</label>
              <div className="relative">
                <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.role || "donor"}
                  disabled
                  className={`${inputClass} pl-11 capitalize`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>District</label>
              <div className="relative">
                <FaLocationDot className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.districtId}
                  disabled={!editing || saving}
                  onChange={(event) => handleDistrictChange(event.target.value)}
                  className={`${inputClass} pl-11`}
                >
                  <option value="">Select district</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Upazila</label>
              <select
                value={form.upazila}
                disabled={!editing || saving || !form.districtId}
                onChange={(event) => updateField("upazila", event.target.value)}
                className={inputClass}
              >
                <option value="">
                  {form.districtId ? "Select upazila" : "Select district first"}
                </option>

                {filteredUpazilas.map((upazila) => (
                  <option key={upazila.id} value={upazila.name}>
                    {upazila.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {editing && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              You can change avatar from the camera icon on your profile image.
              Email and role are not editable.
            </div>
          )}
        </div>
      </form>
    </section>
  );
}