# CSVインポート形式定義

> 作成日: 2026-06-23  
> 対象: イナクロ育成DB Webアプリ

---

## 概要

本アプリへのデータ一括インポートのためのCSVフォーマット定義です。  
各CSVファイルは UTF-8（BOMなし）で保存し、1行目はヘッダー行としてください。

---

## 1. characters.csv（キャラクターマスタ）

### カラム定義

| カラム名 | 型 | 必須 | 説明 | 値の例 |
|---------|-----|------|------|-------|
| id | string | ✅ | 一意のID | char_gouenji_s3 |
| name | string | ✅ | キャラクター名 | 豪炎寺修也 |
| nickname | string | | 肩書き | 炎のストライカー |
| position | string | ✅ | ポジション | FW / MF / DF / GK |
| attribute | string | ✅ | 属性 | 火 / 風 / 山 / 林 |
| rarity | string | ✅ | レアリティ | 星1 / 星2 / 星3 |
| team | string | | チーム名 | イナズマジャパン |
| series | string | | 元シリーズ | イナズマイレブン1 |
| obtainMethod | string | | 入手方法 | gacha / neptuneBoard / event / story / exchange |
| isGachaLimited | boolean | | ガチャ限定か | true / false |
| initialAwakeningRank | string | ✅ | 初期覚醒ランク | growing player |
| maxAwakeningRank | string | ✅ | 最大覚醒ランク | legendary player+ |
| imageUrl | string | | 画像URL | https://... または空欄 |
| memo | string | | 備考 | 自由記述 |
| sourceUrl | string | | 情報源URL | https://... |
| verificationStatus | string | | 確認状態 | confirmed / unverified / partial |

### サンプルデータ

```csv
id,name,nickname,position,attribute,rarity,team,series,obtainMethod,isGachaLimited,initialAwakeningRank,maxAwakeningRank,imageUrl,memo,sourceUrl,verificationStatus
char_gouenji_s3,豪炎寺修也,炎のストライカー,FW,火,星3,イナズマジャパン,イナズマイレブン1,gacha,true,growing player,legendary player+,,,https://appmedia.jp/inazuma-cross/80072293,confirmed
char_endou_s3,円堂守,熱血守護神,GK,山,星3,雷門中,イナズマイレブン1,gacha,true,growing player,legendary player+,,,https://gamerch.com/inazuma-cross/989782,confirmed
char_fubuki_s3,吹雪士郎,雪原のプリンス,FW,風,星3,イナズマジャパン,イナズマイレブン1,gacha,true,growing player,legendary player+,,,https://appmedia.jp/inazuma-cross/80072362,confirmed
char_kidou_s3,鬼道有人,天才ゲームメーカー,MF,風,星3,,イナズマイレブン1,gacha,true,growing player,legendary player+,,,https://gamerch.com/inazuma-cross/989782,unverified
char_fudo_s3,不動明王,孤高の反逆児,MF,火,星3,イナズマジャパン,イナズマイレブン2,gacha,true,growing player,legendary player+,,,https://game8.jp/inazuma-cross/788184,confirmed
char_染岡_s3,染岡竜吾,ドラゴンストライカー,FW,林,星3,,イナズマイレブン1,gacha,true,growing player,legendary player+,,,https://gamerch.com/inazuma-cross/989782,unverified
char_kabe_s3,壁山塀吾郎,鉄壁アフロ,DF,山,星3,,イナズマイレブン1,gacha,true,growing player,legendary player+,,,https://gamerch.com/inazuma-cross/989782,unverified
char_tatsuya_s3,立向居勇気,ムゲン・ザ・努力,GK,林,星3,,イナズマイレブン1,gacha,true,growing player,legendary player+,,,https://gamerch.com/inazuma-cross/989782,unverified
char_kaze_s3,風丸一郎太,疾風スプリンター,DF,風,星3,雷門中,イナズマイレブン1,gacha,true,growing player,legendary player+,,,https://gamerch.com/inazuma-cross/989782,unverified
char_hiroto_s3,基山ヒロト,流星の貴公子,FW,火,星3,,イナズマイレブン3,gacha,true,growing player,legendary player+,,,https://gamerch.com/inazuma-cross/989782,unverified
char_endou_s2,円堂守,,GK,山,星2,雷門中,イナズマイレブン1,gacha,false,normal player+,legendary player+,,,https://gamerch.com/inazuma-cross/989784,confirmed
char_kidou_s2,鬼道有人,,MF,風,星2,帝国学園,イナズマイレブン1,gacha,false,normal player+,legendary player+,,,https://gamerch.com/inazuma-cross/989784,confirmed
```

### バリデーションルール

