
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Define Sample Workflow Data
    const workflowId = uuidv4();
    const timestamp = new Date();

    // Node IDs
    const nodes = {
        uploadImage: uuidv4(),
        cropImage: uuidv4(),
        textSystem1: uuidv4(),
        textProduct: uuidv4(),
        llm1: uuidv4(),
        uploadVideo: uuidv4(),
        extractFrame: uuidv4(),
        textSystem2: uuidv4(),
        llm2: uuidv4(),
    };

    const sampleNodes = [
      // Branch A: Image Processing + Product Description
      {
        id: nodes.uploadImage,
        type: 'uploadImage',
        label: 'Upload Product Photo',
        positionX: 50,
        positionY: 50,
        config: {},
      },
      {
        id: nodes.cropImage,
        type: 'cropImage',
        label: 'Crop to Product',
        positionX: 50,
        positionY: 300,
        config: { x_percent: 10, y_percent: 10, width_percent: 80, height_percent: 80 },
      },
      {
        id: nodes.textSystem1,
        type: 'text',
        label: 'System Prompt (Copywriter)',
        positionX: 300,
        positionY: 50,
        config: { text: "You are a professional marketing copywriter. Generate a compelling one-paragraph product description." },
      },
      {
        id: nodes.textProduct,
        type: 'text',
        label: 'Product Details',
        positionX: 300,
        positionY: 200,
        config: { text: "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design." },
      },
      {
        id: nodes.llm1,
        type: 'llm',
        label: 'Generate Description',
        positionX: 300,
        positionY: 450,
        config: { model: 'gemini-2.5-flash', temperature: 0.7 },
      },
      
      // Branch B: Video Frame Extraction
      {
        id: nodes.uploadVideo,
        type: 'uploadVideo',
        label: 'Upload Demo Video',
        positionX: 600,
        positionY: 50,
        config: {},
      },
      {
        id: nodes.extractFrame,
        type: 'extractFrame',
        label: 'Extract Frame',
        positionX: 600,
        positionY: 300,
        config: { timestamp: "50%" },
      },

      // Convergence Point
      {
        id: nodes.textSystem2,
        type: 'text',
        label: 'System Prompt (Social Media)',
        positionX: 500,
        positionY: 600,
        config: { text: "You are a social media manager. Create a tweet-length marketing post based on the product image and video frame." },
      },
      {
        id: nodes.llm2,
        type: 'llm',
        label: 'Final Marketing Post',
        positionX: 500,
        positionY: 800,
        config: { model: 'gemini-2.5-pro', temperature: 0.8 },
      },
    ];

    const sampleEdges = [
        // Branch A Connections
        { id: uuidv4(), source: nodes.uploadImage, target: nodes.cropImage, sourceHandle: 'output', targetHandle: 'image_url' },
        { id: uuidv4(), source: nodes.cropImage, target: nodes.llm1, sourceHandle: 'output', targetHandle: 'images' },
        { id: uuidv4(), source: nodes.textSystem1, target: nodes.llm1, sourceHandle: 'output', targetHandle: 'system_prompt' },
        { id: uuidv4(), source: nodes.textProduct, target: nodes.llm1, sourceHandle: 'output', targetHandle: 'user_message' },

        // Branch B Connections
        { id: uuidv4(), source: nodes.uploadVideo, target: nodes.extractFrame, sourceHandle: 'output', targetHandle: 'video_url' },

        // Convergence Connections
        { id: uuidv4(), source: nodes.textSystem2, target: nodes.llm2, sourceHandle: 'output', targetHandle: 'system_prompt' },
        { id: uuidv4(), source: nodes.llm1, target: nodes.llm2, sourceHandle: 'output', targetHandle: 'user_message' },
        { id: uuidv4(), source: nodes.cropImage, target: nodes.llm2, sourceHandle: 'output', targetHandle: 'images' }, // Image 1
        { id: uuidv4(), source: nodes.extractFrame, target: nodes.llm2, sourceHandle: 'output', targetHandle: 'images' }, // Image 2
    ];

    // Create the workflow in the database
    const workflow = await prisma.workflow.create({
      data: {
        id: workflowId,
        userId: userId,
        name: "Product Marketing Kit (Sample)",
        description: "A sample workflow demonstrating parallel execution and multimodal AI.",
        definition: {}, // Can be empty or store ReactFlow specific view state
        nodes: {
            create: sampleNodes.map(node => ({
                id: node.id,
                type: node.type,
                label: node.label,
                positionX: node.positionX,
                positionY: node.positionY,
                config: node.config,
            }))
        },
        edges: {
            create: sampleEdges.map(edge => ({
                id: edge.id,
                sourceId: edge.source,
                targetId: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
            }))
        }
      },
    });

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error("[SAMPLE_WORKFLOW_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
