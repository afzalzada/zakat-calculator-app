// src/ai/flows/zakat-calculation.ts
'use server';
/**
 * @fileOverview Zakat liability calculation flow for a specific asset type.
 * It takes an asset type, its value, optional notes, and a Madhab selection,
 * and calculates the Zakat liability based on the specific rules for that asset.
 *
 * - calculateZakatForAsset - A function that initiates the Zakat calculation process for a single asset.
 * - CalculateZakatForAssetInput - The input type for the calculateZakatForAsset function.
 * - CalculateZakatForAssetOutput - The return type for the calculateZakatForAsset function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const assetTypes = [
  'Gold',
  'Silver',
  'Cash & Savings',
  'Investments',
  'Livestock',
  'Agriculture',
] as const;

const CalculateZakatForAssetInputSchema = z.object({
  assetType: z.enum(assetTypes).describe('The type of asset for Zakat calculation.'),
  value: z
    .number()
    .describe(
      'The monetary value or count of the asset (e.g., value of gold, number of sheep).'
    ),
  notes: z
    .string()
    .optional()
    .describe(
      'Optional user-provided notes for more context, e.g., "rain-irrigated land" for agriculture or "40 sheep" for livestock.'
    ),
  madhab: z
    .enum(['Hanafi', 'Maliki', 'Shafi’i', 'Hanbali'])
    .describe('The Madhab to follow for Zakat calculation rules.'),
});
export type CalculateZakatForAssetInput = z.infer<typeof CalculateZakatForAssetInputSchema>;

const CalculateZakatForAssetOutputSchema = z.object({
  zakatLiability: z.number().describe('The total Zakat liability calculated for the given asset.'),
  explanation: z
    .string()
    .describe(
      'A detailed explanation of how the Zakat liability was calculated, including the Nisab, Zakat rate, and any specific rules for the asset type and Madhab.'
    ),
});
export type CalculateZakatForAssetOutput = z.infer<typeof CalculateZakatForAssetOutputSchema>;

export async function calculateZakatForAsset(
  input: CalculateZakatForAssetInput
): Promise<CalculateZakatForAssetOutput> {
  return calculateZakatForAssetFlow(input);
}

const calculateZakatForAssetPrompt = ai.definePrompt({
  name: 'calculateZakatForAssetPrompt',
  input: {schema: CalculateZakatForAssetInputSchema},
  output: {schema: CalculateZakatForAssetOutputSchema},
  prompt: `You are an expert in Islamic finance, specializing in Zakat calculation according to different Madhabs.

  A user wants to calculate Zakat for a specific asset.
  - Asset Type: {{{assetType}}}
  - Value / Count: {{{value}}}
  - Madhab: {{{madhab}}}
  {{#if notes}}
  - Additional Notes: {{{notes}}}
  {{/if}}

  Your task is to calculate the Zakat liability for this single asset. You must follow the specific rules for the given asset type according to the selected Madhab.

  - For 'Gold', 'Silver', 'Cash & Savings', and 'Investments', the standard Zakat rate is 2.5% if the value is above the Nisab threshold. The Nisab is the value of 85g of gold or 595g of silver. State the assumed Nisab value you are using.
  - For 'Agriculture' (Ushr), the Zakat rate is 10% on produce from naturally (rain) irrigated land and 5% from artificially irrigated land. The Nisab is approximately 653 kg. Use the 'notes' field to determine the irrigation type if provided.
  - For 'Livestock' (An'am), the rules are specific to the type and number of animals. For example, for sheep/goats, the Nisab is 40 animals, and the Zakat is 1 sheep for 40-120 sheep. Use the 'notes' to understand the context. The 'value' field will represent the count of animals. The Zakat liability should be expressed in terms of the number and type of animals due, and then also provide an estimated monetary value. For the purpose of the 'zakatLiability' field in the output, provide the monetary value.

  Provide a clear and concise explanation of the calculation. This should include:
  1. The Nisab for the asset type.
  2. Whether the user's asset meets the Nisab.
  3. The Zakat rate applied.
  4. The final calculated Zakat amount.

  Return the total zakatLiability (as a number, without currency symbols) and a detailed explanation.
  `,
});

const calculateZakatForAssetFlow = ai.defineFlow(
  {
    name: 'calculateZakatForAssetFlow',
    inputSchema: CalculateZakatForAssetInputSchema,
    outputSchema: CalculateZakatForAssetOutputSchema,
  },
  async input => {
    const {output} = await calculateZakatForAssetPrompt(input);
    return output!;
  }
);
