import { useState, useEffect, useRef, useCallback } from 'react'

export function useCountdown(durationSec, { running = false, onDone } = {}) {
  const [remaining, setRemaining] = useState(durationSec)
  const remainingRef = useRef(durationSec)
  const rafRef      = useRef(null)
  const intervalRef = useRef(null)
  const lastRef     = useRef(null)
  const doneRef     = useRef(false)
  const onDoneRef   = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    remainingRef.current = durationSec
    setRemaining(durationSec)
    doneRef.current = false
  }, [durationSec])

  const applyDelta = useCallback((dt) => {
    setRemaining(r => {
      const next = Math.max(0, r - dt)
      remainingRef.current = next
      if (next <= 0 && !doneRef.current) {
        doneRef.current = true
        // Fire onDone outside the setState call
        setTimeout(() => onDoneRef.current?.(), 0)
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(rafRef.current)
      clearInterval(intervalRef.current)
      lastRef.current = null
      return
    }

    function startRAF() {
      cancelAnimationFrame(rafRef.current)
      function tick(t) {
        if (lastRef.current == null) lastRef.current = t
        const dt = (t - lastRef.current) / 1000
        lastRef.current = t
        applyDelta(dt)
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    function startInterval() {
      clearInterval(intervalRef.current)
      let last = Date.now()
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        applyDelta((now - last) / 1000)
        last = now
      }, 250)
    }

    function onVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current)
        lastRef.current = null
        startInterval()
      } else {
        clearInterval(intervalRef.current)
        startRAF()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    document.hidden ? startInterval() : startRAF()

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearInterval(intervalRef.current)
      lastRef.current = null
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [running, applyDelta])

  const reset = useCallback(() => {
    remainingRef.current = durationSec
    setRemaining(durationSec)
    doneRef.current = false
  }, [durationSec])

  return { remaining, remainingRef, reset }
}
