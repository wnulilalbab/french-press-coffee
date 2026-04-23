import { IconChevL } from './icons'

export function TopBar({ left, center, right }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
      padding: '58px 20px 14px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid var(--rule-2)',
      background: 'var(--paper)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 60 }}>{left}</div>
      <div style={{ flex: 1, textAlign: 'center' }}>{center}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 60, justifyContent: 'flex-end' }}>{right}</div>
    </div>
  )
}

export function SheetLabel({ index, total, label }) {
  return (
    <div className="mono" style={{
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
      color: 'var(--ink-3)',
    }}>
      <span>
        {String(index).padStart(2, '0')}
        <span style={{ color: 'var(--ink-4)' }}>/{String(total).padStart(2, '0')}</span>
      </span>
      <span style={{ width: 14, height: 1, background: 'var(--rule-2)', display: 'block', flexShrink: 0 }} />
      <span style={{ color: 'var(--ink-2)' }}>{label}</span>
    </div>
  )
}

export function MonoLink({ onClick, children, color = 'var(--ink-2)', style = {} }) {
  return (
    <button className="hit" onClick={onClick} style={{
      border: 'none', background: 'transparent', padding: 6,
      fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
      letterSpacing: '0.14em', textTransform: 'uppercase', color,
      display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
      ...style,
    }}>
      {children}
    </button>
  )
}
