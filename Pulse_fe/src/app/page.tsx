"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    useMotionValue,
    useInView,
    useMotionTemplate,
} from "framer-motion";

import * as THREE from "three";

// ═══════════════════════════════════════════════
// WEBGL FLUID GRADIENT BACKGROUND (Olivier Larose Style)
// ═══════════════════════════════════════════════
function WebGLGradient() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        // Perspective camera to properly capture the 3D Z-warping of the mesh
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 1.2;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        // Use a high pixel ratio for smooth gradient (capped at 1.5 for performance)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // A very large, highly subdivided plane to cover the screen even when tilted and warped
        // Optimized: Reduced subdivisions from 256 to 64 to drastically improve GPU geometry load
        const geometry = new THREE.PlaneGeometry(6, 6, 64, 64);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0 },
                u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                // Target Colors (Grainient cosmic dark)
                u_colorA: { value: new THREE.Color("#04010d") }, // Deep Black Space
                u_colorB: { value: new THREE.Color("rgba(36, 77, 189, 0.79)") },
                u_colorC: { value: new THREE.Color("rgba(36, 77, 189, 0.79)") },
            },
            vertexShader: `
                // Simplex 3D Noise 
                // by Ian McEwan, Ashima Arts
                vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
                vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

                float snoise(vec3 v){ 
                    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

                    // First corner
                    vec3 i  = floor(v + dot(v, C.yyy) );
                    vec3 x0 = v - i + dot(i, C.xxx) ;

                    // Other corners
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min( g.xyz, l.zxy );
                    vec3 i2 = max( g.xyz, l.zxy );

                    //  x0 = x0 - 0.0 + 0.0 * C 
                    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
                    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
                    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

                    // Permutations
                    i = mod(i, 289.0 ); 
                    vec4 p = permute( permute( permute( 
                                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

                    // Gradients
                    // ( N*N points uniformly over a square, mapped onto an octahedron.)
                    float n_ = 1.0/7.0; // N=7
                    vec3  ns = n_ * D.wyz - D.xzx;

                    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);

                    vec4 b0 = vec4( x.xy, y.xy );
                    vec4 b1 = vec4( x.zw, y.zw );

                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));

                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

                    vec3 p0 = vec3(a0.xy,h.x);
                    vec3 p1 = vec3(a0.zw,h.y);
                    vec3 p2 = vec3(a1.xy,h.z);
                    vec3 p3 = vec3(a1.zw,h.w);

                    //Normalise gradients
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;

                    // Mix final noise value
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                                dot(p2,x2), dot(p3,x3) ) );
                }

                varying vec2 vUv;
                varying float vNoise;
                uniform float u_time;
                uniform vec2 u_resolution;

                void main() {
                    vUv = uv;
                    
                    // Aspect ratio fix for noise scaling
                    vec2 aspectUv = uv;
                    aspectUv.x *= u_resolution.x / u_resolution.y;

                    // Compute 3D noise using coordinate and time
                    // Original scale of 0.4 for tight 3D gradient shapes
                    float noise = snoise(vec3(aspectUv * 0.4, u_time * 0.15));
                    
                    // Pass to fragment
                    vNoise = noise;

                    // Gently warp the plane in 3D to create the liquid swelling wave effect
                    vec3 pos = position;
                    pos.z += noise * 0.25; // Deep 3D waves

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                varying float vNoise;
                
                uniform vec3 u_colorA; // Dark Black
                uniform vec3 u_colorB; // Purple
                uniform vec3 u_colorC; // Blue
                uniform vec3 u_colorD; // Magenta
                uniform float u_time;

                void main() {
                    // Map noise softly to 0..1
                    float n = vNoise * 0.5 + 0.5;

                    vec3 color = u_colorA; // Base is pure black space

                    // 1. CARVE THE SHAPE MASK
                    // Anything below 0.35 elevation is pure black. The transition to fully opaque shape color happens at 0.5.
                    // This mathematically guarantees huge rivers of pristine black canvas between the dynamic colored waves.
                    float shapeMask = smoothstep(0.35, 0.5, n);

                    // 2. PAINT THE WAVES
                    // We generate a beautiful fluid color gradient strictly INSIDE the abstract shapes 
                    // dependent on their screen position
                    
                    // Left to Right: Purple to Cobalt Blue
                    vec3 shapeColor = mix(u_colorB, u_colorC, vUv.x);
                    // Add Deep Magenta to the bottom
                    shapeColor = mix(shapeColor, u_colorD, 1.0 - vUv.y);
                    
                    // 3. APPLY TO CANVAS
                    color = mix(color, shapeColor, shapeMask);

                    // Vignette to push to dark edges
                    float dist = distance(vUv, vec2(0.5));
                    color = mix(color, u_colorA, smoothstep(0.3, 1.5, dist));

                    gl_FragColor = vec4(color, 1.0);
                }
            `,
        });

        const plane = new THREE.Mesh(geometry, material);
        // Tilt the plane slightly to reveal its 3D wavy topology
        plane.rotation.x = -0.15;
        plane.rotation.y = -0.1;
        scene.add(plane);

        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            material.uniforms.u_resolution.value.set(width, height);
        };
        window.addEventListener("resize", handleResize);

        let time = 0;
        let animationFrameId: number;

        const animate = () => {
            time += 0.02; // Speed of the fluid motion
            material.uniforms.u_time.value = time;
            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 z-0 bg-[#04010d]" />;
}

// ═══════════════════════════════════════════════
// THREE.JS 3D PARTICLE CLOUD + GEOMETRIC SHAPES
// ═══════════════════════════════════════════════
function ParticleCloud() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // ─── Scene ───
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0a0515, 30, 85);

        const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 12, 40);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Capped at 1.5 for performance
        container.appendChild(renderer.domElement);

        // ─── Particle wave ───
        const gridSize = 120; // Reduced from 300 to drastically cut vertex count (90k -> 14.4k)
        const spacing = 0.70; // Increased spacing to cover the same volume of space
        const count = gridSize * gridSize;
        const positions = new Float32Array(count * 3);
        const opacities = new Float32Array(count);

        let idx = 0;
        for (let ix = 0; ix < gridSize; ix++) {
            for (let iz = 0; iz < gridSize; iz++) {
                positions[idx * 3] = (ix - gridSize / 2) * spacing;
                positions[idx * 3 + 1] = 0;
                positions[idx * 3 + 2] = (iz - gridSize / 2) * spacing;
                opacities[idx] = 0.1 + Math.random() * 0.3;
                idx++;
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));

        const mat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uSize: { value: 1.8 * renderer.getPixelRatio() },
            },
            vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uSize;
        attribute float aOpacity;
        varying float vOpacity;
        void main() {
          vec3 pos = position;
          float w1 = sin(pos.x*0.15+uTime*0.4)*cos(pos.z*0.12+uTime*0.3)*3.5;
          float w2 = sin(pos.x*0.08-uTime*0.25)*sin(pos.z*0.1+uTime*0.2)*2.0;
          float w3 = cos((pos.x+pos.z)*0.05+uTime*0.15)*4.0;
          pos.y = w1+w2+w3;
          float md = length(pos.xz - uMouse*30.0);
          pos.y += sin(md*0.5-uTime*3.0)*exp(-md*0.04)*2.5;
          vec4 mv = modelViewMatrix * vec4(pos,1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = max(uSize*(60.0/-mv.z), 0.5);
          vOpacity = aOpacity * smoothstep(100.0,20.0, length(mv.xyz));
        }
      `,
            fragmentShader: `
        varying float vOpacity;
        void main() {
          float d = length(gl_PointCoord-0.5);
          if(d>0.5) discard;
          float a = smoothstep(0.5,0.1,d)*vOpacity*0.7;
          gl_FragColor = vec4(0.82,0.82,0.9, a);
        }
      `,
        });
        const points = new THREE.Points(geo, mat);
        scene.add(points);


        // ─── Mouse tracking ───
        const mouse = { x: 0, y: 0 };
        const targetRot = { x: 0, y: 0 };
        const currentRot = { x: 0, y: 0 };

        const handleMouse = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
            targetRot.x = mouse.y * 0.15;
            targetRot.y = mouse.x * 0.2;
            mat.uniforms.uMouse.value.set(mouse.x, -mouse.y);
        };
        window.addEventListener("mousemove", handleMouse);

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        // ─── Animation ───
        let time = 0;
        const animate = () => {
            time += 0.005;
            mat.uniforms.uTime.value = time;

            currentRot.x += (targetRot.x - currentRot.x) * 0.03;
            currentRot.y += (targetRot.y - currentRot.y) * 0.03;

            camera.position.x = Math.sin(currentRot.y) * 40;
            camera.position.y = 12 + currentRot.x * 15;
            camera.position.z = Math.cos(currentRot.y) * 40;
            camera.lookAt(0, 0, 0);


            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener("mousemove", handleMouse);
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            geo.dispose();
            mat.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={containerRef} className="fixed inset-0 z-0" />;
}

// ═══════════════════════════════════════════════
// GRAIN NOISE (Grainient-style heavy grain)
// ═══════════════════════════════════════════════
function NoiseOverlay() {
    return (
        <>
            {/* SVG Grain — same technique as Grainient Supply */}
            <svg className="fixed inset-0 w-full h-full pointer-events-none z-[2]" style={{ opacity: 0.55, mixBlendMode: "soft-light" }}>
                <filter id="g-noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#g-noise)" />
            </svg>
        </>
    );
}

// ═══════════════════════════════════════════════
// VIGNETTE (dark edge framing)
// ═══════════════════════════════════════════════
function Vignette() {
    return (
        <div
            className="fixed inset-0 pointer-events-none z-[1]"
            style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.75) 100%)" }}
        />
    );
}

// ─── Animated Section ───
function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
            {children}
        </motion.div>
    );
}

// ─── 3D Tilt Card ───
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
    const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

    return (
        <motion.div
            ref={ref}
            onMouseMove={(e) => {
                if (!ref.current) return;
                const rect = ref.current.getBoundingClientRect();
                rotateX.set(((e.clientY - rect.top) / rect.height - 0.5) * -15);
                rotateY.set(((e.clientX - rect.left) / rect.width - 0.5) * 15);
            }}
            onMouseLeave={() => { rotateX.set(0); rotateY.set(0); }}
            style={{ rotateX: springX, rotateY: springY, transformPerspective: 800 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Scroll Text Reveal ───
function ScrollRevealText({ text }: { text: string }) {
    const ref = useRef<HTMLDivElement>(null);
    // Adjust offset so animation finishes before scrolling out of view
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "start 0.2"] });

    // Mask Cursor Effect State
    const [isHovered, setIsHovered] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    // Smooth spring animation for the mask radius instead of instant scale
    const size = useSpring(0, { bounce: 0 });

    useEffect(() => {
        size.set(isHovered ? 400 : 0);
    }, [isHovered, size]);

    const maskImage = useMotionTemplate`radial-gradient(${size}px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;

    const lines = text.split("\n");
    const allWords = text.replace(/\n/g, " ").split(" ").filter(w => w !== "");
    let globalIdx1 = 0;

    return (
        <div
            ref={ref}
            className="relative w-full text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-[1.15] tracking-tight flex flex-col items-start text-left cursor-default"
            style={{ fontFamily: "var(--font-mono)" }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 1. Base Text (Scroll Reveal) */}
            <div className="w-full">
                {lines.map((line, lineIndex) => {
                    const wordsInLine = line.split(" ");
                    return (
                        <span key={lineIndex} className="block w-full whitespace-nowrap">
                            {wordsInLine.map((word, i) => {
                                if (word === "") return <span key={`space-${i}`}> </span>;
                                const currentIdx = globalIdx1++;
                                const s = currentIdx / allWords.length;
                                const e = (currentIdx + 1) / allWords.length;
                                return <ScrollWord key={`base-${i}`} word={word} range={[s, e]} progress={scrollYProgress} />;
                            })}
                        </span>
                    );
                })}
            </div>

            {/* 2. Hidden Masked Text (Brand color highlight via cursor) */}
            <motion.div
                className="absolute inset-0 w-full pointer-events-none text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400"
                style={{
                    "--mask-image": maskImage,
                    WebkitMaskImage: "var(--mask-image)",
                    maskImage: "var(--mask-image)"
                } as any}
            >
                {lines.map((line, lineIndex) => {
                    const wordsInLine = line.split(" ");
                    return (
                        <span key={lineIndex} className="block w-full whitespace-nowrap">
                            {wordsInLine.map((word, i) => {
                                if (word === "") return <span key={`space-${i}`}> </span>;
                                return <span key={`mask-${i}`} className="inline-block mr-[0.3em]">{word}</span>;
                            })}
                        </span>
                    );
                })}
            </motion.div>
        </div>
    );
}

function ScrollWord({ word, range, progress }: { word: string; range: [number, number]; progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
    const opacity = useTransform(progress, range, [0.15, 1]);
    const color = useTransform(progress, range, ["rgb(75,85,99)", "rgb(255,255,255)"]);
    return <motion.span style={{ opacity, color }} className="inline-block mr-[0.3em]">{word}</motion.span>;
}

// ─── Counter ───
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let n = 0;
        const step = Math.max(1, Math.floor(target / 60));
        const timer = setInterval(() => { n += step; if (n >= target) { setCount(target); clearInterval(timer); } else setCount(n); }, 20);
        return () => clearInterval(timer);
    }, [target]);
    return <span style={{ fontFamily: "var(--font-mono)" }}>{count.toLocaleString()}{suffix}</span>;
}

