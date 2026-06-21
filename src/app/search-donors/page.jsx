"use client";

import { useEffect, useState } from "react";
import {
  FaDroplet,
  FaEnvelope,
  FaLocationDot,
  FaMagnifyingGlass,
  FaRotateRight,
  FaUser,
} from "react-icons/fa6";

const bloodGroups = ["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const defaultFilters = {
  bloodGroup: "all",
  district: "",
  upazila: "",
};

export default function SearchDonorsPage() {
  const [urlReady, setUrlReady] = useState(false);

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [filteredUpazilas, setFilteredUpazilas] = useState([]);

  const [bloodGroup, setBloodGroup] = useState("all");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [selectedUpazila, setSelectedUpazila] = useState("");

  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0,
  });

  const updateUrl = (filters, pageNumber) => {
    const params = new URLSearchParams();

    if (filters.bloodGroup && filters.bloodGroup !== "all") {
      params.set("bloodGroup", filters.bloodGroup);
    }

    if (filters.district) {
      params.set("district", filters.district);
    }

    if (filters.upazila) {
      params.set("upazila", filters.upazila);
    }

    if (pageNumber > 1) {
      params.set("page", String(pageNumber));
    }

    const queryString = params.toString();
    const nextUrl = queryString
      ? `/search-donors?${queryString}`
      : "/search-donors";

    window.history.replaceState(null, "", nextUrl);
  };

  const syncStateFromUrl = (districtList, upazilaList) => {
    const searchParams = new URLSearchParams(window.location.search);

    const urlBloodGroup = searchParams.get("bloodGroup") || "all";
    const urlDistrict = searchParams.get("district") || "";
    const urlUpazila = searchParams.get("upazila") || "";
    const urlPage = Number(searchParams.get("page")) || 1;

    const safeBloodGroup = bloodGroups.includes(urlBloodGroup)
      ? urlBloodGroup
      : "all";

    const selectedDistrict = districtList.find(
      (district) => district.name === urlDistrict
    );

    const matchedUpazilas = selectedDistrict
      ? upazilaList
          .filter(
            (upazila) =>
              String(upazila.district_id) === String(selectedDistrict.id)
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];

    const safeUpazila = matchedUpazilas.some(
      (upazila) => upazila.name === urlUpazila
    )
      ? urlUpazila
      : "";

    setBloodGroup(safeBloodGroup);
    setSelectedDistrictId(selectedDistrict?.id || "");
    setSelectedDistrictName(selectedDistrict?.name || "");
    setSelectedUpazila(safeUpazila);
    setFilteredUpazilas(matchedUpazilas);

    setAppliedFilters({
      bloodGroup: safeBloodGroup,
      district: selectedDistrict?.name || "",
      upazila: safeUpazila,
    });

    setPage(urlPage > 0 ? urlPage : 1);
    setUrlReady(true);
  };

  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const [districtRes, upazilaRes] = await Promise.all([
          fetch("/districts.json"),
          fetch("/upazilas.json"),
        ]);

        const districtJson = await districtRes.json();
        const upazilaJson = await upazilaRes.json();

        const districtList = [...(districtJson?.[2]?.data || [])].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        const upazilaList = [...(upazilaJson?.[2]?.data || [])].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setDistricts(districtList);
        setUpazilas(upazilaList);

        syncStateFromUrl(districtList, upazilaList);
      } catch (error) {
        console.error("DONOR_LOCATION_JSON_LOAD_ERROR:", error);
        setDistricts([]);
        setUpazilas([]);
        setFilteredUpazilas([]);
        setUrlReady(true);
      }
    };

    loadLocationData();
  }, []);

  useEffect(() => {
    if (!urlReady) return;

    const loadDonors = async () => {
      try {
        setLoading(true);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        const queryParams = new URLSearchParams({
          page: String(page),
          limit: "8",
          bloodGroup: appliedFilters.bloodGroup,
          district: appliedFilters.district,
          upazila: appliedFilters.upazila,
        });

        const response = await fetch(
          `${baseUrl}/api/donors?${queryParams.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load donors.");
        }

        setDonors(data?.donors || []);
        setPagination(
          data?.pagination || {
            page: 1,
            limit: 8,
            total: 0,
            totalPages: 0,
          }
        );
      } catch (error) {
        console.error("PUBLIC_DONORS_ERROR:", error);
        setDonors([]);
        setPagination({
          page: 1,
          limit: 8,
          total: 0,
          totalPages: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDonors();
  }, [
    urlReady,
    page,
    appliedFilters.bloodGroup,
    appliedFilters.district,
    appliedFilters.upazila,
  ]);

  const handleDistrictChange = (districtId) => {
    const selectedDistrict = districts.find(
      (district) => String(district.id) === String(districtId)
    );

    const matchedUpazilas = upazilas
      .filter((upazila) => String(upazila.district_id) === String(districtId))
      .sort((a, b) => a.name.localeCompare(b.name));

    setSelectedDistrictId(districtId);
    setSelectedDistrictName(selectedDistrict?.name || "");
    setSelectedUpazila("");
    setFilteredUpazilas(matchedUpazilas);
  };

  const handleApplyFilter = (event) => {
    event.preventDefault();

    const nextFilters = {
      bloodGroup,
      district: selectedDistrictName,
      upazila: selectedUpazila,
    };

    setPage(1);
    setAppliedFilters(nextFilters);
    updateUrl(nextFilters, 1);
  };

  const handleResetFilter = () => {
    setBloodGroup("all");
    setSelectedDistrictId("");
    setSelectedDistrictName("");
    setSelectedUpazila("");
    setFilteredUpazilas([]);

    setPage(1);
    setAppliedFilters(defaultFilters);
    updateUrl(defaultFilters, 1);
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
    updateUrl(appliedFilters, pageNumber);
  };

  const currentPage = pagination.page || page;
  const totalPages = pagination.totalPages || 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-[1450px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
          <div className="relative bg-gradient-to-br from-red-600 to-rose-700 p-6 text-white sm:p-10">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 max-w-3xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                <FaDroplet />
                Search Donors
              </p>

              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Find Blood Donors
              </h1>

              <p className="mt-4 text-sm leading-6 text-red-50 sm:text-base">
                Search registered donors by blood group and location.
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <form
          onSubmit={handleApplyFilter}
          className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-red-600">
                Donor Filter
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Search Matching Donors
              </h2>
            </div>

            <p className="text-sm font-bold text-slate-500">
              Total Found: {pagination.total || 0}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Blood Group
              </label>

              <select
                value={bloodGroup}
                onChange={(event) => setBloodGroup(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
              >
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group === "all" ? "All Blood Groups" : group}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                District
              </label>

              <select
                value={selectedDistrictId}
                onChange={(event) => handleDistrictChange(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
              >
                <option value="">All Districts</option>

                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                Upazila
              </label>

              <select
                value={selectedUpazila}
                onChange={(event) => setSelectedUpazila(event.target.value)}
                disabled={!selectedDistrictId}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {selectedDistrictId ? "All Upazilas" : "Select district first"}
                </option>

                {filteredUpazilas.map((upazila) => (
                  <option key={upazila.id} value={upazila.name}>
                    {upazila.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 md:items-end">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
              >
                <FaMagnifyingGlass />
                Search
              </button>

              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                title="Reset Filter"
              >
                <FaRotateRight />
              </button>
            </div>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              Loading donors...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && donors.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-2xl text-red-600">
              <FaUser />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              No Donors Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              No donor matched your selected filter.
            </p>
          </div>
        )}

        {/* Donor Grid */}
        {!loading && donors.length > 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {donors.map((donor) => {
                const donorId = donor._id || donor.id;
                const avatar =
                  donor.image || donor.avatar || donor.avatarUrl || "";

                return (
                  <div
                    key={donorId}
                    className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={donor.name || "Donor"}
                            className="h-14 w-14 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">
                            <FaUser />
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                            Donor
                          </p>

                          <h2 className="line-clamp-1 text-lg font-black text-slate-950">
                            {donor.name || "N/A"}
                          </h2>
                        </div>
                      </div>

                      <span className="rounded-2xl bg-red-600 px-3 py-1.5 text-sm font-black text-white">
                        {donor.bloodGroup || "N/A"}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                        <FaLocationDot className="mt-1 text-red-500" />

                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Location
                          </p>

                          <p className="text-sm font-bold text-slate-800">
                            {donor.upazila || "N/A"},{" "}
                            {donor.district || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                        <FaEnvelope className="mt-1 text-red-500" />

                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Email
                          </p>

                          <p className="break-all text-sm font-bold text-slate-800">
                            {donor.email || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs font-black uppercase text-slate-400">
                          Status
                        </p>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black capitalize ${
                            donor.status === "blocked"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {donor.status || "active"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row">
                <p className="text-sm font-bold text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(Math.max(currentPage - 1, 1))
                    }
                    disabled={currentPage <= 1 || loading}
                    className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .slice(
                      Math.max(currentPage - 3, 0),
                      Math.min(currentPage + 2, totalPages)
                    )
                    .map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => handlePageChange(pageNumber)}
                        disabled={loading}
                        className={`h-10 w-10 rounded-2xl text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          currentPage === pageNumber
                            ? "bg-red-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(Math.min(currentPage + 1, totalPages))
                    }
                    disabled={currentPage >= totalPages || loading}
                    className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}