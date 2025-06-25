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
  'Business Assets',
  'Livestock',
  'Agriculture',
  'Rikaz (Treasure)',
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
  nisabMet: z.boolean().describe('Whether the Nisab threshold has been met by the user.'),
  hawlMet: z.boolean().describe('Whether the Hawl (one lunar year of possession) has been completed.'),
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
  - User claims Nisab is met: {{{nisabMet}}}
  - User claims Hawl (1 Year) is met: {{{hawlMet}}}
  {{#if notes}}
  - Additional Notes: {{{notes}}}
  {{/if}}

  Your task is to calculate the Zakat liability for this single asset based on the user's input.

  - First, analyze the conditions. If 'nisabMet' is false for any asset that requires it, Zakat is not due. The zakatLiability must be 0, and the explanation should state this is the reason.
  - If 'hawlMet' is false for assets that require it (Gold, Silver, Cash, Investments, Business Assets, Livestock), Zakat is not due. The zakatLiability must be 0, and the explanation should state this is the reason.
  - Note: 'Agriculture' and 'Rikaz (Treasure)' do not have a Hawl requirement. Their Zakat is due upon harvest/discovery if Nisab is met (for Agriculture). 'Rikaz' has no Nisab requirement.

  If Zakat is due based on the conditions being met:
  - For 'Gold', 'Silver', 'Cash & Savings', 'Investments', and 'Business Assets', the standard Zakat rate is 2.5%. State the assumed Nisab value you are using for confirmation. For 'Business Assets', the value should be net current assets (inventory, receivables, cash) after deducting short-term liabilities.
  - For 'Agriculture' (Ushr), the Zakat rate is 10% on produce from naturally (rain) irrigated land and 5% from artificially irrigated land. The Nisab is approximately 653 kg. Use the 'notes' field to determine the irrigation type if provided.
  - For 'Livestock' (An'am), the rules are specific to the type and number of animals. For example, for sheep/goats, the Nisab is 40 animals, and the Zakat is 1 sheep for 40-120 sheep. Use the 'notes' to understand the context. The 'value' field will represent the count of animals. The Zakat liability should be expressed in terms of the number and type of animals due, and then also provide an estimated monetary value. For the purpose of the 'zakatLiability' field in the output, provide the monetary value.
  - For 'Rikaz (Treasure)', the rate is a flat 20% of the value. There is no Nisab or Hawl requirement.

  Provide a clear and concise explanation for the result.
  - If Zakat is not due, explain which condition (Nisab or Hawl) was not met.
  - If Zakat is due, your explanation should include:
    1. The Nisab for the asset type (if applicable).
    2. Confirmation that the user's wealth meets the conditions.
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
