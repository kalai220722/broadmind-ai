"use client";

import { useId } from "react";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 40, showText = true, className = "" }: LogoProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative flex-shrink-0 rounded-2xl overflow-hidden"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`bg${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1440" />
              <stop offset="50%" stopColor="#241e58" />
              <stop offset="100%" stopColor="#1a1440" />
            </linearGradient>
            <linearGradient id={`brd${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id={`cl${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id={`pl${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <radialGradient id={`rg${uid}`} cx="50%" cy="50%" r="30%">
              <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity="0" />
            </radialGradient>
            <filter id={`gc${uid}`}><feGaussianBlur stdDeviation="2.5" result="b"/><feFlood floodColor="#22d3ee" floodOpacity="0.35" result="c"/><feComposite in="c" in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id={`gp${uid}`}><feGaussianBlur stdDeviation="2.5" result="b"/><feFlood floodColor="#7c3aed" floodOpacity="0.35" result="c"/><feComposite in="c" in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id={`sg${uid}`}><feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          {/* Background rounded square */}
          <rect width="200" height="200" rx="40" fill={`url(#bg${uid})`}/>
          <rect width="200" height="200" rx="40" fill="none" stroke={`url(#brd${uid})`} strokeWidth="1.5"/>

          {/* Background geometric circles */}
          <circle cx="100" cy="100" r="58" fill="none" stroke="#4338ca" strokeWidth="0.6" opacity="0.12"/>
          <circle cx="100" cy="100" r="74" fill="none" stroke="#4338ca" strokeWidth="0.6" opacity="0.08"/>

          {/* Connecting lines between icon circles */}
          <g stroke="#6366f1" strokeWidth="0.5" opacity="0.1">
            <line x1="48" y1="52" x2="100" y2="34"/>
            <line x1="100" y1="34" x2="152" y2="52"/>
            <line x1="152" y1="52" x2="164" y2="100"/>
            <line x1="164" y1="100" x2="148" y2="148"/>
            <line x1="148" y1="148" x2="100" y2="164"/>
            <line x1="100" y1="164" x2="52" y2="148"/>
            <line x1="52" y1="148" x2="36" y2="100"/>
            <line x1="36" y1="100" x2="48" y2="52"/>
          </g>

          {/* Center glow */}
          <circle cx="100" cy="100" r="45" fill={`url(#rg${uid})`}/>

          {/* ═══ LEFT BRAIN — cyan circuit board ═══ */}
          <g filter={`url(#gc${uid})`}>
            <path d="M100 65 C97 63,90 60,84 63 C78 67,74 73,74 81 C74 87,72 92,74 98 C76 104,74 110,78 116 C82 122,90 128,96 130 L100 131" fill="none" stroke={`url(#cl${uid})`} strokeWidth="2.8" strokeLinecap="round"/>
            {/* Horizontal traces */}
            <path d="M100 74 L90 74 L86 70" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M100 83 L88 83 L82 79" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M100 92 L86 92 L80 89" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M100 101 L88 101 L82 105" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M100 110 L90 110 L86 114" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M100 119 L94 119 L90 123" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round"/>
            {/* Nodes */}
            <circle cx="86" cy="70" r="2.2" fill="#22d3ee"/>
            <circle cx="82" cy="79" r="2.2" fill="#22d3ee"/>
            <circle cx="80" cy="89" r="2.2" fill="#67e8f9"/>
            <circle cx="82" cy="105" r="2.2" fill="#22d3ee"/>
            <circle cx="86" cy="114" r="2.2" fill="#22d3ee"/>
            <circle cx="90" cy="123" r="2.2" fill="#22d3ee"/>
            {/* Vertical connectors */}
            <path d="M86 70 L86 77 L82 79" fill="none" stroke="#22d3ee" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
            <path d="M82 79 L82 87 L80 89" fill="none" stroke="#22d3ee" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
            <path d="M82 105 L84 111 L86 114" fill="none" stroke="#22d3ee" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
          </g>

          {/* ═══ RIGHT BRAIN — purple circuit board ═══ */}
          <g filter={`url(#gp${uid})`}>
            <path d="M100 65 C103 63,110 60,116 63 C122 67,126 73,126 81 C126 87,128 92,126 98 C124 104,126 110,122 116 C118 122,110 128,104 130 L100 131" fill="none" stroke={`url(#pl${uid})`} strokeWidth="2.8" strokeLinecap="round"/>
            {/* Horizontal traces */}
            <path d="M100 74 L110 74 L114 70" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M100 83 L112 83 L118 79" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M100 92 L114 92 L120 89" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M100 101 L112 101 L118 105" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M100 110 L110 110 L114 114" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M100 119 L106 119 L110 123" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"/>
            {/* Nodes */}
            <circle cx="114" cy="70" r="2.2" fill="#a78bfa"/>
            <circle cx="118" cy="79" r="2.2" fill="#a78bfa"/>
            <circle cx="120" cy="89" r="2.2" fill="#c084fc"/>
            <circle cx="118" cy="105" r="2.2" fill="#a78bfa"/>
            <circle cx="114" cy="114" r="2.2" fill="#a78bfa"/>
            <circle cx="110" cy="123" r="2.2" fill="#a78bfa"/>
            {/* Vertical connectors */}
            <path d="M114 70 L114 77 L118 79" fill="none" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
            <path d="M118 79 L118 87 L120 89" fill="none" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
            <path d="M118 105 L116 111 L114 114" fill="none" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
          </g>

          {/* Center divider */}
          <line x1="100" y1="65" x2="100" y2="131" stroke="#818cf8" strokeWidth="1" opacity="0.25"/>

          {/* ═══ 8 ICON CIRCLES ═══ */}

          {/* π — top-left */}
          <g filter={`url(#sg${uid})`}>
            <circle cx="48" cy="52" r="15" fill="#1e1b4b" fillOpacity="0.7" stroke="#4f46e5" strokeWidth="0.8" opacity="0.6"/>
            <text x="48" y="58" fill="#c4b5fd" fontSize="18" fontFamily="'Times New Roman',serif" fontWeight="bold" textAnchor="middle" opacity="0.9">π</text>
          </g>

          {/* Σ — top-center */}
          <g filter={`url(#sg${uid})`}>
            <circle cx="100" cy="34" r="15" fill="#1e1b4b" fillOpacity="0.7" stroke="#4f46e5" strokeWidth="0.8" opacity="0.6"/>
            <text x="100" y="41" fill="#c4b5fd" fontSize="18" fontFamily="'Times New Roman',serif" fontWeight="bold" textAnchor="middle" opacity="0.9">Σ</text>
          </g>

          {/* Flask — top-right */}
          <g filter={`url(#sg${uid})`}>
            <circle cx="152" cy="52" r="15" fill="#1e1b4b" fillOpacity="0.7" stroke="#4f46e5" strokeWidth="0.8" opacity="0.6"/>
            <g transform="translate(152,52)">
              <path d="M-2.5,-9 L-2.5,-2 L-7,7 L7,7 L2.5,-2 L2.5,-9" fill="none" stroke="#c4b5fd" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
              <line x1="-4" y1="-9" x2="4" y2="-9" stroke="#c4b5fd" strokeWidth="1.2" opacity="0.9"/>
              <path d="M-5,3 L5,3 L7,7 L-7,7 Z" fill="#7c3aed" fillOpacity="0.45"/>
              <circle cx="-1" cy="1" r="1" fill="#c084fc" opacity="0.6"/>
              <circle cx="2" cy="4.5" r="0.7" fill="#c084fc" opacity="0.5"/>
            </g>
          </g>

          {/* Atom — right */}
          <g filter={`url(#sg${uid})`}>
            <circle cx="164" cy="100" r="15" fill="#1e1b4b" fillOpacity="0.7" stroke="#4f46e5" strokeWidth="0.8" opacity="0.6"/>
            <g transform="translate(164,100)" opacity="0.9">
              <ellipse rx="9" ry="3.5" fill="none" stroke="#c084fc" strokeWidth="1" transform="rotate(-30)"/>
              <ellipse rx="9" ry="3.5" fill="none" stroke="#c084fc" strokeWidth="1" transform="rotate(30)"/>
              <ellipse rx="9" ry="3.5" fill="none" stroke="#c084fc" strokeWidth="1" transform="rotate(90)"/>
              <circle r="1.8" fill="#c084fc"/>
            </g>
          </g>

          {/* DNA — bottom-right */}
          <g filter={`url(#sg${uid})`}>
            <circle cx="148" cy="148" r="15" fill="#1e1b4b" fillOpacity="0.7" stroke="#4f46e5" strokeWidth="0.8" opacity="0.6"/>
            <g transform="translate(148,148)" opacity="0.9">
              <path d="M-3,-9 Q1,-5 3,-4 Q-1,-1 -3,0 Q1,3 3,5 Q-1,7 -3,9" fill="none" stroke="#67e8f9" strokeWidth="1.2"/>
              <path d="M3,-9 Q-1,-5 -3,-4 Q1,-1 3,0 Q-1,3 -3,5 Q1,7 3,9" fill="none" stroke="#c084fc" strokeWidth="1.2"/>
              <line x1="-1.5" y1="-4" x2="1.5" y2="-4" stroke="#a5b4fc" strokeWidth="0.7" opacity="0.5"/>
              <line x1="-1.5" y1="0" x2="1.5" y2="0" stroke="#a5b4fc" strokeWidth="0.7" opacity="0.5"/>
              <line x1="-1.5" y1="5" x2="1.5" y2="5" stroke="#a5b4fc" strokeWidth="0.7" opacity="0.5"/>
            </g>
          </g>

          {/* Σ — bottom-center */}
          <g filter={`url(#sg${uid})`}>
            <circle cx="100" cy="164" r="15" fill="#1e1b4b" fillOpacity="0.7" stroke="#4f46e5" strokeWidth="0.8" opacity="0.6"/>
            <text x="100" y="171" fill="#c4b5fd" fontSize="18" fontFamily="'Times New Roman',serif" fontWeight="bold" textAnchor="middle" opacity="0.9">Σ</text>
          </g>

          {/* Atom — bottom-left */}
          <g filter={`url(#sg${uid})`}>
            <circle cx="52" cy="148" r="15" fill="#1e1b4b" fillOpacity="0.7" stroke="#4f46e5" strokeWidth="0.8" opacity="0.6"/>
            <g transform="translate(52,148)" opacity="0.9">
              <ellipse rx="9" ry="3.5" fill="none" stroke="#a78bfa" strokeWidth="1" transform="rotate(-30)"/>
              <ellipse rx="9" ry="3.5" fill="none" stroke="#a78bfa" strokeWidth="1" transform="rotate(30)"/>
              <ellipse rx="9" ry="3.5" fill="none" stroke="#a78bfa" strokeWidth="1" transform="rotate(90)"/>
              <circle r="1.8" fill="#a78bfa"/>
            </g>
          </g>

          {/* ℝ — left */}
          <g filter={`url(#sg${uid})`}>
            <circle cx="36" cy="100" r="15" fill="#1e1b4b" fillOpacity="0.7" stroke="#4f46e5" strokeWidth="0.8" opacity="0.6"/>
            <text x="36" y="107" fill="#c4b5fd" fontSize="18" fontFamily="'Times New Roman',serif" fontWeight="bold" textAnchor="middle" opacity="0.9">ℝ</text>
          </g>
        </svg>
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
