import { PressLogo, PressWordmark, IconPlus, IconEdit, IconTrash, IconChev } from '../components/icons'
import { formatRatio, formatTime } from '../data/steps'

export default function HomePage({ profiles, onNew, onEdit, onDelete, onBrew }) {
  return (
    <div style={{ background: 'var(--paper)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '58px 20px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--rule-2)',
        background: 'var(--paper)',
        flexShrink: 0,
      }}>
        <PressWordmark size={18} color="var(--ink)" />
        <button
          className="hit"
          onClick={onNew}
          aria-label="New profile"
          style={{
            border: '1px solid var(--ink)', background: 'transparent',
            width: 32, height: 32, display: 'grid', placeItems: 'center', padding: 0,
          }}
        >
          <IconPlus size={16} color="var(--ink)" />
        </button>
      </div>

      {/* Hero block */}
      <div style={{ padding: '22px 20px 10px', flexShrink: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          <span>Profiles</span>
          {' · '}
          <span style={{ color: 'var(--ink-4)' }}>{String(profiles.length).padStart(2, '0')} saved</span>
        </div>
        <h1 style={{
          margin: 0,
          fontFamily: 'Instrument Serif, serif',
          fontSize: 38, fontStyle: 'italic',
          letterSpacing: '-0.02em', lineHeight: 1.02,
          color: 'var(--ink)', fontWeight: 400,
        }}>
          Good morning.<br />
          <span style={{ color: 'var(--ink-3)' }}>Ready to brew?</span>
        </h1>
      </div>

      {/* Divider eyebrow */}
      <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="eyebrow" style={{ whiteSpace: 'nowrap' }}>— Your profiles</span>
          <div style={{ flex: 1, height: 1, background: 'var(--rule-2)' }} />
        </div>
      </div>

      {/* Cards list */}
      <div className="scroll" style={{ flex: 1, padding: '12px 16px 28px' }}>
        {profiles.length === 0 ? (
          <EmptyState onNew={onNew} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profiles.map(p => (
              <ProfileCard
                key={p.id}
                profile={p}
                onEdit={() => onEdit(p.id)}
                onDelete={() => onDelete(p.id)}
                onBrew={() => onBrew(p.id)}
              />
            ))}
            <LogRow profiles={profiles} />
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileCard({ profile, onEdit, onDelete, onBrew }) {
  const ratio = formatRatio(profile.volume_ml, profile.coffee_g)

  function stopThen(fn) {
    return (e) => { e.stopPropagation(); fn() }
  }

  return (
    <div style={{ background: 'white', border: '1px solid var(--rule-2)' }}>
      {/* Top strip: name + volume */}
      <div
        className="hit"
        onClick={onBrew}
        style={{
          padding: '14px 16px 12px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14,
          borderBottom: '1px solid var(--rule-2)', cursor: 'pointer',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div className="mono" style={{
            fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'var(--ink-3)', marginBottom: 5,
          }}>
            {profile.subtitle || 'Profile'}
          </div>
          <div style={{
            fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
            fontSize: 26, lineHeight: 1.05, letterSpacing: '-0.01em', color: 'var(--ink)',
          }}>
            {profile.name}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="big-num" style={{ fontSize: 28, lineHeight: 1, color: 'var(--ink)' }}>
            {profile.volume_ml}
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--ink-3)', marginLeft: 3 }}>ml</span>
          </div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)', marginTop: 4, textTransform: 'uppercase' }}>
            {ratio}
          </div>
        </div>
      </div>

      {/* Spec grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--rule-2)' }}>
        {[
          ['Dose', profile.coffee_g.toFixed(1), 'g'],
          ['Bloom', profile.bloom_ml, 'ml'],
          ['Steep', formatTime(profile.steep_wait_sec), ''],
          ['Temp', profile.water_temp_c, '°'],
        ].map(([k, v, u], i) => (
          <div key={k} style={{
            padding: '10px 12px',
            borderRight: i < 3 ? '1px solid var(--rule-2)' : 'none',
          }}>
            <div className="mono" style={{
              fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-3)',
              textTransform: 'uppercase', marginBottom: 2,
            }}>{k}</div>
            <div className="big-num" style={{ fontSize: 14, color: 'var(--ink)' }}>
              {v}<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--ink-3)', marginLeft: 2 }}>{u}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px 8px 16px',
      }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-4)', textTransform: 'uppercase' }}>
          Used {profile.uses ?? 0}×
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="hit"
            onClick={stopThen(onEdit)}
            aria-label="Edit"
            style={{
              background: 'transparent', border: 'none', padding: '6px 8px',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-2)',
              cursor: 'pointer',
            }}
          >
            <IconEdit size={13} /> Edit
          </button>
          <button
            className="hit"
            onClick={stopThen(onDelete)}
            aria-label="Delete"
            style={{
              background: 'transparent', border: 'none', padding: '6px 8px',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)',
              cursor: 'pointer',
            }}
          >
            <IconTrash size={13} />
          </button>
          <button
            className="hit btn btn-primary"
            onClick={stopThen(onBrew)}
            style={{ height: 32, padding: '0 14px', fontSize: 10 }}
          >
            Brew <IconChev size={11} color="var(--paper)" />
          </button>
        </div>
      </div>
    </div>
  )
}

function LogRow({ profiles }) {
  const total = profiles.reduce((a, p) => a + (p.uses || 0), 0)
  return (
    <div style={{
      marginTop: 14, padding: '14px 16px',
      border: '1px dashed var(--rule-2)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <div className="eyebrow">Session Log</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 3 }}>
          {total} brews logged · local only
        </div>
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        v{__APP_VERSION__}
      </div>
    </div>
  )
}

function EmptyState({ onNew }) {
  return (
    <div style={{
      border: '1px dashed var(--rule-2)', padding: '40px 24px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 64, height: 64, border: '1px solid var(--ink)',
        display: 'grid', placeItems: 'center',
      }}>
        <PressLogo size={36} color="var(--ink)" />
      </div>
      <div>
        <div style={{
          fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
          fontSize: 24, color: 'var(--ink)',
        }}>
          No profiles yet.
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.6 }}>
          A profile saves your target volume and brew settings<br />
          so you can repeat it every morning.
        </div>
      </div>
      <button onClick={onNew} className="btn btn-primary hit" style={{ marginTop: 8, gap: 8 }}>
        <IconPlus size={12} color="var(--paper)" /> Create first profile
      </button>
    </div>
  )
}
