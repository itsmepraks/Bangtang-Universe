// All landmarks are local to each illustrated cell, in bottom-to-top UVs.
export const SINGING_MARKS = [
  [.52, .702], [.49, .697], [.48, .568], [.49, .638],
  [.60, .674], [.49, .656], [.51, .637],
] as const;

// Shoulder, elbow, wrist, fingertips. Left/right refer to the image, not anatomy.
// Each pose needs its own rig: the raised arm and crouched pose cannot share pivots.
export const ARM_RIGS = [
  [[.39,.63,.29,.59,.33,.69,.35,.74], [.62,.60,.70,.55,.65,.67,.62,.69]],
  [[.36,.63,.32,.56,.31,.62,.29,.63], [.60,.62,.67,.54,.61,.65,.59,.68]],
  [[.33,.59,.28,.50,.40,.45,.43,.40], [.58,.57,.61,.46,.52,.57,.50,.59]],
  [[.33,.64,.25,.77,.20,.86,.23,.93], [.62,.58,.69,.50,.64,.60,.59,.63]],
  [[.40,.62,.35,.52,.35,.44,.36,.40], [.56,.61,.62,.55,.69,.52,.76,.49]],
  [[.32,.66,.23,.58,.24,.65,.22,.68], [.60,.64,.64,.54,.58,.69,.55,.71]],
  [[.34,.64,.33,.57,.35,.64,.37,.66], [.63,.64,.68,.57,.62,.67,.60,.69]],
] as const;

export function performerMotion(time: number, index: number, bass: number, vocal = 0) {
  const energy = Math.min(1, Math.max(0, bass));
  const voice = Math.min(1, Math.max(0, vocal));
  const phase = time * .72 + index * 1.37;
  // Slow phrase gestures, with softer idle movement. No root translation/scaling.
  const gesture = Math.sin(phase) * (.13 + energy * .065);
  const elbow = Math.sin(phase - .65) * (.16 + energy * .07);
  const wrist = Math.sin(phase - 1.1) * (.055 + energy * .04);
  const mic = Math.sin(time * .68 + index) * (.025 + voice * .025);
  return {
    nod: Math.sin(phase - .45) * (.012 + voice * .012),
    freeArm: [gesture, elbow, wrist] as const,
    micArm: [mic, -mic * .65, mic * .3] as const,
    // Jimin's microphone is lowered in this artwork; don't animate a singing mouth.
    singing: index === 4 ? 0 : voice,
  };
}

// Subtle envelope-based mouth motion, not lyric/phoneme lip-sync.
export const singingUvGLSL = `
  vec2 singingUv(vec2 uv, vec2 mouth, float singing) {
    vec2 delta = uv - mouth;
    float mask = exp(-dot(delta / vec2(.047,.026), delta / vec2(.047,.026)) * 1.7);
    uv.y = mouth.y + delta.y / (1. + singing * .28 * mask);
    return uv;
  }
`;

export const rigUniformsGLSL = `
  uniform vec4 leftUpper, leftLower, rightUpper, rightLower;
  uniform vec3 leftAngles, rightAngles;
  uniform vec2 mouth;
  uniform float nod;
`;

// Linear skinning of three rotations, blended into the untouched torso at the
// shoulder. Aspect-correct coordinates keep limbs from stretching as they rotate.
export const armRigGLSL = `
  vec2 rotateJoint(vec2 p, vec2 pivot, float angle) {
    float c=cos(angle), s=sin(angle);
    return pivot + mat2(c,s,-s,c)*(p-pivot);
  }
  float capsule(vec2 p, vec2 a, vec2 b, float radius) {
    vec2 ab=b-a;
    float t=clamp(dot(p-a,ab)/max(dot(ab,ab),.00001),0.,1.);
    return 1.-smoothstep(radius*.45,radius,length(p-a-t*ab));
  }
  vec2 armOffset(vec2 p, vec4 upper, vec4 lower, vec3 angles) {
    vec2 shape=vec2(3.22,4.4);
    vec2 s=upper.xy*shape,e=upper.zw*shape,w=lower.xy*shape,h=lower.zw*shape;
    float hand=capsule(p,w,h,.23);
    float forearm=capsule(p,e,w,.30)*(1.-hand);
    float arm=capsule(p,s,e,.32)*(1.-max(hand,forearm));
    vec2 a=rotateJoint(p,s,angles.x);
    vec2 b=rotateJoint(rotateJoint(p,e,angles.y),s,angles.x);
    vec2 c=rotateJoint(rotateJoint(rotateJoint(p,w,angles.z),e,angles.y),s,angles.x);
    float total=max(1.,arm+forearm+hand);
    return ((a-p)*arm+(b-p)*forearm+(c-p)*hand)/total;
  }
`;

// Shared by the stage and its live portrait screens. The nod includes the nearby
// microphone hand, keeping it with the face; the lower body remains untouched.
export const performerOffsetGLSL = `
  vec2 performerOffset(vec2 artUv) {
    vec2 art=artUv*vec2(3.22,4.4);
    vec2 arms=armOffset(art,leftUpper,leftLower,leftAngles)+armOffset(art,rightUpper,rightLower,rightAngles);
    vec2 neck=(mouth-vec2(0.,.075))*vec2(3.22,4.4);
    float head=smoothstep(mouth.y-.075,mouth.y+.025,artUv.y);
    return arms+(rotateJoint(art,neck,nod)-art)*head;
  }
`;
