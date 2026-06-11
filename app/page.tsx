import { readdirSync } from 'fs'
import path from 'path'
import Hero from '@/components/landing/Hero'
import NavCards from '@/components/landing/NavCards'

function getPhotos(): string[] {
  const dir = path.join(process.cwd(), 'public', 'photos')
  try {
    return readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .map(f => `/photos/${encodeURIComponent(f)}`)
  } catch {
    return []
  }
}

export default function Home() {
  const photos = getPhotos()
  return (
    <>
      <Hero photos={photos} />
      <NavCards />
    </>
  )
}
