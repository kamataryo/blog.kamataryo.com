import fs from 'fs/promises'

const geojson_map = {}
const geojson_recursive_search = async (base_dir = './geojson') => {
  const dirents = await fs.readdir(base_dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const target_path = `${base_dir}/${dirent.name}`
    if(dirent.isDirectory()) {
      await geojson_recursive_search(target_path)
    } else {
      const [year, month, date, ...others] = dirent.name.split('-')
      const slug = others.join('-').replace('.geojson', '')
      geojson_map[slug] = target_path
    }
  }
}

const post_map = {}
const post_recursive_search = async (base_dir = './content/posts') => {
  const dirents = await fs.readdir(base_dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const target_path = `${base_dir}/${dirent.name}`
    if(dirent.isDirectory()) {
      await post_recursive_search(target_path)
    } else {
      if(dirent.name.endsWith('.md')) {
        const dir_parts = base_dir.split('/')
        const slug = dir_parts.pop()
        post_map[slug] = base_dir
      }
    }
  }
}

await Promise.all([
  geojson_recursive_search(),
  post_recursive_search(),
])

for (const slug in geojson_map) {
  const geojson_path = geojson_map[slug]
  const post_path = post_map[slug]
  if(post_path) {
    const dest = `${post_path}/track.geojson`
    await fs.copyFile(geojson_path, dest)
    console.log({geojson_path, dest})
  } else {
    throw new Error(`存在せんで: ${slug}`)
  }
}

