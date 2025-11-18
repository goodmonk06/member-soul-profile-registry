import { NextRequest, NextResponse } from 'next/server'
import { updateSoulProfile } from '@/services/memberService'
import { updateSoulProfileSchema } from '@/lib/validation'

/**
 * PUT /api/members/[id]/soul
 * Update member's soul profile
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = updateSoulProfileSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const soulProfile = await updateSoulProfile(params.id, validationResult.data)

    return NextResponse.json(soulProfile)
  } catch (error: any) {
    console.error('Error updating soul profile:', error)
    return NextResponse.json(
      { error: 'Failed to update soul profile', details: error.message },
      { status: 500 }
    )
  }
}
