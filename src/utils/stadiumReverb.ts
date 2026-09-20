/** A quiet stereo room tail for previews; generated locally, with no audio asset. */
export function stadiumImpulse(sampleRate: number): [Float32Array, Float32Array] {
  const length = Math.ceil(sampleRate * 2.2);
  return [0, 1].map(channel => {
    const data = new Float32Array(length);
    let seed = 79 + channel * 120;
    const delay = Math.round(sampleRate * (.045 + channel * .008));
    for (let i = delay; i < length; i++) {
      seed = seed * 16807 % 2147483647;
      const decay = Math.pow(1 - (i - delay) / (length - delay), 3.5);
      const onset = Math.min(1, (i - delay) / (sampleRate * .035));
      data[i] = ((seed - 1) / 2147483646 * 2 - 1) * decay * onset * .35;
    }
    return data;
  }) as [Float32Array, Float32Array];
}

export function connectStadiumAcoustics(ctx: AudioContext, input: AudioNode, output: AudioNode) {
  const dry = ctx.createGain(); dry.gain.value = .92;
  input.connect(dry).connect(output);
  const impulse = stadiumImpulse(ctx.sampleRate);
  const buffer = ctx.createBuffer(2, impulse[0].length, ctx.sampleRate);
  impulse.forEach((channel, index) => buffer.getChannelData(index).set(channel));
  const room = ctx.createConvolver(); room.buffer = buffer;
  const lowpass = ctx.createBiquadFilter(); lowpass.type = 'lowpass'; lowpass.frequency.value = 4200;
  const highpass = ctx.createBiquadFilter(); highpass.type = 'highpass'; highpass.frequency.value = 180;
  const wet = ctx.createGain(); wet.gain.value = .12;
  input.connect(highpass).connect(lowpass).connect(room).connect(wet).connect(output);
}
