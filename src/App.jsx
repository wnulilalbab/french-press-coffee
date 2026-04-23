import { useState, useEffect } from 'react'
import { SAMPLE_PROFILES } from './data/steps'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import BrewPage from './pages/BrewPage'

const STORAGE_KEY = 'brew_profiles'

function loadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return null
}

function saveProfiles(profiles) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles)) } catch {}
}

function genId() {
  return 'p-' + Math.random().toString(36).slice(2, 10)
}

export default function App() {
  const [profiles, setProfiles] = useState(() => loadProfiles() ?? SAMPLE_PROFILES)
  const [screen, setScreen] = useState({ name: 'home' })

  useEffect(() => {
    function update() {
      const h = (window.visualViewport ?? window).height
      document.documentElement.style.setProperty('--app-h', `${h}px`)
    }
    update()
    const vvp = window.visualViewport ?? window
    vvp.addEventListener('resize', update)
    return () => vvp.removeEventListener('resize', update)
  }, [])

  useEffect(() => { saveProfiles(profiles) }, [profiles])

  function findProfile(id) { return profiles.find(p => p.id === id) }

  function handleSave(data, editId) {
    if (editId) {
      setProfiles(ps => ps.map(p => p.id === editId ? { ...p, ...data } : p))
    } else {
      setProfiles(ps => [...ps, {
        id: genId(), uses: 0, created_at: new Date().toISOString(), ...data,
      }])
    }
    setScreen({ name: 'home' })
  }

  function handleDelete(id) {
    setProfiles(ps => ps.filter(p => p.id !== id))
    setScreen({ name: 'home' })
  }

  function handleBrewComplete(id) {
    setProfiles(ps => ps.map(p => p.id === id ? { ...p, uses: (p.uses || 0) + 1 } : p))
  }

  const current = (screen.name === 'brew' || screen.name === 'edit')
    ? findProfile(screen.id)
    : null

  if (screen.name === 'new') {
    return (
      <ProfilePage
        initial={null}
        onCancel={() => setScreen({ name: 'home' })}
        onSave={(data) => handleSave(data, null)}
        onDelete={null}
      />
    )
  }

  if (screen.name === 'edit' && current) {
    return (
      <ProfilePage
        initial={current}
        onCancel={() => setScreen({ name: 'home' })}
        onSave={(data) => handleSave(data, current.id)}
        onDelete={handleDelete}
      />
    )
  }

  if (screen.name === 'brew' && current) {
    return (
      <BrewPage
        profile={current}
        onExit={() => setScreen({ name: 'home' })}
        onComplete={() => handleBrewComplete(current.id)}
      />
    )
  }

  return (
    <HomePage
      profiles={profiles}
      onNew={() => setScreen({ name: 'new' })}
      onEdit={(id) => setScreen({ name: 'edit', id })}
      onDelete={handleDelete}
      onBrew={(id) => setScreen({ name: 'brew', id })}
    />
  )
}
