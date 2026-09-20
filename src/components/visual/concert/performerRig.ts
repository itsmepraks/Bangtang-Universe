import * as THREE from 'three';
import { ARM_RIGS, SINGING_MARKS, performerMotion } from './performerMotion';

export function createRigUniforms(index: number) {
  const [left, right] = ARM_RIGS[index];
  return {
    memberIndex: { value: index },
    mouth: { value: new THREE.Vector2(...SINGING_MARKS[index]) }, singing: { value: 0 }, nod: { value: 0 },
    leftUpper: { value: new THREE.Vector4().fromArray(left.slice(0, 4)) },
    leftLower: { value: new THREE.Vector4().fromArray(left.slice(4)) },
    rightUpper: { value: new THREE.Vector4().fromArray(right.slice(0, 4)) },
    rightLower: { value: new THREE.Vector4().fromArray(right.slice(4)) },
    leftAngles: { value: new THREE.Vector3() }, rightAngles: { value: new THREE.Vector3() },
  };
}
export function updateRig(uniforms: ReturnType<typeof createRigUniforms>, time: number, index: number, bass: number, vocal: number) {
  if (uniforms.memberIndex.value !== index) {
    const [left, right] = ARM_RIGS[index];
    uniforms.leftUpper.value.fromArray(left.slice(0, 4)); uniforms.leftLower.value.fromArray(left.slice(4));
    uniforms.rightUpper.value.fromArray(right.slice(0, 4)); uniforms.rightLower.value.fromArray(right.slice(4));
    uniforms.mouth.value.fromArray(SINGING_MARKS[index]); uniforms.memberIndex.value = index;
  }
  const pose = performerMotion(time, index, bass, vocal);
  uniforms.leftAngles.value.set(...(index === 4 ? pose.micArm : pose.freeArm));
  uniforms.rightAngles.value.set(...(index === 4 ? pose.freeArm : pose.micArm));
  uniforms.singing.value = pose.singing; uniforms.nod.value = pose.nod;
  return pose;
}
