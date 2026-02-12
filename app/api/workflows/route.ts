import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const workflows = await prisma.workflow.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Failed to list workflows:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }


  try {
    const { name, definition } = await req.json();

    const workflow = await prisma.workflow.create({
      data: {
        userId: userId,
        name: name || 'Untitled Workflow',
        definition: definition || { nodes: [], edges: [] },
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Failed to create workflow:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
