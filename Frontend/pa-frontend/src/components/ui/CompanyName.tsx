"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const fetchCompanyName = async (token: string) => {
  const response = await axios.get(`${backendUrl}/company/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data?.data?.name
};

const CompanyName = () => {
  const { data: session } = useSession();
  const token = session?.user?.token;

  const { data: companyName, isLoading, isError } = useQuery({
    queryKey: ["companyName"],
    queryFn: () => fetchCompanyName(token!),
    enabled: !!token, // only run if token exists
    staleTime: 5 * 60 * 1000, // optional: cache for 5 minutes
  });

  if (isLoading) return <span className="ml-2 text-gray-500">| Loading...</span>;
  if (isError) return <span className="ml-2 text-red-500">| Error loading company</span>;

  return (
    <span className="ml-2 font-medium text-gray-700">
      Here&apos;s what happening in {companyName} today
    </span>

  );
};

export default CompanyName;