| カラム | ルール |
|--------|-------|
| position | FW / MF / DF / GK のいずれか |
| attribute | 火 / 風 / 山 / 林 のいずれか |
| rarity | 星1 / 星2 / 星3 のいずれか |
| isGachaLimited | true / false のいずれか |
| initialAwakeningRank | 覚醒ランク名10種のいずれか |
| maxAwakeningRank | 覚醒ランク名10種のいずれか |
| verificationStatus | confirmed / unverified / partial のいずれか |

---

## 2. awakening_requirements.csv（覚醒ルートマスタ）

> このCSVはレアリティ共通の覚醒ルート定義です。キャラ個別ではありません。

### カラム定義

| カラム名 | 型 | 必須 | 説明 | 値の例 |
|---------|-----|------|------|-------|
| id | string | ✅ | 一意のID | route_s3_1 |
| rarity | string | ✅ | 適用レアリティ | 星1 / 星2 / 星3 |
| fromRank | string | ✅ | 開始覚醒ランク | growing player |
| toRank | string | ✅ | 到達覚醒ランク | growing player+ |
| materialType | string | ✅ | 素材種別 | soul / fragment |
| requiredCount | integer | ✅ | 必要数 | 1 |
| characterSpecificSoul | boolean | | キャラ固有魂か | true |
| attributeFragmentRequired | boolean | | 属性のかけら必要か | false |
| memo | string | | 備考 | 要検証など |

### サンプルデータ

```csv
id,rarity,fromRank,toRank,materialType,requiredCount,characterSpecificSoul,attributeFragmentRequired,memo
route_s3_1,星3,growing player,growing player+,soul,1,true,false,
route_s3_2,星3,growing player+,advanced player,soul,1,true,false,
route_s3_3,星3,advanced player,advanced player+,fragment,100,false,true,属性のかけら（各属性）
route_s3_4,星3,advanced player+,top player,soul,1,true,false,
route_s3_5,星3,top player,top player+,soul,2,true,false,
route_s3_6,星3,top player+,legendary player,fragment,600,false,true,属性のかけら（各属性）
route_s3_7,星3,legendary player,legendary player+,soul,2,true,false,
route_s2_1,星2,normal player+,growing player,soul,3,true,false,
route_s2_2,星2,growing player,growing player+,soul,4,true,false,
route_s2_3,星2,growing player+,advanced player,soul,5,true,false,
route_s2_4,星2,advanced player,advanced player+,fragment,120,false,true,属性のかけら（各属性）
route_s2_5,星2,advanced player+,top player,soul,8,true,false,
route_s2_6,星2,top player,top player+,soul,10,true,false,
route_s2_7,星2,top player+,legendary player,fragment,200,false,true,属性のかけら（各属性）
route_s2_8,星2,legendary player,legendary player+,soul,15,true,false,
route_s1_1,星1,normal player,normal player+,soul,1,true,false,
route_s1_2,星1,normal player+,growing player,soul,3,true,false,
route_s1_3,星1,growing player,growing player+,soul,4,true,false,
route_s1_4,星1,growing player+,advanced player,soul,5,true,false,
route_s1_5,星1,advanced player,advanced player+,soul,8,true,false,
route_s1_6,星1,advanced player+,top player,soul,10,true,false,
route_s1_7,星1,top player,top player+,soul,12,true,false,
route_s1_8,星1,top player+,legendary player,fragment,200,false,true,属性のかけら（各属性）
route_s1_9,星1,legendary player,legendary player+,soul,20,true,false,
```

---

## 3. passive_skills.csv（パッシブスキルマスタ）

### カラム定義

| カラム名 | 型 | 必須 | 説明 | 値の例 |
|---------|-----|------|------|-------|
| id | string | ✅ | 一意のID | ps_kessoku_kick_ij |
| name | string | ✅ | スキル名 | 【結束】キック+ |
| description | string | ✅ | 効果説明 | イナズマジャパンタグの味方が3人以上いる場合、自身のキックを2240上昇 |
| activationTiming | string | | 発動タイミング | 試合開始時 / ドリブル成功時 |
| activationCondition | string | | 発動条件（テキスト） | イナズマジャパンタグの味方が3人以上 |
| conditionType | string | | 条件種別 | none / teamTag / attribute / position / special |
| conditionTagName | string | | チームタグ名 | イナズマジャパン |
| conditionCount | integer | | 必要人数 | 3 |
| effectType | string | | 効果種別 | stat_up / tp_up / skill_power / crit_up / debuff |
| targetScope | string | | 対象範囲 | self / ally_tag / ally_all |
| targetPosition | string | | 対象ポジション | FW / MF / DF / GK / all |
| targetAttribute | string | | 対象属性 | 火 / 風 / 山 / 林 / all |
| stackable | boolean | | 重複可否 | false（要検証） |
| unlockType | string | | 解放種別 | level / awakening |
| unlockValue | string | | 解放値 | 1 / 11 / 41（レベル）/ advanced player+（覚醒ランク） |
| memo | string | | 備考 | |
| sourceUrl | string | | 情報源URL | |
| verificationStatus | string | | 確認状態 | confirmed / unverified / partial |

