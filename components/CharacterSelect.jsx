import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const CHARS = [
  {
    id: "miles",
    name: "Miles",
    lastName: "Morales",
    code: "Miles",
    faction: "Spider-Verse",
    tag: "EARTH-1610",
    desc: "Into the multiverse. Gravity is merely a suggestion.",
    accent: "#e63946",
    accentSoft: "#ff6b78",
    modelPath: "/model/mup.glb",
    modelScale: 0.8,       
    modelOffset: [0.6, -0.4, 0],
    idleAnim: "happyidle",
    modelRotation: [0, 0, 0]

  },
  {
    id: "character",
    name: "The",
    lastName: "Operative",
    code: "Character",
    faction: "Default Unit",
    tag: "BASELINE-00",
    desc: "Perfectly calibrated. A blank slate ready for anything.",
    accent: "#a855f7",
    accentSoft: "#c98bff",
    modelPath: "/model/untitled.glb",
    modelScale: 0.9,       
    modelOffset: [0, -0.9, 0],
    idleAnim: "lay",
    modelRotation: [0, -Math.PI / 2, 0]
  },
  {
    id: "spiderman",
    name: "Spider",
    lastName: "Man",
    code: "Spiderman",
    faction: "Marvel · 616",
    tag: "EARTH-616",
    desc: "The original. Every reflex sharpened to a blade's edge.",
    accent: "#3ba7e0",
    accentSoft: "#6fc6ff",
    modelPath: "/model/spiderman.glb",
    modelScale: 0.8,
    modelOffset: [0, -0.6, 0],
    idleAnim: "idle",
    modelRotation: [0,0, 0]
  },
];

/* ─────────────────────────────────────────────
   CharacterModel
   - Does NOT clone the scene (safe for skinned meshes)
   - Auto-fits the group to a ~2-unit tall bounding box
     AFTER mount, when bones have computed their world matrices
───────────────────────────────────────────── */
function CharacterModel({ char, entering }) {
  
  const groupRef = useRef();
  const { scene, animations } = useGLTF(char.modelPath);
  const { actions } = useAnimations(animations, groupRef);

  // Animation disabled — uncomment below to re-enable:
  // useEffect(() => {
  //   const first = Object.values(actions)[0];
  //   if (first) first.reset().fadeIn(0.3).play();
  //   return () => { Object.values(actions).forEach(a => a?.stop()); };
  // }, [actions]);

  // Auto-fit after first render — scene is now in the DOM so bones are ready
  // Miles

    useEffect(() => {
  const clip = actions[char.idleAnim];
  if (clip) {
    clip.reset().fadeIn(0.3).play();
    clip.setLoop(THREE.LoopRepeat, Infinity);
  }
  return () => { clip?.fadeOut(0.3); };
}, [actions, char.idleAnim]);
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

   
    group.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(group);

    if (box.isEmpty()) return;

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    // Target: fit inside a ~2.4-unit tall box, then apply modelScale
    const targetSize = 2.4 * char.modelScale;
    const s = targetSize / maxDim;

    group.scale.setScalar(s);

    // Re-compute bounds after scale and shift to sit on y=0, centered on x
    group.updateWorldMatrix(true, true);
    const box2 = new THREE.Box3().setFromObject(group);
    const center2 = new THREE.Vector3();
    box2.getCenter(center2);
    const minY = box2.min.y; // .min is a Vector3 property, not a method

    group.position.set(
      -center2.x + char.modelOffset[0],
      -minY      + char.modelOffset[1],
       char.modelOffset[2]
    );
if (char.modelRotation) {
  group.rotation.set(...char.modelRotation);
}
    // Enable shadows on all meshes
    group.traverse((c) => {
      if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
    });
  }, [char]);

  // Idle rotation + enter pulse
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    if (entering) {
      const pulse = 1 + 0.07 * Math.sin(Date.now() * 0.008);
      groupRef.current.scale.multiplyScalar(pulse / (groupRef.current.scale.x || 1));
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

/* ─────────────────────────────────────────────
   Placeholder — shown while model loads
───────────────────────────────────────────── */
function Placeholder({ accent }) {
  const ref = useRef();
  useFrame((_, delta) => {
    
  });
  return (
    <group ref={ref} position={[0, 0, 0]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.38, 1.1, 8, 16]} />
        <meshStandardMaterial color={accent} roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color={accent} roughness={0.55} metalness={0.3} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   Error boundary — shows placeholder if GLB fails
───────────────────────────────────────────── */
class ModelErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: false }; }
  static getDerivedStateFromError() { return { error: true }; }
  componentDidUpdate(prevProps) {
    if (prevProps.modelPath !== this.props.modelPath) this.setState({ error: false });
  }
  render() {
    if (this.state.error) return <Placeholder accent={this.props.accent} />;
    return this.props.children;
  }
}

