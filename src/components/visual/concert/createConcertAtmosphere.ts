import * as THREE from 'three';
import { loadPerformerArtwork, performerCell } from './performerArtwork';
import { singingUvGLSL, armRigGLSL, rigUniformsGLSL, performerOffsetGLSL } from './performerMotion';

import { createRigUniforms, updateRig } from './performerRig';

type Keep = <T extends { dispose(): void }>(resource: T) => T;

export function createConcertAtmosphere(scene: THREE.Scene, keep: Keep, mobile: boolean, onReady: () => void) {
  let disposed = false;
  keep({ dispose() { disposed = true; } });
  const map = keep(new THREE.Texture()); map.colorSpace = THREE.SRGBColorSpace;
  const portraits: { mesh: THREE.Mesh; material: THREE.ShaderMaterial; rig: ReturnType<typeof createRigUniforms>; index: number }[] = [];
  const portraitGeo = keep(new THREE.PlaneGeometry(8.8, 14.8, 48, 64));
  for (const side of [-1, 1]) {
    const rig = createRigUniforms(0);
    const material = keep(new THREE.ShaderMaterial({
      uniforms: { map: { value: map }, cell: { value: new THREE.Vector2() }, ...rig },
      transparent: true, depthWrite: false,
      vertexShader: `
        varying vec2 vUv;
        ${rigUniformsGLSL}
        ${armRigGLSL}
        ${performerOffsetGLSL}
        void main(){
          vUv=uv;
          vec2 artUv=vec2(.125,.32)+uv*vec2(.75,.68);
          vec3 p=position;
          p.xy+=performerOffset(artUv)*vec2(8.8/(3.22*.75),14.8/(4.4*.68));
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
        }`,
      fragmentShader: `
        uniform sampler2D map; uniform vec2 cell; uniform float singing; uniform vec2 mouth; varying vec2 vUv;
        ${singingUvGLSL}
        void main(){
          vec2 crop = vec2(.125, .32) + vUv * vec2(.75,.68);
          vec4 c = texture2D(map, cell + singingUv(crop, mouth, singing) * vec2(.25,.5));
          if(c.a < .12) discard;
          c.rgb *= vec3(.83,.7,1.) * 1.05;
          c.rgb *= .9 + .1*sin(vUv.y*600.);
          gl_FragColor=c;
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    const mesh = new THREE.Mesh(portraitGeo, material); mesh.position.set(side * 28.5, 13.65, -34.65); mesh.visible = false; scene.add(mesh);
    portraits.push({ mesh, material, rig, index: -1 });
  }
  void loadPerformerArtwork().then(canvas => {
    if (disposed) return;
    map.image = canvas; map.needsUpdate = true;
    portraits.forEach(({mesh}) => { mesh.visible = true; }); onReady();
  }).catch(() => {});

  // One GPU particle draw for drifting silver / violet confetti above the pit.
  const count = mobile ? 220 : 580;
  const positions = new Float32Array(count * 3), phases = new Float32Array(count), colors = new Float32Array(count * 3);
  let seed = 418;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < count; i++) {
    positions.set([(random() - .5) * 65, random() * 23, -25 + random() * 47], i * 3);
    phases[i] = random() * Math.PI * 2;
    const color = new THREE.Color(i % 4 === 0 ? '#ddc190' : i % 3 === 0 ? '#d18bff' : '#d9defa');
    colors.set([color.r, color.g, color.b], i * 3);
  }
  const confettiGeo = keep(new THREE.BufferGeometry());
  confettiGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3)); confettiGeo.setAttribute('phase', new THREE.BufferAttribute(phases, 1)); confettiGeo.setAttribute('tint', new THREE.BufferAttribute(colors, 3));
  const confettiMaterial = keep(new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, energy: { value: 0 } }, transparent: true, depthWrite: false,
    vertexShader: `
      uniform float time; uniform float energy; attribute float phase; attribute vec3 tint;
      varying vec3 vTint; varying float vSpin; varying float vAlpha;
      void main(){
        vec3 p=position; p.y=mod(position.y-time*(.36+.1*sin(phase))+230.,23.);
        p.x+=sin(time*.55+phase+p.y*.25)*1.4;
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp(120./-mv.z,1.,4.5);vTint=tint;
        vSpin=time*(.6+phase*.1)+phase;vAlpha=smoothstep(0.,3.,p.y)*(.3+.25*sin(phase+time*.22)*sin(phase+time*.22)+energy*.2);
      }`,
    fragmentShader: `
      varying vec3 vTint; varying float vSpin; varying float vAlpha;
      void main(){vec2 p=gl_PointCoord-.5;p=mat2(cos(vSpin),-sin(vSpin),sin(vSpin),cos(vSpin))*p;
      if(abs(p.x)>.19||abs(p.y)>.43)discard;gl_FragColor=vec4(vTint,vAlpha);}
    `,
  }));
  const confetti = new THREE.Points(confettiGeo, confettiMaterial); confetti.frustumCulled = false; scene.add(confetti);

  // Individual bulbs break up the perfectly straight, flat-looking stage edge.
  const bulbGeo = keep(new THREE.SphereGeometry(.055, 6, 4));
  const bulbs: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 37; i++) {
    const material = keep(new THREE.MeshBasicMaterial({ color: '#bba1ff' })); bulbs.push(material);
    const mesh = new THREE.Mesh(bulbGeo, material); mesh.position.set((i - 18) * .46, 1.27, 23.04); scene.add(mesh);
  }
  return { resize(narrow: boolean) {
    portraits.forEach(({mesh}, i) => { mesh.position.x = (i ? 1 : -1) * (narrow ? 22 : 28.5); mesh.scale.x = narrow ? 7 / 9 : 1; });
  }, animate(time: number, energy: number, focus: number, vocal = 0, beatPosition = 0) {
    confettiMaterial.uniforms.time.value = time; confettiMaterial.uniforms.energy.value = 0;
    portraits.forEach((portrait, side) => {
      const index = focus >= 0 ? focus : (Math.floor(time / 11) + side * 3) % 7;
      if (portrait.index !== index) {
        const cell = performerCell(index); portrait.material.uniforms.cell.value.set(cell.x, 1 - cell.y - cell.height); portrait.index = index;
      }
      updateRig(portrait.rig, time, index, energy, vocal);
    });
    bulbs.forEach((material, i) => { material.color.setRGB(.46,.22,.88).multiplyScalar(1.5 + Math.pow(.5 + .5 * Math.sin(i * .35 - beatPosition * .7), 5) * .35); });
  } };
}