### サンプルデータ

```csv
id,name,description,activationTiming,activationCondition,conditionType,conditionTagName,conditionCount,effectType,targetScope,targetPosition,targetAttribute,stackable,unlockType,unlockValue,memo,sourceUrl,verificationStatus
ps_gouenji_kick1,キック+,試合開始時・自身のキックを1344上昇,試合開始時,,none,,0,stat_up,self,FW,all,false,level,1,,https://appmedia.jp/inazuma-cross/80072293,confirmed
ps_gouenji_tp,最大TP+,試合開始時・自身の最大TPを30上昇,試合開始時,,none,,0,tp_up,self,all,all,false,awakening,advanced player,,https://appmedia.jp/inazuma-cross/80072293,confirmed
ps_gouenji_kessoku,【結束】キック+,雷門またはイナズマジャパンタグの味方が3人以上いる場合・自身のキックを2194上昇,試合開始時,雷門またはイナズマジャパンタグの味方が3人以上,teamTag,雷門/イナズマジャパン,3,stat_up,self,FW,all,false,level,1,,https://appmedia.jp/inazuma-cross/80072293,confirmed
ps_gouenji_score,【自得点/累】雷門・イナズマジャパン+,自身がゴールを入れるたびに雷門またはイナズマジャパンタグを持つ味方の全パラメータを199上昇,得点時,雷門またはイナズマジャパンタグの味方が3人以上,teamTag,雷門/イナズマジャパン,3,stat_up,ally_tag,all,all,false,awakening,advanced player+,,https://appmedia.jp/inazuma-cross/80072293,confirmed
ps_gouenji_shoot,【決定機】シュートパワー+,ペナルティエリア内でシュート技を打つ時・自身のシュート技の威力を99上昇,シュート時,ペナルティエリア内,special,,0,skill_power,self,FW,all,false,level,41,,https://appmedia.jp/inazuma-cross/80072293,confirmed
ps_fudo_tech1,テクニック+,試合開始時・自身のテクニックを215上昇,試合開始時,,none,,0,stat_up,self,MF,all,false,level,1,,https://game8.jp/inazuma-cross/788184,confirmed
ps_fudo_tp,最大TP+,試合開始時・自身の最大TPを10上昇,試合開始時,,none,,0,tp_up,self,all,all,false,awakening,advanced player,,https://game8.jp/inazuma-cross/788184,confirmed
ps_fudo_kessoku,【結束】ドリブルパワー+,イナズマジャパンタグの味方が3人以上いる場合・自身のドリブル技の威力を18上昇,試合開始時,イナズマジャパンタグの味方が3人以上,teamTag,イナズマジャパン,3,skill_power,self,MF,all,false,level,41,,https://game8.jp/inazuma-cross/788184,confirmed
ps_fubuki_kessoku,【結束】キック+,イナズマジャパンタグの味方が3人以上いる場合・自身のキックを2240上昇,試合開始時,イナズマジャパンタグの味方が3人以上,teamTag,イナズマジャパン,3,stat_up,self,FW,all,false,level,1,,https://appmedia.jp/inazuma-cross/80072362,confirmed
ps_fubuki_kick2,キック+,試合開始時・自身のキックを1344上昇,試合開始時,,none,,0,stat_up,self,FW,all,false,level,11,,https://appmedia.jp/inazuma-cross/80072362,confirmed
ps_fubuki_wolf,ウルフレジェンドパワー+改,試合開始時・ウルフレジェンドの威力を35上昇・射程を10上昇,試合開始時,,none,,0,skill_power,self,FW,wind,false,awakening,advanced player+,,https://appmedia.jp/inazuma-cross/80072362,confirmed
ps_fubuki_wind,パワー&CRT,試合開始時・自身の風属性技の威力を36上昇・クリティカル率を10%上昇,試合開始時,,none,,0,skill_power,self,FW,wind,false,level,41,,https://appmedia.jp/inazuma-cross/80072362,confirmed
```

---

## 4. character_passive_skills.csv（キャラ×パッシブスキル 紐付け）

### カラム定義

