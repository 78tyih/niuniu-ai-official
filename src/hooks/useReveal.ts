import { useEffect } from 'react'

/**
 * Adds .is-visible to every .reveal element as it enters the viewport.
 * Call once at the page root.
 *
 * Uses a MutationObserver so that .reveal nodes mounted AFTER the initial
 * render (e.g. search results appearing after a query change) are observed
 * too — otherwise they stay at opacity:0 forever and look like a blank page.
 */
export function useReveal() {
  useEffect(() => {
    const io: IntersectionObserver | null = 'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            const observer = io as IntersectionObserver
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add('is-visible')
                observer.unobserve(e.target)
              }
            })
          },
          { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
        )
      : null

    const observeAll = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)').forEach((el) => {
        if (io) io.observe(el)
        else el.classList.add('is-visible')
      })
    }

    observeAll(document)

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return
          if (n.classList?.contains('reveal')) {
            if (io) io.observe(n)
            else n.classList.add('is-visible')
          }
          observeAll(n)
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      io?.disconnect()
    }
  }, [])
}
