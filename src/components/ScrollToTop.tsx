import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * React Router does not restore scroll on navigation, so entering an article
 * kept whatever offset the previous page had (usually the footer). Reset to
 * the top on every path change, but leave in-page #anchor links alone.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}
