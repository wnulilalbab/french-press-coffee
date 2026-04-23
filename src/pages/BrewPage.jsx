import { useState, useEffect, useRef } from 'react'
import { STEPS, formatTime, formatRatio } from '../data/steps'
import { useCountdown } from '../hooks/useCountdown'
import { SheetLabel } from '../components/ui'
import {
  IconClose, IconChevL, IconPlay, IconPause, IconReset, IconCheck, IconChev,
} from '../components/icons'

export default function BrewPage({ profile, onExit, onComplete }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [brewElapsed, setBrewElapsed] = useState(0)
  const completedRef = useRef(false)

  useEffect(() => {
    const t = setInterval(() => setBrewElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Increment uses when reaching done step
  useEffect(() => {
    if (stepIdx === STEPS.length - 1 && !completedRef.current) {
      completedRef.current = true
      onComplete()
    }
  }, [stepIdx, onComplete])

  const step = STEPS[stepIdx]

  function advance() {
    if (stepIdx + 1 < STEPS.length) setStepIdx(i => i + 1)
  }
  function back() {
    if (stepIdx === 0) onExit()
    else setStepIdx(i => i - 1)
  }

  return (
    <div style={{ background: 'var(--paper)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top chrome */}
      <div style={{
        padding: '58px 20px 14px',
        borderBottom: '1px solid var(--rule-2)',
        background: 'var(--paper)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button className="hit" onClick={onExit} style={{
            border: 'none', background: 'transparent', padding: 0,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)',
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          }}>
            <IconClose size={12} /> Exit
          </button>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-2)', textTransform: 'uppercase' }}>
            {profile.name}
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>
            T+{formatTime(brewElapsed)}
          </div>
        </div>

        {/* Step chips */}
        <div style={{ display: 'flex', gap: 4 }}>
          {STEPS.map((s, i) => (
            <div key={s.key} style={{
              flex: 1, height: 4,
              background: i === stepIdx ? 'var(--accent)' : i < stepIdx ? 'var(--ink)' : 'var(--rule-2)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
            Step {String(step.index).padStart(2, '0')}/{String(STEPS.length).padStart(2, '0')}
          </span>
          <span className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
            {Math.round((stepIdx / (STEPS.length - 1)) * 100)}% complete
          </span>
        </div>
      </div>

      {/* Content slot — keyed to remount on step change */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {step.kind === 'final' ? (
          <DoneStep
            key="done"
            profile={profile}
            elapsed={brewElapsed}
            onAgain={() => { completedRef.current = false; setStepIdx(0); setBrewElapsed(0) }}
            onHome={onExit}
          />
        ) : (
          <StepBody
            key={step.key}
            step={step}
            profile={profile}
            onNext={advance}
            onBack={back}
          />
        )}
      </div>
    </div>
  )
}

function StepBody({ step, profile, onNext, onBack }) {
  const isTimer = step.kind === 'timer'
  const [running, setRunning] = useState(false)
  const dur = isTimer ? step.duration(profile) : 0
  const { remaining, reset } = useCountdown(dur, {
    running,
    onDone: () => setRunning(false),
  })
  const metric = step.metric(profile)
  const pct = isTimer && dur > 0 ? (1 - remaining / dur) : 0
  const didDone = isTimer && remaining <= 0.05

  return (
    <div className="slide-up" style={{
      flex: 1, display: 'flex', flexDirection: 'column', padding: '22px 20px 20px', minHeight: 0,
    }}>
      <SheetLabel index={step.index} total={7} label={step.label} />

      <div style={{ marginTop: 14, marginBottom: 10, flexShrink: 0 }}>
        <h2 style={{
          margin: 0, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
          fontSize: 40, lineHeight: 1.02, letterSpacing: '-0.02em',
          color: 'var(--ink)', fontWeight: 400,
        }}>
          {step.label}
          {isTimer && (
            <span className="cursor-blink" style={{
              display: 'inline-block', width: 3, height: 28,
              background: 'var(--accent)', verticalAlign: '-0.1em', marginLeft: 4,
            }} />
          )}
        </h2>
        <p style={{ margin: '8px 0 0', color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.5, maxWidth: '32ch' }}>
          {step.sub}
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 0, gap: 8 }}>
        <StepIllustration stepKey={step.key} running={running} pct={pct} />
        {isTimer ? (
          <TimerRing remaining={remaining} total={dur} running={running} done={didDone} />
        ) : (
          <MetricBlock metric={metric} />
        )}

        {/* Secondary metrics strip */}
        <div style={{
          marginTop: 16, width: '100%',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          border: '1px solid var(--rule-2)', background: 'white', flexShrink: 0,
        }}>
          {[
            ['Total', profile.volume_ml, 'ml'],
            ['Dose', profile.coffee_g.toFixed(1), 'g'],
            ['Temp', profile.water_temp_c, '°C'],
          ].map(([k, v, u], i) => (
            <div key={k} style={{ padding: '10px 12px', borderRight: i < 2 ? '1px solid var(--rule-2)' : 'none' }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
              <div className="big-num" style={{ fontSize: 15, color: 'var(--ink)' }}>
                {v}<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--ink-3)', marginLeft: 2 }}>{u}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div style={{ marginTop: 14, display: 'flex', gap: 8, flexShrink: 0 }}>
        <button className="btn btn-ghost hit" onClick={onBack} style={{ flex: '0 0 auto', padding: '0 14px' }}>
          <IconChevL size={12} /> Back
        </button>
        {isTimer ? (
          <>
            {!didDone ? (
              <>
                <button className="btn btn-ghost hit" onClick={() => { reset(); setRunning(false) }} style={{ flex: '0 0 auto', padding: '0 14px' }}>
                  <IconReset size={12} />
                </button>
                <button
                  className={`btn btn-primary hit${running ? ' pulse' : ''}`}
                  onClick={() => setRunning(r => !r)}
                  style={{ flex: 1 }}
                >
                  {running
                    ? <><IconPause size={12} color="var(--paper)" /> Pause</>
                    : <><IconPlay size={12} color="var(--paper)" /> Start · {formatTime(Math.ceil(remaining))}</>
                  }
                </button>
              </>
            ) : (
              <button className="btn btn-primary hit" onClick={onNext} style={{ flex: 1 }}>
                <IconCheck size={12} color="var(--paper)" /> Next step
              </button>
            )}
          </>
        ) : (
          <button className="btn btn-primary hit" onClick={onNext} style={{ flex: 1 }}>
            Done <IconChev size={12} color="var(--paper)" />
          </button>
        )}
      </div>
    </div>
  )
}

function TimerRing({ remaining, total, running, done }) {
  const r = 58
  const c = 2 * Math.PI * r
  const pct = total > 0 ? (1 - remaining / total) : 1
  const offset = c * (1 - pct)
  return (
    <div style={{ position: 'relative', width: 150, height: 150, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="75" cy="75" r={r} fill="none" stroke="var(--rule-2)" strokeWidth="1.5" />
        <circle cx="75" cy="75" r={r} fill="none"
          stroke={done ? 'var(--ok)' : 'var(--accent)'} strokeWidth="2.5"
          strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 75 75)"
          style={{ transition: 'stroke-dashoffset 0.15s linear' }}
        />
        {Array.from({ length: 60 }).map((_, i) => {
          const a = i * 6 * Math.PI / 180
          const r1 = r + 6, r2 = r + (i % 5 === 0 ? 11 : 9)
          return (
            <line key={i}
              x1={75 + Math.cos(a - Math.PI / 2) * r1} y1={75 + Math.sin(a - Math.PI / 2) * r1}
              x2={75 + Math.cos(a - Math.PI / 2) * r2} y2={75 + Math.sin(a - Math.PI / 2) * r2}
              stroke={i % 5 === 0 ? 'var(--ink-3)' : 'var(--rule-2)'}
              strokeWidth={i % 5 === 0 ? 1 : 0.5}
            />
          )
        })}
      </svg>
      <div style={{ textAlign: 'center', lineHeight: 1 }}>
        <div className="big-num" style={{ fontSize: 32, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
          {formatTime(Math.ceil(remaining))}
        </div>
        <div className="mono" style={{ fontSize: 8, letterSpacing: '0.2em', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: 6 }}>
          {done ? 'Complete' : running ? 'Counting' : 'Ready'} · {Math.round(pct * 100)}%
        </div>
      </div>
    </div>
  )
}

function MetricBlock({ metric }) {
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
        {metric.label}
      </div>
      <div className="big-num" style={{ fontSize: 44, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1, marginTop: 6 }}>
        {metric.value}
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, color: 'var(--ink-3)', marginLeft: 4 }}>{metric.unit}</span>
      </div>
    </div>
  )
}

// ── SVG Step Illustrations ──

function StepIllustration({ stepKey, running, pct = 0 }) {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none"
      stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}>
      <line x1="10" y1="150" x2="190" y2="150" stroke="var(--ink-3)" strokeWidth="1" />
      {stepKey === 'preheat' && <PreheatScene />}
      {stepKey === 'dose'    && <DoseScene />}
      {stepKey === 'bloom'   && <PourScene amount="bloom" running={running} pct={pct} />}
      {stepKey === 'main'    && <PourScene amount="main" running={false} pct={1} />}
      {stepKey === 'steep'   && <SteepScene pct={pct} />}
      {stepKey === 'press'   && <PressScene pct={pct} />}
    </svg>
  )
}

function PressBody({ liquid = 0, grounds = 0, bloomed = false, plungerY = 36, lidLifted = false }) {
  const rimY = 58, baseY = 148
  const innerH = baseY - rimY - 3
  const liquidTop = rimY + 3 + innerH * (1 - liquid)
  const groundH = grounds * 22
  return (
    <g>
      {liquid > 0 && (
        <rect x="72" y={liquidTop} width="66" height={baseY - liquidTop - 2}
          fill="var(--accent)" fillOpacity="0.14" stroke="none" />
      )}
      {grounds > 0 && (
        <g>
          <rect x="72" y={baseY - groundH - 2} width="66" height={groundH}
            fill="var(--ink)" fillOpacity={bloomed ? 0.35 : 0.75} stroke="none" />
          {bloomed && liquid > 0 && [0,1,2,3].map(i => (
            <circle key={i} cx={78 + i * 15} cy={baseY - groundH - 4} r="1.2"
              fill="var(--ink)" fillOpacity="0.5" stroke="none" />
          ))}
        </g>
      )}
      <rect x="70" y={rimY} width="70" height={baseY - rimY} />
      <path d="M140 78 Q156 82 156 104 Q156 126 140 130" />
      <line x1="66" y1="148" x2="144" y2="148" />
      <g stroke="var(--ink-3)" strokeWidth="0.6">
        {[0.33, 0.66].map((f, i) => (
          <line key={i} x1="70" y1={rimY + 3 + innerH * (1 - f)} x2="74" y2={rimY + 3 + innerH * (1 - f)} />
        ))}
      </g>
      {!lidLifted && (
        <g>
          <rect x="66" y={rimY - 6} width="78" height="6" />
          <line x1="104" y1={rimY - 6} x2="104" y2={plungerY} />
          <rect x="100" y={plungerY - 8} width="8" height="8" />
          {plungerY > rimY && (
            <rect x="74" y={rimY + (plungerY - rimY) + 2} width="62" height="3"
              fill="var(--ink)" stroke="none" />
          )}
        </g>
      )}
    </g>
  )
}

function PreheatScene() {
  return (
    <g>
      <g stroke="var(--ink-3)" strokeWidth="1.1" fill="none">
        <path d="M90 48 Q96 38 90 28 Q84 18 90 10" />
        <path d="M104 48 Q110 38 104 28 Q98 18 104 10" />
        <path d="M118 48 Q124 38 118 28 Q112 18 118 10" />
      </g>
      <PressBody liquid={0.4} lidLifted />
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L8 5 L0 10 z" fill="var(--ink-3)" />
        </marker>
      </defs>
      <path d="M156 120 Q172 118 172 138" fill="none" stroke="var(--ink-3)" strokeWidth="1" markerEnd="url(#arr)" />
    </g>
  )
}

function DoseScene() {
  return (
    <g>
      <g transform="translate(30 44) rotate(28)">
        <ellipse cx="18" cy="10" rx="18" ry="9" fill="none" />
        <path d="M36 10 L70 6" strokeWidth="1.3" />
      </g>
      <g fill="var(--ink)" stroke="none">
        {[0,1,2,3,4,5,6].map(i => (
          <circle key={i} cx={60 + i * 1.6} cy={60 + i * 8} r="1.1" />
        ))}
      </g>
      <PressBody liquid={0} grounds={0.5} bloomed={false} lidLifted />
    </g>
  )
}

function PourScene({ amount, running, pct = 0 }) {
  const liquidLevel = amount === 'bloom' ? 0.18 : 0.95
  return (
    <g>
      <g transform="translate(6 14)">
        <path d="M16 22 Q16 10 30 10 L52 10 Q66 10 66 22 L66 44 Q66 52 58 52 L24 52 Q16 52 16 44 Z" />
        <line x1="40" y1="10" x2="40" y2="4" />
        <rect x="37" y="0" width="6" height="4" />
        <path d="M66 18 Q78 22 78 34 Q78 46 66 50" />
        <path d="M16 26 Q2 30 4 50 Q6 68 28 70" />
        <line x1="20" y1="34" x2="62" y2="34" stroke="var(--ink-3)" strokeWidth="0.8" />
      </g>
      <g stroke="var(--accent)" strokeWidth="1.6" fill="none" strokeLinecap="round">
        {running ? (
          <line x1="34" y1="86" x2="96" y2={54} strokeDasharray="3 3"
            style={{ animation: 'pourDash 0.4s linear infinite' }} />
        ) : (
          <line x1="34" y1="86" x2="96" y2={54} />
        )}
      </g>
      <PressBody liquid={liquidLevel} grounds={0.4} bloomed={amount === 'main'} lidLifted />
      {running && (
        <g fill="var(--accent)" stroke="none">
          {[0,1,2].map(i => (
            <circle key={i} cx={40 + i * 8} cy={96 + i * 4} r="1.2" opacity={0.4 + i * 0.2} />
          ))}
        </g>
      )}
    </g>
  )
}

function SteepScene({ pct }) {
  return (
    <g>
      <PressBody liquid={0.95} grounds={0.3} bloomed plungerY={36} />
      <g stroke="var(--ink-3)" strokeWidth="0.8" fill="none" opacity="0.55">
        <path d="M82 96 Q96 92 110 96 Q124 100 132 96" strokeDasharray="2 3" />
        <path d="M82 114 Q96 110 110 114 Q124 118 132 114" strokeDasharray="2 3" />
      </g>
      <g transform="translate(160 118)">
        <circle cx="0" cy="0" r="12" stroke="var(--ink-3)" strokeWidth="1" fill="var(--paper)" />
        <line x1="0" y1="0" x2="0" y2="-8" stroke="var(--ink-2)" strokeWidth="1.2" />
        <line x1="0" y1="0"
          x2={Math.cos((pct * 2 * Math.PI) - Math.PI / 2) * 7}
          y2={Math.sin((pct * 2 * Math.PI) - Math.PI / 2) * 7}
          stroke="var(--accent)" strokeWidth="1.2" />
      </g>
    </g>
  )
}

function PressScene({ pct }) {
  const plungerY = 36 + pct * 70
  return (
    <g>
      <g stroke="var(--ink)" fill="var(--paper)" strokeWidth="1.3" transform={`translate(82 ${plungerY - 38})`}>
        <path d="M8 20 Q8 8 22 8 L30 8 Q44 8 44 20 L44 30 L8 30 Z" />
        <line x1="16" y1="10" x2="16" y2="2" />
        <line x1="24" y1="8" x2="24" y2="0" />
        <line x1="32" y1="8" x2="32" y2="0" />
        <line x1="40" y1="10" x2="40" y2="2" />
      </g>
      <g stroke="var(--accent)" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <line x1="156" y1={plungerY - 12} x2="156" y2={plungerY + 20} />
        <polyline points={`152,${plungerY + 14} 156,${plungerY + 20} 160,${plungerY + 14}`} />
      </g>
      <PressBody liquid={1} grounds={0.22} bloomed plungerY={plungerY} />
    </g>
  )
}

// ── Done / final screen ──

function DoneStep({ profile, elapsed, onAgain, onHome }) {
  return (
    <div className="slide-up" style={{
      flex: 1, display: 'flex', flexDirection: 'column', padding: '26px 20px 20px', minHeight: 0,
    }}>
      <SheetLabel index={7} total={7} label="Brewed" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 20, minHeight: 0 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-grid', placeItems: 'center',
            width: 66, height: 66, border: '1.5px solid var(--ink)', marginBottom: 14,
          }}>
            <IconCheck size={32} color="var(--ink)" sw={2} />
          </div>
          <h2 style={{
            margin: 0, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
            fontSize: 44, letterSpacing: '-0.02em', color: 'var(--ink)', fontWeight: 400, lineHeight: 1,
          }}>
            Ready to pour.
          </h2>
          <p style={{ margin: '10px 0 0', color: 'var(--ink-2)', fontSize: 14 }}>
            Decant immediately to stop extraction.
          </p>
        </div>

        {/* Session receipt */}
        <div style={{ width: '100%', background: 'white', border: '1px solid var(--rule-2)' }}>
          <div style={{
            padding: '12px 14px', borderBottom: '1px dashed var(--rule-2)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
              Session Receipt
            </span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div style={{ padding: '12px 14px' }}>
            {[
              ['Profile', profile.name],
              ['Volume',  `${profile.volume_ml} ml`],
              ['Dose',    `${profile.coffee_g.toFixed(1)} g`],
              ['Ratio',   formatRatio(profile.volume_ml, profile.coffee_g)],
              ['Total time', formatTime(elapsed)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</span>
                <span className="big-num" style={{ fontSize: 12, color: 'var(--ink)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexShrink: 0 }}>
        <button className="btn btn-ghost hit" onClick={onAgain} style={{ flex: 1, gap: 8 }}>
          <IconReset size={12} /> Brew again
        </button>
        <button className="btn btn-primary hit" onClick={onHome} style={{ flex: 1, gap: 8 }}>
          Back home <IconChev size={12} color="var(--paper)" />
        </button>
      </div>
    </div>
  )
}
