'use server';
/**
 * @fileOverview Online AI chatbot using Google Gemini API
 * Works like ChatGPT with real AI responses
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetContextualHelpInputSchema = z.object({
  pageName: z.string().describe('The name of the current page the user is on.'),
  tasks: z.array(z.string()).describe('The list of tasks the user is currently working on.'),
  notes: z.string().optional().describe('Any notes the user has taken on the current page.'),
  question: z.string().describe('The user question about the current page.'),
});
export type GetContextualHelpInput = z.infer<typeof GetContextualHelpInputSchema>;

const GetContextualHelpOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type GetContextualHelpOutput = z.infer<typeof GetContextualHelpOutputSchema>;

export async function getContextualHelp(input: GetContextualHelpInput): Promise<GetContextualHelpOutput> {
  return contextualHelpChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualHelpChatbotPrompt',
  input: { schema: GetContextualHelpInputSchema },
  output: { schema: GetContextualHelpOutputSchema },
  prompt: `You are a friendly, helpful AI assistant for learning AI and programming. You're like ChatGPT but specialized in helping students learn.

**Your personality:**
- Conversational and friendly (use emojis occasionally 😊)
- Encouraging and supportive
- Clear and concise explanations
- Provide code examples when relevant
- Never robotic or template-like

**Context:**
Current Page: {{{pageName}}}
Tasks: {{#each tasks}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if notes}}Notes: {{{notes}}}{{/if}}

**User Question:**
{{{question}}}

**Instructions:**
1. Answer naturally and conversationally
2. If it's a coding question, provide working code examples with comments
3. Relate your answer to their current learning topic when relevant
4. Be encouraging and supportive
5. Keep responses focused but comprehensive
6. Use markdown formatting for code blocks
7. Vary your responses - don't be repetitive

Answer the question in a helpful, friendly way:`,
});

const contextualHelpChatbotFlow = ai.defineFlow(
  {
    name: 'contextualHelpChatbotFlow',
    inputSchema: GetContextualHelpInputSchema,
    outputSchema: GetContextualHelpOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
