const fs = require('fs/promises')

const main = async () => {
  const file_paths = []
  const years = await fs.readdir('content/posts')
  for (const year of years) {
    const months = await fs.readdir(`content/posts/${year}`)
    for (const month of months) {
      const files = await fs.readdir(`content/posts/${year}/${month}`)
      for (const file of files) {
        file_paths.push(`content/posts/${year}/${month}/${file}`)
      }
    }
  }

  for (const file_path of file_paths) {
    const basename = file_path.split('/').slice(-1)[0].split('.md')[0]
    const [_y,_m,_d, ...other] = basename.split('-')
    const slug = other.join('-')

    await fs.mkdir(`content/posts2/${_y}`, { recursive: true })
    await fs.mkdir(`content/posts2/${_y}/${_m}`, { recursive: true })
    await fs.mkdir(`content/posts2/${_y}/${_m}/${_d}`, { recursive: true })
    await fs.mkdir(`content/posts2/${_y}/${_m}/${_d}/${slug}`, { recursive: true })

    const markdown_content = await fs.readFile(file_path, 'utf8')

    // "title:" を検索してその次の行に "slug:" がなければ追加する
    const next_markdown_content = markdown_content.replace(/title:.*\n/, (match) => {
      if (markdown_content.match(/slug:/)) {
        return match
      }
      return `${match}slug: ${slug}\n`
    })

    // image: が存在すればそのパスを取得
    let image_relative_path = next_markdown_content.match(/image: (.*)/)?.[1]

    if(image_relative_path) {
      const [_bl, _assets, _img, _posts, _y, _m, _d, ...other] = image_relative_path.split('/')
      image_relative_path = '.' + image_relative_path.replace('assets', 'static')
      const ext = image_relative_path.split('.').slice(-1)[0]
      const image_target = `content/posts2/${_y}/${_m}/${_d}/${slug}/featured.${ext}`

      await fs.copyFile(image_relative_path, image_target)
    }
    await fs.copyFile(file_path, `content/posts2/${_y}/${_m}/${_d}/${slug}/index.md`)
  }
}

main()
