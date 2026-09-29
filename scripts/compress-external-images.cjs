// 压缩 resources/external 下的图片：
// - 宽度超过 1920px 的缩放到 1920px
// - jpg/jpeg 以 quality 85 重新编码
// - png 保持原格式，仅当超宽时缩放
// 注意：.webp/.gif 暂不处理（app 支持展示，但本脚本不压缩它们）
// 原图备份在 zip 中，此脚本直接覆盖 external 里的副本
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const ROOT = path.join(__dirname, '..', 'resources', 'external')
const MAX_WIDTH = 1920
const EXTS = ['.jpg', '.jpeg', '.png']

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(p)
    else if (!entry.name.startsWith('.') && EXTS.includes(path.extname(entry.name).toLowerCase())) yield p
  }
}

async function main() {
  if (!fs.existsSync(ROOT)) {
    throw new Error(`未找到目录 ${ROOT}，请先拷贝 resources/external 数据`)
  }
  let saved = 0
  for (const file of walk(ROOT)) {
    const meta = await sharp(file).metadata()
    const origSize = fs.statSync(file).size
    const ext = path.extname(file).toLowerCase()
    const needResize = meta.width > MAX_WIDTH
    const isJpg = ext === '.jpg' || ext === '.jpeg'

    // 小图且无需缩放则跳过
    if (!needResize && !(isJpg && origSize > 1.5 * 1024 * 1024)) continue

    const tmp = file + '.tmp'
    let pipeline = sharp(file)
    if (needResize) pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true })
    if (isJpg) pipeline = pipeline.jpeg({ quality: 85, mozjpeg: false })
    await pipeline.toFile(tmp)
    fs.renameSync(tmp, file)

    const newSize = fs.statSync(file).size
    saved += origSize - newSize
    console.log(
      `${path.relative(ROOT, file)}: ${(origSize / 1048576).toFixed(1)}MB -> ${(newSize / 1048576).toFixed(1)}MB (${meta.width}x${meta.height})`
    )
  }
  console.log(`\n总计节省: ${(saved / 1048576).toFixed(1)}MB`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
