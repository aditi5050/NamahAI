import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { definition, name } = await req.json();


    const workflow = await prisma.workflow.update({
      where: {
        id: params.id,
        userId: userId,
      },
      data: {
        definition: definition,
        name: name,
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Failed to save workflow:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
