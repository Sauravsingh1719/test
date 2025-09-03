// app/api/tests/category/[categoryId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Test from '@/models/Test';
import { getToken } from 'next-auth/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    await dbConnect();
    
    const token = await getToken({ req: request });
    if (!token || (token.role !== 'teacher' && token.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Build search filter
    const searchFilter = search ? {
      title: { $regex: search, $options: 'i' }
    } : {};
    
    // Get tests with pagination
    const tests = await Test.find({
      category: params.categoryId,
      ...searchFilter
    })
    .select('title description duration questions createdAt')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    // Get total count for pagination
    const total = await Test.countDocuments({
      category: params.categoryId,
      ...searchFilter
    });
    
    return NextResponse.json({
      tests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Tests by category API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}