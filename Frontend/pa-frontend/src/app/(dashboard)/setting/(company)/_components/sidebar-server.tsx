import axios from "axios";
import { cookies } from "next/headers";
import Image from "next/image";


export async function SidebarLogo() {
    const cookieStore = cookies();
    const token = cookieStore.get('next-auth.session-token')?.value;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  try {
    const { data } = await axios.get(`${backendUrl}/company/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const companyLogo = data?.data?.logo;

    return companyLogo ? (
      <Image 
        src={companyLogo} 
        alt="Company Logo" 
        width={8}
        height={8}
        className="h-8 w-auto object-contain"
      />
    ) : (
      <Image 
        src="/logo.svg" 
        alt="Logo" 
        width={120} 
        height={32} 
      />
    );
  } catch (error) {
    return (
      <Image 
        src="/logo.svg" 
        alt="Logo" 
        width={120} 
        height={32} 
      />
    );
  }
}