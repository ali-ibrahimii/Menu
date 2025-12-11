import React from "react";


type Props = {
label?: string;
};


export default function GlassButtons({ label = "Button" }: Props) {
return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-600 p-8">
<div className="flex gap-6 items-center">
{/* circular icon button */}
<button
aria-label="up"
className="glass-btn glass-small flex items-center justify-center"
>
{/* arrow svg */}
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
<path d="M12 19V5" stroke="rgba(255,255,255,0.95)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
<path d="M5 12l7-7 7 7" stroke="rgba(255,255,255,0.95)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
</svg>
</button>


{/* pill / rounded rectangle button */}
<button className="glass-btn glass-pill px-10 py-4">
<span className="glass-label text-[26px] font-semibold">{label}</span>
</button>
</div>
</div>
);
}