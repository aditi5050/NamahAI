// Workflow type definitions

import { Node, Edge } from "reactflow";

// Custom node data types with index signature for React Flow compatibility
export interface TextNodeData {
  label: string;
  content: string;
  [key: string]: unknown;
}

export interface ImageNodeData {
  label: string;
  imageUrl: string | null;
  imageBase64: string | null;
  [key: string]: unknown;
}

export interface LLMNodeData {
  label: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  response: string | null;
  generatedImage: string | null; // Base64 image from Clipdrop
  isLoading: boolean;
  error: string | null;
  imageInputCount?: number; // Number of image input handles (default: 1)
  [key: string]: unknown;
}

export interface CropNodeData {
  label: string;
  x_percent: number;
  y_percent: number;
  width_percent: number;
  height_percent: number;
  imageUrl: string | null;
  [key: string]: unknown;
}

export interface ExtractNodeData {
  label: string;
  timestamp: string;
  videoUrl: string | null;
  [key: string]: unknown;
}

export interface VideoNodeData {
  label: string;
  videoUrl: string | null;
  fileName: string | null;
  [key: string]: unknown;
}

// Union type for all node data
export type WorkflowNodeData = TextNodeData | ImageNodeData | LLMNodeData | CropNodeData | ExtractNodeData | VideoNodeData;

// Custom node types
export type TextNode = Node<TextNodeData, "text">;
export type ImageNode = Node<ImageNodeData, "image">;
export type LLMNode = Node<LLMNodeData, "llm">;
export type CropNode = Node<CropNodeData, "crop">;
export type ExtractNode = Node<ExtractNodeData, "extract">;
export type VideoNode = Node<VideoNodeData, "video">;

export type WorkflowNode = TextNode | ImageNode | LLMNode | CropNode | ExtractNode | VideoNode;

// Workflow state
export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

// API types
export interface LLMRequest {
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  images?: string[]; // base64 encoded images
}

export interface LLMResponse {
  success: boolean;
  content?: string;
  image?: string; // base64 generated image from Clipdrop
  error?: string;
}

// Supported Gemini models with vision (text + image input)
export const GEMINI_MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
  { id: "gemini-2-flash", name: "Gemini 2 Flash" },
] as const;

export type GeminiModel = (typeof GEMINI_MODELS)[number]["id"];
