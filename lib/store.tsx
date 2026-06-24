'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { AppData, Character, Material, PassiveSkill, CharacterPassiveSkill } from './types'
import { initialData } from './sampleData'

const STORAGE_KEY = 'inakuro-db-v3'

interface AppStore extends AppData {
  updateCharacter: (id: string, updates: Partial<Character>) => void
  addCharacter: (char: Character) => void
  deleteCharacter: (id: string) => void
  toggleOwned: (id: string) => void
  toggleFavorite: (id: string) => void
  updateMaterial: (id: string, updates: Partial<Material>) => void
  addMaterial: (mat: Material) => void
  deleteMaterial: (id: string) => void
  addPassiveSkill: (skill: PassiveSkill) => void
  updatePassiveSkill: (id: string, updates: Partial<PassiveSkill>) => void
  deletePassiveSkill: (id: string) => void
  addCharacterPassiveSkill: (link: CharacterPassiveSkill) => void
  deleteCharacterPassiveSkill: (id: string) => void
  resetToSampleData: () => void
}

const AppContext = createContext<AppStore | null>(null)

function loadData(): AppData {
  if (typeof window === 'undefined') return initialData
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppData
  } catch {
    // ignore
  }
  return initialData
}

function saveData(data: AppData) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(initialData)

  useEffect(() => {
    setData(loadData())
  }, [])

  const mutate = useCallback((updater: (prev: AppData) => AppData) => {
    setData(prev => {
      const next = updater(prev)
      saveData(next)
      return next
    })
  }, [])

  const updateCharacter = useCallback((id: string, updates: Partial<Character>) => {
    mutate(d => ({
      ...d,
      characters: d.characters.map(c => c.id === id ? { ...c, ...updates } : c),
    }))
  }, [mutate])

  const addCharacter = useCallback((char: Character) => {
    mutate(d => ({ ...d, characters: [...d.characters, char] }))
  }, [mutate])

  const deleteCharacter = useCallback((id: string) => {
    mutate(d => ({
      ...d,
      characters: d.characters.filter(c => c.id !== id),
      characterPassiveSkills: d.characterPassiveSkills.filter(cp => cp.characterId !== id),
    }))
  }, [mutate])

  const toggleOwned = useCallback((id: string) => {
    mutate(d => ({
      ...d,
      characters: d.characters.map(c => c.id === id ? { ...c, isOwned: !c.isOwned } : c),
    }))
  }, [mutate])

  const toggleFavorite = useCallback((id: string) => {
    mutate(d => ({
      ...d,
      characters: d.characters.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c),
    }))
  }, [mutate])

  const updateMaterial = useCallback((id: string, updates: Partial<Material>) => {
    mutate(d => ({
      ...d,
      materials: d.materials.map(m => m.id === id ? { ...m, ...updates } : m),
    }))
  }, [mutate])

  const addMaterial = useCallback((mat: Material) => {
    mutate(d => ({ ...d, materials: [...d.materials, mat] }))
  }, [mutate])

  const deleteMaterial = useCallback((id: string) => {
    mutate(d => ({ ...d, materials: d.materials.filter(m => m.id !== id) }))
  }, [mutate])

  const addPassiveSkill = useCallback((skill: PassiveSkill) => {
    mutate(d => ({ ...d, passiveSkills: [...d.passiveSkills, skill] }))
  }, [mutate])

  const updatePassiveSkill = useCallback((id: string, updates: Partial<PassiveSkill>) => {
    mutate(d => ({
      ...d,
      passiveSkills: d.passiveSkills.map(s => s.id === id ? { ...s, ...updates } : s),
    }))
  }, [mutate])

  const deletePassiveSkill = useCallback((id: string) => {
    mutate(d => ({
      ...d,
      passiveSkills: d.passiveSkills.filter(s => s.id !== id),
      characterPassiveSkills: d.characterPassiveSkills.filter(cp => cp.passiveSkillId !== id),
    }))
  }, [mutate])

  const addCharacterPassiveSkill = useCallback((link: CharacterPassiveSkill) => {
    mutate(d => ({ ...d, characterPassiveSkills: [...d.characterPassiveSkills, link] }))
  }, [mutate])

  const deleteCharacterPassiveSkill = useCallback((id: string) => {
    mutate(d => ({ ...d, characterPassiveSkills: d.characterPassiveSkills.filter(cp => cp.id !== id) }))
  }, [mutate])

  const resetToSampleData = useCallback(() => {
    setData(initialData)
    saveData(initialData)
  }, [])

  return (
    <AppContext.Provider value={{
      ...data,
      updateCharacter,
      addCharacter,
      deleteCharacter,
      toggleOwned,
      toggleFavorite,
      updateMaterial,
      addMaterial,
      deleteMaterial,
      addPassiveSkill,
      updatePassiveSkill,
      deletePassiveSkill,
      addCharacterPassiveSkill,
      deleteCharacterPassiveSkill,
      resetToSampleData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
