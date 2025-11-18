import { NextRequest, NextResponse } from 'next/server'
import { updatePreferenceProfile } from '@/services/memberService'
import { updatePreferenceProfileSchema } from '@/lib/validation'

/**
 * PUT /api/members/[id]/preferences
 * Update member's preference profile
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = updatePreferenceProfileSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const preferenceProfile = await updatePreferenceProfile(params.id, validationResult.data)

    return NextResponse.json(preferenceProfile)
  } catch (error: any) {
    console.error('Error updating preference profile:', error)
    return NextResponse.json(
      { error: 'Failed to update preference profile', details: error.message },
      { status: 500 }
    )
  }
}
