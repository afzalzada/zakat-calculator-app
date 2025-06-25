
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { jsPDF } from "jspdf"
import { TrendingUp, Wallet, Share, Download, Leaf, Store, Gem } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { CalculateZakatForAssetOutput } from "@/ai/flows/zakat-calculation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "./icons"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"


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

type AssetType = typeof assetTypes[number];
type LivestockType = 'Sheep/Goats' | 'Cattle' | 'Camels';
type AgriType = 'rain-fed' | 'artificially-irrigated';

const formSchema = z.object({
  assetType: z.enum(assetTypes),
  value: z.coerce.number().min(0, { message: "Value must be positive." }),
  notes: z.string().optional(),
  madhab: z.enum(['Hanafi', 'Maliki', 'Shafi’i', 'Hanbali']),
  hawlMet: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;
const currencies = [
    'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 
    'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 
    'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY', 
    'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 
    'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'FOK', 'GBP', 'GEL', 'GGP', 'GHS', 
    'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 
    'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 
    'JPY', 'KES', 'KGS', 'KHR', 'KID', 'KMF', 'KRW', 'KWD', 'KYD', 'KZT', 
    'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 
    'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 
    'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 
    'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 
    'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD', 
    'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 
    'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VES', 
    'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR', 
    'ZMW', 'ZWL'
];


const assetIcons: Record<AssetType, React.ReactNode> = {
    'Gold': <Icons.GoldBar className="w-5 h-5 text-primary" />,
    'Silver': <Icons.GoldBar className="w-5 h-5 text-gray-400" />,
    'Cash & Savings': <Wallet className="w-5 h-5 text-primary" />,
    'Investments': <TrendingUp className="w-5 h-5 text-primary" />,
    'Business Assets': <Store className="w-5 h-5 text-primary" />,
    'Livestock': <Icons.Sheep className="w-5 h-5 text-primary" />,
    'Agriculture': <Leaf className="w-5 h-5 text-primary" />,
    'Rikaz (Treasure)': <Gem className="w-5 h-5 text-primary" />,
}

const assetNotesPlaceholders: Record<AssetType, string> = {
    'Gold': 'e.g., Value of 100 grams of 24k gold.',
    'Silver': 'e.g., Value of 700 grams of pure silver.',
    'Cash & Savings': 'e.g., Total in bank accounts and cash on hand.',
    'Investments': 'e.g., Value of stocks, mutual funds, etc.',
    'Business Assets': 'e.g., Value of inventory + receivables - short-term debts.',
    'Livestock': 'Enter the number of animals in the value field.',
    'Agriculture': 'Enter the total value of your harvest.',
    'Rikaz (Treasure)': 'e.g., Value of discovered ancient coins.',
}

const assetsWithHawl: AssetType[] = [
  'Gold', 'Silver', 'Cash & Savings', 'Investments', 'Business Assets', 'Livestock'
];

export function ZakatCalculator() {
  const [result, setResult] = React.useState<CalculateZakatForAssetOutput | null>(null)
  const [currency, setCurrency] = React.useState('USD');
  const [goldPrice, setGoldPrice] = React.useState(75);
  const [silverPrice, setSilverPrice] = React.useState(1);
  const [livestockType, setLivestockType] = React.useState<LivestockType>('Sheep/Goats');
  const [agriType, setAgriType] = React.useState<AgriType>('rain-fed');
  const { toast } = useToast()

  const goldNisabValue = GOLD_NISAB_GRAMS * goldPrice;
  const silverNisabValue = SILVER_NISAB_GRAMS * silverPrice;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetType: "Gold",
      value: 0,
      notes: "",
      madhab: "Hanafi",
      hawlMet: false,
    },
  })

  const selectedAssetType = form.watch("assetType");
  const showHawl = assetsWithHawl.includes(selectedAssetType);
  
  const formatCurrency = (value: number) => {
    try {
        return value.toLocaleString(undefined, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        });
    } catch (e) {
        // Fallback for invalid currency codes if any
        return `${currency} ${value.toFixed(2)}`;
    }
  };

  const getLivestockZakat = (count: number, type: LivestockType): string => {
    switch (type) {
        case 'Sheep/Goats':
            if (count < 40) return "0";
            if (count <= 120) return "1 sheep";
            if (count <= 200) return "2 sheep";
            if (count <= 399) return "3 sheep";
            return `${Math.floor(count / 100)} sheep`;
        case 'Cattle':
            if (count < 30) return "0";
            if (count <= 39) return "1 one-year-old calf (Tabi')";
            if (count <= 59) return "1 two-year-old cow (Musinnah)";
            if (count <= 69) return "2 one-year-old calves (Tabi')";
            if (count <= 79) return "1 Tabi' and 1 Musinnah";
            if (count <= 89) return "2 Musinnah";
            if (count <= 99) return "3 Tabi'";
            if (count <= 119) return "1 Musinnah and 2 Tabi'";
            if (count >= 120) {
                const musinnahs = Math.floor(count / 40);
                const tabis = Math.floor((count % 40) / 30);
                return `${musinnahs} Musinnah and ${tabis} Tabi'`;
            }
            return "Calculation for this number is complex, please consult a scholar.";
        case 'Camels':
            if (count < 5) return "0";
            if (count <= 9) return "1 sheep";
            if (count <= 14) return "2 sheep";
            if (count <= 19) return "3 sheep";
            if (count <= 24) return "4 sheep";
            if (count <= 35) return "1 one-year-old she-camel (Bint Makhad)";
            if (count <= 45) return "1 two-year-old she-camel (Bint Labun)";
            if (count <= 60) return "1 three-year-old she-camel (Hiqqah)";
            if (count <= 75) return "1 four-year-old she-camel (Jadh'ah)";
            if (count <= 90) return "2 two-year-old she-camels (Bint Labun)";
            if (count <= 120) return "2 three-year-old she-camels (Hiqqah)";
            if (count > 120) return "For every 40, one Bint Labun; for every 50, one Hiqqah. Consult a scholar for the exact combination."
            return "0";
    }
  }

  const onSubmit = (values: FormValues) => {
    const { assetType, value, hawlMet } = values;
    let zakatLiability = 0;
    let explanation = "";
    const cashNisab = goldNisabValue;

    switch (assetType) {
        case 'Gold':
            if (value < goldNisabValue) {
                explanation = `Asset value (${formatCurrency(value)}) is below the Gold Nisab of ${formatCurrency(goldNisabValue)}. No Zakat is due.`;
            } else if (!hawlMet) {
                explanation = `The Hawl (one lunar year) has not been met. No Zakat is due.`;
            } else {
                zakatLiability = value * 0.025;
                explanation = `Nisab and Hawl are met. Zakat is calculated at 2.5% of the asset value.`;
            }
            break;
        case 'Silver':
             if (value < silverNisabValue) {
                explanation = `Asset value (${formatCurrency(value)}) is below the Silver Nisab of ${formatCurrency(silverNisabValue)}. No Zakat is due.`;
            } else if (!hawlMet) {
                explanation = `The Hawl (one lunar year) has not been met. No Zakat is due.`;
            } else {
                zakatLiability = value * 0.025;
                explanation = `Nisab and Hawl are met. Zakat is calculated at 2.5% of the asset value.`;
            }
            break;
        case 'Cash & Savings':
        case 'Investments':
        case 'Business Assets':
            if (value < cashNisab) {
                explanation = `Asset value (${formatCurrency(value)}) is below the Nisab of ${formatCurrency(cashNisab)} (based on gold). No Zakat is due.`;
            } else if (!hawlMet) {
                explanation = `The Hawl (one lunar year) has not been met. No Zakat is due.`;
            } else {
                zakatLiability = value * 0.025;
                explanation = `Nisab and Hawl are met. Zakat is calculated at 2.5% of the asset value.`;
            }
            break;
        case 'Livestock':
            const animalCount = Math.floor(value);
            const zakatDueInAnimals = getLivestockZakat(animalCount, livestockType);
            zakatLiability = 0; // Monetary value is not calculated here.
            if (zakatDueInAnimals === "0") {
                explanation = `The number of animals (${animalCount}) is below the Nisab for ${livestockType}. No Zakat is due.`;
            } else if (!hawlMet) {
                 explanation = `The Hawl (one lunar year) has not been met. No Zakat is due.`;
            }
            else {
                explanation = `For ${animalCount} ${livestockType}, the Zakat due is: ${zakatDueInAnimals}.\n\nNote: This is a non-monetary calculation. Please consult a scholar for the monetary equivalent if you wish to pay in cash.`;
            }
            break;
        case 'Agriculture':
            const rate = agriType === 'rain-fed' ? 0.10 : 0.05;
            zakatLiability = value * rate;
            explanation = `Zakat on agricultural produce (Ushr) does not have a Hawl requirement and is calculated on the harvest value. The rate is ${rate * 100}% for ${agriType} land. Nisab for agriculture is approx. 653kg; it's assumed your harvest exceeds this.`;
            break;
        case 'Rikaz (Treasure)':
            zakatLiability = value * 0.20;
            explanation = `Zakat on Rikaz (found treasure) is a flat rate of 20%, with no Nisab or Hawl requirement.`;
            break;
    }

    setResult({ zakatLiability, explanation });
  }

  const handleExportPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    const assetType = form.getValues('assetType');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Zakat Calculation Summary", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Asset Type:", 20, 40);
    doc.setFont("helvetica", "normal");
    doc.text(assetType, 60, 40);
    
    doc.setFont("helvetica", "bold");
    doc.text("Currency:", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(currency, 60, 50);

    doc.setFont("helvetica", "bold");
    doc.text("Zakat Due:", 20, 60);
    doc.setFont("helvetica", "normal");
    const zakatDisplay = result.zakatLiability > 0 
        ? formatCurrency(result.zakatLiability)
        : (assetType === 'Livestock' ? 'See breakdown' : formatCurrency(0));
    doc.text(zakatDisplay, 60, 60);

    doc.setFont("helvetica", "bold");
    doc.text("Calculation Breakdown:", 20, 70);
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(result.explanation, 170);
    doc.text(splitText, 20, 80);

    doc.save(`zakat-summary-${assetType.toLowerCase().replace(/\\s/g, '-')}.pdf`);
  };

  const handleShare = async () => {
    if (!result) return;
    const assetType = form.getValues('assetType');
    const zakatDisplay = result.zakatLiability > 0 
        ? formatCurrency(result.zakatLiability)
        : (assetType === 'Livestock' ? 'See breakdown' : formatCurrency(0));

    const shareData = {
      title: "Zakat Calculation Result",
      text: `Zakat result for ${assetType}:\n\nZakat Due: ${zakatDisplay}\n\n${result.explanation}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        toast({
          title: "Copied to Clipboard",
          description: "Calculation results have been copied to your clipboard.",
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      try {
        await navigator.clipboard.writeText(shareData.text);
        toast({
          title: "Copied to Clipboard",
          description: "Sharing didn't work, so we copied the results to your clipboard.",
        });
      } catch (copyError) {
        toast({
          variant: "destructive",
          title: "Sharing Failed",
          description: "Could not share or copy the results.",
        });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Zakat Calculator</CardTitle>
          <CardDescription>
            Select an asset type and conditions to calculate your Zakat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="assetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an asset type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assetTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                                <div className="flex items-center gap-2">
                                    {assetIcons[type]}
                                    {type}
                                </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedAssetType === 'Livestock' && (
                    <FormItem>
                        <FormLabel>Livestock Type</FormLabel>
                        <Select onValueChange={(value) => setLivestockType(value as LivestockType)} defaultValue={livestockType}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select livestock type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Sheep/Goats">Sheep/Goats</SelectItem>
                                <SelectItem value="Cattle">Cattle</SelectItem>
                                <SelectItem value="Camels">Camels</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedAssetType === 'Livestock' ? 'Number of Animals' : `Asset Value in ${currency}`}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showHawl && (
                  <FormField
                    control={form.control}
                    name="hawlMet"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Hawl Completed?</FormLabel>
                          <FormDescription>
                            Have you possessed this wealth for one lunar year?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {selectedAssetType === 'Agriculture' && (
                    <FormItem>
                        <FormLabel>Irrigation Method</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={(value) => setAgriType(value as AgriType)} defaultValue={agriType} className="flex pt-2 gap-6">
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <RadioGroupItem value="rain-fed" id="rain-fed" />
                                    </FormControl>
                                    <Label htmlFor="rain-fed" className="font-normal cursor-pointer">Rain-fed (10%)</Label>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <RadioGroupItem value="artificially-irrigated" id="artificially-irrigated" />
                                    </FormControl>
                                    <Label htmlFor="artificially-irrigated" className="font-normal cursor-pointer">Artificially Irrigated (5%)</Label>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                    </FormItem>
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder={assetNotesPlaceholders[selectedAssetType]} {...field} />
                      </FormControl>
                      <FormDescription>
                        For complex scenarios, please provide details.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="madhab"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School of Thought (Madhab)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Madhab" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Hanafi">Hanafi</SelectItem>
                          <SelectItem value="Maliki">Maliki</SelectItem>
                          <SelectItem value="Shafi’i">Shafi’i</SelectItem>
                          <SelectItem value="Hanbali">Hanbali</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Note: Madhab selection primarily affects fiqhi details in the Q&A. Core calculation rules are standard.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                Calculate Zakat
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>Currency & Market Prices</CardTitle>
                <CardDescription>
                    Select your local currency and enter current market prices for accuracy.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select onValueChange={setCurrency} defaultValue={currency}>
                        <SelectTrigger id="currency">
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                            {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="gold-price">Gold Price / gram ({currency})</Label>
                        <Input id="gold-price" type="number" value={goldPrice} onChange={(e) => setGoldPrice(parseFloat(e.target.value) || 0)} />
                        <p className="text-xs text-muted-foreground">Nisab: {formatCurrency(goldNisabValue)}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="silver-price">Silver Price / gram ({currency})</Label>
                        <Input id="silver-price" type="number" value={silverPrice} onChange={(e) => setSilverPrice(parseFloat(e.target.value) || 0)} />
                        <p className="text-xs text-muted-foreground">Nisab: {formatCurrency(silverNisabValue)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card className="min-h-[300px] flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Your Zakat Liability</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            {result && (
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground">Zakat Due for {form.getValues('assetType')}</p>
                   {selectedAssetType !== 'Livestock' || result.zakatLiability > 0 ? (
                    <p className="text-4xl font-bold text-primary">
                        {formatCurrency(result.zakatLiability)}
                    </p>
                    ) : null}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Calculation Breakdown</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {result.explanation}
                  </p>
                </div>
              </div>
            )}
            {!result && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>Your calculation results will appear here.</p>
              </div>
            )}
          </CardContent>
          {result && (
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={handleExportPdf}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
            </CardFooter>
          )}
        </Card>
        <p className="text-xs text-muted-foreground px-4 text-center">
            Disclaimer: This is an educational tool and not a fatwa. Please consult a qualified Islamic scholar for complex financial situations.
        </p>
      </div>
    </div>
  )
}
