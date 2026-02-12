import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { runWorkflowEngine } from '@/lib/engine';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { workflowId, inputs } = body;

    if (!workflowId) {
      return new NextResponse("Workflow ID required", { status: 400 });
    }

    // Verify ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true }
    });

    if (!workflow) return new NextResponse("Not Found", { status: 404 });
    if (workflow.userId !== userId) return new NextResponse("Forbidden", { status: 403 });

    // Create Run Record
    const run = await prisma.workflowRun.create({
      data: {
        workflowId,
        userId,
        status: 'PENDING',
        // Initialize node executions
        nodeExecutions: {
          create: workflow.nodes.map((node: any) => ({
            nodeId: node.id,
            status: 'PENDING'
          }))
        }
      }
    });

    // Fire and forget execution logic so we return runId immediately
    runWorkflowEngine(run.id, inputs).catch(err => {
      console.error("Failed to trigger workflow", err);
    });

    return NextResponse.json({ runId: run.id });
  } catch (error) {
    console.error("[RUN_START]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

