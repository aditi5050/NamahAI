import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Server-Sent Events streaming for real-time run updates
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const runId = params.id;

    // Verify the user owns this run
    const run = await prisma.workflowRun.findUnique({
      where: { id: runId },
      include: {
        workflow: true,
      },
    });

    if (!run) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (run.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Create SSE stream
    const encoder = new TextEncoder();

    const customReadable = new ReadableStream({
      async start(controller) {
        let isStreamClosed = false;
        let interval: NodeJS.Timeout | null = null;

        const closeStream = () => {
            if (!isStreamClosed) {
                isStreamClosed = true;
                if (interval) clearInterval(interval);
                try {
                    controller.close();
                } catch (e) {
                    // Ignore errors if controller is already closed
                    console.error("Error closing controller", e);
                }
            }
        };

        const safeEnqueue = (data: string) => {
            if (isStreamClosed) return;
            try {
                controller.enqueue(encoder.encode(data));
            } catch (e) {
                console.error("Error enqueuing to stream", e);
                closeStream();
            }
        };

        // Send initial state
        const initialRun = await prisma.workflowRun.findUnique({
          where: { id: runId },
          include: {
            nodeExecutions: {
              include: {
                node: {
                  select: {
                    id: true,
                    label: true,
                    type: true,
                  },
                },
              },
            },
          },
        });

        // Track state of each node to detect changes reliably
        const nodeStateMap = new Map<string, { status: string; completedAt: number | null }>();

        if (initialRun) {
          initialRun.nodeExecutions.forEach((exec) => {
            nodeStateMap.set(exec.nodeId, {
              status: exec.status,
              completedAt: exec.completedAt ? new Date(exec.completedAt).getTime() : null,
            });
          });

          safeEnqueue(
              `data: ${JSON.stringify({
                type: "init",
                run: initialRun,
              })}\n\n`
          );
        }

        // Poll for updates every 500ms
        interval = setInterval(async () => {
          if (isStreamClosed) return;

          try {
            const updatedRun = await prisma.workflowRun.findUnique({
              where: { id: runId },
              include: {
                nodeExecutions: {
                  include: {
                    node: {
                      select: {
                        id: true,
                        label: true,
                        type: true,
                      },
                    },
                  },
                },
              },
            });

            if (!updatedRun) {
              safeEnqueue(
                  `data: ${JSON.stringify({
                    type: "error",
                    error: "Run not found",
                  })}\n\n`
              );
              closeStream();
              return;
            }

            // Send updates for changed nodes
            const updates = updatedRun.nodeExecutions
              .filter((exec) => {
                const prevState = nodeStateMap.get(exec.nodeId);
                const currentCompletedAt = exec.completedAt ? new Date(exec.completedAt).getTime() : null;
                
                const hasChanged = 
                    !prevState || 
                    prevState.status !== exec.status ||
                    prevState.completedAt !== currentCompletedAt;

                if (hasChanged) {
                    nodeStateMap.set(exec.nodeId, {
                        status: exec.status,
                        completedAt: currentCompletedAt
                    });
                    return true;
                }
                return false;
              })
              .map((exec: any) => ({
                nodeId: exec.nodeId,
                status: exec.status,
                output: exec.outputs,
                error: exec.error,
                duration: exec.duration,
                node: exec.node,
              }));

            if (updates.length > 0) {
              safeEnqueue(
                  `data: ${JSON.stringify({
                    type: "nodeUpdates",
                    updates,
                  })}\n\n`
              );
            }

            // Check if run is complete
            if (
              updatedRun.status === "COMPLETED" ||
              updatedRun.status === "FAILED" ||
              updatedRun.status === "CANCELLED"
            ) {
              safeEnqueue(
                  `data: ${JSON.stringify({
                    type: "runComplete",
                    run: updatedRun,
                  })}\n\n`
              );
              
              // Wait slightly before closing to ensure client receives the message
              setTimeout(() => closeStream(), 1000);
              // Clear interval immediately to prevent further polling
              if (interval) {
                clearInterval(interval);
              }
            }
          } catch (error) {
            console.error("[SSE_ERROR]", error);
            closeStream();
          }
        }, 500);

        // Cleanup on client disconnect
        req.signal.addEventListener("abort", () => {
          closeStream();
        });
      },
    });

    return new NextResponse(customReadable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[RUN_STREAM]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
