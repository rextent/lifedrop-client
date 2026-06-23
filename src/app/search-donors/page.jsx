"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FaDownload,
  FaDroplet,
  FaEnvelope,
  FaLocationDot,
  FaMagnifyingGlass,
  FaRotateRight,
  FaUser,
} from "react-icons/fa6";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const defaultFilters = {
  bloodGroup: "",
  district: "",
  upazila: "",
};

export default function SearchDonorsPage() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [filteredUpazilas, setFilteredUpazilas] = useState([]);

  const [bloodGroup, setBloodGroup] = useState("");
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

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
      } catch (error) {
        console.error("DONOR_LOCATION_JSON_LOAD_ERROR:", error);
        setDistricts([]);
        setUpazilas([]);
        setFilteredUpazilas([]);
      }
    };

    loadLocationData();
  }, []);

  const fetchDonors = async (filters, pageNumber = 1) => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page: String(pageNumber),
        limit: "8",
        bloodGroup: filters.bloodGroup,
        district: filters.district,
        upazila: filters.upazila,
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
          page: pageNumber,
          limit: 8,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (error) {
      console.error("PUBLIC_DONORS_ERROR:", error);
      toast.error(error.message || "Failed to load donors.");

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

  const fetchAllSearchDonors = async () => {
    const totalResults = pagination.total || donors.length || 10000;

    const queryParams = new URLSearchParams({
      page: "1",
      limit: String(totalResults),
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
      throw new Error(data?.message || "Failed to load donors for PDF.");
    }

    return data?.donors || [];
  };

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

  const handleApplyFilter = async (event) => {
    event.preventDefault();

    if (!bloodGroup) {
      toast.error("Please select a blood group.");
      return;
    }

    if (!selectedDistrictName) {
      toast.error("Please select a district.");
      return;
    }

    if (!selectedUpazila) {
      toast.error("Please select an upazila.");
      return;
    }

    const nextFilters = {
      bloodGroup,
      district: selectedDistrictName,
      upazila: selectedUpazila,
    };

    setPage(1);
    setAppliedFilters(nextFilters);
    setHasSearched(true);

    await fetchDonors(nextFilters, 1);
  };

  const handleResetFilter = () => {
    setBloodGroup("");
    setSelectedDistrictId("");
    setSelectedDistrictName("");
    setSelectedUpazila("");
    setFilteredUpazilas([]);

    setPage(1);
    setAppliedFilters(defaultFilters);
    setDonors([]);
    setHasSearched(false);
    setLoading(false);
    setPagination({
      page: 1,
      limit: 8,
      total: 0,
      totalPages: 0,
    });
  };

  const handlePageChange = async (pageNumber) => {
    if (!hasSearched) return;

    setPage(pageNumber);
    await fetchDonors(appliedFilters, pageNumber);
  };

  const handleDownloadPDF = async () => {
    if (!hasSearched) {
      toast.error("Please search donors first.");
      return;
    }

    try {
      setDownloadLoading(true);

      const allDonors = await fetchAllSearchDonors();

      if (allDonors.length === 0) {
        toast.error("No donors available to download.");
        return;
      }

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("LifeDrop Donor Search Results", pageWidth / 2, 45, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Blood Group: ${appliedFilters.bloodGroup} | District: ${appliedFilters.district} | Upazila: ${appliedFilters.upazila}`,
        pageWidth / 2,
        68,
        { align: "center" }
      );

      doc.text(
        `Total Donors: ${allDonors.length} | Generated: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        86,
        { align: "center" }
      );

      autoTable(doc, {
        startY: 110,
        head: [["SL", "Name", "Email", "Blood Group", "District", "Upazila", "Status"]],
        body: allDonors.map((donor, index) => [
          index + 1,
          donor.name || "N/A",
          donor.email || "N/A",
          donor.bloodGroup || "N/A",
          donor.district || "N/A",
          donor.upazila || "N/A",
          donor.status || "active",
        ]),
        styles: {
          font: "helvetica",
          fontSize: 9,
          cellPadding: 7,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 130 },
          2: { cellWidth: 190 },
          3: { cellWidth: 85 },
          4: { cellWidth: 110 },
          5: { cellWidth: 110 },
          6: { cellWidth: 75 },
        },
        margin: {
          left: 35,
          right: 35,
        },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          const currentPageNumber = doc.internal.getCurrentPageInfo().pageNumber;

          doc.setFontSize(9);
          doc.setTextColor(120);
          doc.text(
            `LifeDrop - Donor Search Results | Page ${currentPageNumber} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 20,
            { align: "center" }
          );
        },
      });

      const fileName = `lifedrop-donors-${appliedFilters.bloodGroup}-${appliedFilters.district}-${appliedFilters.upazila}.pdf`;

      doc.save(fileName);

      toast.success("PDF downloaded successfully.");
    } catch (error) {
      console.error("DONOR_PDF_DOWNLOAD_ERROR:", error);
      toast.error(error.message || "Failed to download PDF.");
    } finally {
      setDownloadLoading(false);
    }
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
                Search registered donors by blood group, district, and upazila.
              </p>
            </div>
          </div>
        </div>

        {/* Search Form */}
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
              {hasSearched
                ? `Total Found: ${pagination.total || 0}`
                : "No search yet"}
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
                <option value="">Select Blood Group</option>

                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
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
                <option value="">Select District</option>

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
                  {selectedDistrictId ? "Select Upazila" : "Select district first"}
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
                disabled={loading}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaMagnifyingGlass />
                {loading ? "Searching..." : "Search"}
              </button>

              <button
                type="button"
                onClick={handleResetFilter}
                className="cursor-pointer inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                title="Reset Filter"
              >
                <FaRotateRight />
              </button>
            </div>
          </div>
        </form>

        {/* Before Search */}
        {!hasSearched && (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-2xl text-red-600">
              <FaMagnifyingGlass />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              Search to View Donors
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Select blood group, district, and upazila. Donor results will only
              appear after clicking the search button.
            </p>
          </div>
        )}

        {/* Loading */}
        {hasSearched && loading && (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              Loading donors...
            </p>
          </div>
        )}

        {/* Empty After Search */}
        {hasSearched && !loading && donors.length === 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-2xl text-red-600">
              <FaUser />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              No Donors Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              No donor matched your selected area.
            </p>
          </div>
        )}

        {/* Donor Results */}
        {hasSearched && !loading && donors.length > 0 && (
          <>
            <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-red-600">
                  Search Results
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {pagination.total || donors.length} donor found
                </h2>
              </div>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={downloadLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaDownload />
                {downloadLoading ? "Generating PDF..." : "Download PDF"}
              </button>
            </div>

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