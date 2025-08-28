import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
    // Get the path to revalidate from query parameters
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('article')

    // Revalidate the specified path
    revalidatePath(`/article/${articleId}`)

    revalidatePath("/article/[id]", "layout")
    
    revalidatePath("/article/[id]", "page")

    return NextResponse.json({
      success: true,
      message: 'Revalidated!',
      revalidatedPath: `/article/${articleId}`
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to revalidate path' },
      { status: 500 }
    )
  }
}