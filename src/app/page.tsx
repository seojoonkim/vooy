"use client";

import { useEffect, useRef, useState } from "react";

const GREEN = "#00d4ff";
const CYAN = "#00e5ff";
const DIM = "rgba(0,180,255,0.7)";

// Eye reference center (for offset calculation)
const refCenter = { x: 120.32, y: 93.67 };

// Eye motion tuning constants
const EYE_BASE_MAX_R = 12;
const EYE_RANGE_MULTIPLIER = 1.2; // +20% movement range
const EYE_MAX_R = EYE_BASE_MAX_R * EYE_RANGE_MULTIPLIER;
const EYE_DESKTOP_RADIUS_FACTOR = 0.8;
const EYE_FOLLOW_STIFFNESS = 0.098;
const EYE_FOLLOW_DAMPING = 0.835;
const EYE_VELOCITY_MAX = 2.0;
const EYE_CLOSE_DISTANCE = 60;
const EYE_MOBILE_RANDOM_INTERVAL_MS = 2500;
const EYE_SETTLE_PULL = 0.011;
const EYE_MICRO_SWAY_X = 0.72;
const EYE_MICRO_SWAY_Y = 0.48;
const EYE_MICRO_SWAY_SPEED_X = 0.00155;
const EYE_MICRO_SWAY_SPEED_Y = 0.00205;
const EYE_NEAR_POINTER_SOFTEN = 0.64;
const EYE_EDGE_SOFTNESS = 0.93;
const EYE_INTEREST_BOOST = 0.12;
const EYE_CUTE_BOUNCE = 0.08;
const EYE_CUTE_BOUNCE_SPEED = 0.0032;

// Original font paths extracted from vooy-logo-path.svg
const V_PATH = "M34.0234375 126.25 10.703125 60.7421875H35.4296875L43.92578125 90.625Q45.21484375 95.078125 46.26953125 99.6484375Q47.32421875 104.21875 48.26171875 109.140625Q49.19921875 104.21875 50.224609375 99.677734375Q51.25 95.13671875 52.48046875 90.625L60.7421875 60.7421875H85.1171875L61.6796875 126.25Z";

const O1_OUTER = "M120.37890625 127.421875Q109.71484375 127.421875 102.09765625 123.173828125Q94.48046875 118.92578125 90.466796875 111.337890625Q86.453125 103.75 86.453125 93.671875Q86.453125 83.59375 90.466796875 76.005859375Q94.48046875 68.41796875 102.09765625 64.169921875Q109.71484375 59.921875 120.37890625 59.921875Q131.04296875 59.921875 138.6015625 64.169921875Q146.16015625 68.41796875 150.173828125 76.005859375Q154.1875 83.59375 154.1875 93.671875Q154.1875 103.75 150.173828125 111.337890625Q146.16015625 118.92578125 138.6015625 123.173828125Q131.04296875 127.421875 120.37890625 127.421875Z";

const O2_OUTER = "M192.37890625 127.421875Q181.71484375 127.421875 174.09765625 123.173828125Q166.48046875 118.92578125 162.466796875 111.337890625Q158.453125 103.75 158.453125 93.671875Q158.453125 83.59375 162.466796875 76.005859375Q166.48046875 68.41796875 174.09765625 64.169921875Q181.71484375 59.921875 192.37890625 59.921875Q203.04296875 59.921875 210.6015625 64.169921875Q218.16015625 68.41796875 222.173828125 76.005859375Q226.1875 83.59375 226.1875 93.671875Q226.1875 103.75 222.173828125 111.337890625Q218.16015625 118.92578125 210.6015625 123.173828125Q203.04296875 127.421875 192.37890625 127.421875Z";

