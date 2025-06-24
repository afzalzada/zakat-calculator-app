// src/ai/flows/zakat-calculation.ts
'use server';
/**
 * @fileOverview Zakat liability calculation flow. It takes asset inputs and a Madhab selection,
 * and calculates the Zakat liability based on the inputs and the selected religious guidelines.
 *
 * - calculateZakatLiability - A function that initiates the Zakat calculation process.
 * - CalculateZakatLiabilityInput - The input type for the calculateZakatLiability function.
 * - CalculateZakatLiabilityOutput - The return type for the calculateZakatLiability function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateZakatLiabilityInputSchema = z.object({
  cash: z.number().describe('Total cash savings.'),
  gold: z.number().describe('Total value of gold assets.'),
  investments: z.number().describe('Total value of investments.'),
  madhab: z
    .enum(['Hanafi', 'Maliki', 'Shafi’i', 'Hanbali'])
    .describe('The Madhab to follow for Zakat calculation rules.'),
});
export type CalculateZakatLiabilityInput = z.infer<
  typeof CalculateZakatLiabilityInputSchema
>;

const CalculateZakatLiabilityOutputSchema = z.object({
  zakatLiability: z
    .number()
    .describe('The total Zakat liability calculated based on the inputs and Madhab.'),
  explanation: z
    .string()
    .describe('A detailed explanation of how the Zakat liability was calculated.'),
});
export type CalculateZakatLiabilityOutput = z.infer<
  typeof CalculateZakatLiabilityOutputSchema
>;

export async function calculateZakatLiability(
  input: CalculateZakatLiabilityInput
): Promise<CalculateZakatLiabilityOutput> {
  return calculateZakatLiabilityFlow(input);
}

const calculateZakatLiabilityPrompt = ai.definePrompt({
  name: 'calculateZakatLiabilityPrompt',
  input: {schema: CalculateZakatLiabilityInputSchema},
  output: {schema: CalculateZakatLiabilityOutputSchema},
  prompt: `You are an expert in Islamic finance, specializing in Zakat calculation according to different Madhabs.

  Based on the user's asset inputs (cash: {{{cash}}}, gold: {{{gold}}}, investments: {{{investments}}}) and their chosen Madhab ({{{madhab}}}), calculate their total Zakat liability.

  Provide a clear and concise explanation of the calculation, including any specific rules or considerations based on the selected Madhab.

  Ensure the final Zakat liability is accurate and aligns with the religious guidelines of the chosen Madhab.

  Return the total zakatLiability and a detailed explanation.
  Remember that these values are in the local currency, so do not include currency symbols in your output.
  `,
});

const calculateZakatLiabilityFlow = ai.defineFlow(
  {
    name: 'calculateZakatLiabilityFlow',
    inputSchema: CalculateZakatLiabilityInputSchema,
    outputSchema: CalculateZakatLiabilityOutputSchema,
  },
  async input => {
    const {output} = await calculateZakatLiabilityPrompt(input);
    return output!;
  }
);
