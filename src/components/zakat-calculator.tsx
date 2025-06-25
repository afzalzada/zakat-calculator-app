"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { jsPDF } from "jspdf"
import { Loader2, TrendingUp, Wallet, Share, Download, Leaf, Store, Gem } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  calculateZakatForAsset,
  type CalculateZakatForAssetOutput,
} from "@/ai/flows/zakat-calculation"
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

const formSchema = z.object({
  assetType: z.enum(assetTypes),
  value: z.coerce.number().min(0, { message: "Value must be positive." }),
  notes: z.string().optional(),
  madhab: z.enum(['Hanafi', 'Maliki', 'Shafi’i', 'Hanbali']),
  nisabMet: z.boolean().default(false),
  hawlMet: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

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
    'Livestock': 'e.g., 40 sheep.',
    'Agriculture': 'e.g., 1000kg of wheat from rain-irrigated land.',
    'Rikaz (Treasure)': 'e.g., Value of discovered ancient coins.',
}

// Asset types that require Hawl (1 year possession)
const assetsWithHawl: AssetType[] = [
  'Gold', 'Silver', 'Cash & Savings', 'Investments', 'Business Assets', 'Livestock'
];

// Asset types that require Nisab (minimum threshold)
const assetsWithNisab: AssetType[] = [
  'Gold', 'Silver', 'Cash & Savings', 'Investments', 'Business Assets', 'Livestock', 'Agriculture'
];


export function ZakatCalculator() {
  const [result, setResult] = React.useState<CalculateZakatForAssetOutput | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetType: "Gold",
      value: 0,
      notes: "",
      madhab: "Hanafi",
      nisabMet: false,
      hawlMet: false,
    },
  })

  const selectedAssetType = form.watch("assetType");

  const showNisab = assetsWithNisab.includes(selectedAssetType);
  const showHawl = assetsWithHawl.includes(selectedAssetType);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setResult(null)
    try {
      const response = await calculateZakatForAsset({
        ...values,
        assetType: values.assetType,
        // Ensure values are boolean even if not shown
        nisabMet: showNisab ? values.nisabMet : true,
        hawlMet: showHawl ? values.hawlMet : true,
      });
      setResult(response)
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to calculate Zakat. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
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
    doc.text("Zakat Due:", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(result.zakatLiability.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }), 60, 50);

    doc.setFont("helvetica", "bold");
    doc.text("Calculation Breakdown:", 20, 60);
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(result.explanation, 170);
    doc.text(splitText, 20, 70);

    doc.save(`zakat-summary-${assetType.toLowerCase().replace(/\\s/g, '-')}.pdf`);
  };

  const handleShare = async () => {
    if (!result) return;
    const assetType = form.getValues('assetType');
    const shareData = {
      title: "Zakat Calculation Result",
      text: `Zakat result for ${assetType}:\n\nZakat Due: ${result.zakatLiability.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n\n${result.explanation}`,
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
      console.error("Sharing failed", error);
      toast({
        variant: "destructive",
        title: "Sharing Failed",
        description: "Could not share or copy the results.",
      });
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

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedAssetType === 'Livestock' ? 'Number of Animals' : 'Asset Value'}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showNisab && (
                  <FormField
                    control={form.control}
                    name="nisabMet"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Nisab Met?</FormLabel>
                          <FormDescription>
                            Is your zakatable wealth above the minimum threshold?
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
                        Provide details like livestock type, or irrigation method for agriculture.
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Calculate Zakat
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card className="min-h-[300px] flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Your Zakat Liability</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {result && !isLoading && (
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground">Zakat Due for {form.getValues('assetType')}</p>
                  <p className="text-4xl font-bold text-primary">
                    {result.zakatLiability.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Calculation Breakdown</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {result.explanation}
                  </p>
                </div>
              </div>
            )}
            {!result && !isLoading && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>Your calculation results will appear here.</p>
              </div>
            )}
          </CardContent>
          {result && !isLoading && (
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
