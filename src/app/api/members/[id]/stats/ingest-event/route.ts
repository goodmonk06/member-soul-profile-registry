import { NextRequest, NextResponse } from 'next/server'
import { ingestStatsEvent } from '@/services/statsService'
import { ingestStatsEventSchema } from '@/lib/validation'

/**
 * POST /api/members/[id]/stats/ingest-event
 * Ingest a stats event for a member
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = ingestStatsEventSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const stats = await ingestStatsEvent(params.id, {
      type: validationResult.data.type,
      metadata: validationResult.data.metadata,
    })

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error ingesting stats event:', error)
    return NextResponse.json(
      { error: 'Failed to ingest event', details: error.message },
      { status: 500 }
    )
  }
}
