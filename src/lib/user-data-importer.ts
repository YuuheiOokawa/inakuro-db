export interface ParsedSoulName {
  characterName: string
  characterVersion: string | undefined
}

/**
 * 覚醒魂名を解析してキャラ名・バージョンを返す。
 *
 * 対応フォーマット:
 *   [バージョン名]キャラ名の覚醒魂   → { characterVersion: "バージョン名", characterName: "キャラ名" }
 *   ★1キャラ名の覚醒魂              → { characterVersion: "★1", characterName: "キャラ名" }
 *   ★1　キャラ名の覚醒魂            → （全角スペースも除去）
 *   キャラ名の覚醒魂                 → { characterVersion: undefined, characterName: "キャラ名" }
 */
export function parseSoulName(soulName: string): ParsedSoulName {
  // [version]name
  const bracketMatch = soulName.match(/^\[(.+?)\](.+?)の覚醒魂$/)
  if (bracketMatch) {
    return {
      characterVersion: bracketMatch[1].trim(),
      characterName: bracketMatch[2].trim(),
    }
  }

  // ★1 prefix（全角スペースあり・なし両対応）
  const starMatch = soulName.match(/^★1[　\s]?(.+?)の覚醒魂$/)
  if (starMatch) {
    return {
      characterVersion: "★1",
      characterName: starMatch[1].trim(),
    }
  }

  // バージョンなし（プレーンな名前）
  const plainMatch = soulName.match(/^(.+?)の覚醒魂$/)
  if (plainMatch) {
    return {
      characterVersion: undefined,
      characterName: plainMatch[1].trim(),
    }
  }

  return { characterVersion: undefined, characterName: soulName }
}

/**
 * キャラ名を正規化する（全角スペース・半角スペースを除去して比較用に使用）。
 */
export function normalizeCharacterName(name: string): string {
  return name.replace(/[　\s]/g, "")
}
