"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGame } from "./store";
import { NPCS, TOTAL, CREED, CONTACT_EMAIL } from "./data";
import { pressKey, releaseKey, setStick, clearStick } from "./input";
import { startAudio, setSound } from "./audio";

const ACCENT = "#ddc527";
const CYAN = "#4fe3d0";

function npcById(id: string | null) {
  return NPCS.find((n) => n.id === id) ?? null;
}

export default function Hud() {
  const router = useRouter();
  const started = useGame((s) => s.started);
  const soundOn = useGame((s) => s.soundOn);
  const showObjective = useGame((s) => s.showObjective);
  const complete = useGame((s) => s.complete);
  const nearId = useGame((s) => s.nearId);
  const dialogue = useGame((s) => s.dialogue);
  const talked = useGame((s) => s.talked);

  const [typed, setTyped] = useState("");
  const typingDone = useRef(true);
  const fullText = useRef("");

  // --- セリフのタイプライター表示 ---
  useEffect(() => {
    if (!dialogue) return;
    const npc = npcById(dialogue.npcId);
    if (!npc) return;
    const full = npc.lines[dialogue.line] ?? "";
    fullText.current = full;
    typingDone.current = false;
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        typingDone.current = true;
        clearInterval(id);
      }
    }, 28);
    return () => clearInterval(id);
  }, [dialogue]);

  const advance = useCallback(() => {
    const d = useGame.getState().dialogue;
    if (!d) return;
    if (!typingDone.current) {
      setTyped(fullText.current);
      typingDone.current = true;
      return;
    }
    const npc = npcById(d.npcId);
    useGame.getState().nextLine(npc ? npc.lines.length : 1);
  }, []);

  const interact = useCallback(() => {
    const st = useGame.getState();
    if (!st.started) return;
    if (st.dialogue) advance();
    else if (st.nearId) st.openDialogue(st.nearId);
  }, [advance]);

  // --- キーボード ---
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
      pressKey(e.key);
      if (k === "e" || k === " ") interact();
    };
    const up = (e: KeyboardEvent) => releaseKey(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [interact]);

  // --- サウンド同期 ---
  useEffect(() => {
    if (started) setSound(soundOn);
  }, [soundOn, started]);

  const handleStart = () => {
    useGame.getState().start();
    useGame.setState({ soundOn: true });
    startAudio();
  };

  const goCorporate = useCallback(() => {
    router.push("/corporate");
  }, [router]);

  const near = npcById(nearId);
  const dialogueNpc = dialogue ? npcById(dialogue.npcId) : null;
  const count = talked.length;

  return (
    <div className="hud-root">
      <style>{cssText}</style>

      {/* 上部右：目標 & サウンド */}
      {started && (
        <div className="top-right">
          <button className="icobtn" onClick={() => useGame.getState().toggleObjective()} title="目標">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <path d="M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </button>
          <button className="icobtn" onClick={() => useGame.getState().toggleSound()} title="サウンド">
            {soundOn ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /><line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* 会社概要リンク */}
      {started && (
        <button type="button" className="corp-link" onClick={goCorporate}>
          <span>会社概要を見る</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </button>
      )}

      {/* 目標カード */}
      {started && showObjective && (
        <div className="objective">
          <div className="nextup">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01z" /></svg>
            FRIEND COLLECTION
          </div>
          <div className="obj-body">
            {count < TOTAL ? (
              <>社員に話しかけて、<b>木まぐれの想い</b>を集めよう。</>
            ) : (
              <>コンプリート！ <b>木まぐれの想い</b>が集まりました。</>
            )}
            <div className="bar"><div className="bar-fill" style={{ width: `${(count / TOTAL) * 100}%` }} /></div>
            <div className="bar-label">友達コレクション {count} / {TOTAL}</div>
          </div>
        </div>
      )}

      {/* 操作プロンプト（タップ/クリックでも会話開始） */}
      {started && !dialogue && near && (
        <button
          type="button"
          className="prompt"
          onPointerDown={(e) => {
            e.preventDefault();
            interact();
          }}
        >
          <span className="prompt-pill">
            <span className="keycap">E</span>
            <span>{talked.includes(near.id) ? "もう一度話す" : "話しかける"}</span>
          </span>
        </button>
      )}

      {/* 会話 */}
      {dialogue && dialogueNpc && (
        <div className="dialogue" onClick={advance}>
          <div className="dwrap">
            <div className="speaker">{dialogueNpc.name}</div>
            <div className="dbox">
              <div className="dtext">{typed}</div>
            </div>
            <div className="advance">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        </div>
      )}

      {/* モバイルジョイスティック */}
      {started && <Joystick />}

      {/* スタート画面 */}
      {!started && (
        <div className="overlay">
          <div className="panel">
            <div className="badge">KIMAGURE ・ FRIEND COLLECTION</div>
            <h1>木まぐれを、<br />あるいて知ろう。</h1>
            <p>ようこそ、株式会社木まぐれのオフィスへ。<br /><b>社員たち</b>に話しかけて、会社の<b>想い</b>を集めてください。</p>
            <div className="controls-row">
              <div className="ctl"><div className="keys"><span>W</span><span>A</span><span>S</span><span>D</span></div>移動</div>
              <div className="ctl"><div className="keys"><span className="singlekey">E</span></div>話す</div>
              <div className="ctl"><div className="keys"><span className="singlekey">␣</span></div>すすめる</div>
            </div>
            <p className="hint">スマホは左下のスティックで移動、ふきだしをタップで会話。</p>
            <button className="bigbtn" onClick={handleStart}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>体験をはじめる
            </button>
            <Link href="/corporate" className="text-link">会社概要を見る →</Link>
          </div>
        </div>
      )}

      {/* コンプリート画面 */}
      {complete && (
        <div className="overlay">
          <div className="panel">
            <div className="badge">COLLECTION COMPLETE</div>
            <h1>仲間が、ぜんぶ集まった！</h1>
            <p>巡ってくれてありがとう。<br />これが、株式会社木まぐれの<b>想い</b>です。</p>
            <dl className="creed">
              {CREED.map((c) => (
                <div key={c.label}>
                  <dt>{c.label}</dt>
                  <dd>{c.text}</dd>
                </div>
              ))}
            </dl>
            <div className="applybtns">
              <a className="b-primary" href={`mailto:${CONTACT_EMAIL}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="M22 6l-10 7L2 6" /></svg>
                お問い合わせ
              </a>
              <Link className="b-link" href="/corporate">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></svg>
                会社概要を見る
              </Link>
              <button className="b-ghost" onClick={() => useGame.getState().closeComplete()}>オフィスをもう一度あるく</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ ジョイスティック ============
function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const [nub, setNub] = useState({ x: 0, y: 0 });
  const active = useRef(false);

  const move = (clientX: number, clientY: number) => {
    const el = base.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const max = r.width / 2 - 12;
    const d = Math.hypot(dx, dy);
    if (d > max) {
      dx = (dx / d) * max;
      dy = (dy / d) * max;
    }
    setNub({ x: dx, y: dy });
    setStick(dx / max, dy / max);
  };

  return (
    <div
      ref={base}
      className="stick"
      onPointerDown={(e) => {
        active.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        move(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (active.current) move(e.clientX, e.clientY);
      }}
      onPointerUp={() => {
        active.current = false;
        setNub({ x: 0, y: 0 });
        clearStick();
      }}
      onPointerCancel={() => {
        active.current = false;
        setNub({ x: 0, y: 0 });
        clearStick();
      }}
    >
      <div className="nub" style={{ transform: `translate(${nub.x}px, ${nub.y}px)` }} />
    </div>
  );
}

const cssText = `
.hud-root{position:fixed;inset:0;z-index:10;pointer-events:none;font-family:var(--font-noto-sans-jp),sans-serif;color:#fff}
.hud-root button,.hud-root a{pointer-events:auto}
.top-right{position:fixed;top:16px;right:16px;display:flex;gap:10px;pointer-events:none;z-index:70}
.icobtn{pointer-events:auto;width:46px;height:46px;border-radius:14px;border:2px solid rgba(255,255,255,.18);
  background:rgba(12,18,26,.6);backdrop-filter:blur(8px);display:grid;place-items:center;cursor:pointer;color:#fff;
  transition:transform .12s,border-color .2s}
.icobtn:hover{border-color:${ACCENT}}
.icobtn:active{transform:scale(.92)}
.icobtn svg{width:22px;height:22px}
.corp-link{position:fixed;bottom:20px;right:22px;display:inline-flex;align-items:center;gap:10px;
  min-height:58px;padding:0 24px;border-radius:999px;border:2px solid rgba(255,255,255,.9);
  background:${ACCENT};color:#10151c;font-size:1rem;font-weight:900;letter-spacing:.04em;text-decoration:none;
  cursor:pointer;box-shadow:0 12px 34px rgba(0,0,0,.42),0 0 28px ${ACCENT}77;
  transition:transform .14s ease,box-shadow .2s ease,border-color .2s ease}
.corp-link:hover{transform:translateY(-3px);border-color:#fff;box-shadow:0 16px 42px rgba(0,0,0,.48),0 0 38px ${ACCENT}99}
.corp-link:active{transform:translateY(1px)}
.corp-link svg{width:20px;height:20px;flex:0 0 auto}

.objective{position:fixed;left:16px;top:16px;max-width:min(320px,calc(100vw - 150px));z-index:80}
.nextup{display:inline-flex;align-items:center;gap:7px;background:${ACCENT};color:#10151c;
  font-family:var(--font-oswald),sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.08em;
  padding:6px 13px 5px;border-radius:11px 11px 11px 2px;text-transform:uppercase;box-shadow:0 0 18px ${ACCENT}55}
.nextup svg{width:15px;height:15px}
.obj-body{margin-top:-6px;background:rgba(12,18,26,.82);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.12);
  border-radius:4px 14px 14px 14px;padding:13px 15px;font-weight:700;font-size:.92rem;line-height:1.5}
.obj-body b{color:${ACCENT}}
.bar{margin-top:10px;height:7px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden}
.bar-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,${CYAN},${ACCENT});transition:width .5s ease}
.bar-label{margin-top:6px;font-family:var(--font-oswald),sans-serif;font-size:.72rem;letter-spacing:.1em;color:rgba(255,255,255,.7)}

.prompt{position:fixed;left:50%;bottom:25%;transform:translateX(-50%);animation:fadeUp .2s ease;
  background:none;border:none;padding:0;margin:0;font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
.prompt:active{transform:translateX(-50%) scale(.95)}
.prompt-pill{display:inline-flex;align-items:center;gap:9px;background:rgba(12,18,26,.9);backdrop-filter:blur(8px);
  border:2px solid ${ACCENT};color:#fff;padding:13px 22px;border-radius:999px;font-weight:800;font-size:1rem;
  box-shadow:0 0 22px ${ACCENT}55,0 8px 24px rgba(0,0,0,.4)}
.keycap{font-family:var(--font-oswald),sans-serif;font-weight:700;background:${ACCENT};color:#10151c;border-radius:7px;
  padding:2px 9px;font-size:.85rem}

.dialogue{position:fixed;left:0;right:0;bottom:0;padding:0 16px 20px;display:flex;justify-content:center;
  pointer-events:auto;animation:fadeUp .25s ease}
.dwrap{width:min(720px,94vw);position:relative}
.speaker{position:absolute;top:-15px;left:18px;background:${ACCENT};color:#10151c;
  font-weight:800;font-size:.82rem;padding:6px 16px;border-radius:10px;z-index:2;box-shadow:0 0 16px ${ACCENT}66}
.dbox{background:rgba(10,15,22,.92);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.16);
  border-radius:18px;padding:30px 26px 24px;min-height:104px;display:flex;align-items:center;
  box-shadow:0 12px 40px rgba(0,0,0,.5)}
.dtext{font-weight:600;font-size:1.1rem;line-height:1.75;color:#f4f6f8}
.advance{position:absolute;right:18px;bottom:16px;width:42px;height:42px;border-radius:50%;
  background:${ACCENT};display:grid;place-items:center;color:#10151c;animation:bob 1s ease-in-out infinite}
.advance svg{width:18px;height:18px;margin-left:2px}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes fadeUp{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1}}
.dialogue{animation:none}

.stick{position:fixed;left:24px;bottom:24px;width:128px;height:128px;border-radius:50%;
  background:rgba(247,243,230,.16);border:2px solid rgba(255,255,255,.3);touch-action:none;pointer-events:auto;display:none}
.touch .stick{display:block}
.nub{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;
  background:${ACCENT};border:2px solid #fff;box-shadow:0 0 16px ${ACCENT}}

.overlay{position:fixed;inset:0;z-index:30;display:grid;place-items:center;padding:24px;overflow:auto;pointer-events:auto;
  background:radial-gradient(120% 100% at 50% 0%,rgba(79,227,208,.14),rgba(8,12,18,.92))}
.panel{width:min(580px,94vw);background:rgba(14,20,28,.9);backdrop-filter:blur(16px);
  border:1px solid rgba(255,255,255,.14);border-radius:24px;padding:36px 30px;text-align:center;
  box-shadow:0 24px 80px rgba(0,0,0,.6)}
.badge{font-family:var(--font-oswald),sans-serif;font-weight:700;letter-spacing:.16em;color:${ACCENT};font-size:.8rem;text-transform:uppercase}
.panel h1{font-weight:900;font-size:clamp(1.6rem,5vw,2.4rem);line-height:1.35;margin:.5em 0;color:#fff}
.panel p{color:rgba(255,255,255,.66);font-weight:500;font-size:1rem;line-height:1.8;margin-bottom:8px}
.panel p b{color:${ACCENT}}
.panel .hint{font-size:.82rem;color:rgba(255,255,255,.45)}
.controls-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:22px 0 6px}
.ctl{display:flex;flex-direction:column;align-items:center;gap:7px;font-weight:700;font-size:.82rem;color:rgba(255,255,255,.8)}
.keys{display:flex;gap:4px}
.keys span,.singlekey{font-family:var(--font-oswald),sans-serif;font-weight:700;background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.2);border-radius:8px;min-width:34px;height:34px;display:grid;place-items:center;font-size:.9rem;padding:0 6px}
.bigbtn{display:inline-flex;align-items:center;gap:10px;background:${ACCENT};color:#10151c;
  font-weight:900;font-size:1.1rem;padding:16px 40px;border:none;border-radius:999px;cursor:pointer;
  margin-top:20px;box-shadow:0 0 30px ${ACCENT}66;transition:transform .12s}
.bigbtn:hover{transform:translateY(-2px)}
.bigbtn:active{transform:translateY(1px)}
.bigbtn svg{width:20px;height:20px}
.text-link{display:block;margin-top:16px;color:rgba(255,255,255,.55);font-size:.84rem;font-weight:700;text-decoration:none}
.text-link:hover{color:${ACCENT}}

.creed{display:grid;gap:10px;margin:22px 0 4px;text-align:left}
.creed div{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:11px 15px}
.creed dt{font-size:.68rem;font-weight:800;color:${ACCENT};font-family:var(--font-oswald),sans-serif;letter-spacing:.1em;text-transform:uppercase}
.creed dd{font-weight:600;font-size:.94rem;color:#eef1f4;margin-top:3px;line-height:1.6}
.applybtns{display:flex;flex-direction:column;gap:12px;margin-top:20px}
.applybtns a,.applybtns button{display:inline-flex;align-items:center;justify-content:center;gap:9px;
  font-weight:900;font-size:1.02rem;padding:15px 24px;border:none;border-radius:16px;cursor:pointer;text-decoration:none;transition:transform .12s}
.applybtns a:active,.applybtns button:active{transform:translateY(2px)}
.applybtns svg{width:20px;height:20px}
.b-primary{background:${ACCENT};color:#10151c;box-shadow:0 0 24px ${ACCENT}55}
.b-link{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2)!important}
.b-ghost{background:transparent;color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.18)!important}
`;
