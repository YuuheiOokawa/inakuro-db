'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { UserCharacterState, UserMaterialState } from '@/src/types/inazuma-cross'
import { userCharacterStates as defaultCharacterStates } from '@/src/data/user-character-states'
import { userMaterialStates as defaultMaterialStates } from '@/src/data/user-material-states'

const STORAGE_KEY = 'inakuro-user-data-v1'

interface UserData {
  characters: UserCharacterState[]
  materials: UserMaterialState[]
}

interface UserDataContextValue extends UserData {
  updateCharacter: (id: string, patch: Partial<UserCharacterState>) => void
  updateMaterial: (id: string, patch: Partial<UserMaterialState>) => void
}

const UserDataContext = createContext<UserDataContextValue | null>(null)

const defaultData: UserData = {
  characters: defaultCharacterStates,
  materials: defaultMaterialStates,
}

function loadFromStorage(): UserData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserData
  } catch {
    return null
  }
}

function saveToStorage(data: UserData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore storage errors
  }
}

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UserData>(defaultData)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = loadFromStorage()
    if (stored) setData(stored)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) saveToStorage(data)
  }, [data, loaded])

  const updateCharacter = (id: string, patch: Partial<UserCharacterState>) => {
    setData(prev => ({
      ...prev,
      characters: prev.characters.map(c =>
        c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
      ),
    }))
  }

  const updateMaterial = (id: string, patch: Partial<UserMaterialState>) => {
    setData(prev => ({
      ...prev,
      materials: prev.materials.map(m =>
        m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m
      ),
    }))
  }

  return (
    <UserDataContext.Provider value={{ ...data, updateCharacter, updateMaterial }}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const ctx = useContext(UserDataContext)
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider')
  return ctx
}
