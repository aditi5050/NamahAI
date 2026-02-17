import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { saveWorkflowSchema } from "@/lib/validations/api";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const body = await req.json();

    // Validate with Zod
    const parsed = saveWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, definition } = parsed.data;

    // Ensure user exists in database (create if not exists)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `user-${userId}@placeholder.com`, // Placeholder email
      },
    });

    // Find or create workflow
    let workflow = await prisma.workflow.findUnique({
      where: { id: params.id },
    });

    if (!workflow) {
      // Create new workflow if it doesn't exist
      workflow = await prisma.workflow.create({
        data: {
          id: params.id,
          name: name || 'Untitled Workflow',
          definition,
          userId,
        },
      });
    } else if (workflow.userId !== userId) {
      // Verify ownership if workflow exists
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Use transaction to ensure atomic save (increased timeout for slower connections)
    const updatedWorkflow = await prisma.$transaction(async (tx) => {
      // Delete existing nodes and edges (must delete in correct order due to FK constraints)
      // First, get all node IDs for this workflow
      const existingNodes = await tx.workflowNode.findMany({
        where: { workflowId: params.id },
        select: { id: true },
      });
      const nodeIds = existingNodes.map(n => n.id);

      // Delete NodeExecutions that reference these nodes
      if (nodeIds.length > 0) {
        await tx.nodeExecution.deleteMany({
          where: { nodeId: { in: nodeIds } },
        });
      }

      // Delete edges first (they reference nodes)
      await tx.workflowEdge.deleteMany({
        where: { workflowId: params.id },
      });

      // Delete nodes
      await tx.workflowNode.deleteMany({
        where: { workflowId: params.id },
      });

      // Create all nodes first
      if (definition.nodes && definition.nodes.length > 0) {
        await tx.workflowNode.createMany({
          data: definition.nodes.map((node: any) => {
            // Clone node data but exclude large base64 fields from database
            // These will be re-processed at execution time
            const config = { ...node.data };
            
            // Strip ALL large base64 data to prevent transaction timeouts
            // Video data URLs can be 10+ MB and cause 88s+ transaction times
            if (config.videoUrl && config.videoUrl.startsWith('data:')) {
              delete config.videoUrl; // Too large for DB, user must re-upload
            }
            if (config.imageBase64) {
              delete config.imageBase64; // Use imageUrl instead
            }
            // Keep extractedFrameUrl and croppedImageUrl - they're smaller after compression
            // But strip if they're too large (> 500KB)
            if (config.extractedFrameUrl && config.extractedFrameUrl.length > 500000) {
              console.log('[SAVE] Stripping large extractedFrameUrl:', config.extractedFrameUrl.length);
              delete config.extractedFrameUrl;
            }
            if (config.croppedImageUrl && config.croppedImageUrl.length > 500000) {
              console.log('[SAVE] Stripping large croppedImageUrl:', config.croppedImageUrl.length);
              delete config.croppedImageUrl;
            }
            
            // Debug logging for extract nodes
            if (node.type === 'extract') {
              console.log('[SAVE] Extract node data:', {
                nodeId: node.id,
                hasExtractedFrameUrl: !!config.extractedFrameUrl,
                extractedFrameUrlLength: config.extractedFrameUrl?.length,
                configKeys: Object.keys(config),
              });
            }
            
            return {
              id: node.id,
              workflowId: params.id,
              type: node.type,
              label: config.label || node.type,
              config,
              positionX: node.position?.x || 0,
              positionY: node.position?.y || 0,
            };
          }),
        });
      }

      // Create all edges after nodes exist
      if (definition.edges && definition.edges.length > 0) {
        // Only create edges where both source and target nodes exist
        const nodeIdSet = new Set(definition.nodes.map((n: any) => n.id));
        const validEdges = definition.edges.filter((edge: any) => 
          nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target)
        );
        
        if (validEdges.length > 0) {
          await tx.workflowEdge.createMany({
            data: validEdges.map((edge: any) => ({
              workflowId: params.id,
              sourceId: edge.source,
              targetId: edge.target,
              sourceHandle: edge.sourceHandle || null,
              targetHandle: edge.targetHandle || null,
            })),
          });
        }
      }

      // Update workflow with new definition
      // Strip large base64 data from definition to avoid DB bloat
      const cleanDefinition = {
        ...definition,
        nodes: definition.nodes?.map((node: any) => {
          const cleanData = { ...node.data };
          if (cleanData.videoUrl && cleanData.videoUrl.startsWith('data:')) {
            delete cleanData.videoUrl;
          }
          if (cleanData.imageBase64) {
            delete cleanData.imageBase64;
          }
          if (cleanData.extractedFrameUrl && cleanData.extractedFrameUrl.length > 500000) {
            delete cleanData.extractedFrameUrl;
          }
          if (cleanData.croppedImageUrl && cleanData.croppedImageUrl.length > 500000) {
            delete cleanData.croppedImageUrl;
          }
          return { ...node, data: cleanData };
        }) || [],
      };
      
      return tx.workflow.update({
        where: { id: params.id },
        data: {
          name,
          definition: cleanDefinition,
          updatedAt: new Date(),
        },
      });
    }, {
      timeout: 120000, // 120 seconds timeout for slow remote databases
      maxWait: 15000, // Wait up to 15s to acquire connection
    });

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error("[WORKFLOW_SAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
