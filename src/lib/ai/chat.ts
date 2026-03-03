// AI chat client
// Placeholder - to be implemented in future stories

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  userId?: string;
  currentProduct?: string;
  conversationHistory: ChatMessage[];
}

export async function sendChatMessage(message: string, context?: ChatContext): Promise<string> {
  // TODO: Implement with Groq AI
  return 'AI response placeholder';
}

export async function getSizingAdvice(measurements: Record<string, number>, productCategory: string): Promise<string> {
  // TODO: Implement with Groq AI
  return 'Size advice placeholder';
}

export async function checkProductAvailability(productName: string): Promise<boolean> {
  // TODO: Implement with Groq AI + database
  return true;
}
