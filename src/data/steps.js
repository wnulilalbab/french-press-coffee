// deriveProfile, SAMPLE_PROFILES, STEPS, formatRatio, formatTime

export function deriveProfile(volume_ml) {
  const v = Math.max(50, Math.round(volume_ml || 0))
  return {
    volume_ml: v,
    coffee_g:       +(v / 16.7).toFixed(1),
    bloom_ml:       Math.round(v * 0.143),
    bloom_wait_sec: 30,
    main_pour_ml:   v - Math.round(v * 0.143),
    steep_wait_sec: 240,
    water_temp_c:   94,
    press_sec:      25,
  }
}

export const SAMPLE_PROFILES = [
  {
    id: 'p-morning-light', name: 'Morning Light', subtitle: 'Light roast · Ethiopia',
    created_at: '2026-03-14T06:02:00Z', uses: 42,
    ...deriveProfile(350),
  },
  {
    id: 'p-weekend-dark', name: 'Weekend Dark', subtitle: 'Dark roast · Sumatra',
    created_at: '2026-02-08T09:18:00Z', uses: 17,
    ...deriveProfile(500),
    coffee_g: 32,
    steep_wait_sec: 270,
  },
  {
    id: 'p-afternoon-half', name: 'Afternoon Half', subtitle: 'Medium · House blend',
    created_at: '2026-04-01T14:55:00Z', uses: 8,
    ...deriveProfile(250),
  },
]

export function formatRatio(volume_ml, coffee_g) {
  if (!coffee_g) return '—'
  return `1:${(volume_ml / coffee_g).toFixed(1)}`
}

export function formatTime(sec) {
  if (sec < 0) sec = 0
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export const STEPS = [
  {
    key: 'preheat', index: 1, label: 'Preheat',
    sub: 'Rinse carafe & mesh with boiling water, discard',
    kind: 'manual',
    metric: p => ({ label: 'Temp target', value: `${p.water_temp_c}°`, unit: 'C' }),
  },
  {
    key: 'dose', index: 2, label: 'Add Coffee',
    sub: 'Medium-coarse grind — sea salt texture',
    kind: 'manual',
    metric: p => ({ label: 'Dose', value: p.coffee_g.toFixed(1), unit: 'g' }),
  },
  {
    key: 'bloom', index: 3, label: 'Bloom Pour',
    sub: 'Saturate grounds, gentle swirl, then wait',
    kind: 'timer',
    duration: p => p.bloom_wait_sec,
    metric: p => ({ label: 'Bloom', value: p.bloom_ml, unit: 'ml' }),
  },
  {
    key: 'main', index: 4, label: 'Main Pour',
    sub: 'Pour remaining water in a steady circle, then stir',
    kind: 'manual',
    metric: p => ({ label: 'Main pour', value: p.main_pour_ml, unit: 'ml' }),
  },
  {
    key: 'steep', index: 5, label: 'Steep',
    sub: 'Place lid, plunger up. Let the coffee rest.',
    kind: 'timer',
    duration: p => p.steep_wait_sec,
    metric: p => ({ label: 'Steep time', value: formatTime(p.steep_wait_sec), unit: 'mm:ss' }),
  },
  {
    key: 'press', index: 6, label: 'Press & Pour',
    sub: 'Push plunger slowly, even pressure, to the base',
    kind: 'timer',
    duration: p => p.press_sec,
    metric: p => ({ label: 'Press', value: `${p.press_sec}`, unit: 'sec' }),
  },
  {
    key: 'done', index: 7, label: 'Brewed',
    sub: 'Decant immediately into cup to stop extraction',
    kind: 'final',
    metric: p => ({ label: 'Yield', value: p.volume_ml, unit: 'ml' }),
  },
]
