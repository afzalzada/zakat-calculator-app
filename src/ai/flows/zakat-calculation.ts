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
  - User claims Hawl (1 Year) is met: {{{hawlMet}}}
  {{#if notes}}
  - Additional Notes: {{{notes}}}
  {{/if}}

  Your task is to calculate the Zakat liability for this single asset based on the user's input.

  IMPORTANT: For 'Gold', 'Silver', 'Cash & Savings', 'Investments', and 'Business Assets', the Nisab threshold has already been checked and verified on the client side. You can assume it has been met. Your role is to proceed directly with the calculation and provide a clear explanation.

  For 'Livestock' and 'Agriculture', you still need to determine if the Nisab is met based on the details provided in 'value' (count) and 'notes'.
  - For 'Agriculture', the Nisab is approximately 653 kg of produce. You should evaluate if the provided 'value' (which could be monetary value or quantity) meets this threshold.
  - For 'Livestock' (An'am), the rules are specific to the type and number of animals. For example, for sheep/goats, the Nisab is 40 animals.
  - If Nisab is not met for these types, zakatLiability must be 0 and the explanation should state why.

  'Rikaz (Treasure)' has no Nisab requirement.

  Next, analyze the Hawl condition. If 'hawlMet' is false for assets that require it (Gold, Silver, Cash, Investments, Business Assets, Livestock), Zakat is not due. The zakatLiability must be 0, and the explanation should state this is the reason. Note: 'Agriculture' and 'Rikaz (Treasure)' do not have a Hawl requirement.

  If Zakat is due:
  - For 'Gold', 'Silver', 'Cash & Savings', 'Investments', and 'Business Assets', apply the standard Zakat rate of 2.5%. For 'Business Assets', the value should be net current assets.
  - For 'Agriculture' (Ushr), the Zakat rate is 10% on produce from naturally (rain) irrigated land and 5% from artificially irrigated land. Use the 'notes' field to determine the irrigation type.
  - For 'Livestock' (An'am), the rules are specific to the type and number of animals. For example, for sheep/goats, the Zakat is 1 sheep for 40-120 sheep. The 'value' field represents the count of animals. The Zakat liability should be an estimated monetary value.
  - For 'Rikaz (Treasure)', the rate is a flat 20% of the value.

  Provide a clear and concise explanation for the result.
  - If Zakat is not due, explain which condition (Nisab or Hawl) was not met.
  - If Zakat is due, your explanation should include:
    1. Confirmation that Nisab and Hawl (if applicable) were met. Even for assets where Nisab was pre-checked, briefly mention it as a fulfilled condition.
    2. The Zakat rate applied.
    3. The final calculated Zakat amount.

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
