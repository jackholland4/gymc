import Hero from '@/components/landing/Hero'
import NavCards from '@/components/landing/NavCards'

// Curated high-quality photos confirmed from camera EXIF or large professional resolution.
// WAG (12): abigail-martin, kate-sayer, qinqin-ke, julia-soares, emma-yap,
//           floor-slooff, alice-damato, silja-stohr, aiko-sugihara, lena-khenoun,
//           kaylia-nemour, hezly-rivera
// MAG (9):  ilia-kovtun, rhys-mcclenaghan, zhang-boheng, alex-istock, felix-dolci,
//           tanigawa-wataru, shane-wiskus, daiki-hashimoto, fred-richard
const HERO_PHOTOS = [
  // WAG
  '/photos/abigail-martin.jpg',                                          // Canon EOS R3  — 5265×3580
  '/photos/kate-sayer.jpg',                                              // Nikon D5       — 3358×2238
  '/photos/qinqin-ke.jpg',                                               // 2048×1365
  '/photos/julia-soares.avif',                                           // 1920×1080
  '/photos/emma-yap.webp',                                               // 5000×3333
  '/photos/floor-slooff.jpeg',                                           // 4198×2570
  '/photos/alice-damato.webp',                                           // 4267×2410
  '/photos/silja-stohr.jpg',                                             // 2048×1366
  '/photos/aiko-sugihara.jpg',                                           // 2560×1706
  '/photos/lena-khenoun.jpg',                                            // 2560×1707
  '/photos/kaylia-nemour.avif',                                          // 2440×1372
  '/photos/hezly-rivera.avif',                                           // 2440×1372
  // MAG
  '/photos/ilia-kovtun.jpg',                                             // 5436×3624
  '/photos/rhys-mcclenaghan.jpg',                                        // 3840×2159
  '/photos/zhang-boheng.jpg',                                            // 2182×2728
  '/photos/alex-istock.jpeg',                                            // 2387×1821
  '/photos/felix-dolci.jpeg',                                            // 2048×1365
  '/photos/tanigawa-wataru.jpeg',                                        // 2048×1365
  '/photos/shane-wiskus.jpg',                                            // 2560×1440
  '/photos/daiki-hashimoto.jpg',                                         // 2048×1365
  '/photos/fred-richard.jpg',                                            // 1500×1000
]

export default function Home() {
  return (
    <>
      <Hero photos={HERO_PHOTOS} />
      <NavCards />
    </>
  )
}
