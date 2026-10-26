import React, { useEffect, useRef } from 'react';

const COLS    = 32;
const ROWS    = 32;
const SPACING = 2.4;
const WAVE    = 3.8;
const COUNT   = COLS * ROWS;

export default function ThreeWave(): React.JSX.Element {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        let rafId: number;
        let renderer: import('three').WebGLRenderer;

        (async () => {
            const THREE = await import('three');

            /* ── Renderer ─────────────────────────────────── */
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000, 0);
            renderer.domElement.style.pointerEvents = 'none';
            mount.appendChild(renderer.domElement);

            /* ── Scene & Camera ───────────────────────────── */
            const scene  = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 500);
            camera.position.set(0, 18, 50);
            camera.lookAt(0, -1, 0);

            /* ── Brand gradient palette ───────────────────── */
            const C_A = new THREE.Color('#465BE5'); // indigo-blue  → wave peaks (top)
            const C_B = new THREE.Color('#8B2FD4'); // violet midpoint
            const C_C = new THREE.Color('#CD00BE'); // magenta      → wave troughs (bottom)

            // h in [0,1]: 0 = bottom (magenta) → 1 = top (blue), through violet
            const heightColor = (out: import('three').Color, h: number) => {
                if (h < 0.5) out.lerpColors(C_C, C_B, h * 2);
                else         out.lerpColors(C_B, C_A, (h - 0.5) * 2);
                return out;
            };

            /* ── Core spheres ─────────────────────────────── */
            const coreGeom = new THREE.SphereGeometry(0.17, 10, 7);
            const coreMat  = new THREE.MeshBasicMaterial();
            const coreMesh = new THREE.InstancedMesh(coreGeom, coreMat, COUNT);
            scene.add(coreMesh);

            /* ── Halo spheres (additive glow) ─────────────── */
            const haloGeom = new THREE.SphereGeometry(0.50, 8, 6);
            const haloMat  = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0.07,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            const haloMesh = new THREE.InstancedMesh(haloGeom, haloMat, COUNT);
            scene.add(haloMesh);

            /* ── Per-instance lightness jitter (computed once) ─ */
            const jit = new Float32Array(COUNT);
            for (let k = 0; k < COUNT; k++) {
                jit[k] = (Math.random() - 0.5) * 0.08;
            }
            const tmpColor = new THREE.Color();

            /* ── Mouse tracking ───────────────────────────── */
            const mouse   = { x: 0.5, y: 0.5 };
            const halfW   = (COLS - 1) * SPACING * 0.5;
            const halfD   = (ROWS - 1) * SPACING * 0.5;

            const onMouseMove = (e: MouseEvent) => {
                mouse.x = e.clientX / window.innerWidth;
                mouse.y = e.clientY / window.innerHeight;
            };
            window.addEventListener('mousemove', onMouseMove);

            /* ── Animation ────────────────────────────────── */
            const clock = new THREE.Clock();
            const dummy = new THREE.Object3D();

            const tick = () => {
                rafId = requestAnimationFrame(tick);
                const t = clock.getElapsedTime();

                const mx = (mouse.x - 0.5) * COLS * SPACING;
                const mz = (mouse.y - 0.5) * ROWS * SPACING;

                for (let i = 0; i < COLS; i++) {
                    for (let j = 0; j < ROWS; j++) {
                        const idx = i * ROWS + j;
                        const x   = i * SPACING - halfW;
                        const z   = j * SPACING - halfD;

                        const base   = Math.sin(i * 0.38 + t * 1.1) * Math.cos(j * 0.38 + t * 0.9) * WAVE;
                        const dx     = x - mx;
                        const dz     = z - mz;
                        const dist   = Math.sqrt(dx * dx + dz * dz);
                        const ripple = Math.exp(-dist * 0.045) * Math.sin(dist * 0.55 - t * 3.5) * 2.2;
                        const y      = base + ripple;

                        dummy.position.set(x, y, z);
                        dummy.updateMatrix();
                        coreMesh.setMatrixAt(idx, dummy.matrix);
                        haloMesh.setMatrixAt(idx, dummy.matrix);

                        // Color by height: blue at peaks, magenta at troughs
                        const h = Math.min(Math.max((y + WAVE) / (2 * WAVE), 0), 1);
                        heightColor(tmpColor, h);
                        if (jit[idx] !== 0) tmpColor.offsetHSL(0, 0, jit[idx]);
                        coreMesh.setColorAt(idx, tmpColor);
                        haloMesh.setColorAt(idx, tmpColor);
                    }
                }

                coreMesh.instanceMatrix.needsUpdate = true;
                haloMesh.instanceMatrix.needsUpdate = true;
                coreMesh.instanceColor!.needsUpdate = true;
                haloMesh.instanceColor!.needsUpdate = true;

                camera.position.x = Math.sin(t * 0.035) * 10;
                camera.lookAt(0, -1, 0);

                renderer.render(scene, camera);
            };

            /* ── Resize ───────────────────────────────────── */
            const onResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', onResize);

            tick();

            /* ── Cleanup ref ──────────────────────────────── */
            (mount as any).__threeCleanup = () => {
                cancelAnimationFrame(rafId);
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('resize', onResize);
                renderer.dispose();
                coreGeom.dispose();
                coreMat.dispose();
                haloGeom.dispose();
                haloMat.dispose();
                if (renderer.domElement.parentNode === mount) {
                    mount.removeChild(renderer.domElement);
                }
            };
        })();

        return () => {
            cancelAnimationFrame(rafId);
            (mount as any).__threeCleanup?.();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    );
}
