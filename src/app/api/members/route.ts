import { NextRequest, NextResponse } from 'next/server'
import { createMember, listMembers, getMemberByExternalId } from '@/services/memberService'
import { createMemberSchema } from '@/lib/validation'
import { LifeStage } from '@prisma/client'

/**
 * GET /api/members
 * List members with optional filtering and pagination
 * Query params: externalId, lifeStage, skip, take
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const externalId = searchParams.get('externalId')
    const lifeStage = searchParams.get('lifeStage') as LifeStage | null
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '50')

    // If externalId is provided, return single member
    if (externalId) {
      const member = await getMemberByExternalId(externalId)
      if (!member) {
        return NextResponse.json(
          { error: 'Member not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(member)
    }

    // Otherwise list members
    const result = await listMembers({
      skip,
      take,
      lifeStage: lifeStage || undefined,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/members
 * Create a new member
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = createMemberSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const member = await createMember(validationResult.data)

    return NextResponse.json(member, { status: 201 })
  } catch (error: any) {
    console.error('Error creating member:', error)

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Member with this external ID or email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create member', details: error.message },
      { status: 500 }
    )
  }
}
