"use server";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const createDonationRequest = async (newDonationRequest) => {
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is missing.");
  }

  const res = await fetch(`${baseUrl}/api/donationRequests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newDonationRequest),
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to create donation request.");
  }

  return data;
};