import { NextRequest, NextResponse } from 'next/server'
import { getMemberTags, addTag, removeTag } from '@/services/tagService'
import { createTagSchema } from '@/lib/validation'

/**
 * GET /api/members/[id]/tags
 * Get all tags for a member
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tags = await getMemberTags(params.id)
    return NextResponse.json(tags)
  } catch (error: any) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/members/[id]/tags
 * Add a tag to a member
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const validationResult = createTagSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const tag = await addTag(
      params.id,
      validationResult.data.tag,
      validationResult.data.source
    )

    return NextResponse.json(tag, { status: 201 })
  } catch (error: any) {
    console.error('Error adding tag:', error)
    return NextResponse.json(
      { error: 'Failed to add tag', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/members/[id]/tags
 * Remove a tag from a member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tag = searchParams.get('tag')

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag parameter is required' },
        { status: 400 }
      )
    }

    await removeTag(params.id, tag)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing tag:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to remove tag', details: error.message },
      { status: 500 }
    )
  }
}
