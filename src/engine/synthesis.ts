// Síntesis de percusiones usando Web Audio API pura (sin samples)

type SynthType = 'beat' | 'click' | 'conga' | 'bongo' | 'rimshot' | 'scrape' | 'bell';

export function triggerPercussion(
  ctx: AudioContext,
  type: SynthType,
  time: number,
  volume = 1.0,
  step = 0
): void {
  switch (type) {
    case 'beat':
      // step 0 → t1 del ciclo (acento fuerte); resto = suave
      triggerBeat(ctx, time, volume, step === 0);
      break;
    case 'click':
      triggerClave(ctx, time, volume);
      break;
    case 'conga':
      triggerConga(ctx, time, volume);
      break;
    case 'bongo':
      triggerBongo(ctx, time, volume);
      break;
    case 'rimshot':
      triggerTimbal(ctx, time, volume);
      break;
    case 'scrape':
      triggerGuiro(ctx, time, volume);
      break;
    case 'bell':
      triggerCampana(ctx, time, volume);
      break;
  }
}

function triggerBeat(ctx: AudioContext, time: number, vol: number, accent: boolean) {
  // Acento (t1): click agudo, más fuerte
  // Normal (t2, t3, t4): click más suave y corto
  const freq = accent ? 1800 : 1000;
  const amp = accent ? vol * 0.9 : vol * 0.45;
  const decay = accent ? 0.06 : 0.04;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(freq, time);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + decay);
  gain.gain.setValueAtTime(amp, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
  osc.start(time);
  osc.stop(time + decay + 0.01);
}

function triggerClave(ctx: AudioContext, time: number, vol: number) {
  // Transiente de ataque: noise burst muy corto ("toc" de madera)
  triggerNoiseBurst(ctx, time, 0.006, vol * 0.35);

  // Resonancia principal: tono agudo y seco, sin barrido de pitch
  const osc1 = ctx.createOscillator();
  const g1 = ctx.createGain();
  osc1.connect(g1);
  g1.connect(ctx.destination);
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(2200, time);
  g1.gain.setValueAtTime(vol * 0.85, time);
  g1.gain.exponentialRampToValueAtTime(0.001, time + 0.055);
  osc1.start(time);
  osc1.stop(time + 0.06);

  // Armónico superior — carácter de madera
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.connect(g2);
  g2.connect(ctx.destination);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(3700, time);
  g2.gain.setValueAtTime(vol * 0.25, time);
  g2.gain.exponentialRampToValueAtTime(0.001, time + 0.025);
  osc2.start(time);
  osc2.stop(time + 0.03);
}

function triggerConga(ctx: AudioContext, time: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, time);
  osc.frequency.exponentialRampToValueAtTime(60, time + 0.15);
  gain.gain.setValueAtTime(vol * 0.9, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
  osc.start(time);
  osc.stop(time + 0.26);

  triggerNoiseBurst(ctx, time, 0.05, vol * 0.3);
}

function triggerBongo(ctx: AudioContext, time: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, time);
  osc.frequency.exponentialRampToValueAtTime(200, time + 0.08);
  gain.gain.setValueAtTime(vol * 0.7, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
  osc.start(time);
  osc.stop(time + 0.13);
}

function triggerTimbal(ctx: AudioContext, time: number, vol: number) {
  triggerNoiseBurst(ctx, time, 0.03, vol * 0.6);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(600, time);
  osc.frequency.exponentialRampToValueAtTime(300, time + 0.03);
  gain.gain.setValueAtTime(vol * 0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  osc.start(time);
  osc.stop(time + 0.05);
}

function triggerGuiro(ctx: AudioContext, time: number, vol: number) {
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2000, time);
  filter.frequency.linearRampToValueAtTime(800, time + 0.1);
  filter.Q.value = 3;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.5, time);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(time);
}

function triggerCampana(ctx: AudioContext, time: number, vol: number) {
  const freqs = [800, 1200, 1800, 2400];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const amp = vol * 0.5 * (1 / (i + 1));
    gain.gain.setValueAtTime(amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4 + i * 0.1);
    osc.start(time);
    osc.stop(time + 0.5 + i * 0.1);
  });
}

function triggerNoiseBurst(
  ctx: AudioContext,
  time: number,
  duration: number,
  vol: number
) {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(time);
}
