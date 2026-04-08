import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import ReactPDF, { Document } from '@react-pdf/renderer'
import { NeurReportPDF } from '@/components/pdf/NeurReportPDF'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const analysisId = searchParams.get('id')

  if (!analysisId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch analysis
  const { data: analysis, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', analysisId)
    .eq('user_id', user.id)
    .single()

  if (error || !analysis) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fetch live data
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const [censusRes, blsRes] = await Promise.all([
    analysis.preferred_state
      ? fetch(`${base}/api/census?state=${encodeURIComponent(analysis.preferred_state)}`)
      : null,
    analysis.industry_preference
      ? fetch(`${base}/api/bls?industry=${encodeURIComponent(analysis.industry_preference)}`)
      : null,
  ])

  const censusData = censusRes ? await censusRes.json() : null
  const blsData = blsRes ? await blsRes.json() : null

  // Generate PDF
  const element = createElement(NeurReportPDF, { analysis, censusData, blsData }) as unknown as ReactElement<DocumentProps, typeof Document>
  const pdfStream = await ReactPDF.renderToStream(element)

  return new NextResponse(pdfStream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="neur-report-${analysisId.slice(0, 8)}.pdf"`,
    },
  })
}
