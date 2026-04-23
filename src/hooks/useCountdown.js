import { useState, useEffect, useRef, useCallback } from 'react'

export function useCountdown(durationSec, { running = false, onDone } = {}) {
  const [remaining, setRemaining] = useState(durationSec)
  const rafRef = useRef(null)
  const lastRef = useRef(null)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    setRemaining(durationSec)
    doneRef.current = false
  }, [durationSec])

  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(rafRef.current)
      lastRef.current = null
      return
    }
    function tick(t) {
      if (lastRef.current == null) lastRef.current = t
      const dt = (t - lastRef.current) / 1000
      lastRef.current = t
      setRemaining(r => {
        const next = Math.max(0, r - dt)
        if (next <= 0 && !doneRef.current) {
          doneRef.current = true
          onDoneRef.current?.()
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running])

  const reset = useCallback(() => {
    setRemaining(durationSec)
    doneRef.current = false
  }, [durationSec])

  return { remaining, reset }
}
