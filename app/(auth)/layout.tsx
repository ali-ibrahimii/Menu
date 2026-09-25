import type { Metadata } from "next";

/** صفحهٔ ورود به پنل مدیریت — نباید در نتایج جست‌وجو ظاهر شود */
export const metadata: Metadata = {
  title: "ورود به پنل مدیریت",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
