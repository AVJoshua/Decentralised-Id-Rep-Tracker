interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 16, md: 24, lg: 40 }

export default function Spinner({ size = 'md' }: SpinnerProps) {
  const px = sizes[size]
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-label="Loading"
      style={{ color: 'var(--color-btc)' }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
