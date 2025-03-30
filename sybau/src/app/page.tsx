"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    router.push("/authentication");
    // return (
    //   <main className="flex min-h-screen flex-col items-center justify-center p-24">
    //     <div className="text-center">
    //       <h1 className="text-4xl font-bold mb-6">Sybau Dashboard</h1>
    //       <p className="text-xl mb-10">Testing OAuth integrations</p>

    //       <div className="space-y-4">
    //         <div className="p-6 border rounded-lg bg-white shadow-sm">
    //           <h2 className="text-2xl font-semibold mb-4">Integrations</h2>
    //           <div className="flex flex-col space-y-3">
    //             <Button asChild>
    //               <Link href="/integrate/linear">
    //                 Connect Linear Account
    //               </Link>
    //             </Button>
    //             <Button asChild>
    //               <Link href="/integrate/jira">
    //                 Connect JIRA Account
    //               </Link>
    //             </Button>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </main>
    // );
}
