export function Isotipo({ size = 32, variant = 'color' }) {
  const outer    = variant === 'white' ? '#F6F8F6' : '#1F4D3A'
  const inner    = variant === 'white' ? '#F6F8F6' : '#3FB7A6'
  const nucleus  = variant === 'white' ? '#F6F8F6' : '#D9544D'
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" role="img" aria-label="CuidAR 360">
      <circle cx="60" cy="60" r="48" stroke={outer} strokeWidth="10"
              strokeDasharray="251 51" transform="rotate(-62 60 60)" strokeLinecap="round"/>
      <circle cx="60" cy="60" r="26" stroke={inner} strokeWidth="10"
              strokeDasharray="123 41" transform="rotate(118 60 60)" strokeLinecap="round"/>
      <circle cx="60" cy="60" r="6" fill={nucleus}/>
    </svg>
  )
}
