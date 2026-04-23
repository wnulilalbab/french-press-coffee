export function PressLogo({ size = 28, color = 'currentColor', stroke = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <rect x="10.5" y="1.5" width="3" height="2" fill={color} />
      <rect x="11.25" y="3.5" width="1.5" height="7.5" fill={color} />
      <rect x="6.5" y="10.5" width="11" height="1.8" fill={color} />
      <path d="M5 5 L5 20.5 Q5 22 6.5 22 L17.5 22 Q19 22 19 20.5 L19 5"
        stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="square"/>
      <line x1="5" y1="5" x2="19" y2="5" stroke={color} strokeWidth={stroke}/>
      <line x1="7" y1="16" x2="11" y2="16" stroke={color} strokeWidth={stroke * 0.7}/>
    </svg>
  )
}

export function PressWordmark({ size = 20, color = 'currentColor' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <PressLogo size={size} color={color} />
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: size * 0.62,
        fontWeight: 600,
        letterSpacing: '0.2em',
        color,
        textTransform: 'uppercase',
      }}>PRESS</span>
    </div>
  )
}

const Icon = ({ d, size = 18, color = 'currentColor', sw = 1.5, fill = 'none', children, vb = '0 0 24 24' }) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke={color} strokeWidth={sw}
    strokeLinecap="square" strokeLinejoin="miter" style={{ display: 'block', flexShrink: 0 }}>
    {d ? <path d={d} /> : children}
  </svg>
)

export const IconPlus   = (p) => <Icon {...p}><line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/></Icon>
export const IconChev   = (p) => <Icon {...p}><polyline points="9 6 15 12 9 18" fill="none"/></Icon>
export const IconChevL  = (p) => <Icon {...p}><polyline points="15 6 9 12 15 18" fill="none"/></Icon>
export const IconPlay   = (p) => <Icon {...p}><polygon points="6 4 20 12 6 20" fill="currentColor" stroke="none"/></Icon>
export const IconPause  = (p) => <Icon {...p}><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"/></Icon>
export const IconReset  = (p) => <Icon {...p}><path d="M4 4 L4 10 L10 10" fill="none"/><path d="M4 10 A8 8 0 1 1 6.5 16" fill="none"/></Icon>
export const IconEdit   = (p) => <Icon {...p}><path d="M4 20 L4 16 L16 4 L20 8 L8 20 Z" fill="none"/></Icon>
export const IconTrash  = (p) => <Icon {...p}><line x1="4" y1="7" x2="20" y2="7"/><path d="M6 7 L7 21 L17 21 L18 7" fill="none"/><line x1="10" y1="3" x2="14" y2="3"/></Icon>
export const IconClose  = (p) => <Icon {...p}><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></Icon>
export const IconCheck  = (p) => <Icon {...p}><polyline points="4 12 10 18 20 6" fill="none"/></Icon>
