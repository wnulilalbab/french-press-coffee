import { useState, useEffect } from 'react'
import { TopBar, SheetLabel } from '../components/ui'
import { IconChevL, IconTrash } from '../components/icons'
import { deriveProfile, formatRatio, formatTime } from '../data/steps'

const FIELDS = [
  { k: 'coffee_g',       label: 'Coffee dose',    unit: 'g',   step: 0.1, fmt: v => (+v).toFixed(1) },
  { k: 'bloom_ml',       label: 'Bloom water',    unit: 'ml',  step: 5 },
  { k: 'bloom_wait_sec', label: 'Bloom wait',     unit: 'sec', step: 5 },
  { k: 'main_pour_ml',   label: 'Main pour',      unit: 'ml',  step: 10 },
  { k: 'steep_wait_sec', label: 'Steep wait',     unit: 'sec', step: 10, helper: v => formatTime(v) },
  { k: 'water_temp_c',   label: 'Water temp',     unit: '°C',  step: 1 },
  { k: 'press_sec',      label: 'Press duration', unit: 'sec', step: 5 },
]

export default function ProfilePage({ initial, onCancel, onSave, onDelete }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '')
  const [vol, setVol] = useState(initial?.volume_ml ?? 350)
  const [manual, setManual] = useState(() => initial?._manual ?? {})
  const [values, setValues] = useState(() => {
    const d = deriveProfile(initial?.volume_ml ?? 350)
    const overrides = {}
    if (initial) {
      for (const k of Object.keys(d)) {
        overrides[k] = initial[k] ?? d[k]
      }
    }
    return { ...d, ...overrides }
  })

  useEffect(() => {
    const d = deriveProfile(vol)
    setValues(prev => {
      const next = { ...prev, volume_ml: vol }
      for (const k of Object.keys(d)) {
        if (!manual[k]) next[k] = d[k]
      }
      return next
    })
  }, [vol, manual])

  function setField(k, rawVal) {
    const v = parseFloat(rawVal)
    if (!isNaN(v)) setValues(prev => ({ ...prev, [k]: v }))
  }

  function setManualOn(k) {
    setManual(m => ({ ...m, [k]: true }))
  }

  function toggleManual(k) {
    setManual(m => ({ ...m, [k]: !m[k] }))
  }

  function handleSave() {
    onSave({
      name: name.trim() || 'Untitled',
      subtitle,
      volume_ml: vol,
      ...values,
      _manual: manual,
    })
  }

  const ratio = formatRatio(values.volume_ml, values.coffee_g)

  return (
    <div style={{ background: 'var(--paper)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        left={
          <button className="hit" onClick={onCancel} style={{
            border: 'none', background: 'transparent', padding: 6,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-2)',
            display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
          }}>
            <IconChevL size={14} /> Cancel
          </button>
        }
        center={<SheetLabel index={initial ? 2 : 1} total={7} label={initial ? 'Edit Profile' : 'New Profile'} />}
        right={
          <button className="hit" onClick={handleSave} style={{
            border: 'none', background: 'transparent', padding: 6,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)',
            fontWeight: 600, cursor: 'pointer',
          }}>
            Save
          </button>
        }
      />

      <div className="scroll" style={{ flex: 1, paddingTop: 100 }}>
        {/* Name block */}
        <div style={{ padding: '20px 20px 18px', borderBottom: '1px solid var(--rule-2)' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Profile Name</div>
          <input
            className="raw"
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Morning Light"
            style={{
              fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
              fontSize: 32, color: 'var(--ink)', lineHeight: 1.1,
            }}
          />
          <input
            className="raw mono"
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            placeholder="Bean / roast / notes (optional)"
            style={{
              fontSize: 11, color: 'var(--ink-3)', marginTop: 6,
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}
          />
        </div>

        {/* Target volume — master input */}
        <div style={{ padding: '18px 20px 22px', borderBottom: '1px solid var(--rule-2)', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div className="eyebrow" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>Target Volume</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>
                Drives all auto calculations
              </div>
            </div>
            <div className="mono" style={{
              fontSize: 10, padding: '4px 8px',
              border: '1px solid var(--rule-2)', color: 'var(--ink-2)',
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Ratio {ratio}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <input
              className="raw big-num"
              inputMode="numeric"
              type="number"
              value={vol}
              onChange={e => {
                const v = parseInt(e.target.value || '0', 10)
                if (!isNaN(v)) setVol(v)
              }}
              style={{
                fontSize: 58, fontWeight: 500, color: 'var(--ink)',
                width: '4.5ch', letterSpacing: '-0.02em',
              }}
            />
            <span className="mono" style={{ fontSize: 18, color: 'var(--ink-3)' }}>ml</span>
          </div>
          <input
            type="range" min={150} max={1000} step={10} value={vol}
            onChange={e => setVol(parseInt(e.target.value, 10))}
            style={{ width: '100%', marginTop: 10 }}
          />
          <div className="mono" style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.12em', marginTop: 4,
          }}>
            <span>150</span><span>350</span><span>600</span><span>1000 ml</span>
          </div>
        </div>

        {/* Derived recipe fields */}
        <div style={{ padding: '20px 20px 8px' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Brew Recipe</div>
          <div style={{ border: '1px solid var(--rule-2)', background: 'white' }}>
            {FIELDS.map((f, i) => (
              <EditorRow
                key={f.k}
                label={f.label}
                unit={f.unit}
                value={values[f.k]}
                fmt={f.fmt}
                helper={f.helper?.(values[f.k])}
                isManual={!!manual[f.k]}
                onToggle={() => toggleManual(f.k)}
                onChange={v => { setField(f.k, v); setManualOn(f.k) }}
                step={f.step}
                isLast={i === FIELDS.length - 1}
              />
            ))}
          </div>
          <div className="mono" style={{
            fontSize: 10, color: 'var(--ink-4)', marginTop: 10, lineHeight: 1.6, letterSpacing: '0.02em',
          }}>
            AUTO values recompute from target volume.<br />
            Tap a lock to override any field manually.
          </div>
        </div>

        {initial && onDelete && (
          <div style={{ padding: '20px 20px 40px' }}>
            <button
              onClick={() => onDelete(initial.id)}
              className="btn btn-ghost hit"
              style={{ width: '100%', color: 'var(--warn)', borderColor: 'var(--warn)', gap: 8 }}
            >
              <IconTrash size={13} color="var(--warn)" /> Delete profile
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EditorRow({ label, unit, value, fmt, helper, isManual, onToggle, onChange, step, isLast }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center',
      padding: '12px 14px', gap: 12,
      borderBottom: isLast ? 'none' : '1px solid var(--rule-2)',
    }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{label}</div>
        {helper && (
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>= {helper}</div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <input
          type="number"
          step={step}
          className="raw big-num"
          value={fmt ? fmt(value) : value}
          onChange={e => onChange(e.target.value)}
          style={{
            fontSize: 18, color: 'var(--ink)', textAlign: 'right', width: '5.5ch',
            background: isManual ? 'rgba(200,75,26,0.06)' : 'transparent',
            padding: '2px 4px',
          }}
        />
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', width: 22 }}>{unit}</span>
      </div>
      <button
        onClick={onToggle}
        className="hit"
        title={isManual ? 'Manual override — click to revert to Auto' : 'Auto calculated — click to override manually'}
        style={{
          border: `1px solid ${isManual ? 'var(--accent)' : 'var(--rule-2)'}`,
          background: isManual ? 'var(--accent)' : 'transparent',
          color: isManual ? 'var(--paper)' : 'var(--ink-3)',
          padding: '3px 7px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        {isManual ? 'Man' : 'Auto'}
      </button>
    </div>
  )
}
