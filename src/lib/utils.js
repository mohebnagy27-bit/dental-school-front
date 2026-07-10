/**
 * cx — Lightweight conditional className helper.
 * Joins truthy values and filters out falsy ones.
 * Drop-in replacement for clsx without the extra dependency.
 *
 * Usage:  cx('base', isActive && 'active', hasError && 'error')
 */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}
