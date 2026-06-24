'use client'

import { useState } from 'react'
import { Settings, Plus, Edit2, Trash2, Save, X, RefreshCw, ChevronDown } from 'lucide-react'
import { useApp } from '@/lib/store'
import { POSITIONS, ATTRIBUTES, RARITIES, AWAKENING_RANKS, INITIAL_AWAKENING_RANK_BY_RARITY } from '@/src/data/inazuma-cross-master'
import { attributeColor, attributeEmoji, rarityColor, positionColor, verificationColor, cn } from '@/lib/utils'
import type { Character, PassiveSkill, Rarity, AwakeningRank, VerificationStatus } from '@/lib/types'

type Tab = 'characters' | 'skills' | 'materials'

const VERIFICATION_OPTIONS: VerificationStatus[] = ['公式確認済み', '非公式確認済み', '要検証', '不明']

const emptyChar = (): Omit<Character, 'id'> => ({
  name: '', position: 'FW', attribute: '火', rarity: '星3',
  team: '', series: '', obtainMethod: '',
  isGachaLimited: true,
  initialAwakeningRank: 'growing player',
  currentAwakeningRank: 'growing player',
  maxAwakeningRank: 'legendary player+',
  isOwned: false, isFavorite: false,
  memo: '', sourceUrl: '', verificationStatus: '要検証',
})

const emptySkill = (): Omit<PassiveSkill, 'id'> => ({
  name: '', description: '', activationCondition: '',
  effectType: '', targetTeam: '', verificationStatus: '要検証',
})

