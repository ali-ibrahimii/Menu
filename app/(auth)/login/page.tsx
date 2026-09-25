// app/login/page.tsx (با Suspense)
import { Suspense } from "react";
import LoginContent from "./LoginContent";
import { FullPageLoader } from "@/components/Loader";

export default function LoginPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <LoginContent />
    </Suspense>
  );
}
