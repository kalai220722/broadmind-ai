"use client";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 40, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative flex-shrink-0 rounded-xl overflow-hidden"
        style={{ width: size, height: size }}
      >
        <img
          src="/logo.png"
          alt="BroadMind AI"
          width={size}
          height={size}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            BroadMind
          </span>
          <span className="text-[10px] font-medium text-slate-400 tracking-[0.2em] uppercase -mt-1">
            AI Learning
          </span>
        </div>
      )}
    </div>
  );
}
