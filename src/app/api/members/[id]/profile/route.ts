import { NextRequest, NextResponse } from 'next/server'
import { getAggregatedSoulProfile } from '@/services/memberService'

/**
 * GET /api/members/[id]/profile
 * Get aggregated soul profile with insights
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await getAggregatedSoulProfile(params.id)

    if (!profile) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(profile)
  } catch (error: any) {
    console.error('Error fetching aggregated profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    )
  }
}