/* ─────────────────────────────────────────────
   Full scene
───────────────────────────────────────────── */
function CharScene({ char, entering }) {
  return (
    <>
      {/* Very low ambient — keeps shadows dark and dramatic */}
      <ambientLight intensity={0.08} />
 
      {/* Key light — strong front-left, slightly above, warm */}
      <directionalLight
        position={[-2.5, 4, 3]}
        intensity={3.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        color="#ffe8d0"
      />
 
      {/* Rim light — right side, cool blue, behind character */}
      <directionalLight
        position={[3, 3, -4]}
        intensity={4}
        color="#4a8fff"
      />
 
      {/* Rim light — left side, accent color glow from behind */}
      <directionalLight
        position={[-3, 2, -3]}
        intensity={2.5}
        color={char.accent}
      />
 
      {/* Ground bounce — subtle warm fill from below */}
      <pointLight
        position={[0, -0.5, 2]}
        intensity={1.2}
        distance={6}
        color="#ff9955"
      />
 
      {/* Accent hero light — character-tinted glow close up */}
      <pointLight
        position={[0.5, 2, 1.5]}
        intensity={3}
        distance={5}
        color={char.accent}
      />
 
      {/* Top spotlight — cinematic top-down beam */}
      <spotLight
        position={[0, 8, 1]}
        angle={0.25}
        penumbra={0.8}
        intensity={5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        color="#ffffff"
        target-position={[0, 0, 0]}
      />
 
      {/* Colored contact shadow on the ground */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.75}
        scale={8}
        blur={3}
        far={5}
        color={char.accent}
      />
 
      <Suspense fallback={<Placeholder accent={char.accent} />}>
        <ModelErrorBoundary modelPath={char.modelPath} accent={char.accent}>
          <CharacterModel char={char} entering={entering} />
        </ModelErrorBoundary>
      </Suspense>
 
      {/* Warehouse preset gives neutral gray environment good for character showcase */}
      <Environment preset="warehouse" />
 
      {/* OrbitControls — rotate only, no zoom, limited vertical range */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}
 

function SceneCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.2, 5);
    camera.lookAt(0, 1.2, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

/* ─────────────────────────────────────────────
   Main component — UI unchanged
───────────────────────────────────────────── */
export default function CharacterSelect({ onSelect }) {
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState(null);
  const [dir, setDir] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [entering, setEntering] = useState(false);
  const drag = useRef({ active: false, x: 0 });
  const ch = CHARS[cur];

  const go = useCallback((d) => {
    if (transitioning || entering) return;
    setDir(d);
    setPrev(cur);
    setTransitioning(true);
    setCur((c) => (c + d + CHARS.length) % CHARS.length);
    setTimeout(() => { setPrev(null); setTransitioning(false); }, 650);
  }, [cur, transitioning, entering]);

  const handleEnter = useCallback(() => {
    if (entering) return;
    setEntering(true);
    setTimeout(() => onSelect(ch.code), 900);
  }, [ch.code, onSelect, entering]);

  useEffect(() => {
    const h = (e) => {
      if (entering) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "Enter") handleEnter();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [go, handleEnter, entering]);

  const onDown = (e) => { drag.current = { active: true, x: e.clientX }; };
  const onUp = (e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    drag.current.active = false;
  };

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      <div style={S.bgBase} />
      <div
        key={`atm-${cur}`}
        className="atm-in"
        style={{
          ...S.atmosphere,
          background: `
            radial-gradient(ellipse 80% 70% at 15% 50%, ${ch.accent}28 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 85% 30%, ${ch.accentSoft}14 0%, transparent 55%)
          `,
        }}
      />
      <div style={S.grain} />
      <div style={S.lbTop} />
      <div style={S.lbBot} />

      {entering && (
        <div
          className="flash-in"
          style={{
            ...S.flash,
            background: `radial-gradient(circle at 50% 50%, ${ch.accent} 0%, ${ch.accent}aa 20%, #07050d 68%)`,
          }}
        />
      )}

      <div style={S.canvasWrap}>
        <Canvas
          key={cur}
          camera={{ fov: 42, near: 0.1, far: 100 }}
          shadows
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <SceneCamera />
          <CharScene char={ch} entering={entering} />
        </Canvas>
      </div>

      <div style={S.imgOverlay} />
      <div style={S.clickLeft} onClick={() => go(-1)} />
      <div style={S.clickRight} onClick={() => go(1)} />

      <div
        style={S.content}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current.active = false)}
      >
        <div style={S.topLeft}>
          <div style={S.episodeTag}>Character Select</div>
          <div style={{ ...S.tagDivider, background: ch.accent }} />
          <div style={{ ...S.factionTag, color: ch.accent }}>{ch.faction}</div>
        </div>

        <div style={S.topRight}>
          <span style={S.idxCurrent}>0{cur + 1}</span>
          <span style={S.idxSep}> / </span>
          <span style={S.idxTotal}>0{CHARS.length}</span>
        </div>

        <div style={S.nameBlock}>
          <div key={`tag-${ch.id}`} className="name-slide-in" style={{ ...S.charTag, color: ch.accent }}>
            {ch.tag}
          </div>
          <div key={`n1-${ch.id}`} className="name-slide-in" style={S.firstName}>
            {ch.name}
          </div>
          <div key={`n2-${ch.id}`} className="name-slide-in name-slide-delay" style={S.lastName}>
            {ch.lastName}
          </div>
          <div key={`desc-${ch.id}`} className="name-slide-in name-slide-delay2" style={S.charDesc}>
            {ch.desc}
          </div>
        </div>

        <div style={S.bottomBar}>
          <div style={S.progressWrap}>
            <div style={S.progressTrack}>
              <div key={`prog-${cur}`} className="prog-fill" style={{ ...S.progressFill, background: ch.accent }} />
            </div>
          </div>

          <div style={S.navRow}>
            <div style={S.arrowGroup}>
              <button className="arr-btn" onClick={() => go(-1)} style={{ ...S.arrBtn, ["--accent"]: ch.accent }} aria-label="Previous">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button className="arr-btn" onClick={() => go(1)} style={{ ...S.arrBtn, ["--accent"]: ch.accent }} aria-label="Next">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <button
              className="enter-btn"
              onClick={handleEnter}
              disabled={entering}
              style={{
                ...S.enterBtn,
                borderColor: ch.accent,
                boxShadow: `0 0 30px ${ch.accent}35, inset 0 0 20px ${ch.accent}10`,
                ["--accent"]: ch.accent,
              }}
            >
              <span style={{ ...S.enterDot, background: ch.accent, boxShadow: `0 0 8px ${ch.accent}` }} />
              {entering ? "ENTERING…" : "ENTER WORLD"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  root: { position: "fixed", inset: 0, overflow: "hidden", background: "#07050d", fontFamily: "'Rajdhani', 'Segoe UI', sans-serif", color: "#fff", userSelect: "none" },
  bgBase: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% 0%, #130920 0%, #07050d 50%)", zIndex: 0 },
  atmosphere: { position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" },
  grain: { position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", opacity: 0.032, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" },
  lbTop: { position: "absolute", top: 0, left: 0, right: 0, height: 44, background: "#000", zIndex: 30 },
  lbBot: { position: "absolute", bottom: 0, left: 0, right: 0, height: 44, background: "#000", zIndex: 30 },
  flash: { position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" },
  canvasWrap: { position: "absolute", inset: 0, zIndex: 3 },
  imgOverlay: {
    position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none",
    background: `linear-gradient(90deg, rgba(7,5,13,.92) 0%, rgba(7,5,13,.65) 38%, rgba(7,5,13,.2) 65%, rgba(7,5,13,.55) 100%), linear-gradient(0deg, rgba(7,5,13,.85) 0%, transparent 30%, transparent 70%, rgba(7,5,13,.85) 100%)`,
  },
  clickLeft:  { position: "absolute", left: 0, top: 44, bottom: 44, width: "18%", zIndex: 15, cursor: "w-resize" },
  clickRight: { position: "absolute", right: 0, top: 44, bottom: 44, width: "18%", zIndex: 15, cursor: "e-resize" },
  content: { position: "absolute", inset: "44px 0", zIndex: 20, display: "grid", gridTemplateRows: "auto 1fr auto", gridTemplateColumns: "1fr 1fr", padding: "28px 48px", gap: 0 },
  topLeft: { display: "flex", alignItems: "center", gap: 12, gridColumn: "1", gridRow: "1" },
  episodeTag: { fontSize: 9, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,.35)" },
  tagDivider: { width: 20, height: 1, opacity: 0.7 },
  factionTag: { fontSize: 9, letterSpacing: 4, textTransform: "uppercase" },
  topRight: { gridColumn: "2", gridRow: "1", display: "flex", justifyContent: "flex-end", alignItems: "center", fontFamily: "'Rajdhani', monospace" },
  idxCurrent: { fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.9)", letterSpacing: 1 },
  idxSep:     { fontSize: 11, color: "rgba(255,255,255,.2)", margin: "0 4px" },
  idxTotal:   { fontSize: 11, color: "rgba(255,255,255,.3)", letterSpacing: 1 },
  nameBlock: { gridColumn: "1", gridRow: "2", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 28, maxWidth: 520 },
  charTag:   { fontSize: 10, letterSpacing: 5, textTransform: "uppercase", marginBottom: 10, opacity: 0.9 },
  firstName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(72px, 10vw, 110px)", lineHeight: 0.92, letterSpacing: 2, color: "#fff", filter: "drop-shadow(0 4px 24px rgba(0,0,0,.6))" },
  lastName:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(38px, 5.5vw, 62px)", lineHeight: 1, letterSpacing: 6, color: "rgba(255,255,255,.55)", marginBottom: 20 },
  charDesc:  { fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,.4)", letterSpacing: 0.3, maxWidth: 340 },
  bottomBar: { gridColumn: "1 / 3", gridRow: "3", display: "flex", flexDirection: "column", gap: 14 },
  progressWrap: { width: "100%" },
  progressTrack: { height: 1, background: "rgba(255,255,255,.1)", width: "100%", position: "relative", overflow: "hidden" },
  progressFill: { height: "100%", position: "absolute", left: 0, top: 0 },
  navRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  arrowGroup: { display: "flex", gap: 8 },
  arrBtn: { width: 42, height: 42, borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .25s ease" },
  enterBtn: { display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 52px", fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, letterSpacing: 6, color: "#fff", background: "rgba(255,255,255,.025)", border: "1px solid", borderRadius: 2, cursor: "pointer", backdropFilter: "blur(6px)", transition: "all .35s cubic-bezier(.22,1,.36,1)" },
  enterDot: { width: 6, height: 6, borderRadius: "50%", display: "inline-block", flexShrink: 0 },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap');
@keyframes atmIn   { from { opacity:0 } to { opacity:1 } }
@keyframes flashIn { from { opacity:0 } 15% { opacity:1 } to { opacity:1 } }
@keyframes nameSlide { from { transform:translateY(18px); opacity:0 } to { transform:translateY(0); opacity:1 } }
@keyframes progGrow  { from { width:0 } }
.atm-in   { animation: atmIn .8s ease forwards; }
.flash-in { animation: flashIn .9s ease forwards; }
.name-slide-in         { animation: nameSlide .5s cubic-bezier(.22,1,.36,1) both; }
.name-slide-delay      { animation-delay: .06s; }
.name-slide-delay2     { animation-delay: .12s; }
.prog-fill             { animation: progGrow .65s cubic-bezier(.22,1,.36,1); }
.arr-btn:hover {
  background: color-mix(in srgb, var(--accent) 20%, transparent) !important;
  border-color: var(--accent) !important;
  color: #fff !important;
  transform: translateY(-1px);
}
.enter-btn:hover:not(:disabled) {
  background: rgba(255,255,255,.07) !important;
  letter-spacing: 9px !important;
}
.enter-btn:disabled { cursor: default; }
`;
