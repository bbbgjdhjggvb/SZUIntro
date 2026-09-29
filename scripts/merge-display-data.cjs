// 合并显示屏数据：把法学院材料并入显示屏机器的 JSON
// 用法: node scripts/merge-display-data.cjs
const fs = require('fs')
const path = require('path')

const DISPLAY_DIR = path.join(__dirname, '..', '新建文件夹')
const LOCAL_EXTERNAL = path.join(__dirname, '..', 'resources', 'external')

// 过滤系统杂文件（Thumbs.db、隐藏文件等），只复制真实图片
const isRealImage = (f) => !f.startsWith('.') && f.toLowerCase() !== 'thumbs.db'

// 我的本地法学院条目（完整版，来自 docx/xlsx 整理结果）
const localCollege = JSON.parse(
  fs.readFileSync(path.join(LOCAL_EXTERNAL, 'data', 'college_association.json'), 'utf8')
).college_associations[0]
const localAlumni = JSON.parse(
  fs.readFileSync(path.join(LOCAL_EXTERNAL, 'data', 'outstanding_alumni.json'), 'utf8')
).outstanding_alumni

// ---------- 1. 修复并合并 college_association.json ----------
let collegeRaw = fs.readFileSync(path.join(DISPLAY_DIR, 'college_association.json'), 'utf8')
// 去掉 BOM（记事本保存的 UTF-8 文件常见），否则 JSON.parse 会失败
collegeRaw = collegeRaw.replace(/^\uFEFF/, '')
// 修复两处中文逗号语法错误
collegeRaw = collegeRaw.replace(/}，/g, '},')
collegeRaw = collegeRaw.replace(/。"，/g, '。",')
// 原文件末尾缺少 college_associations 数组的闭合符 ]，补上
if (!/\}\s*$/.test(collegeRaw)) {
  throw new Error('college_association.json 末尾缺少闭合符 }，请检查文件末尾结构后重试')
}
collegeRaw = collegeRaw.replace(/\}\s*$/, '\n    ]\n}')
const collegeData = JSON.parse(collegeRaw)

const list = collegeData.college_associations
// 填入 id=6（法学院占位条目），使用本地整理好的完整内容，图片目录沿用显示屏约定
const target = list.find((x) => x.id === 6)
if (!target) throw new Error('未找到 id=6 的法学院占位条目')
target.name = localCollege.name
target.background = localCollege.background
target.description = localCollege.description
target.activitys = localCollege.activitys
target.images = 'college_associations/6'
// 删除重复的 id=31 法学院条目（内容为旧版，已被 id=6 完整版取代）
const before = list.length
const mergedCollege = { college_associations: list.filter((x) => x.id !== 31) }
console.log(`college_association: 原 ${before} 条 -> 合并后 ${mergedCollege.college_associations.length} 条（填入 id=6，删除重复 id=31）`)

fs.writeFileSync(
  path.join(DISPLAY_DIR, 'college_association.json'),
  JSON.stringify(mergedCollege, null, 4) + '\n',
  'utf8'
)

// ---------- 2. 合并 outstanding_alumni.json ----------
const outData = JSON.parse(fs.readFileSync(path.join(DISPLAY_DIR, 'outstanding_alumni.json'), 'utf8'))
const existing = outData.outstanding_alumni
const maxId = Math.max(...existing.map((x) => x.id))
const existingNames = new Set(existing.map((x) => x.name))
console.log(`outstanding_alumni: 现有 ${existing.length} 人，最大 id=${maxId}`)

// 幂等保护：已存在的姓名跳过，避免脚本重复运行时重复追加
const skipped = localAlumni.filter((a) => existingNames.has(a.name))
const toAdd = localAlumni.filter((a) => !existingNames.has(a.name))
if (skipped.length > 0) {
  console.log(`跳过已存在 ${skipped.length} 人: ${skipped.map((a) => a.name).join('、')}`)
}