// Inner hole paths extracted from font (second M contour in each o path)
const O1_INNER = "M120.37890625 109.84375Q124.94921875 109.84375 127.556640625 105.537109375Q130.1640625 101.23046875 130.1640625 93.5546875Q130.1640625 85.8203125 127.556640625 81.66015625Q124.94921875 77.5 120.37890625 77.5Q115.75 77.5 113.11328125 81.66015625Q110.4765625 85.8203125 110.4765625 93.5546875Q110.4765625 101.23046875 113.11328125 105.537109375Q115.75 109.84375 120.37890625 109.84375Z";
const O2_INNER = "M192.37890625 109.84375Q196.94921875 109.84375 199.55664062500003 105.537109375Q202.16406250000003 101.23046875 202.16406250000003 93.5546875Q202.16406250000003 85.8203125 199.55664062500003 81.66015625Q196.94921875 77.5 192.37890625 77.5Q187.75 77.5 185.11328125000003 81.66015625Q182.47656250000003 85.8203125 182.47656250000003 93.5546875Q182.47656250000003 101.23046875 185.11328125000003 105.537109375Q187.75 109.84375 192.37890625 109.84375Z";

const Y_PATH = "M232.85546875 148.984375 238.01171875 132.2265625 241.05859375 133.046875Q246.80078125 134.5703125 250.140625 132.900390625Q253.48046875 131.23046875 252.42578125 128.18359375L251.78125 126.30859375L227.52343750 60.7421875H252.25L260.74609375 90.625Q261.91796875 94.78515625 262.708984375 98.974609375Q263.5 103.1640625 264.203125 107.6171875Q265.19921875 103.10546875 266.283203125 98.916015625Q267.3671875 94.7265625 268.65625 90.625L278.03125 60.7421875H302.40625L275.39453125 132.2265625Q273.40234375 137.55859375 270.00390625 141.865234375Q266.60546875 146.171875 261.185546875 148.69140625Q255.765625 151.2109375 247.50390625 151.2109375Q243.46093750 151.2109375 239.53515625 150.625Q235.609375 150.0390625 232.85546875 148.984375Z";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [litLetters, setLitLetters] = useState<boolean[]>([false,false,false,false]);
  const [allLit, setAllLit] = useState(false);
  const [typed, setTyped] = useState("");
  const [uptime, setUptime] = useState("00:00:00");
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const eyeOffsetRef = useRef({ x: 0, y: 0 });
  const eyeVelocityRef = useRef({ x: 0, y: 0 });

  // Typewriter effect for command line
  const CMD = "initialize --mode=agentic --level=autonomous";
  useEffect(() => {
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        setTyped(CMD.slice(0, ++i));
        if (i >= CMD.length) clearInterval(iv);
      }, 180);
      return () => clearInterval(iv);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  // Uptime counter
  useEffect(() => {
    let s = 0;
    const iv = setInterval(() => {
      s++;
      const h = String(Math.floor(s / 3600)).padStart(2, "0");
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      const sec = String(s % 60).padStart(2, "0");
      setUptime(`${h}:${m}:${sec}`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // Letter-by-letter light up sequence (one-time, stays lit)
  useEffect(() => {
    const STEP = 600;

    function runCycle() {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          setLitLetters(prev => { const n=[...prev]; n[i]=true; return n; });
          if (i === 3) {
            setTimeout(() => setAllLit(true), 60);
            // 리셋 없음 - 여기서 끝
          }
        }, i * STEP);
      }
    }
    const t = setTimeout(runCycle, 900);
    return () => clearTimeout(t);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Eye animation
  useEffect(() => {
    if (!allLit) return;

    const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    let randomTarget = { x: 0, y: 0 };
    let lastRandomChange = 0;
    let rafId = 0;

    const clampToEyeRange = (x: number, y: number, limit = EYE_MAX_R * EYE_EDGE_SOFTNESS) => {
      const mag = Math.hypot(x, y);
      if (mag <= limit || mag === 0) return { x, y };
      const scale = limit / mag;
      return { x: x * scale, y: y * scale };
    };

    const animate = () => {
      const now = Date.now();
      const svg = svgRef.current;

      if (svg) {
        const rect = svg.getBoundingClientRect();
        const scaleX = 313.1094 / rect.width;
        const scaleY = 165.1953 / rect.height;
        const mouseInSvgX = (mousePos.current.x - rect.left) * scaleX;
        const mouseInSvgY = (mousePos.current.y - rect.top) * scaleY;

        const prev = eyeOffsetRef.current;
        let targetX: number, targetY: number;

        if (isMobile) {
          // Mobile: random movement every 2.5s, but keep it soft and alive.
          if (now - lastRandomChange > EYE_MOBILE_RANDOM_INTERVAL_MS) {
            lastRandomChange = now;
            const randomAngle = Math.random() * Math.PI * 2;
            const randomRadius = (0.35 + Math.random() * 0.45) * EYE_MAX_R;
            randomTarget = {
              x: Math.cos(randomAngle) * randomRadius,
              y: Math.sin(randomAngle) * randomRadius,
            };
          }
          targetX = randomTarget.x;
          targetY = randomTarget.y;
        } else {
          // Desktop: follow pointer with softer near-center response and a tiny organic sway.
          const dx = mouseInSvgX - refCenter.x;
          const dy = mouseInSvgY - refCenter.y;
          const dist = Math.hypot(dx, dy);
          const normalizedDist = Math.min(dist / EYE_CLOSE_DISTANCE, 1);
          const easedDist = 1 - Math.pow(1 - normalizedDist, 2);
          const nearPointerFactor = normalizedDist < 1
            ? EYE_NEAR_POINTER_SOFTEN + (1 - EYE_NEAR_POINTER_SOFTEN) * easedDist
            : 1;
          const r = Math.min(
            easedDist * EYE_MAX_R * nearPointerFactor,
            EYE_MAX_R * EYE_DESKTOP_RADIUS_FACTOR,
          );
          const ang = Math.atan2(dy, dx);
          const swayX = Math.sin(now * EYE_MICRO_SWAY_SPEED_X) * EYE_MICRO_SWAY_X;
          const swayY = Math.cos(now * EYE_MICRO_SWAY_SPEED_Y) * EYE_MICRO_SWAY_Y;
          const interest = Math.min(dist / 220, 1) * EYE_INTEREST_BOOST;
          const cuteBounce = Math.sin(now * EYE_CUTE_BOUNCE_SPEED) * EYE_CUTE_BOUNCE;
          targetX = Math.cos(ang) * r * (1 + interest) + swayX;
          targetY = Math.sin(ang) * r * (1 + interest * 0.6) + swayY + cuteBounce;
        }

        const settledTarget = clampToEyeRange(
          targetX - prev.x * EYE_SETTLE_PULL,
          targetY - prev.y * EYE_SETTLE_PULL,
        );

        const prevVelocity = eyeVelocityRef.current;
        let nextVelocity = {
          x: (prevVelocity.x + (settledTarget.x - prev.x) * EYE_FOLLOW_STIFFNESS) * EYE_FOLLOW_DAMPING,
          y: (prevVelocity.y + (settledTarget.y - prev.y) * EYE_FOLLOW_STIFFNESS) * EYE_FOLLOW_DAMPING,
        };

        const velocityMagnitude = Math.hypot(nextVelocity.x, nextVelocity.y);
        if (velocityMagnitude > EYE_VELOCITY_MAX) {
          const scale = EYE_VELOCITY_MAX / velocityMagnitude;
          nextVelocity = {
            x: nextVelocity.x * scale,
            y: nextVelocity.y * scale,
          };
        }

        const next = clampToEyeRange(
          prev.x + nextVelocity.x,
          prev.y + nextVelocity.y,
        );

        eyeVelocityRef.current = nextVelocity;
        eyeOffsetRef.current = next;
        setEyeOffset(next);
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [allLit]);

  // Anti-gravity particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const CHARS = "01アイウエ><[]{}=_▲▼◆●⬡⬢∞";
    const COLORS = [GREEN, CYAN, "#b388ff", "#4fc3f7"];
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vy: -(0.25 + Math.random() * 0.7),
      vx: (Math.random() - 0.5) * 0.25,
      size: 9 + Math.random() * 7,
      alpha: 0.06 + Math.random() * 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      t: 0,
    }));

    let raf: number, frame = 0;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);
      frame++;

      // Scanlines
      for (let y = 0; y < H; y += 3) { ctx.fillStyle = "rgba(0,0,0,0.06)"; ctx.fillRect(0, y, W, 1); }

      // Particles
      for (const p of particles) {
        if (frame % 35 === 0) p.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        p.y += p.vy; p.x += p.vx;
        if (p.y < -20) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        ctx.font = `${p.size}px monospace`;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillText(p.char, p.x, p.y);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <main style={{ position:"relative", height:"100dvh", minHeight:"100dvh", maxHeight:"100dvh", background:"linear-gradient(160deg,#050a0d 0%,#020810 55%,#05050a 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden", fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif" }}>
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, pointerEvents:"none" }} />

      {/* Vignette */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.8) 100%)" }} />
      {/* Center glow */}
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"min(700px,90vw)", height:400, borderRadius:"50%", background:`radial-gradient(ellipse, rgba(0,180,255,0.06) 0%, transparent 70%)`, pointerEvents:"none" }} />

      <div style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", gap:0, textAlign:"center", padding:"0 16px", width:"100%" }}>

        {/* ── Top status bar ── */}
        <div style={{ display:"flex", gap:"clamp(6.3px,2.1vw,25.2px)", marginBottom:44, flexWrap:"nowrap", justifyContent:"center", animation:"fadeSlide 0.6s ease both" }}>
          {[
            { label:"SYS", value:"ONLINE" },
            { label:"MODE", value:"AGENTIC" },
            { label:"UPTIME", value:uptime },
          ].map((item, i) => (
            <div key={i} style={{ fontFamily:"monospace", fontSize:"clamp(9.45px,2.415vw,13.65px)", letterSpacing:"0.12em", padding:"3px 7px", border:`1px solid ${DIM}`, borderRadius:3, background:"rgba(0,180,255,0.04)", color:DIM, display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ color:"rgba(0,180,255,0.6)" }}>{item.label}</span>
              <span style={{ color: item.label === "SYS" ? GREEN : DIM }}>{item.value}</span>
              {item.label === "SYS" && <span style={{ color:GREEN, animation:"blink 1s step-end infinite", fontSize:8 }}>●</span>}
            </div>
          ))}
        </div>

        {/* ── LOGO (inline SVG) ── */}
        <div style={{ position:"relative", animation:"fadeSlide 0.8s 0.15s ease both", opacity:0 }}>
          <svg
            ref={svgRef}
            viewBox="0 0 313.1094 165.1953"
            style={{
              width: "clamp(336px,67vw,730px)",
              height: "auto",
              display: "block",
              filter: allLit
                ? "drop-shadow(0 0 3px rgba(0,180,255,0.15)) drop-shadow(0 0 6px rgba(0,180,255,0.075))"
                : "none",
              transition: "filter 1.2s ease",
            }}
          >
            <defs>
              <filter id="letterGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {/* Masks for transparent holes that move with eye offset */}
              <mask id="o1mask">
                <rect x="0" y="0" width="313.1094" height="165.1953" fill="white" />
                <path d={O1_INNER} fill="black" transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`} />
              </mask>
              <mask id="o2mask">
                <rect x="0" y="0" width="313.1094" height="165.1953" fill="white" />
                <path d={O2_INNER} fill="black" transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`} />
              </mask>

            </defs>
            {/* v */}
            <path
              d={V_PATH}
              fillRule="evenodd"
              fill={litLetters[0] ? "white" : "rgba(255,255,255,0.08)"}
              filter={litLetters[0] ? "url(#letterGlow)" : undefined}
              style={{ transition: "fill 0.5s ease" }}
            />
            {/* o1 - outer shape with mask for transparent moving hole */}
            <g filter={litLetters[1] ? "url(#letterGlow)" : undefined}>
              <path
                d={O1_OUTER}
                fill={litLetters[1] ? "white" : "rgba(255,255,255,0.08)"}
                mask="url(#o1mask)"
                style={{ transition: "fill 0.5s ease" }}
              />

            </g>
            {/* o2 - outer shape with mask for transparent moving hole */}
            <g filter={litLetters[2] ? "url(#letterGlow)" : undefined}>
              <path
                d={O2_OUTER}
                fill={litLetters[2] ? "white" : "rgba(255,255,255,0.08)"}
                mask="url(#o2mask)"
                style={{ transition: "fill 0.5s ease" }}
              />

            </g>
            {/* y */}
            <path
              d={Y_PATH}
              fillRule="evenodd"
              fill={litLetters[3] ? "white" : "rgba(255,255,255,0.08)"}
              filter={litLetters[3] ? "url(#letterGlow)" : undefined}
              style={{ transition: "fill 0.5s ease" }}
            />
          </svg>
          {/* Underline */}
          <div style={{ marginTop:6, height:2, background:`linear-gradient(to right, transparent, ${GREEN}, ${CYAN}, transparent)`, borderRadius:2, animation:"underlineGlow 8s ease-in-out infinite" }} />
        </div>

        {/* ── Catchphrase ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:11, animation:"fadeSlide 0.9s 0.3s ease both", opacity:0, marginTop:39 }}>
          <p style={{ fontWeight:700, fontSize:"clamp(16.8px,3.675vw,21px)", letterSpacing:"0.12em", color:GREEN, textShadow:`0 0 12px rgba(0,180,255,0.8), 0 0 28px rgba(0,180,255,0.5), 0 0 50px rgba(0,180,255,0.25)`, margin:0 }}>
            Virtual Oracle Of You
          </p>
        </div>

        {/* ── Divider ── */}
        <div style={{ width:1, height:29, background:`linear-gradient(to bottom,transparent,${DIM},transparent)`, margin:"21px 0", animation:"fadeSlide 0.8s 0.4s ease both", opacity:0 }} />

        {/* ── Terminal command line ── */}
        <div style={{ fontFamily:"monospace", fontSize:"clamp(12.6px,3.045vw,15.75px)", color:DIM, letterSpacing:"0.08em", animation:"fadeSlide 0.8s 0.5s ease both", opacity:0 }}>
          <span style={{ color:"rgba(0,180,255,0.7)" }}>root@vooy</span>
          <span style={{ color:"rgba(0,180,255,0.5)" }}>:~$ </span>
          <span style={{ color:GREEN }}>{typed}</span>
          <span style={{ animation:"blink 0.8s step-end infinite", color:GREEN }}>▌</span>
        </div>

        {/* ── Mini terminal log ── */}
        <div style={{ marginTop:29, fontFamily:"monospace", fontSize:"clamp(8.4px,1.89vw,10.5px)", color:"rgba(0,180,255,0.55)", letterSpacing:"0.08em", lineHeight:1.9, textAlign:"center", animation:"fadeSlide 1s 0.7s ease both", opacity:0, maxWidth:336, width:"100%" }}>
          {[
            "[OK]  agent runtime initialized",
            "[>>]  autonomous systems online...",
          ].map((line, i) => (
            <div key={i} style={{ color: i === 1 ? `rgba(79,195,247,0.65)` : "rgba(0,180,255,0.55)" }}>
              {line}
            </div>
          ))}
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeSlide {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes blink {
          0%,100% { opacity:1; }
          50%      { opacity:0; }
        }
        @keyframes breathe {
          0%,100% { opacity:1;    text-shadow:0 0 25px rgba(0,180,255,0.2),0 0 50px rgba(0,180,255,0.075); }
          35%     { opacity:0.12; text-shadow:none; }
          55%     { opacity:0.06; text-shadow:none; }
          75%     { opacity:0.65; text-shadow:0 0 15px rgba(0,180,255,0.1); }
        }
        @keyframes underlineGlow {
          0%   { opacity:0.08; background-size:20% 100%; background-position:0% center; }
          50%  { opacity:0.45; background-size:100% 100%; background-position:50% center; }
          100% { opacity:0.08; background-size:20% 100%; background-position:100% center; }
        }
        @media (max-width:480px) {
          main { padding:24px 0; }
        }
      `}</style>
    </main>
  );
}
