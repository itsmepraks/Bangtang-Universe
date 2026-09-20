/** Shared by performers, light pools and follow-spots so they stay aligned. */
export function frontStagePosition(index: number, count = 7) {
  const offset = index - (count - 1) / 2;
  return { x: offset * 2.1, y: 1.2, z: 19.6 - Math.abs(offset) * .32 + (index % 2 ? -.45 : .25) };
}
