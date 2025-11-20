'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  input: {schema: GetContextualHelpInputSchema},
  output: {schema: GetContextualHelpOutputSchema},
  prompt: `You are a help chatbot that provides contextual information based on the user's current page and tasks.

  Current Page: {{{pageName}}}
  Tasks: {{#each tasks}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Notes: {{{notes}}}

  Answer the following question:
  {{{question}}}`,
});

const contextualHelpChatbotFlow = ai.defineFlow(
  {
    name: 'contextualHelpChatbotFlow',
    inputSchema: GetContextualHelpInputSchema,
    outputSchema: GetContextualHelpOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
