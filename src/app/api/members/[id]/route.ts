import { NextRequest, NextResponse } from 'next/server'
import { getMemberById, deleteMember } from '@/services/memberService'

/**
 * GET /api/members/[id]
 * Get a single member by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await getMemberById(params.id)

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error: any) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/members/[id]
 * Delete a member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteMember(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting member:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete member', details: error.message },
      { status: 500 }
    )
  }
}
