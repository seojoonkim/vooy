"use client";

import { useEffect, useRef, useState } from "react";

const GREEN = "#00d4ff";
const CYAN = "#00e5ff";
const DIM = "rgba(0,180,255,0.175)";

// Eye centers (computed from SVG inner hole bounding boxes)
const EYE_CENTERS = [
  { x: 120.32, y: 93.67 }, // first 'o'
  { x: 192.32, y: 93.67 }, // second 'o'
];
const EYE_MAX_R = 15;
const EYE_PUPIL_R = 9;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [litLetters, setLitLetters] = useState<boolean[]>([false,false,false,false]);
  const [allLit, setAllLit] = useState(false);
  const [typed, setTyped] = useState("");
  const [uptime, setUptime] = useState("00:00:00");
  const [eyePos, setEyePos] = useState([{ x: 0, y: 0 }, { x: 0, y: 0 }]);
  const mousePos = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const eyePosRef = useRef([{ x: 0, y: 0 }, { x: 0, y: 0 }]);

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
    const STEP = 350;

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
    const t = setTimeout(runCycle, 600);
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

    let randomTarget = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
    let lastRandomChange = 0;
    let rafId = 0;

    const animate = () => {
      const now = Date.now();
      const svg = svgRef.current;

      if (svg) {
        const rect = svg.getBoundingClientRect();
        const scaleX = 313.1094 / rect.width;
        const scaleY = 165.1953 / rect.height;
        const mouseInSvgX = (mousePos.current.x - rect.left) * scaleX;
        const mouseInSvgY = (mousePos.current.y - rect.top) * scaleY;

        // Random target every 2s
        if (now - lastRandomChange > 2000) {
          lastRandomChange = now;
          randomTarget = EYE_CENTERS.map(() => ({
            x: (Math.random() * 2 - 1) * EYE_MAX_R,
            y: (Math.random() * 2 - 1) * EYE_MAX_R,
          }));
        }

        const prev = eyePosRef.current;
        const next = EYE_CENTERS.map((center, i) => {
          const dist = Math.hypot(mouseInSvgX - center.x, mouseInSvgY - center.y);
          const isNear = dist < 80;

          let targetX: number, targetY: number;
          if (isNear) {
            const dx = mouseInSvgX - center.x;
            const dy = mouseInSvgY - center.y;
            const angle = Math.atan2(dy, dx);
            const r = Math.min(dist / 80 * EYE_MAX_R, EYE_MAX_R);
            targetX = Math.cos(angle) * r;
            targetY = Math.sin(angle) * r;
          } else {
            targetX = randomTarget[i].x;
            targetY = randomTarget[i].y;
          }

          return {
            x: (prev[i]?.x ?? 0) * 0.85 + targetX * 0.15,
            y: (prev[i]?.y ?? 0) * 0.85 + targetY * 0.15,
          };
        });

        eyePosRef.current = next;
        setEyePos(next);
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
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"min(700px,90vw)", height:400, borderRadius:"50%", background:`radial-gradient(ellipse, rgba(0,180,255,0.028) 0%, transparent 70%)`, pointerEvents:"none" }} />

      <div style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", gap:0, textAlign:"center", padding:"0 16px", width:"100%" }}>

        {/* ── Top status bar ── */}
        <div style={{ display:"flex", gap:"clamp(8px,3vw,24px)", marginBottom:32, flexWrap:"wrap", justifyContent:"center", animation:"fadeSlide 0.6s ease both" }}>
          {[
            { label:"SYS", value:"ONLINE" },
            { label:"MODE", value:"AGENTIC" },
            { label:"UPTIME", value:uptime },
          ].map((item, i) => (
            <div key={i} style={{ fontFamily:"monospace", fontSize:"clamp(9px,2vw,11px)", letterSpacing:"0.15em", padding:"4px 10px", border:`1px solid ${DIM}`, borderRadius:3, background:"rgba(0,180,255,0.04)", color:DIM, display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ color:"rgba(0,180,255,0.125)" }}>{item.label}</span>
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
              width: "clamp(280px, 65vw, 510px)",
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
            </defs>
            {/* v */}
            <path
              d="M34.0234375 126.25 10.703125 60.7421875H35.4296875L43.92578125 90.625Q45.21484375 95.078125 46.26953125 99.6484375Q47.32421875 104.21875 48.26171875 109.140625Q49.19921875 104.21875 50.224609375 99.677734375Q51.25 95.13671875 52.48046875 90.625L60.7421875 60.7421875H85.1171875L61.6796875 126.25Z"
              fillRule="evenodd"
              fill={litLetters[0] ? "white" : "rgba(255,255,255,0.08)"}
              filter={litLetters[0] ? "url(#letterGlow)" : undefined}
              style={{ transition: "fill 0.5s ease" }}
            />
            {/* o1 흰 원 (눈 흰자) */}
            <circle
              cx={120.32} cy={93.67} r={33.75}
              fill={litLetters[1] ? "white" : "rgba(255,255,255,0.08)"}
              style={{ transition: "fill 0.5s ease" }}
            />
            {/* o1 눈동자 */}
            {allLit && (
              <circle
                cx={120.32 + eyePos[0].x}
                cy={93.67 + eyePos[0].y}
                r={EYE_PUPIL_R}
                fill="#00d4ff"
              />
            )}
            {/* o2 흰 원 (눈 흰자) */}
            <circle
              cx={192.32} cy={93.67} r={33.75}
              fill={litLetters[2] ? "white" : "rgba(255,255,255,0.08)"}
              style={{ transition: "fill 0.5s ease" }}
            />
            {/* o2 눈동자 */}
            {allLit && (
              <circle
                cx={192.32 + eyePos[1].x}
                cy={93.67 + eyePos[1].y}
                r={EYE_PUPIL_R}
                fill="#00d4ff"
              />
            )}
            {/* y */}
            <path
              d="M232.85546875 148.984375 238.01171875 132.2265625 241.05859375 133.046875Q246.80078125 134.5703125 250.140625 132.900390625Q253.48046875 131.23046875 252.42578125 128.18359375L251.78125 126.30859375L227.52343750 60.7421875H252.25L260.74609375 90.625Q261.91796875 94.78515625 262.708984375 98.974609375Q263.5 103.1640625 264.203125 107.6171875Q265.19921875 103.10546875 266.283203125 98.916015625Q267.3671875 94.7265625 268.65625 90.625L278.03125 60.7421875H302.40625L275.39453125 132.2265625Q273.40234375 137.55859375 270.00390625 141.865234375Q266.60546875 146.171875 261.185546875 148.69140625Q255.765625 151.2109375 247.50390625 151.2109375Q243.46093750 151.2109375 239.53515625 150.625Q235.609375 150.0390625 232.85546875 148.984375Z"
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
        <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"fadeSlide 0.9s 0.3s ease both", opacity:0, marginTop:28 }}>
          <p style={{ fontWeight:700, fontSize:"clamp(11px,2.5vw,14px)", letterSpacing:"0.12em", color:GREEN, textShadow:`0 0 20px rgba(0,180,255,0.2)`, margin:0 }}>
            Virtual Oracle Of You
          </p>
        </div>

        {/* ── Divider ── */}
        <div style={{ width:1, height:28, background:`linear-gradient(to bottom,transparent,${DIM},transparent)`, margin:"20px 0", animation:"fadeSlide 0.8s 0.4s ease both", opacity:0 }} />

        {/* ── Terminal command line ── */}
        <div style={{ fontFamily:"monospace", fontSize:"clamp(10px,2.5vw,13px)", color:DIM, letterSpacing:"0.08em", animation:"fadeSlide 0.8s 0.5s ease both", opacity:0 }}>
          <span style={{ color:"rgba(0,180,255,0.125)" }}>root@vooy</span>
          <span style={{ color:"rgba(0,180,255,0.075)" }}>:~$ </span>
          <span style={{ color:GREEN }}>{typed}</span>
          <span style={{ animation:"blink 0.8s step-end infinite", color:GREEN }}>▌</span>
        </div>

        {/* ── Mini terminal log ── */}
        <div style={{ marginTop:28, fontFamily:"monospace", fontSize:"clamp(8px,1.8vw,10px)", color:"rgba(0,180,255,0.11)", letterSpacing:"0.08em", lineHeight:1.9, textAlign:"center", animation:"fadeSlide 1s 0.7s ease both", opacity:0, maxWidth:320, width:"100%" }}>
          {[
            "[OK]  agent runtime initialized",
            "[>>]  autonomous systems online...",
          ].map((line, i) => (
            <div key={i} style={{ color: i === 1 ? `rgba(79,195,247,0.175)` : "rgba(0,180,255,0.11)" }}>
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
