// import { Navigate, Outlet } from "react-router-dom";
// import { Loader2 } from "lucide-react";
// import { useSession } from "../lib/auth-client"; 

// export function ProtectedRoute() {
//   const { data: session, isPending } = useSession();

//   if (isPending) {
//     return (
//       <div className="h-screen w-screen flex items-center justify-center bg-background">
//         <Loader2 className="h-10 w-10 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (!session) {
//     return <Navigate to="/login" replace />;
//   }

//   return <Outlet />;
// }

import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSession } from "../lib/auth-client"; 

export function ProtectedRoute() {
  const { data: session, isPending, error } = useSession();

  // 🕵️ THE POLYGRAPH TEST
  console.log("🔒 BOUNCER CHECK:", { session, isPending, error });

  if (isPending) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    console.log("🚫 NO SESSION FOUND! Kicking user to /login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ USER IS LOGGED IN! Opening the VIP doors.");
  return <Outlet />;
}