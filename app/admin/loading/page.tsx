const theme = {
  page: "min-h-screen w-full bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-500",
  card: "rounded-[1.5rem] border border-black/[0.06] bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70",
};

export default function LoadingPage() {
  <div
    className={`flex items-center justify-center min-h-screen ${theme.page}`}
  >
    <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
  </div>;
}
