type BadgeVariant = 'registered' | 'unregistered' | 'pending' | 'resolved' | 'rejected' | 'none'

interface BadgeProps {
  variant: BadgeVariant
  label?: string
}

const CONFIG: Record<BadgeVariant, { label: string; color: string; bg: string }> = {
  registered:   { label: 'Registered',   color: 'var(--color-success)', bg: 'rgba(34,197,94,0.12)' },
  unregistered: { label: 'Unregistered', color: 'var(--color-text-muted)', bg: 'var(--color-surface-3)' },
  pending:      { label: 'Pending',      color: 'var(--color-warning)', bg: 'rgba(234,179,8,0.12)' },
  resolved:     { label: 'Resolved',     color: 'var(--color-info)',    bg: 'rgba(59,130,246,0.12)' },
  rejected:     { label: 'Rejected',     color: 'var(--color-error)',   bg: 'rgba(239,68,68,0.12)' },
  none:         { label: 'No Dispute',   color: 'var(--color-text-muted)', bg: 'var(--color-surface-3)' },
}

export default function Badge({ variant, label }: BadgeProps) {
  const { label: defaultLabel, color, bg } = CONFIG[variant]
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ color, backgroundColor: bg }}
    >
      {label ?? defaultLabel}
    </span>
  )
}
