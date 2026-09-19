// Pure signal models shared by the live graphs, audio engine and numerical checks.
export const TAU = 2 * Math.PI;
export const radians = degrees => degrees * Math.PI / 180;
export const phaseAmplitude = degrees => Math.abs(Math.cos(radians(degrees) / 2));
export const phaseSample = (time, degrees, frequency = 220) => (Math.sin(TAU * frequency * time) + Math.sin(TAU * frequency * time + radians(degrees))) / 2;
export const combMagnitude = (frequency, delayMs) => Math.abs(Math.cos(Math.PI * frequency * delayMs / 1000));
export const firstNotch = delayMs => delayMs > 0 ? 500 / delayMs : null;
export const stereoSample = (mid, side, width) => [(mid + width * side) / 2, (mid - width * side) / 2];
export const monoSample = (left, right) => (left + right) / 2;
export function seededNoise(length, seed = 42) {
  const result = new Float32Array(length); let state = seed >>> 0;
  for (let i=0;i<length;i++) { state=(Math.imul(1664525,state)+1013904223)>>>0; result[i]=(state/4294967296*2-1)*0.7; }
  return result;
}
export function musicLayers(sampleRate, seconds = 8) {
  const mid = new Float32Array(sampleRate * seconds), side = new Float32Array(mid.length);
  const melody = [261.6256,329.6276,391.9954,329.6276,293.6648,349.2282,440,391.9954];
  const shimmer = [1046.502,1567.982,1318.510,1760,1174.659,1396.913,1567.982,1318.510];
  for(let i=0;i<mid.length;i++) {
    const t=i/sampleRate, beat=t%0.5, note=Math.floor(t/0.5)%8;
    const env=(1-Math.exp(-beat*150))*Math.exp(-beat*6)*Math.min(1,(0.5-beat)/0.02);
    mid[i]=env*(0.7*Math.sin(TAU*melody[note]*beat)+0.18*Math.sin(TAU*2*melody[note]*beat));
    const tick=t%0.25, n=Math.floor(t/0.25)%8;
    const se=(1-Math.exp(-tick*220))*Math.exp(-tick*16)*Math.min(1,(0.25-tick)/0.015);
    side[i]=se*(0.6*Math.sin(TAU*shimmer[n]*tick)+0.18*Math.sin(TAU*shimmer[n]*1.5*tick));
  }
  return {mid,side};
}
