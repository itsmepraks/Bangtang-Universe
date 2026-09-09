import * as THREE from 'three';
import type { StageMember } from './createConcertScene';
import { loadPerformerArtwork, performerCell } from './performerArtwork';
import { armRigGLSL, singingUvGLSL, rigUniformsGLSL, performerOffsetGLSL } from './performerMotion';

import { createRigUniforms, updateRig } from './performerRig';

type Keep = <T extends { dispose(): void }>(resource: T) => T;

// Illustrated performance characters in the 3D scene. A segmented surface gives
// the artwork restrained shoulder, elbow and wrist gestures with planted feet.
export function createCartoonPerformerFactory(keep: Keep, onReady: () => void) {
  const geometry = keep(new THREE.PlaneGeometry(3.22, 4.4, 48, 64));
  geometry.translate(0, 2.09, 0);
  const texture = keep(new THREE.Texture()); texture.colorSpace = THREE.SRGBColorSpace;
  let disposed = false;
  keep({ dispose() { disposed = true; } });
  const pending: THREE.Mesh[] = [];
  void loadPerformerArtwork().then(canvas => {
    if (disposed) return;
    texture.image = canvas; texture.needsUpdate = true;
    pending.forEach(mesh => { mesh.visible = true; });
    onReady();
  }).catch(() => { /* The arena and entry controls remain available if artwork fails. */ });

  return (_member: StageMember, index: number) => {
    const cell = performerCell(index);
    const rig = createRigUniforms(index);
    const material = keep(new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture }, cell: { value: new THREE.Vector2(cell.x, 1 - cell.y - cell.height) },
        ...rig,
      },
      transparent: true, depthWrite: true,
      vertexShader: `
        varying vec2 vUv;
        ${rigUniformsGLSL}
        ${armRigGLSL}
        ${performerOffsetGLSL}
        void main() {
          vUv = uv; vec3 p = position;
          p.xy += performerOffset(uv);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
        }`,
      fragmentShader: `
        uniform sampler2D map; uniform vec2 cell; uniform float singing; uniform vec2 mouth;
        ${singingUvGLSL}
        varying vec2 vUv;
        void main() {
          vec4 c = texture2D(map, cell + singingUv(vUv, mouth, singing) * vec2(.25, .5));
          if(c.a < .12) discard;
          c.rgb *= vec3(.94, .94, 1.04);
          gl_FragColor = c;
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    const root = new THREE.Group(); root.name = `Performance ${_member.fullName || _member.name}`;
    const mesh = new THREE.Mesh(geometry, material); mesh.visible = !!texture.image;
    pending.push(mesh); root.add(mesh);
    return { root, animate(time: number, bass: number, vocal = 0) {
      const motion = updateRig(rig, time, index, bass, vocal);
      return motion;
    } };
  };
}