| カラム名 | 型 | 必須 | 説明 | 値の例 |
|---------|-----|------|------|-------|
| id | string | ✅ | 一意のID | cps_gouenji_kick1 |
| characterId | string | ✅ | キャラID | char_gouenji_s3 |
| passiveSkillId | string | ✅ | パッシブスキルID | ps_gouenji_kick1 |
| sortOrder | integer | | 表示順 | 1 |

### サンプルデータ

```csv
id,characterId,passiveSkillId,sortOrder
cps_gouenji_1,char_gouenji_s3,ps_gouenji_kick1,1
cps_gouenji_2,char_gouenji_s3,ps_gouenji_tp,2
cps_gouenji_3,char_gouenji_s3,ps_gouenji_kessoku,3
cps_gouenji_4,char_gouenji_s3,ps_gouenji_score,4
cps_gouenji_5,char_gouenji_s3,ps_gouenji_shoot,5
cps_fudo_1,char_fudo_s3,ps_fudo_tech1,1
cps_fudo_2,char_fudo_s3,ps_fudo_tp,2
cps_fudo_3,char_fudo_s3,ps_fudo_kessoku,3
cps_fubuki_1,char_fubuki_s3,ps_fubuki_kessoku,1
cps_fubuki_2,char_fubuki_s3,ps_fubuki_kick2,2
cps_fubuki_3,char_fubuki_s3,ps_fubuki_wolf,3
cps_fubuki_4,char_fubuki_s3,ps_fubuki_wind,4
```

---

## 5. materials.csv（素材マスタ）

### カラム定義

| カラム名 | 型 | 必須 | 説明 | 値の例 |
|---------|-----|------|------|-------|
| id | string | ✅ | 一意のID | soul_gouenji |
| name | string | ✅ | 素材名 | 豪炎寺修也の覚醒魂 |
| materialType | string | ✅ | 素材種別 | soul / fragment / fragment_universal / other |
| attribute | string | | 属性のかけらの場合の属性 | 火 / 風 / 山 / 林 |
| characterId | string | | 覚醒魂の対象キャラID | char_gouenji_s3 |
| obtainMethod | string | | 入手方法 | ガチャ被り / 人脈ボード / 交換所 |
| memo | string | | 備考 | |

### サンプルデータ

```csv
id,name,materialType,attribute,characterId,obtainMethod,memo
soul_gouenji,豪炎寺修也の覚醒魂,soul,,char_gouenji_s3,ガチャ被り / 人脈ボード / 交換所（試練のコイン2000）,
soul_endou_s3,円堂守の覚醒魂（熱血守護神）,soul,,char_endou_s3,ガチャ被り / 交換所（試練のコイン2000）,
soul_fubuki,吹雪士郎の覚醒魂,soul,,char_fubuki_s3,ガチャ被り,
soul_fudo,不動明王の覚醒魂,soul,,char_fudo_s3,ガチャ被り,
soul_endou_s2,円堂守の覚醒魂（星2）,soul,,char_endou_s2,ガチャ被り / 交換所（試練のコイン2000）,
soul_kidou_s2,鬼道有人の覚醒魂（星2）,soul,,char_kidou_s2,ガチャ被り,
frag_fire,火のかけら,fragment,火,,ガチャ / 人脈ボード / 交換所,
frag_wind,風のかけら,fragment,風,,ガチャ / 人脈ボード / 交換所,
frag_mountain,山のかけら,fragment,山,,ガチャ / 人脈ボード / 交換所,
frag_forest,林のかけら,fragment,林,,ガチャ / 人脈ボード / 交換所,
frag_universal,属性のかけら・万能,fragment_universal,,,ガチャ / イベント（要検証）,全属性共通使用可能
```

---

## インポート実装ガイドライン

### CSVパース時の注意点

1. **文字コード**: UTF-8（BOMなし）
2. **改行コード**: LF または CRLF（どちらも受け付ける）
3. **カンマを含む値**: ダブルクォートで囲む
4. **空欄**: 空文字列 `""` または何も書かない
5. **boolean値**: `true` / `false` または `1` / `0` を受け付ける

### インポート順序（依存関係あり）

```
1. awakening_requirements.csv  （依存なし）
2. materials.csv               （characterId が後で設定される場合は空欄可）
3. characters.csv              （依存なし）
4. passive_skills.csv          （依存なし）
5. character_passive_skills.csv（characters + passive_skills に依存）
```

### バリデーション必須項目

- `position`: `FW` / `MF` / `DF` / `GK` 以外は拒否
- `attribute`: `火` / `風` / `山` / `林` 以外は拒否
- `rarity`: `星1` / `星2` / `星3` 以外は拒否
- `initialAwakeningRank` / `maxAwakeningRank`: 覚醒ランク10種以外は拒否
- `conditionType`: `none` / `teamTag` / `attribute` / `position` / `special` 以外は拒否
