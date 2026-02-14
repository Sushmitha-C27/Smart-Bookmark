import { NextResponse } from 'next/server'
import { getLinkPreview } from 'link-preview-js'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    const data: any = await getLinkPreview(url, {
      followRedirects: 'follow',
      headers: { "user-agent": "googlebot" } // Helps bypass some bot blockers
    })

    return NextResponse.json({
      title: data.title || '',
      description: data.description || '',
      image: data.images?.[0] || data.favicons?.[0] || ''
    })
  } catch (error) {
    console.error('Scraping error:', error)
    // Return empty fields instead of crashing so the user can still save the link
    return NextResponse.json({ title: '', description: '', image: '' })
  }
}