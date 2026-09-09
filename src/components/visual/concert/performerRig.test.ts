import { expect, it } from 'vitest';
import { createRigUniforms, updateRig } from './performerRig';
import { SINGING_MARKS } from './performerMotion';

it('keeps stage and screen gestures identical, including when the screen switches members', () => {
  const stage = createRigUniforms(3), screen = createRigUniforms(0);
  updateRig(stage, 2, 3, .6, .5); updateRig(screen, 2, 3, .6, .5);
  expect(screen.leftAngles.value.toArray()).toEqual(stage.leftAngles.value.toArray());
  expect(screen.leftUpper.value.toArray()).toEqual(stage.leftUpper.value.toArray());
  expect(screen.mouth.value.toArray()).toEqual([...SINGING_MARKS[3]]);
  const earlier = screen.leftAngles.value.toArray();
  updateRig(screen, 5, 3, .6, .5);
  expect(screen.leftAngles.value.toArray()).not.toEqual(earlier);
  const held = screen.leftAngles.value.toArray();
  updateRig(screen, 5, 3, .6, .5);
  expect(screen.leftAngles.value.toArray()).toEqual(held);
});
