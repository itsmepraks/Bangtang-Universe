import * as THREE from 'three';
import { createSurfaceResizer, createQualityMonitor } from './renderSurface';
import { frontStagePosition } from './stageLayout';
import { createCartoonPerformerFactory } from './createCartoonPerformer';
import { createConcertAtmosphere } from './createConcertAtmosphere';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { crowdVertex, crowdFragment, beamVertex, beamFragment, screenVertex, screenFragment } from './shaders';

export interface ConcertFrame { time: number; bass: number; vocal?: number; beatPulse?: number; beatPosition?: number; bpm?: number; audioPlaying?: boolean; pointerX: number; pointerY: number; focus: number }
export interface ConcertScene { render(frame: ConcertFrame): void; resize(): void; dispose(): void }
export interface StageMember { name: string; fullName?: string; short: string; color: string; glow: string }

export function createConcertScene(canvas: HTMLCanvasElement, members: readonly StageMember[]): ConcertScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  // Embedded browser surfaces may composite between our animation frames.
  // Retain the finished frame until the next complete render replaces it.
  canvas.dataset.frameRetention = 'preserved';
  renderer.setClearColor('#030207');
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#090511', .008);
  const camera = new THREE.PerspectiveCamera(52, 1, .1, 350);
  const resources = new Set<{ dispose(): void }>();
  const keep = <T extends { dispose(): void }>(resource: T): T => { resources.add(resource); return resource; };
  let seed = 97;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  const dark = keep(new THREE.MeshStandardMaterial({ color: '#17121d', roughness: .72, metalness: .4 }));
  const black = keep(new THREE.MeshBasicMaterial({ color: '#060509' }));
  const floorMaterial = keep(new THREE.MeshStandardMaterial({ color: '#050307', roughness: .28, metalness: .65 }));
  const cube = keep(new THREE.BoxGeometry(1, 1, 1));
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material = dark) => {
    const mesh = new THREE.Mesh(cube, material); mesh.position.set(x, y, z); mesh.scale.set(w, h, d); scene.add(mesh); return mesh;
  };
  scene.add(new THREE.HemisphereLight('#a891d6', '#08050e', .42));
  const key = new THREE.DirectionalLight('#aaa6ff', 1.2); key.position.set(0, 25, -30); scene.add(key);
  box(0, -.4, 0, 145, .5, 200, floorMaterial);

  // A physical stage with a thrust, LED fascia, overhead rigging and line arrays.
  box(0, .7, -39, 70, 1.4, 17, floorMaterial);
  box(0, .55, -8, 7, 1.1, 46, floorMaterial);
  box(0, .6, 18, 17, 1.2, 10, floorMaterial);
  const ledMat = keep(new THREE.MeshBasicMaterial({ color: new THREE.Color('#ad75ed').multiplyScalar(2.2) }));
  box(0, .7, -30.45, 70, .09, .09, ledMat);
  for (const sign of [-1, 1]) {
    box(sign * 3.52, 1.1, -8, .08, .07, 46, ledMat);
    box(sign * 8.53, 1.21, 18, .08, .07, 10, ledMat);
    box(sign * 34, 13.5, -36, 1, 27, 1);
    // Hanging speaker arrays give the stage a tangible, venue-scale silhouette.
    for (let i = 0; i < 9; i++) box(sign * 36, 24 - i * .85, -33 + i * .12, 1.5, .65, 1.25, black);
  }
  box(0, 27, -34, 70, .45, .7);
  box(0, 25.8, -34, 70, .3, .7);
  const trussPoints: THREE.Vector3[] = [];
  for (let x = -34; x < 34; x += 1.6) {
    trussPoints.push(new THREE.Vector3(x, 25.8, -33.7), new THREE.Vector3(x + 1.6, 27, -33.7));
    trussPoints.push(new THREE.Vector3(x, 27, -33.7), new THREE.Vector3(x + 1.6, 25.8, -33.7));
  }
  scene.add(new THREE.LineSegments(keep(new THREE.BufferGeometry().setFromPoints(trussPoints)), keep(new THREE.LineBasicMaterial({ color: '#544366' }))));

  // Three LED walls: name projection on the main wall, BTS doors on the wings.
  const screenUniforms = { time: { value: 0 }, energy: { value: 0 }, tint: { value: new THREE.Color('#bd7bff') } };
  const screenMaterial = keep(new THREE.ShaderMaterial({ uniforms: screenUniforms, vertexShader: screenVertex, fragmentShader: screenFragment }));
  const screenGeo = keep(new THREE.PlaneGeometry(1, 1));
  const screen = (x: number, y: number, z: number, w: number, h: number) => {
    const frame = box(x, y, z - .25, w + .7, h + .7, .45, black);
    const mesh = new THREE.Mesh(screenGeo, screenMaterial); mesh.position.set(x, y, z); mesh.scale.set(w, h, 1); scene.add(mesh); return { mesh, frame };
  };
  const mainScreen = { y: 13.7, z: -36, width: 44, height: 22 };
  const mainWall = screen(0, mainScreen.y, mainScreen.z, mainScreen.width, mainScreen.height);
  const wingWalls = [screen(-28.5, 13.7, -35, 9, 17), screen(28.5, 13.7, -35, 9, 17)];
  // Text is part of the physical screen, so it shares its perspective and glow.
  // Redraw only on selection changes, never on every animation frame.
  const nameCanvas = document.createElement('canvas'); nameCanvas.width = 1536; nameCanvas.height = 768;
  const nameInk = nameCanvas.getContext('2d')!;
  const nameTexture = keep(new THREE.CanvasTexture(nameCanvas)); nameTexture.colorSpace = THREE.SRGBColorSpace;
  nameTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const nameMaterial = keep(new THREE.MeshBasicMaterial({ map: nameTexture, transparent: true, depthWrite: false, toneMapped: false }));
  const nameScreen = new THREE.Mesh(screenGeo, nameMaterial); nameScreen.position.set(0, mainScreen.y, mainScreen.z + .25); nameScreen.scale.set(mainScreen.width, mainScreen.height, 1); scene.add(nameScreen);
  let displayedFocus = -2;
  const updateScreenName = (focus: number) => {
    if (focus === displayedFocus) return;
    displayedFocus = focus;
    const member = members[focus];
    nameInk.clearRect(0, 0, 1536, 768);
    // A scrim keeps projected lettering readable against moving LED visuals.
    nameInk.fillStyle = '#07021566'; nameInk.fillRect(0, 0, 1536, 768);
    nameInk.textAlign = 'center'; nameInk.textBaseline = 'middle';
    nameInk.shadowColor = member?.color || '#b785f5'; nameInk.shadowBlur = 16;
    nameInk.fillStyle = member?.glow || '#f8f0ff';
    if (member) {
      const fullName = (member.fullName || member.name).toUpperCase();
      nameInk.font = '700 170px Arial, sans-serif';
      const fontSize = Math.min(170, 170 * 1320 / Math.max(1, nameInk.measureText(fullName).width));
      nameInk.font = `700 ${fontSize}px Arial, sans-serif`;
      nameInk.fillText(fullName, 768, 395);
      nameInk.shadowBlur = 0; nameInk.font = '600 60px Arial, sans-serif';
      nameInk.fillStyle = '#eee0ff'; nameInk.fillText(member.name, 768, 205);
      nameInk.shadowBlur = 0; nameInk.font = '500 44px Arial, sans-serif'; nameInk.fillStyle = '#eee0ff'; nameInk.fillText('BANGTAN UNIVERSE', 768, 595);
    } else {
      // A concert emblem replaces the repeated wall of title text between calls.
      nameInk.fillStyle = '#f6eaff';
      nameInk.beginPath(); nameInk.moveTo(585, 165); nameInk.lineTo(735, 222); nameInk.lineTo(735, 518); nameInk.lineTo(585, 576); nameInk.fill();
      nameInk.beginPath(); nameInk.moveTo(951, 165); nameInk.lineTo(801, 222); nameInk.lineTo(801, 518); nameInk.lineTo(951, 576); nameInk.fill();
      nameInk.shadowBlur = 0; nameInk.font = '500 48px Arial, sans-serif'; nameInk.fillStyle = '#e5d8fa'; nameInk.fillText('BANGTAN UNIVERSE', 768, 670);

    }
    nameTexture.needsUpdate = true;
    canvas.dataset.screenName = member?.fullName || member?.name || 'BANGTAN UNIVERSE';
  };
  updateScreenName(-1);

  // Stepped seating sections, broken by real aisles rather than perfect dot rings.
  const lowPower = canvas.clientWidth < 700;
  const seatsPerRow = lowPower ? 220 : 380;
  const crowdPositions: number[] = [], phases: number[] = [], sizes: number[] = [], tints: number[] = [];
  const colors = ['#a847f5', '#8e35ec', '#d094ff', '#bc78f9', '#faf6ff'].map(color => new THREE.Color(color));
  const addFan = (x: number, y: number, z: number, floor: boolean) => {
    crowdPositions.push(x, y + 1.6 + random() * .6, z); phases.push(random() * Math.PI * 2); sizes.push(.38 + random() * .28);
    const c = colors[Math.floor(random() * colors.length)]; tints.push(c.r, c.g, c.b);
    if (floor) floorFans.push(new THREE.Vector3(x, y, z));
  };
  const floorFans: THREE.Vector3[] = [];
  for (let level = 0; level < 4; level++) {
    for (let row = 0; row < 11; row++) {
      const rx = 52 + level * 6 + row * .52, rz = 76 + level * 7 + row * .6;
      const y = 3 + level * 7.6 + row * .46;
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const a = seat / seatsPerRow * Math.PI * 2;
        const x = Math.sin(a) * rx, z = Math.cos(a) * rz - 3;
        if (z < -51 || seat % Math.round(seatsPerRow / 10) < 2 || random() < .055) continue;
        addFan(x + random() * .28, y, z + random() * .3, false);
      }
    }
    const balcony = new THREE.Mesh(keep(new THREE.CylinderGeometry(52 + level * 6, 52 + level * 6, 1.15, 100, 1, true, -2.14, 4.28)), dark);
    balcony.position.set(0, 2.2 + level * 7.6, -3); balcony.scale.z = (76 + level * 7) / (52 + level * 6); scene.add(balcony);
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 180; i++) {
      const a = -2.14 + i / 180 * 4.28;
      points.push(new THREE.Vector3(Math.sin(a) * (52 + level * 6), 2.8 + level * 7.6, Math.cos(a) * (76 + level * 7) - 3));
    }
    const rail = keep(new THREE.BufferGeometry().setFromPoints(points));
    scene.add(new THREE.Line(rail, keep(new THREE.LineBasicMaterial({ color: '#281539' }))));
    // A thick, unlit balcony face under a narrow purple ribbon board.
    const ribbon = new THREE.Mesh(keep(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 180, .08, 4, false)), keep(new THREE.MeshBasicMaterial({ color: '#522981' })));
    scene.add(ribbon);
  }
  const floorRows = lowPower ? 44 : 66, floorCols = lowPower ? 52 : 76;
  for (let row = 0; row < floorRows; row++) for (let col = 0; col < floorCols; col++) {
    const x = (col - (floorCols - 1) / 2) * (64.6 / floorCols) + (random() - .5) * .4;
    const z = -28 + row * (89.1 / floorRows) + random() * .45;
    if ((Math.abs(x) < 4.7 && z < 14) || (Math.abs(x) < 10 && z >= 12 && z < 25) || col % 19 === 0 || random() < .06) continue;
    addFan(x, 0, z, true);
  }
  const crowdGeometry = keep(new THREE.BufferGeometry());
  crowdGeometry.setAttribute('position', new THREE.Float32BufferAttribute(crowdPositions, 3));
  crowdGeometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1));
  crowdGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  crowdGeometry.setAttribute('tint', new THREE.Float32BufferAttribute(tints, 3));
  const crowdUniforms = { rhythm: { value: 0 }, time: { value: 0 }, energy: { value: 0 }, pixelRatio: { value: 1 } };
  const crowdMaterial = keep(new THREE.ShaderMaterial({ uniforms: crowdUniforms, vertexShader: crowdVertex, fragmentShader: crowdFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  const crowd = new THREE.Points(crowdGeometry, crowdMaterial); crowd.frustumCulled = false; scene.add(crowd);
  // Instanced heads and shoulders: lights belong to people, rather than floating.
  const headGeo = keep(new THREE.SphereGeometry(.18, 6, 5));
  const bodyGeo = keep(new THREE.CylinderGeometry(.25, .32, .85, 5));
  const bodies = new THREE.InstancedMesh(bodyGeo, black, floorFans.length);
  const heads = new THREE.InstancedMesh(headGeo, black, floorFans.length);
  const dummy = new THREE.Object3D();
  floorFans.forEach((p, i) => {
    dummy.position.set(p.x, .83, p.z); dummy.scale.set(1, .8 + random() * .3, 1); dummy.updateMatrix(); bodies.setMatrixAt(i, dummy.matrix);
    dummy.position.y = 1.43; dummy.scale.setScalar(1); dummy.updateMatrix(); heads.setMatrixAt(i, dummy.matrix);
  });
  scene.add(bodies, heads);

  // Cartoon members stand on the forward thrust, close to the audience.
  const redrawWhenReady = () => {
    if (disposed) return;
    if (bloom.enabled) composer.render(); else renderer.render(scene, camera);
  };
  const makePerformer = createCartoonPerformerFactory(keep, redrawWhenReady);
  const atmosphere = createConcertAtmosphere(scene, keep, lowPower, redrawWhenReady);
  const performers = members.map((member, i) => {
    const position = frontStagePosition(i, members.length);
    const performer = makePerformer(member, i);
    performer.root.position.set(position.x, position.y, position.z);
    performer.root.scale.setScalar(1.08);
    scene.add(performer.root);
    return performer;
  });

  // Front-of-house wash lights illuminate faces and clothing on the thrust.
  for (const x of [-14, 14]) {
    const wash = new THREE.SpotLight('#fff0e3', 900, 65, .6, .85, 2);
    wash.position.set(x, 16, 34); wash.target.position.set(0, 2, 19); scene.add(wash, wash.target);
  }

  // Soft volumetric cones with actual fixture origins; shader edges dissolve in haze.
  const beams: { mesh: THREE.Mesh; origin: THREE.Vector3; material: THREE.ShaderMaterial; member: number; floor: boolean }[] = [];
  const beamGeometry = keep(new THREE.CylinderGeometry(.05, 4.5, 1, 28, 1, true));
  beamGeometry.translate(0, -.5, 0);
  const lampGeo = keep(new THREE.SphereGeometry(.15, 8, 6));
  const lampMaterial = keep(new THREE.MeshBasicMaterial({ color: new THREE.Color('#ead9ff').multiplyScalar(5) }));
  const beamCount = 24;
  for (let i = 0; i < beamCount; i++) {
    const floor = i >= 18;
    const side = i % 2 ? 1 : -1;
    const origin = floor
      ? new THREE.Vector3(side * (10 + Math.floor((i - 18) / 2) * 2.3), .45, 10 + Math.floor((i - 18) / 2) * 4)
      : new THREE.Vector3((i / 17 - .5) * 65, i % 2 ? 25.7 : 26.9, -33);
    const material = keep(new THREE.ShaderMaterial({ uniforms: { tint: { value: new THREE.Color(i % 3 ? '#c4a5ff' : '#8199ff') }, strength: { value: .11 }, time: { value: 0 } }, vertexShader: beamVertex, fragmentShader: beamFragment, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    const mesh = new THREE.Mesh(beamGeometry, material); mesh.position.copy(origin); mesh.frustumCulled = false; scene.add(mesh);
    beams.push({ mesh, origin, material, member: i % 7, floor });
    const lamp = new THREE.Mesh(lampGeo, lampMaterial); lamp.position.copy(origin); scene.add(lamp);
    box(origin.x, origin.y + .3, origin.z, .45, .5, .5, black);
  }
  // Floor pools and a softer mirror of the LED wall anchor light to the surface.
  const poolCanvas = document.createElement('canvas'); poolCanvas.width = poolCanvas.height = 128;
  const poolCtx = poolCanvas.getContext('2d')!;
  const gradient = poolCtx.createRadialGradient(64, 64, 0, 64, 64, 64); gradient.addColorStop(0, '#ffffffaa'); gradient.addColorStop(.3, '#ffffff55'); gradient.addColorStop(1, '#ffffff00');
  poolCtx.fillStyle = gradient; poolCtx.fillRect(0, 0, 128, 128);
  const poolMap = keep(new THREE.CanvasTexture(poolCanvas));
  const pools = members.map((m, i) => {
    const material = keep(new THREE.MeshBasicMaterial({ map: poolMap, color: m.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .5 }));
    const position = frontStagePosition(i, members.length);
    const mesh = new THREE.Mesh(screenGeo, material); mesh.rotation.x = -Math.PI / 2; mesh.position.set(position.x, position.y + .02, position.z); mesh.scale.set(3.6, 3.6, 1); scene.add(mesh); return material;
  });
  members.forEach((_, i) => {
    const material = keep(new THREE.MeshBasicMaterial({ map: poolMap, color: '#020106', transparent: true, depthWrite: false, opacity: .4 }));
    const shadow = new THREE.Mesh(screenGeo, material); const position = frontStagePosition(i, members.length);
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(position.x, position.y + .04, position.z);
    shadow.scale.set(2.3, 1.25, 1); scene.add(shadow);
  });
  const reflection = new THREE.Mesh(screenGeo, keep(new THREE.MeshBasicMaterial({ map: poolMap, color: '#8f46e7', transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending })));
  reflection.rotation.x = -Math.PI / 2; reflection.position.set(0, .02, -18); reflection.scale.set(58, 36, 1); scene.add(reflection);

  // Close ARMY Bombs sit between the lens and the arena, with a globe,
  // dark handle and cap. Their parallax is much stronger than the distant stands.
  const foregroundBombs: { group: THREE.Group; phase: number; glow: THREE.MeshStandardMaterial }[] = [];
  const globeGeometry = keep(new THREE.SphereGeometry(.32, 20, 14));
  const handleGeometry = keep(new THREE.CylinderGeometry(.075, .09, .65, 10));
  const capGeometry = keep(new THREE.CylinderGeometry(.14, .09, .17, 10));
  const nearPositions = [[-7.4, 2.1, 35], [7, 1.3, 33], [-4.2, 3.1, 39], [4.7, 2.7, 38], [-11, 1.8, 28]];
  nearPositions.forEach(([x, y, z], i) => {
    const group = new THREE.Group(); group.position.set(x, y, z);
    const handle = new THREE.Mesh(handleGeometry, dark); group.add(handle);
    const cap = new THREE.Mesh(capGeometry, black); cap.position.y = .4; group.add(cap);
    const glow = keep(new THREE.MeshStandardMaterial({ color: '#dbc3f2', emissive: '#ad57eb', emissiveIntensity: 1.4, roughness: .3, metalness: .1 }));
    const globe = new THREE.Mesh(globeGeometry, glow); globe.position.y = .77; group.add(globe);
    const topCap = new THREE.Mesh(keep(new THREE.CylinderGeometry(.065, .085, .075, 10)), black); topCap.position.y = 1.115; group.add(topCap);
    const seam = new THREE.Mesh(keep(new THREE.TorusGeometry(.325, .007, 5, 32)), dark); seam.rotation.x = Math.PI / 2; seam.position.y = .77; group.add(seam);
    const shell = new THREE.Mesh(keep(new THREE.SphereGeometry(.345, 20, 14)), keep(new THREE.MeshPhysicalMaterial({ color: '#dfd8ed', metalness: .1, roughness: .15, transparent: true, opacity: .17, depthWrite: false })));
    shell.position.y = .77; group.add(shell);
    const halo = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: poolMap, color: '#b451ed', transparent: true, opacity: .3, depthWrite: false, blending: THREE.AdditiveBlending })));
    halo.position.y = .77; halo.scale.setScalar(2.4); group.add(halo);
    group.rotation.z = (i % 2 ? -1 : 1) * .15; scene.add(group); foregroundBombs.push({ group, phase: i * 2.3, glow });
  });

  // Slowly drifting stage haze, textured once and reused by a handful of sprites.
  const smokeCanvas = document.createElement('canvas'); smokeCanvas.width = smokeCanvas.height = 256;
  const smokeContext = smokeCanvas.getContext('2d')!;
  for (let i = 0; i < 40; i++) {
    const x = 80 + random() * 96, y = 80 + random() * 96, r = 25 + random() * 60;
    const cloud = smokeContext.createRadialGradient(x, y, 0, x, y, r);
    cloud.addColorStop(0, '#ffffff12'); cloud.addColorStop(1, '#ffffff00'); smokeContext.fillStyle = cloud; smokeContext.fillRect(0, 0, 256, 256);
  }
  const smokeTexture = keep(new THREE.CanvasTexture(smokeCanvas));
  const hazeSprites: THREE.Sprite[] = [];
  for (let i = 0; i < 7; i++) {
    const haze = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: smokeTexture, color: '#b299d0', transparent: true, opacity: .24, depthWrite: false, blending: THREE.AdditiveBlending })));
    haze.position.set((i - 3) * 9, 7 + i % 3 * 3, -29 + i % 2 * 8); haze.scale.set(24, 16, 1); scene.add(haze); hazeSprites.push(haze);
  }

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const bloom = new UnrealBloomPass(new THREE.Vector2(640, 360), .65, .7, .8);
  const output = new OutputPass(); composer.addPass(renderPass); composer.addPass(bloom); composer.addPass(output);
  const direction = new THREE.Vector3(), target = new THREE.Vector3(), up = new THREE.Vector3(0, -1, 0);
  let width = 1, height = 1;
  const shouldReduceQuality = createQualityMonitor();
  let bloomReduced = false;
  const resizeSurface = createSurfaceResizer(renderer, composer);
  let disposed = false;
  const resize = () => {
    if (disposed) return;
    const size = resizeSurface(canvas.clientWidth, canvas.clientHeight, Math.min(window.devicePixelRatio || 1, bloomReduced ? 1 : Infinity));
    if (!size) return;
    ({ width, height } = size);
    const { ratio } = size;
    canvas.dataset.surfaceResizes = String(Number(canvas.dataset.surfaceResizes || 0) + 1);
    const mobile = width < 700;
    bloom.enabled = !mobile && !bloomReduced;
    // Keep all three screens in the portrait frame without pushing the audience away.
    mainWall.mesh.scale.x = nameScreen.scale.x = mobile ? 32 : mainScreen.width;
    mainWall.frame.scale.x = mainWall.mesh.scale.x + .7;
    wingWalls.forEach((wall, i) => {
      wall.mesh.position.x = wall.frame.position.x = (i ? 1 : -1) * (mobile ? 22 : 28.5);
      wall.mesh.scale.x = mobile ? 7 : 9; wall.frame.scale.x = wall.mesh.scale.x + .7;
    });
    atmosphere.resize(mobile);
    crowdUniforms.pixelRatio.value = ratio;
    camera.aspect = width / Math.max(1, height); camera.fov = mobile ? 66 : 48; camera.updateProjectionMatrix();
  };
  resize();
  return {
    resize,
    render({ time, bass, vocal = 0, beatPulse = 0, beatPosition = 0, bpm = 0, audioPlaying = false, pointerX, pointerY, focus }) {
      if (disposed) return;
      canvas.dataset.sceneTime = time.toFixed(3);
      canvas.dataset.performerStyle = 'illustrated-performance';
      const lightPhase = beatPosition * Math.PI / 4;
      atmosphere.animate(time, bass, focus, vocal, beatPosition);
      canvas.dataset.beatPulse = beatPulse.toFixed(3);
      canvas.dataset.beatPosition = beatPosition.toFixed(3);
      canvas.dataset.detectedBpm = bpm.toFixed(1);
      canvas.dataset.audioPlaying = String(audioPlaying);
      updateScreenName(focus);
      // A closer audience camera keeps the front-stage performers prominent.
      const mobile = width < 700;
      camera.position.set(pointerX * 1.2 + Math.sin(time * .1) * .35, 7 + pointerY * .3 + Math.sin(time * .17) * .08, mobile ? 54 : 48);
      camera.lookAt(pointerX * .7, 9, -20);
      crowdUniforms.time.value = time; crowdUniforms.energy.value = 0; crowdUniforms.rhythm.value = lightPhase;
      screenUniforms.time.value = lightPhase; screenUniforms.energy.value = 0;
      const cue = .5 + .5 * Math.sin(lightPhase * .15);
      screenUniforms.tint.value.setRGB(.28 + cue * .46, .16 + (1 - cue) * .27, .95);
      beams.forEach(({ mesh, origin, material, member, floor }, i) => {
        const fan = (i - (beamCount - 1) / 2) / 9;
        target.set(fan * (27 + 14 * Math.sin(lightPhase * .16)) + Math.sin(lightPhase * .25 + i * .28) * 8, 0, -20 + (i % 3) * 17 + Math.cos(lightPhase * .18 + i * .24) * 8);
        if (!floor && (focus >= 0 || i < members.length)) {
          const position = frontStagePosition(focus >= 0 ? focus : i, members.length);
          target.set(position.x + (focus >= 0 ? fan * .6 : Math.sin(lightPhase * .6 + i) * 1.8), position.y, position.z);
        }
        if (floor) target.set(Math.sign(origin.x) * (22 + Math.sin(lightPhase * .3 + i) * 8), 22, -20 + Math.cos(lightPhase * .27 + i) * 7);
        direction.copy(target).sub(origin);
        const beamWidth = floor ? .42 : focus >= 0 ? .24 : i < members.length ? .34 : .68;
        mesh.scale.set(beamWidth, direction.length(), beamWidth); mesh.quaternion.setFromUnitVectors(up, direction.normalize());
        material.uniforms.time.value = lightPhase;
        material.uniforms.strength.value += ((focus >= 0 ? (member === focus ? .17 : .055) : .10 + .012 * Math.sin(lightPhase * .25 + i * .3)) - material.uniforms.strength.value) * .08;
        material.uniforms.tint.value.set(floor ? '#9bdcfb' : focus >= 0 ? members[focus].color : i % 3 ? '#b986ff' : '#a8e6ff');
      });
      foregroundBombs.forEach(({ group, phase, glow }) => {
        group.rotation.z = Math.sin(time * .95 + phase) * .16;
        group.rotation.x = Math.sin(time * .7 + phase) * .08;
        glow.emissiveIntensity = 1.4;
        group.visible = !mobile;
      });
      hazeSprites.forEach((sprite, i) => { sprite.position.x = (i - 3) * 9 + Math.sin(time * .1 + i) * 5; sprite.material.rotation = Math.sin(time * .08 + i) * .15; });
      pools.forEach((pool, i) => { pool.opacity = focus < 0 ? .4 : i === focus ? .9 : .08; });
      let maxGesture = 0;
      performers.forEach(performer => {
        const motion = performer.animate(time, bass, vocal);
        maxGesture = Math.max(maxGesture, ...motion.freeArm.map(Math.abs));
      });
      canvas.dataset.performerGesture = maxGesture.toFixed(4);
      canvas.dataset.performerMotion = 'grounded-arm-rig';
      canvas.dataset.vocalEnergy = vocal.toFixed(3);
      if (shouldReduceQuality(time)) {
        // Resize and draw in this same call, so no empty frame is presented.
        bloomReduced = true; bloom.enabled = false; resize();
      }
      // Retain the same output/tone-mapping path even when bloom is skipped.
      // Switching to a direct draw can abruptly change exposure and GPU state.
      composer.render();
      canvas.dataset.bloom = bloom.enabled ? 'on' : 'off';
    },
    dispose() {
      if (disposed) return;
      disposed = true; resources.forEach(resource => resource.dispose()); bodies.dispose(); heads.dispose();
      bloom.dispose(); output.dispose(); renderPass.dispose(); composer.dispose(); renderer.dispose(); scene.clear();
    },
  };
}