export default function AdminPage() {
  const { characters, passiveSkills, characterPassiveSkills, materials,
    addCharacter, updateCharacter, deleteCharacter,
    addPassiveSkill, updatePassiveSkill, deletePassiveSkill,
    addCharacterPassiveSkill, deleteCharacterPassiveSkill,
    updateMaterial, resetToSampleData } = useApp()

  const [tab, setTab] = useState<Tab>('characters')
  const [editingCharId, setEditingCharId] = useState<string | null>(null)
  const [charForm, setCharForm] = useState(emptyChar())
  const [showCharForm, setShowCharForm] = useState(false)
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null)
  const [skillForm, setSkillForm] = useState(emptySkill())
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [linkCharId, setLinkCharId] = useState('')
  const [linkSkillId, setLinkSkillId] = useState('')
  const [editMaterialId, setEditMaterialId] = useState<string | null>(null)
  const [editMaterialCount, setEditMaterialCount] = useState(0)

  // --- Character form helpers ---
  const onRarityChange = (rarity: Rarity) => {
    const initRank = INITIAL_AWAKENING_RANK_BY_RARITY[rarity]
    setCharForm(p => ({ ...p, rarity, initialAwakeningRank: initRank, currentAwakeningRank: initRank }))
  }

  const startAddChar = () => {
    setEditingCharId(null)
    setCharForm(emptyChar())
    setShowCharForm(true)
  }

  const startEditChar = (c: Character) => {
    setEditingCharId(c.id)
    setCharForm({ ...c })
    setShowCharForm(true)
  }

  const saveChar = () => {
    if (!charForm.name.trim()) return
    if (editingCharId) {
      updateCharacter(editingCharId, charForm)
    } else {
      const id = `c_${Date.now()}`
      addCharacter({ ...charForm, id })
    }
    setShowCharForm(false)
    setEditingCharId(null)
  }

  // --- Skill form helpers ---
  const startAddSkill = () => {
    setEditingSkillId(null)
    setSkillForm(emptySkill())
    setShowSkillForm(true)
  }

  const startEditSkill = (s: PassiveSkill) => {
    setEditingSkillId(s.id)
    setSkillForm({ ...s })
    setShowSkillForm(true)
  }

  const saveSkill = () => {
    if (!skillForm.name.trim()) return
    if (editingSkillId) {
      updatePassiveSkill(editingSkillId, skillForm)
    } else {
      const id = `ps_${Date.now()}`
      addPassiveSkill({ ...skillForm, id })
    }
    setShowSkillForm(false)
    setEditingSkillId(null)
  }

  const addLink = () => {
    if (!linkCharId || !linkSkillId) return
    if (characterPassiveSkills.some(cp => cp.characterId === linkCharId && cp.passiveSkillId === linkSkillId)) return
    addCharacterPassiveSkill({ id: `cps_${Date.now()}`, characterId: linkCharId, passiveSkillId: linkSkillId })
    setLinkCharId('')
    setLinkSkillId('')
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings size={24} className="text-slate-500" /> 管理画面
        </h1>
        <button onClick={() => { if (confirm('サンプルデータにリセットしますか？（全データが初期化されます）')) resetToSampleData() }}
          className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors">
          <RefreshCw size={12} /> リセット
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(['characters', 'skills', 'materials'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
            {t === 'characters' ? 'キャラ管理' : t === 'skills' ? 'パッシブスキル' : '素材管理'}
          </button>
        ))}
      </div>

      {/* ========== キャラ管理 ========== */}
      {tab === 'characters' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-700">キャラクター ({characters.length}体)</h2>
            <button onClick={startAddChar}
              className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg">
              <Plus size={14} /> 追加
            </button>
          </div>

          {/* Form */}
          {showCharForm && (
            <div className="bg-white rounded-xl p-5 shadow-sm mb-4 border border-blue-200">
              <h3 className="font-bold text-gray-800 mb-4">{editingCharId ? 'キャラ編集' : 'キャラ追加'}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <FormField label="名前 *">
                  <input type="text" value={charForm.name} onChange={e => setCharForm(p => ({ ...p, name: e.target.value }))}
                    className={inputCls} placeholder="例: 豪炎寺修也" />
                </FormField>
                <FormField label="チーム">
                  <input type="text" value={charForm.team ?? ''} onChange={e => setCharForm(p => ({ ...p, team: e.target.value }))}
                    className={inputCls} placeholder="例: イナズマジャパン" />
                </FormField>
                <FormField label="ポジション">
                  <div className="flex gap-1.5 flex-wrap">
                    {POSITIONS.map(p => (
                      <button key={p} type="button" onClick={() => setCharForm(prev => ({ ...prev, position: p }))}
                        className={cn('px-2.5 py-1 rounded-full text-xs font-bold border',
                          charForm.position === p ? positionColor(p) : 'bg-gray-100 text-gray-600 border-transparent')}>
                        {p}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="属性">
                  <div className="flex gap-1.5 flex-wrap">
                    {ATTRIBUTES.map(a => (
                      <button key={a} type="button" onClick={() => setCharForm(prev => ({ ...prev, attribute: a }))}
                        className={cn('px-2.5 py-1 rounded-full text-xs font-bold border',
                          charForm.attribute === a ? attributeColor(a) : 'bg-gray-100 text-gray-600 border-transparent')}>
                        {attributeEmoji(a)} {a}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="レアリティ">
                  <div className="flex gap-1.5 flex-wrap">
                    {RARITIES.map(r => (
                      <button key={r} type="button" onClick={() => onRarityChange(r)}
                        className={cn('px-2.5 py-1 rounded-full text-xs font-bold',
                          charForm.rarity === r ? rarityColor(r) : 'bg-gray-100 text-gray-600')}>
                        {r}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="現在の覚醒ランク">
                  <SelectField
                    value={charForm.currentAwakeningRank}
                    options={AWAKENING_RANKS}
                    onChange={v => setCharForm(p => ({ ...p, currentAwakeningRank: v as AwakeningRank }))}
                  />
                </FormField>
                <FormField label="検証ステータス">
                  <SelectField
                    value={charForm.verificationStatus}
                    options={VERIFICATION_OPTIONS}
                    onChange={v => setCharForm(p => ({ ...p, verificationStatus: v as VerificationStatus }))}
                  />
                </FormField>
                <FormField label="シリーズ">
                  <input type="text" value={charForm.series ?? ''} onChange={e => setCharForm(p => ({ ...p, series: e.target.value }))}
                    className={inputCls} placeholder="例: イナズマイレブン1" />
                </FormField>
                <FormField label="入手方法">
                  <input type="text" value={charForm.obtainMethod ?? ''} onChange={e => setCharForm(p => ({ ...p, obtainMethod: e.target.value }))}
                    className={inputCls} />
                </FormField>
                <FormField label="情報ソースURL">
                  <input type="url" value={charForm.sourceUrl ?? ''} onChange={e => setCharForm(p => ({ ...p, sourceUrl: e.target.value }))}
                    className={inputCls} placeholder="https://..." />
                </FormField>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={charForm.isOwned} onChange={e => setCharForm(p => ({ ...p, isOwned: e.target.checked }))} />
                    所持済み
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={charForm.isFavorite} onChange={e => setCharForm(p => ({ ...p, isFavorite: e.target.checked }))} />
                    お気に入り
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={charForm.isGachaLimited} onChange={e => setCharForm(p => ({ ...p, isGachaLimited: e.target.checked }))} />
                    ガチャ限定
                  </label>
                </div>
              </div>
              <FormField label="メモ">
                <textarea value={charForm.memo ?? ''} onChange={e => setCharForm(p => ({ ...p, memo: e.target.value }))}
                  className={cn(inputCls, 'resize-none')} rows={2} />
              </FormField>
              <div className="flex gap-2 mt-4">
                <button onClick={saveChar} className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
                  <Save size={14} /> 保存
                </button>
                <button onClick={() => { setShowCharForm(false); setEditingCharId(null) }}
                  className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-200">
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {/* Character list */}
          <div className="space-y-2">
            {characters.map(c => (
              <div key={c.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
                <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', positionColor(c.position))}>{c.position}</span>
                <span className={cn('text-xs px-1.5 py-0.5 rounded border', attributeColor(c.attribute))}>{attributeEmoji(c.attribute)}</span>
                <span className={cn('text-xs px-1.5 py-0.5 rounded', rarityColor(c.rarity))}>{c.rarity}</span>
                <span className="font-medium text-gray-800 flex-1">{c.name}</span>
                <span className={cn('text-xs px-1.5 py-0.5 rounded border hidden sm:inline', verificationColor(c.verificationStatus))}>
                  {c.verificationStatus}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => startEditChar(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                  <button onClick={() => { if (confirm(`「${c.name}」を削除しますか？`)) deleteCharacter(c.id) }}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== パッシブスキル管理 ========== */}
      {tab === 'skills' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-700">パッシブスキル ({passiveSkills.length}件)</h2>
            <button onClick={startAddSkill}
              className="flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg">
              <Plus size={14} /> 追加
            </button>
          </div>

          {/* Skill form */}
          {showSkillForm && (
            <div className="bg-white rounded-xl p-5 shadow-sm mb-4 border border-purple-200">
              <h3 className="font-bold text-gray-800 mb-4">{editingSkillId ? 'スキル編集' : 'スキル追加'}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <FormField label="スキル名 *">
                  <input type="text" value={skillForm.name} onChange={e => setSkillForm(p => ({ ...p, name: e.target.value }))}
                    className={inputCls} placeholder="例: 【結束】キック+" />
                </FormField>
                <FormField label="効果種別">
                  <input type="text" value={skillForm.effectType ?? ''} onChange={e => setSkillForm(p => ({ ...p, effectType: e.target.value }))}
                    className={inputCls} placeholder="例: チームタグ条件バフ" />
                </FormField>
                <FormField label="効果説明 *">
                  <textarea value={skillForm.description} onChange={e => setSkillForm(p => ({ ...p, description: e.target.value }))}
                    className={cn(inputCls, 'resize-none')} rows={2} />
                </FormField>
                <FormField label="発動条件">
                  <input type="text" value={skillForm.activationCondition} onChange={e => setSkillForm(p => ({ ...p, activationCondition: e.target.value }))}
                    className={inputCls} />
                </FormField>
                <FormField label="対象チームタグ">
                  <input type="text" value={skillForm.targetTeam ?? ''} onChange={e => setSkillForm(p => ({ ...p, targetTeam: e.target.value }))}
                    className={inputCls} placeholder="例: イナズマジャパン" />
                </FormField>
                <FormField label="検証ステータス">
                  <SelectField
                    value={skillForm.verificationStatus}
                    options={VERIFICATION_OPTIONS}
                    onChange={v => setSkillForm(p => ({ ...p, verificationStatus: v as VerificationStatus }))}
                  />
                </FormField>
                <FormField label="情報ソースURL">
                  <input type="url" value={skillForm.sourceUrl ?? ''} onChange={e => setSkillForm(p => ({ ...p, sourceUrl: e.target.value }))}
                    className={inputCls} placeholder="https://..." />
                </FormField>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveSkill} className="flex items-center gap-1.5 bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700">
                  <Save size={14} /> 保存
                </button>
                <button onClick={() => { setShowSkillForm(false); setEditingSkillId(null) }}
                  className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-200">
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {/* Link character ↔ skill */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <h3 className="font-bold text-gray-700 mb-3">キャラ↔スキル紐付け</h3>
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <label className="text-xs text-gray-500 block mb-1">キャラ</label>
                <select value={linkCharId} onChange={e => setLinkCharId(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white min-w-32">
                  <option value="">選択...</option>
                  {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">スキル</label>
                <select value={linkSkillId} onChange={e => setLinkSkillId(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white min-w-48">
                  <option value="">選択...</option>
                  {passiveSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button onClick={addLink} className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700">
                紐付け
              </button>
            </div>
            <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
              {characterPassiveSkills.map(cp => {
                const char = characters.find(c => c.id === cp.characterId)
                const skill = passiveSkills.find(s => s.id === cp.passiveSkillId)
                if (!char || !skill) return null
                return (
                  <div key={cp.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-1.5">
                    <span className="text-gray-700">{char.name} → {skill.name}</span>
                    <button onClick={() => deleteCharacterPassiveSkill(cp.id)} className="text-red-400 hover:text-red-600 ml-2">
                      <X size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Skill list */}
          <div className="space-y-2">
            {passiveSkills.map(skill => (
              <div key={skill.id} className="bg-white rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-800 text-sm">{skill.name}</span>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded border', verificationColor(skill.verificationStatus))}>
                        {skill.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{skill.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEditSkill(skill)} className="p-1.5 text-purple-500 hover:bg-purple-50 rounded"><Edit2 size={14} /></button>
                    <button onClick={() => { if (confirm(`「${skill.name}」を削除しますか？`)) deletePassiveSkill(skill.id) }}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== 素材管理 ========== */}
      {tab === 'materials' && (
        <div>
          <h2 className="font-bold text-gray-700 mb-4">素材所持数編集</h2>
          <div className="space-y-2">
            {materials.map(mat => (
              <div key={mat.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-800">{mat.name}</div>
                  <div className="text-xs text-gray-400">{mat.materialType}{mat.obtainMethod ? ` / ${mat.obtainMethod}` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  {editMaterialId === mat.id ? (
                    <>
                      <input type="number" min={0} value={editMaterialCount}
                        onChange={e => setEditMaterialCount(Number(e.target.value))}
                        className="w-20 text-right text-sm border border-blue-300 rounded px-2 py-1 focus:outline-none" />
                      <button onClick={() => { updateMaterial(mat.id, { ownedCount: editMaterialCount }); setEditMaterialId(null) }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Save size={14} /></button>
                      <button onClick={() => setEditMaterialId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"><X size={14} /></button>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-gray-800 w-12 text-right">{mat.ownedCount}</span>
                      <button onClick={() => { setEditMaterialId(mat.id); setEditMaterialCount(mat.ownedCount) }}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

function SelectField({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className={cn(inputCls, 'appearance-none pr-7 cursor-pointer')}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white'
