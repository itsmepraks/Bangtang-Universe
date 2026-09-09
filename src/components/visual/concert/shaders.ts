export const crowdVertex = `
  attribute float phase;
  attribute float size;
  attribute vec3 tint;
  uniform float time;
  uniform float energy;
  uniform float pixelRatio;
  uniform float rhythm;
  varying vec3 vColor;
  varying float vDepth;
  void main() {
    vec3 p = position;
    float wave = sin(time * 1.6 + phase + position.x * .045);
    p.x += sin(time * .95 + phase) * .16;
    p.y += wave * .14 + energy * .12;
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(size * pixelRatio * 650. / -mv.z, 1.4, 48. * pixelRatio);
    float sweep = .5 + .5 * sin(position.x * .05 + position.z * .045 - rhythm * .38);
    vColor = mix(tint, vec3(.62, .3, 1.), sweep * .6) * (.9 + energy * .5);
    vDepth = -mv.z;
  }
`;
export const crowdFragment = `
  varying vec3 vColor;
  varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - .5) * 2.;
    if (d > 1.) discard;
    float halo = exp(-d * d * 5.) * .36;
    float globe = 1. - smoothstep(.14, .31, d);
    vec3 color = vColor * (halo + globe * 1.5) + vec3(.45, .12, .8) * globe * .3;
    float fog = exp(-vDepth * .0025);
    gl_FragColor = vec4(color * fog, clamp(halo + globe, 0., 1.));
  }
`;
export const beamVertex = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
export const beamFragment = `
  uniform vec3 tint;
  uniform float strength;
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float edge = pow(abs(dot(normalize(vNormal), normalize(vView))), 1.3);
    float fade = pow(vUv.y, .65) * smoothstep(1., .91, vUv.y);
    float haze = .9 + .1 * sin(vUv.y * 45. - time * .65);
    gl_FragColor = vec4(tint, edge * fade * strength * haze);
  }
`;
export const screenFragment = `
  uniform float time;
  uniform float energy;
  uniform vec3 tint;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - .5;
    float radius = length(p * vec2(1.5,1.));
    float angle = atan(p.y, p.x);
    float arc = pow(.5+.5*sin(radius*24.-time*.8),12.);
    float rays = pow(.5+.5*sin(angle*7.+time*.14),18.);
    float cloud = .5+.5*sin(p.x*9.+sin(p.y*7.+time*.24)*1.7+time*.3);
    vec3 deep = vec3(.013,.004,.055);
    vec3 col = deep + tint * (pow(cloud,4.)*.24 + arc*.18 + rays*.14);
    col += vec3(.2,.08,.42)*exp(-radius*3.);
    float star = pow(max(0., sin(vUv.x*347.+sin(vUv.y*187.))*sin(vUv.y*293.)),36.);
    col += vec3(.68,.65,1.) * star * (.3+.7*pow(.5+.5*sin(time*.7+vUv.x*48.),2.));
    col *= 1. + energy*.45;
    float scan = .85 + .15 * sin(vUv.y * 950.);
    gl_FragColor = vec4(col * scan, 1.);
  }
`;
export const screenVertex = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
