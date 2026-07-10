import '../../styles/LogoBrand.css'

/** Minimal tooth silhouette used inside the logo icon box */
function ToothIcon({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 1C6.8 1 4 3.8 4 7c0 2.5.8 4.7 2 7l1.5 8.5h5L14 14c1.2-2.3 2-4.5 2-7 0-3.2-2.8-6-6-6z" />
    </svg>
  )
}

/**
 * LogoBrand — DentalFlow logo: navy icon box + wordmark.
 * Props:
 *   size — 'sm' (auth cards) | 'md' (landing page)
 */
export function LogoBrand({ size = 'md' }) {
  const isSm = size === 'sm'

  return (
    <div className="logo-brand">
      <div className={`logo-brand__icon logo-brand__icon--${size}`}>
        <ToothIcon size={isSm ? 13 : 17} />
      </div>
      <span className={`logo-brand__wordmark logo-brand__wordmark--${size}`}>
        DentalFlow
      </span>
    </div>
  )
}
