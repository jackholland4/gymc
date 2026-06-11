import { NextResponse } from 'next/server'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const DATA_FILE = join(process.cwd(), 'public', 'data', 'rankings.json')

export async function GET() {
  if (!existsSync(DATA_FILE)) {
    return NextResponse.json(
      { error: 'Rankings not yet computed. Run rankings_compute.py first.' },
      { status: 404 }
    )
  }
  const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  })
}
