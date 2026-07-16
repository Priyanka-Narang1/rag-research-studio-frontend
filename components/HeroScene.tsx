"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const state = { scroll: 0, mx: 0, my: 0 };

function CopperKnot() {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#3d1200"),
    emissive: new THREE.Color("#FF5500"),
    emissiveIntensity: 1.1,
    roughness: 0.22,
    metalness: 0.97,
    transparent: true,
  }), []);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.x = t * 0.07;
    ref.current.rotation.y = t * 0.11;
    ref.current.rotation.z = t * 0.04;
    mat.opacity = Math.max(0, 1 - state.scroll * 3.5);
    mat.emissiveIntensity = 1.1 + Math.sin(t * 0.6) * 0.15;
  });

  return (
    <mesh ref={ref} material={mat}>
      <torusKnotGeometry args={[1.32, 0.36, 320, 72, 2, 3]} />
    </mesh>
  );
}

function PaperCard({ index, tx, ty, tz, rx, ry, rz }: {
  index: number; tx: number; ty: number; tz: number;
  rx: number; ry: number; rz: number;
}) {
  const ref = useRef<THREE.Group>(null);
  // each paper starts emerging at a different scroll depth
  const startAt = 0.03 + index * 0.07;
  const dur = 0.32;
  const floatSpeed = 0.25 + index * 0.06;
  const floatOff = index * 1.3;
  const cardMat = useRef<THREE.MeshStandardMaterial>(null);
  const titleMat = useRef<THREE.MeshStandardMaterial>(null);
  const lineMats = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame((s) => {
    if (!ref.current) return;
    const raw = (state.scroll - startAt) / dur;
    const p = Math.max(0, Math.min(1, raw));
    // cubic ease out — smooth and elegant
    const e = 1 - Math.pow(1 - p, 3);
    const t = s.clock.elapsedTime;

    // start from inside/behind the ring, emerge outward
    ref.current.position.x = tx * e + state.mx * 0.12 * (index % 2 === 0 ? 1 : -1);
    ref.current.position.y = ty * e + Math.sin(t * floatSpeed + floatOff) * 0.16;
    ref.current.position.z = -1.5 + (tz + 1.5) * e;
    ref.current.rotation.x = rx + Math.sin(t * 0.15 + floatOff) * 0.035;
    ref.current.rotation.y = ry + state.mx * 0.07 + Math.sin(t * 0.12 + floatOff) * 0.04;
    ref.current.rotation.z = rz + Math.sin(t * 0.1 + floatOff) * 0.03;

    const op = e;
    if (cardMat.current) cardMat.current.opacity = op * 0.9;
    if (titleMat.current) titleMat.current.opacity = op;
    lineMats.current.forEach((m, i) => { if (m) m.opacity = op * (0.55 - i * 0.1); });
  });

  return (
    <group ref={ref}>
      {/* card background */}
      <mesh>
        <planeGeometry args={[1.55, 1.0]} />
        <meshStandardMaterial ref={cardMat}
          color="#0d0d0d" transparent opacity={0}
          emissive="#FF4400" emissiveIntensity={0.08}
          side={THREE.DoubleSide} />
      </mesh>
      {/* orange title bar */}
      <mesh position={[0, 0.33, 0.003]}>
        <planeGeometry args={[1.18, 0.052]} />
        <meshStandardMaterial ref={titleMat}
          color="#FF6A00" transparent opacity={0} />
      </mesh>
      {/* text lines */}
      {[0.19, 0.07, -0.05, -0.17, -0.29].map((y, i) => (
        <mesh key={y} position={[i > 2 ? -0.12 : 0, y, 0.003]}>
          <planeGeometry args={[1.22 - i * 0.1, 0.033]} />
          <meshStandardMaterial
            ref={(m) => { if (m) lineMats.current[i] = m; }}
            color="#ffffff" transparent opacity={0} />
        </mesh>
      ))}
      {/* subtle border glow */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(1.55, 1.0)]} />
        <lineBasicMaterial color="#FF4400" transparent opacity={0.15} />
      </lineSegments>
    </group>
  );
}

function Particles() {
  const n = 180;
  const pos = useMemo(() => {
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.random() - 0.5) * 20;
      a[i * 3 + 1] = (Math.random() - 0.5) * 20;
      a[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return a;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.elapsedTime * 0.016;
      ref.current.rotation.x = s.clock.elapsedTime * 0.007;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={n} array={pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#FF6A00" size={0.018} transparent opacity={0.5} />
    </points>
  );
}

function VolumetricLight() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.z = s.clock.elapsedTime * 0.04;
      (ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.04 + Math.sin(s.clock.elapsedTime * 0.3) * 0.012;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, -2]}>
      <coneGeometry args={[6, 12, 32, 1, true]} />
      <meshBasicMaterial color="#FF5500" transparent opacity={0.04} side={THREE.BackSide} />
    </mesh>
  );
}

function CameraRig() {
  useFrame((s) => {
    s.camera.position.x = THREE.MathUtils.lerp(s.camera.position.x, state.mx * 0.25, 0.035);
    s.camera.position.y = THREE.MathUtils.lerp(s.camera.position.y, state.my * 0.16, 0.035);
    s.camera.lookAt(0, 0, 0);
  });
  return null;
}

const PAPERS = [
  { tx: 3.2,  ty: 1.5,  tz: 0.5,  rx: 0.1,   ry: -0.3,  rz: 0.12  },
  { tx: -3.0, ty: -1.2, tz: 0.2,  rx: -0.07, ry: 0.26,  rz: -0.1  },
  { tx: 2.5,  ty: -2.0, tz: -0.6, rx: 0.13,  ry: -0.2,  rz: 0.06  },
  { tx: -2.8, ty: 1.9,  tz: -1.0, rx: -0.05, ry: 0.35,  rz: 0.04  },
];

export default function HeroScene() {
  useEffect(() => {
    const totalScrollSpace = window.innerHeight * 1.8;
    const onScroll = () => {
      state.scroll = Math.min(window.scrollY / totalScrollSpace, 1);
    };
    const onMouse = (e: MouseEvent) => {
      state.mx = (e.clientX / window.innerWidth - 0.5) * 2;
      state.my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5.6], fov: 52 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}>
      <CameraRig />
      <ambientLight intensity={0.02} />
      {/* main copper light */}
      <pointLight position={[3, 2, 4]}  color="#FF6A00" intensity={10} distance={18} />
      {/* rim lights for copper depth */}
      <pointLight position={[-4, -2, 2]} color="#FF3D00" intensity={5}  distance={14} />
      <pointLight position={[0,  5, 1]}  color="#FF7030" intensity={3}  distance={12} />
      <pointLight position={[2, -4, 3]}  color="#FF4400" intensity={2.5} distance={10} />
      {/* subtle cool fill to prevent full darkness */}
      <pointLight position={[-2, 3, -1]} color="#1a0800"  intensity={1}  distance={8}  />
      <VolumetricLight />
      <CopperKnot />
      <Particles />
      {PAPERS.map((p, i) => <PaperCard key={i} index={i} {...p} />)}
      <EffectComposer>
        <Bloom luminanceThreshold={0.12} luminanceSmoothing={0.88} intensity={2.2} />
      </EffectComposer>
    </Canvas>
  );
}
