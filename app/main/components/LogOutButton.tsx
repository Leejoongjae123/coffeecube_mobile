"use client";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import Image from "next/image";

export default function LogOutButton() {
  const logout = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  };

  return <Button className="bg-white border shadow-none border-[#B4D2B6] flex items-center gap-2 hover:bg-white/90" onClick={logout}> 
  <Image src="/logout.svg" alt="logout" width={16} height={16} />
  <span className="text-[#26A12E]">로그아웃</span></Button>;
}