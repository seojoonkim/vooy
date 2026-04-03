"use client";

import { useEffect, useRef, useState } from "react";

const GREEN = "#00d4ff";
const CYAN = "#00e5ff";
const DIM = "rgba(0,180,255,0.35)";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [litLetters, setLitLetters] = useState<boolean[]>([false,false,false,false]);
  const [allLit, setAllLit] = useState(false);
  const [typed, setTyped] = useState("");
  const [uptime, setUptime] = useState("00:00:00");

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

  // Letter-by-letter light up sequence
  useEffect(() => {
    const STEP = 350;
    const HOLD = 1800;
    const PAUSE = 2200;

    function runCycle() {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          setLitLetters(prev => { const n=[...prev]; n[i]=true; return n; });
          if (i === 3) {
            setTimeout(() => setAllLit(true), 60);
            setTimeout(() => {
              setAllLit(false);
              setTimeout(() => {
                setLitLetters([false,false,false,false]);
                setTimeout(runCycle, PAUSE);
              }, 1000);
            }, HOLD);
          }
        }, i * STEP);
      }
    }
    const t = setTimeout(runCycle, 600);
    return () => clearTimeout(t);
  }, []);

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
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"min(700px,90vw)", height:400, borderRadius:"50%", background:`radial-gradient(ellipse, rgba(0,180,255,0.055) 0%, transparent 70%)`, pointerEvents:"none" }} />

      <div style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", gap:0, textAlign:"center", padding:"0 16px", width:"100%" }}>

        {/* ── Top status bar ── */}
        <div style={{ display:"flex", gap:"clamp(8px,3vw,24px)", marginBottom:32, flexWrap:"wrap", justifyContent:"center", animation:"fadeSlide 0.6s ease both" }}>
          {[
            { label:"SYS", value:"ONLINE" },
            { label:"MODE", value:"AGENTIC" },
            { label:"UPTIME", value:uptime },
          ].map((item, i) => (
            <div key={i} style={{ fontFamily:"monospace", fontSize:"clamp(9px,2vw,11px)", letterSpacing:"0.15em", padding:"4px 10px", border:`1px solid ${DIM}`, borderRadius:3, background:"rgba(0,180,255,0.04)", color:DIM, display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ color:"rgba(0,180,255,0.25)" }}>{item.label}</span>
              <span style={{ color: item.label === "SYS" ? GREEN : DIM }}>{item.value}</span>
              {item.label === "SYS" && <span style={{ color:GREEN, animation:"blink 1s step-end infinite", fontSize:8 }}>●</span>}
            </div>
          ))}
        </div>

        {/* ── LOGO ── */}
        <div style={{ position:"relative", animation:"fadeSlide 0.8s 0.15s ease both", opacity:0 }}>
          <div style={{ position:"relative" }}>
            {/* Base: individual letter lighting */}
            <div style={{ fontWeight:900, fontSize:"clamp(106px,22vw,148px)", letterSpacing:"-3px", lineHeight:1, display:"flex", justifyContent:"center", fontFamily:"'Inter', Arial Black, sans-serif" }}>
              {"vooy".split("").map((ch, i) => (
                <span key={i} style={{
                  display:"inline-block",
                  transition:"opacity 0.5s ease, color 0.5s ease",
                  color: litLetters[i] ? "#fff" : "rgba(255,255,255,0.08)",
                }}>{ch}</span>
              ))}
            </div>
            {/* Overlay: allLit outline */}
            <div style={{
              position:"absolute", inset:0,
              display:"flex", justifyContent:"center", alignItems:"center",
              fontWeight:900, fontSize:"clamp(106px,22vw,148px)", letterSpacing:"-3px", lineHeight:1,
              fontFamily:"'Inter', Arial Black, sans-serif",
              color:"transparent",
              WebkitTextStroke:"1px rgba(0,180,255,0.6)",
              textShadow:`0 0 20px rgba(0,180,255,0.5), 0 0 40px rgba(0,180,255,0.2)`,
              pointerEvents:"none",
              opacity: allLit ? 1 : 0,
              transition: "opacity 1.2s ease",
            }}>
              vooy
            </div>
            {/* White glow fill allLit */}
            <div style={{
              position:"absolute", inset:0,
              display:"flex", justifyContent:"center", alignItems:"center",
              fontWeight:900, fontSize:"clamp(106px,22vw,148px)", letterSpacing:"-3px", lineHeight:1,
              fontFamily:"'Inter', Arial Black, sans-serif",
              color:"rgba(255,255,255,0.88)",
              pointerEvents:"none",
              opacity: allLit ? 1 : 0,
              transition: "opacity 1.2s ease",
            }}>
              vooy
            </div>
          </div>
          {/* Underline */}
          <div style={{ marginTop:6, height:2, background:`linear-gradient(to right, transparent, ${GREEN}, ${CYAN}, transparent)`, borderRadius:2, animation:"underlineGlow 8s ease-in-out infinite" }} />
        </div>

        {/* ── Catchphrase ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"fadeSlide 0.9s 0.3s ease both", opacity:0, marginTop:28 }}>
          <p style={{ fontWeight:700, fontSize:"clamp(11px,2.5vw,14px)", letterSpacing:"0.12em", color:GREEN, textShadow:`0 0 20px rgba(0,180,255,0.4)`, margin:0 }}>
            Virtual Oracle Of You
          </p>
        </div>

        {/* ── Divider ── */}
        <div style={{ width:1, height:28, background:`linear-gradient(to bottom,transparent,${DIM},transparent)`, margin:"20px 0", animation:"fadeSlide 0.8s 0.4s ease both", opacity:0 }} />

        {/* ── Terminal command line ── */}
        <div style={{ fontFamily:"monospace", fontSize:"clamp(10px,2.5vw,13px)", color:DIM, letterSpacing:"0.08em", animation:"fadeSlide 0.8s 0.5s ease both", opacity:0 }}>
          <span style={{ color:"rgba(0,180,255,0.25)" }}>root@vooy</span>
          <span style={{ color:"rgba(0,180,255,0.15)" }}>:~$ </span>
          <span style={{ color:GREEN }}>{typed}</span>
          <span style={{ animation:"blink 0.8s step-end infinite", color:GREEN }}>▌</span>
        </div>

        {/* ── Mini terminal log ── */}
        <div style={{ marginTop:28, fontFamily:"monospace", fontSize:"clamp(8px,1.8vw,10px)", color:"rgba(0,180,255,0.22)", letterSpacing:"0.08em", lineHeight:1.9, textAlign:"center", animation:"fadeSlide 1s 0.7s ease both", opacity:0, maxWidth:320, width:"100%" }}>
          {[
            "[OK]  agent runtime initialized",
            "[>>]  autonomous systems online...",
          ].map((line, i) => (
            <div key={i} style={{ color: i === 1 ? `rgba(79,195,247,0.35)` : "rgba(0,180,255,0.22)" }}>
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
          0%,100% { opacity:1;    text-shadow:0 0 50px rgba(0,180,255,0.4),0 0 100px rgba(0,180,255,0.15); }
          35%     { opacity:0.12; text-shadow:none; }
          55%     { opacity:0.06; text-shadow:none; }
          75%     { opacity:0.65; text-shadow:0 0 30px rgba(0,180,255,0.2); }
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