// ═══════════════════════════════════════════════
// LIQUID GLASS STYLE CONSTANTS
// ═══════════════════════════════════════════════
const glass = "border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_60px_-15px_rgba(0,0,0,0.5)]";
const glassHover = "hover:bg-white/[0.06] hover:border-white/[0.14] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_25px_70px_-15px_rgba(0,0,0,0.6)]";
const glassBtn = "border border-white/[0.1] bg-white/[0.05] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]";
const glassBtnHover = "hover:bg-white/[0.1] hover:border-white/[0.2]";

const mono = { fontFamily: "var(--font-mono)" };

// ═══════════════════════════════════════════════
// MAIN LANDING PAGE
// ═══════════════════════════════════════════════
export default function LandingPage() {
    const { scrollYProgress } = useScroll();
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

    const scrollRevealRef = useRef<HTMLElement>(null);
    const { scrollYProgress: revealProgress } = useScroll({ target: scrollRevealRef, offset: ["start end", "end start"] });

    return (
        <div className="relative text-white selection:bg-brand-500/30 overflow-x-hidden">
            <WebGLGradient />
            <ParticleCloud />
            <Vignette />

            {/* Progress Bar */}
            <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 origin-left z-50" style={{ scaleX: scrollYProgress }} />

            {/* ─── Nav — Liquid Glass ─── */}
            <motion.nav
                initial={{ y: -80 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`fixed top-0 left-0 right-0 z-40 ${glass}`}
            >
                <div className="flex items-center justify-between max-w-7xl mx-auto px-6 h-16">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500/80 backdrop-blur-sm">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold tracking-tight" style={mono}>Pulse</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm text-gray-400" style={mono}>
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
                        <a href="#stats" className="hover:text-white transition-colors">Stats</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/signin" className={`text-sm text-gray-400 px-4 py-2 rounded-full transition-all ${glassBtnHover}`} style={mono}>
                            Sign In
                        </Link>
                        <Link href="/signup" className={`text-sm font-medium px-5 py-2 rounded-full transition-all ${glassBtn} ${glassBtnHover} text-white`} style={mono}>
                            Get Started
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* ═══ Hero ═══ */}
            <motion.section style={{ y: heroY, opacity: heroOpacity }} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden z-[3]">
                {/* Badge — liquid glass */}
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="mb-8">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium ${glass} text-gray-300`} style={mono}>
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                        v1.0 — Now in Open Beta
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-center leading-[0.95] tracking-tight max-w-5xl"
                    style={mono}
                >
                    <span className="block text-white/95">Manage projects.</span>
                    <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400">Ship faster.</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7 }} className="mt-6 text-base md:text-lg text-white/90 text-center max-w-xl leading-relaxed" style={mono}>
                    The all-in-one workspace for modern teams. Plan, track, and deliver projects with real-time collaboration.
                </motion.p>

                {/* CTA Buttons — Liquid Glass */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.7 }} className="flex flex-col sm:flex-row gap-4 mt-10">
                    <Link href="/signup" className={`group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-white rounded-full transition-all duration-300 ${glass} ${glassHover} bg-gradient-to-r from-brand-500/20 to-purple-500/20`} style={mono}>
                        <span className="relative">Start Building — Free</span>
                        <svg className="relative w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                    <Link href="#features" className={`inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium text-gray-400 rounded-full transition-all duration-300 ${glass} ${glassHover}`} style={mono}>
                        Learn More
                    </Link>
                </motion.div>

                {/* Scroll */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-12 flex flex-col items-center gap-2">
                    <span className="text-[10px] text-gray-600 uppercase tracking-[0.2em]" style={mono}>Scroll</span>
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-1.5 backdrop-blur-sm">
                        <div className="w-1 h-1.5 rounded-full bg-gray-500" />
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* ═══ Scroll Reveal ═══ */}
            <section ref={scrollRevealRef} className="relative py-32 md:py-48 px-6 w-full overflow-hidden z-[3]">
                <div className="max-w-7xl mx-auto flex flex-col items-start relative z-10 w-full">
                    <ScrollRevealText text={"Stop context-switching between tools.\nPulse brings your tasks, docs,\nchats, and timelines into\none beautiful workspace — so your\nteam can focus on what matters."} />
                </div>
            </section>

            {/* ═══ Features — Liquid Glass Cards ═══ */}
            <section id="features" className="relative py-24 md:py-32 px-6 z-[3]">
                <div className="max-w-7xl mx-auto">
                    <FadeInSection className="text-center mb-16">
                        <span className="inline-block text-xs font-medium uppercase tracking-widest text-brand-400 mb-4" style={mono}>Features</span>
                        <h2 className="text-3xl md:text-5xl font-bold" style={mono}>
                            Everything you need to{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">ship faster</span>
                        </h2>
                    </FadeInSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" /></svg>, title: "Kanban Board", desc: "Drag & drop tasks across columns. Visualize your workflow in real-time with live collaboration.", gradient: "from-blue-500/10 to-cyan-500/10" },
                            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>, title: "Real-time Chat", desc: "Integrated messaging with channels, threads, and file sharing — right where you work.", gradient: "from-purple-500/10 to-pink-500/10" },
                            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>, title: "Analytics & OKRs", desc: "Track progress with beautiful charts. Set goals, measure outcomes, and celebrate wins.", gradient: "from-emerald-500/10 to-teal-500/10" },
                            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: "Time Tracking", desc: "Log time on tasks automatically or manually. Understand where your team's effort goes.", gradient: "from-orange-500/10 to-amber-500/10" },
                            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>, title: "Team Management", desc: "Create teams, assign roles, and manage workloads. Keep everyone aligned and productive.", gradient: "from-rose-500/10 to-red-500/10" },
                            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>, title: "AI Assistant", desc: "Auto-assign tasks, generate summaries, and get intelligent insights powered by AI.", gradient: "from-violet-500/10 to-indigo-500/10" },
                        ].map((f, i) => (
                            <FadeInSection key={f.title} delay={i * 0.1}>
                                <TiltCard className="group h-full">
                                    <div className={`relative h-full p-6 rounded-2xl overflow-hidden transition-all duration-300 ${glass} ${glassHover}`}>
                                        <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                        {/* Top reflection line */}
                                        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                        <div className="relative">
                                            <div className={`flex items-center justify-center w-10 h-10 mb-4 rounded-xl ${glassBtn} text-gray-400 group-hover:text-white transition-colors`}>
                                                {f.icon}
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2 text-white" style={mono}>{f.title}</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed" style={mono}>{f.desc}</p>
                                        </div>
                                    </div>
                                </TiltCard>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ How it Works ═══ */}
            <section id="how-it-works" className="relative py-24 md:py-32 px-6 z-[3]">
                <div className="max-w-5xl mx-auto">
                    <FadeInSection className="text-center mb-20">
                        <span className="inline-block text-xs font-medium uppercase tracking-widest text-brand-400 mb-4" style={mono}>How It Works</span>
                        <h2 className="text-3xl md:text-5xl font-bold" style={mono}>
                            From zero to productive in{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">3 steps</span>
                        </h2>
                    </FadeInSection>

                    <div className="relative">
                        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500/30 via-purple-500/20 to-transparent hidden md:block" />
                        {[
                            { step: "01", title: "Create your Workspace", desc: "Set up your team workspace in seconds. Invite members and assign roles with fine-grained permissions.", align: "left" },
                            { step: "02", title: "Organize with Projects", desc: "Create projects, define milestones, and break work into actionable tasks. Use Kanban boards or list views.", align: "right" },
                            { step: "03", title: "Collaborate & Ship", desc: "Track progress in real-time, communicate through integrated chat, and deliver on time — every time.", align: "left" },
                        ].map((item, i) => (
                            <FadeInSection key={item.step} delay={i * 0.2}>
                                <div className={`relative flex items-center mb-16 last:mb-0 ${item.align === "right" ? "md:flex-row-reverse" : ""}`}>
                                    <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center w-16 h-16 rounded-full z-10 ${glass}`}>
                                        <span className="text-sm font-bold text-brand-400" style={mono}>{item.step}</span>
                                    </div>
                                    <div className={`w-full md:w-5/12 ${item.align === "right" ? "md:text-right md:ml-auto" : "md:mr-auto"}`}>
                                        <div className={`p-6 rounded-2xl ${glass} ${glassHover} transition-all duration-300`}>
                                            <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                                            <span className="inline-block md:hidden text-xs font-bold text-brand-400 mb-2" style={mono}>Step {item.step}</span>
                                            <h3 className="text-xl font-semibold mb-2" style={mono}>{item.title}</h3>
                                            <p className="text-gray-500 leading-relaxed text-sm" style={mono}>{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Stats ═══ */}
            <section id="stats" className="relative py-24 md:py-32 px-6 overflow-hidden z-[3]">
                <div className="relative max-w-5xl mx-auto">
                    <FadeInSection>
                        <div className={`rounded-2xl p-10 md:p-14 ${glass}`}>
                            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
                                {[
                                    { value: 10000, suffix: "+", label: "Active Users" },
                                    { value: 500, suffix: "+", label: "Teams" },
                                    { value: 99, suffix: "%", label: "Uptime" },
                                    { value: 50, suffix: "ms", label: "Avg Response" },
                                ].map((s) => (
                                    <div key={s.label} className="text-center">
                                        <p className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                                            <Counter target={s.value} suffix={s.suffix} />
                                        </p>
                                        <p className="mt-2 text-sm text-gray-600" style={mono}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="relative py-24 md:py-32 px-6 z-[3]">
                <div className="max-w-4xl mx-auto">
                    <FadeInSection>
                        <div className={`relative p-12 md:p-16 rounded-3xl text-center overflow-hidden ${glass}`}>
                            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-brand-500/10 rounded-full blur-[80px]" />
                            <div className="relative">
                                <h2 className="text-3xl md:text-5xl font-bold mb-4" style={mono}>
                                    Ready to supercharge<br className="hidden md:block" /> your team?
                                </h2>
                                <p className="text-gray-500 mb-8 max-w-lg mx-auto" style={mono}>
                                    Join thousands of teams already using Pulse to ship faster and collaborate better.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/signup" className={`group inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold rounded-full transition-all duration-300 ${glass} ${glassHover} bg-gradient-to-r from-brand-500/20 to-purple-500/20 text-white`} style={mono}>
                                        Get Started — It&apos;s Free
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </Link>
                                    <Link href="/signin" className={`inline-flex items-center justify-center px-8 py-4 text-sm font-medium rounded-full transition-all duration-300 ${glass} ${glassHover}`} style={mono}>
                                        Sign In
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* ═══ Footer ═══ */}
            <footer className={`relative py-12 px-6 z-[3] border-t border-white/[0.04]`}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6" style={mono}>
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-500/80">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold">Pulse</span>
                    </div>
                    <p className="text-xs text-gray-600">© 2026 Pulse. Enterprise Project Management & Collaboration.</p>
                    <div className="flex items-center gap-6 text-xs text-gray-600">
                        <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
                        <a href="#" className="hover:text-gray-300 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
