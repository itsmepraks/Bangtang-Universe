import { useEffect, useRef, type RefObject } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import type { StageMember } from './concert/createConcertScene';
import { loadPerformerArtwork, performerCell } from './concert/performerArtwork';
import { sampleAudioRhythm, type ConcertAudioFrame } from '../../utils/audioRhythm';
interface ConcertArenaProps {
  members: readonly StageMember[];
  focused: string | null;
  audioRef: RefObject<ConcertAudioFrame | null>;
  paused: boolean;
}
type Point = { x: number; y: number; z: number };
type Light = Point & { phase: number; color: number; size: number };
const COLORS = ['#a855f7', '#c084fc', '#e9d5ff', '#ffffff', '#7c3aed'];

// World coordinates are projected through a moving camera, including the stage,
// lighting, seating and illustrated performers. No animation-frame React state.
export default function ConcertArena({ members, focused, audioRef, paused }: ConcertArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusRef = useRef(focused);
  const redrawRef = useRef<(() => void) | null>(null);
  const reduced = useReducedMotion();
  const pose = useRef({ time: 0, cameraX: 0, bass: 0, beatPhase: 0 });
  useEffect(() => { focusRef.current = focused; redrawRef.current?.(); }, [focused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !ctx) return;
    const still = reduced || paused;
    let width = 0, height = 0, frame = 0, last = 0;
    let { time, cameraX, bass, beatPhase } = reduced ? { time: 0, cameraX: 0, bass: 0, beatPhase: 0 } : pose.current;
    let velocity = 0, pointerX = 0;
    let lights: Light[] = [];
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sprites = COLORS.map(color => {
      const sprite = document.createElement('canvas');
      sprite.width = sprite.height = 48;
      const paint = sprite.getContext('2d')!;
      const glow = paint.createRadialGradient(24, 24, 0, 24, 24, 24);
      glow.addColorStop(0, '#fff'); glow.addColorStop(0.12, '#fff');
      glow.addColorStop(0.24, color); glow.addColorStop(0.5, color + '65'); glow.addColorStop(1, color + '00');
      paint.fillStyle = glow; paint.fillRect(0, 0, 48, 48);
      return sprite;
    });
    let characterArt: HTMLCanvasElement | null = null;
    let cancelled = false;
    void loadPerformerArtwork().then(art => {
      if (cancelled) return;
      characterArt = art; draw();
    }).catch(() => {});
    const generate = () => {
      let seed = 71;
      const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      const mobile = width < 640;
      lights = [];
      // Raked seating wraps around the stage in an actual three-dimensional bowl.
      for (let tier = 0; tier < 19; tier++) {
        const count = mobile ? 65 : 125;
        for (let seat = 0; seat < count; seat++) {
          const angle = (seat / count) * Math.PI * 2;
          const radius = 25 + tier * 1.45;
          const x = Math.sin(angle) * radius, z = 24 + Math.cos(angle) * radius;
          if (z < -18 || (z < 18 && Math.abs(x) < 17)) continue;
          lights.push({ x: x + random() * .5, y: 1.5 + tier * .72 + random() * .4, z,
            phase: random() * Math.PI * 2, color: Math.floor(random() * COLORS.length), size: .16 + random() * .13 });
        }
      }
      // Floor audience leaves a central runway and the main stage clear.
      for (let i = 0; i < (mobile ? 420 : 950); i++) {
        const x = (random() - .5) * 55, z = random() * 52 - 18;
        if ((z > 17 && Math.abs(x) < 17) || (z > -2 && Math.abs(x) < 3)) continue;
        lights.push({ x, z, y: .5 + random(), phase: random() * Math.PI * 2,
          color: Math.floor(random() * COLORS.length), size: .15 + random() * .13 });
      }
      lights.sort((a, b) => b.z - a.z);
    };
    const draw = () => {
      const dolly = Math.sin(time * .19) * 1.4;
      const focal = Math.min(width * 1.5, height * 1.4);
      const horizon = height * .65 - 5 * focal / 26;
      const project = ({ x, y, z }: Point) => {
        const depth = Math.max(8, z + 28 + dolly);
        const scale = focal / depth;
        return { x: width / 2 + (x - cameraX) * scale, y: horizon + (5 - y) * scale, scale };
      };
      const polygon = (points: Point[], fill: string, stroke?: string) => {
        ctx.beginPath(); points.forEach((p, i) => { const v = project(p); if (!i) ctx.moveTo(v.x, v.y); else ctx.lineTo(v.x, v.y); });
        ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
      };
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#020008'; ctx.fillRect(0, 0, width, height);
      const haze = ctx.createRadialGradient(width / 2, height * .52, 0, width / 2, height * .52, width * .65);
      haze.addColorStop(0, '#251139'); haze.addColorStop(.5, '#10081e'); haze.addColorStop(1, '#020008');
      ctx.fillStyle = haze; ctx.fillRect(0, 0, width, height);

      // Subtle balcony lips make the audience read as architecture, not a starfield.
      for (const tier of [3, 8, 13, 18]) {
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const angle = -Math.PI / 2 + i / 100 * Math.PI;
          const radius = 25 + tier * 1.45;
          const p = project({ x: Math.sin(angle) * radius, y: tier * .72 + 1, z: 24 + Math.cos(angle) * radius });
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = '#9973ce25'; ctx.lineWidth = 1; ctx.stroke();
      }
      const crowd = (front: boolean) => {
        ctx.globalCompositeOperation = 'lighter';
        for (const light of lights) {
          if ((light.z < 18) !== front) continue;
          const wave = Math.sin(time * 1.4 + light.phase + light.x * .1);
          const p = project({ x: light.x + (Math.sin(time * .8 + light.phase) * .2), y: light.y + (wave * .18), z: light.z });
          if (p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) continue;
          const size = Math.min(34, light.size * p.scale * 2.4);
          ctx.globalAlpha = .42 + (wave + 1) * .12 + bass * .15;
          if (front && p.scale > 22) {
            ctx.strokeStyle = '#bdb0d05a'; ctx.lineWidth = Math.max(1, p.scale * .025);
            ctx.beginPath(); ctx.moveTo(p.x, p.y + size * .12); ctx.lineTo(p.x + wave, p.y + size * .65); ctx.stroke();
          }
          ctx.drawImage(sprites[light.color], p.x - size / 2, p.y - size / 2, size, size);
        }
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      };
      crowd(false);
      // Keep projected names available on the lightweight renderer as well.
      const screenTop = project({ x: -17, y: 16, z: 26 });
      const screenBottom = project({ x: 17, y: 3, z: 26 });
      ctx.fillStyle = '#28113d'; ctx.fillRect(screenTop.x, screenTop.y, screenBottom.x - screenTop.x, screenBottom.y - screenTop.y);
      ctx.strokeStyle = '#ad75ed70'; ctx.strokeRect(screenTop.x, screenTop.y, screenBottom.x - screenTop.x, screenBottom.y - screenTop.y);
      const screenCenter = (screenTop.x + screenBottom.x) / 2;
      const screenHeight = screenBottom.y - screenTop.y;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f6eaff';
      ctx.font = `700 ${Math.max(12, screenHeight * .19)}px Arial, sans-serif`;
      if (focusRef.current) {
        const member = members.find(m => m.name === focusRef.current);
        const fullName = (member?.fullName || focusRef.current).toUpperCase();
        const fontSize = Math.min(screenHeight * .19, screenHeight * .19 * (screenBottom.x - screenTop.x) * .86 / Math.max(1, ctx.measureText(fullName).width));
        ctx.font = `700 ${fontSize}px Arial, sans-serif`;
        ctx.fillText(fullName, screenCenter, screenTop.y + screenHeight * .52);
        ctx.font = `600 ${screenHeight * .08}px Arial, sans-serif`;
        ctx.fillText(focusRef.current, screenCenter, screenTop.y + screenHeight * .26);
      }
      else {
        ctx.fillText('BANGTAN', screenCenter, screenTop.y + screenHeight * .38);
        ctx.fillText('UNIVERSE', screenCenter, screenTop.y + screenHeight * .61);
      }
      // Raised main stage, lit front fascia, and a thrust extending into the crowd.
      polygon([{ x:-16,y:0,z:18 },{ x:16,y:0,z:18 },{ x:16,y:0,z:28 },{ x:-16,y:0,z:28 }], '#171020', '#c39aef70');
      polygon([{ x:-16,y:0,z:18 },{ x:16,y:0,z:18 },{ x:16,y:-.7,z:18 },{ x:-16,y:-.7,z:18 }], '#38204c', '#d2a0ff66');
      polygon([{ x:-2,y:0,z:18 },{ x:2,y:0,z:18 },{ x:2,y:0,z:0 },{ x:-2,y:0,z:0 }], '#171020', '#c39aef60');
      polygon([{ x:-4,y:0,z:0 },{ x:4,y:0,z:0 },{ x:4,y:0,z:-4 },{ x:-4,y:0,z:-4 }], '#22142d', '#c39aef70');
      ctx.globalCompositeOperation = 'lighter';
      members.forEach((member, index) => {
        const x = (index - 3) * 1.05;
        const selected = focusRef.current === member.name;
        const dim = focusRef.current !== null && !selected;
        const base = project({ x, y: .1, z: -2 });
        const sweep = Math.sin(beatPhase * .36 + index * .65) * 5;
        const tip = project({ x: x + sweep, y: 19, z: 26 + Math.cos(beatPhase * .3 + index) * 5 });
        const radius = base.scale * (selected ? 1.9 : 1.15);
        const beam = ctx.createLinearGradient(tip.x, tip.y, base.x, base.y);
        beam.addColorStop(0, member.color + '00'); beam.addColorStop(.4, member.color + '22'); beam.addColorStop(1, member.color + '88');
        ctx.globalAlpha = dim ? .15 : .6 + bass * .3;
        ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(tip.x - 2, tip.y); ctx.lineTo(base.x - radius, base.y); ctx.quadraticCurveTo(base.x, base.y + 7, base.x + radius, base.y); ctx.lineTo(tip.x + 2, tip.y); ctx.fill();
        const pool = ctx.createRadialGradient(base.x, base.y, 0, base.x, base.y, radius * 2.5);
        pool.addColorStop(0, member.glow + 'cc'); pool.addColorStop(.3, member.color + '65'); pool.addColorStop(1, member.color + '00');
        ctx.save(); ctx.translate(base.x, base.y); ctx.scale(1, .22); ctx.translate(-base.x, -base.y);
        ctx.fillStyle = pool; ctx.fillRect(base.x - radius * 3, base.y - radius * 3, radius * 6, radius * 6); ctx.restore();
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        if (characterArt) {
          const cell = performerCell(index);
          const height = base.scale * 3.3, width = height * .75;
          ctx.save(); ctx.translate(base.x, base.y);
          ctx.globalAlpha = dim ? .7 : 1;
          ctx.drawImage(characterArt, cell.x * characterArt.width, cell.y * characterArt.height,
            cell.width * characterArt.width, cell.height * characterArt.height,
            -width / 2, -height * .965, width, height);
          ctx.restore();
          ctx.globalAlpha = 1;
        }
        ctx.globalCompositeOperation = 'lighter';
      });
      ctx.globalAlpha = 1;
      // Crossing overhead follow-spots have different depths, moving through haze.
      for (let i = 0; i < 4; i++) {
        const origin = project({ x: (i - 1.5) * 12, y: 17, z: 34 });
        const target = project({ x: Math.sin(beatPhase * .23 + i * 1.8) * 27, y: 0, z: 3 + i * 6 });
        const wash = ctx.createLinearGradient(origin.x, origin.y, target.x, target.y);
        wash.addColorStop(0, '#e0c7ff60'); wash.addColorStop(.2, '#c495fa14'); wash.addColorStop(1, '#ac79e900');
        ctx.fillStyle = wash; ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(target.x - 35, target.y); ctx.lineTo(target.x + 35, target.y); ctx.fill();
        ctx.drawImage(sprites[2], origin.x - 7, origin.y - 7, 14, 14);
      }
      ctx.globalCompositeOperation = 'source-over';
      crowd(true);
      const vignette = ctx.createLinearGradient(0, 0, 0, height);
      vignette.addColorStop(0, '#020008bb'); vignette.addColorStop(.23, '#02000800'); vignette.addColorStop(.72, '#02000800'); vignette.addColorStop(1, '#020008d9');
      ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height);
    };
    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min((now - (last || now)) / 1000, .04); last = now;
      time += dt;
      // Damped spring camera: mass 1, stiffness 100, damping 10.
      const target = pointerX * 1.3 + Math.sin(time * .16) * .65;
      velocity += ((target - cameraX) * 100 - velocity * 10) * dt;
      cameraX += velocity * dt;
      const rhythm = sampleAudioRhythm(audioRef.current, now);
      bass = 0; beatPhase += (rhythm.position * Math.PI / 4 - beatPhase) * (1 - Math.exp(-dt / .65));
      draw();
      if (!still && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, width < 640 ? 1.5 : 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); generate(); draw();
    };
    const pointer = (event: PointerEvent) => { if (!still && finePointer.matches) pointerX = (event.clientX / width - .5) * 2; };
    const resetPointer = () => { pointerX = 0; };
    const visibility = () => { if (frame) cancelAnimationFrame(frame); frame = 0; last = 0; if (!document.hidden && !still) frame = requestAnimationFrame(tick); };
    redrawRef.current = draw;
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    window.addEventListener('pointermove', pointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', resetPointer);
    document.addEventListener('visibilitychange', visibility);
    resize(); if (!still) frame = requestAnimationFrame(tick);
    return () => { cancelled = true; pose.current = { time, cameraX, bass, beatPhase }; cancelAnimationFrame(frame); observer.disconnect(); redrawRef.current = null; window.removeEventListener('pointermove', pointer); document.documentElement.removeEventListener('pointerleave', resetPointer); document.removeEventListener('visibilitychange', visibility); };
  }, [audioRef, members, paused, reduced]);

  return <div className="absolute inset-0">
    <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
  </div>;
}