// 新 id 从 maxId+1 开始；照片按显示屏约定命名为 outstanding_alumni/<id>.jpg
const nameToOldImage = {
  庄家紫: '1.庄家紫.jpeg',
  马晓歌: '2.马晓歌照片.jpg',
  李严: '3.李严.jpg',
  李磊明: '4.李磊明.jpg',
  陈晓亚: '5.陈晓亚.jpg',
  杨国强: '6.杨国强.jpg',
  黄丹娜: '7.黄丹娜.jpg',
  滕海迪: '8.滕海迪照片.jpg',
  薛冰: '9.薛冰.jpg',
  王勇飞: '10.王勇飞.jpg'
}
let nextId = maxId + 1
const newEntries = toAdd.map((a) => {
  const entry = {
    id: nextId,
    name: a.name,
    year: a.year,
    major: a.major || undefined,
    image: `/outstanding_alumni/${nextId}.jpg`,
    description: a.description
  }
  if (!entry.major) delete entry.major // 与显示屏现有条目风格一致（专业缺失时不写字段）
  nextId++
  return entry
})
if (newEntries.length > 0) {
  outData.outstanding_alumni = [...existing, ...newEntries]
  console.log(`新增 ${newEntries.length} 人，新 id 范围 ${maxId + 1}-${nextId - 1}`)

  fs.writeFileSync(
    path.join(DISPLAY_DIR, 'outstanding_alumni.json'),
    JSON.stringify(outData, null, 4) + '\n',
    'utf8'
  )
}

// ---------- 3. 把图片按显示屏目录约定放好 ----------
// 3.1 学院介绍图片 -> college_associations/6/
const collegeImgSrc = path.join(LOCAL_EXTERNAL, 'colleges', '法学院校友会')
const collegeImgDst = path.join(DISPLAY_DIR, 'college_associations', '6')
fs.mkdirSync(collegeImgDst, { recursive: true })
const collegeImages = fs.readdirSync(collegeImgSrc).filter(isRealImage)
for (const f of collegeImages) {
  fs.copyFileSync(path.join(collegeImgSrc, f), path.join(collegeImgDst, f))
}
console.log(`学院图片: ${collegeImages.length} 张 -> ${collegeImgDst}`)

// 3.2 校友照片 -> outstanding_alumni/<新id>.jpg
const outImgDst = path.join(DISPLAY_DIR, 'outstanding_alumni')
fs.mkdirSync(outImgDst, { recursive: true })
for (const [i, a] of toAdd.entries()) {
  const oldName = nameToOldImage[a.name]
  if (!oldName) throw new Error(`nameToOldImage 缺少 "${a.name}" 的照片文件名映射`)
  const newId = maxId + 1 + i
  fs.copyFileSync(
    path.join(LOCAL_EXTERNAL, 'outstanding', oldName),
    path.join(outImgDst, `${newId}.jpg`)
  )
}
console.log(`校友照片: ${fs.readdirSync(outImgDst).filter(isRealImage).length} 张 -> ${outImgDst}`)

// ---------- 4. 同步更新本地 resources/external（保持本地与显示屏一致） ----------
fs.copyFileSync(
  path.join(DISPLAY_DIR, 'college_association.json'),
  path.join(LOCAL_EXTERNAL, 'data', 'college_association.json')
)
fs.copyFileSync(
  path.join(DISPLAY_DIR, 'outstanding_alumni.json'),
  path.join(LOCAL_EXTERNAL, 'data', 'outstanding_alumni.json')
)
// 显示屏真实的校友总会/分会数据也拷到本地，替换掉之前的占位文件
fs.copyFileSync(path.join(DISPLAY_DIR, 'data.json'), path.join(LOCAL_EXTERNAL, 'data', 'data.json'))
fs.copyFileSync(
  path.join(DISPLAY_DIR, 'association_distribution.json'),
  path.join(LOCAL_EXTERNAL, 'data', 'association_distribution.json')
)
// 本地图片目录同样改成显示屏约定
const localCollegeDst = path.join(LOCAL_EXTERNAL, 'college_associations', '6')
fs.mkdirSync(localCollegeDst, { recursive: true })
for (const f of fs.readdirSync(collegeImgSrc).filter(isRealImage)) {
  fs.copyFileSync(path.join(collegeImgSrc, f), path.join(localCollegeDst, f))
}
const localOutDst = path.join(LOCAL_EXTERNAL, 'outstanding_alumni')
fs.mkdirSync(localOutDst, { recursive: true })
for (const f of fs.readdirSync(outImgDst).filter(isRealImage)) {
  fs.copyFileSync(path.join(outImgDst, f), path.join(localOutDst, f))
}

console.log('\n合并完成。')
console.log(`显示屏合并结果目录: ${DISPLAY_DIR}`)
console.log(`  - college_association.json / outstanding_alumni.json（合并后）`)
console.log(`  - college_associations/6/（${collegeImages.length} 张学院图片）`)
console.log(`  - outstanding_alumni/（10 张校友照片，按新 id 命名）`)
console.log('本地 resources/external 已同步。')
