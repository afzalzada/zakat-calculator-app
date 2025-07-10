
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { jsPDF } from "jspdf"
import { TrendingUp, Wallet, Share, Download, Leaf, Store, Gem, Coffee } from "lucide-react"
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
import { useI18n } from "@/hooks/use-i18n"


const assetTypes = [
  'gold',
  'silver',
  'cash',
  'investments',
  'business',
  'livestock',
  'agriculture',
  'rikaz',
] as const;

type AssetType = typeof assetTypes[number];
type LivestockType = 'sheep_goats' | 'cattle' | 'camels';
type AgriType = 'rain-fed' | 'artificially-irrigated';

const formSchema = z.object({
  assetType: z.enum(assetTypes),
  value: z.coerce.number().min(0, { message: "Value must be positive." }).optional().transform(val => val ?? 0),
  notes: z.string().optional(),
  madhab: z.enum(['Hanafi', 'Maliki', 'Shafi’i', 'Hanbali']),
  hawlMet: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

// Nisab values in grams
const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;

// Estimated prices per gram in USD.
// These are used to calculate the Nisab value.
const GOLD_PRICE_USD_PER_GRAM = 75;
const SILVER_PRICE_USD_PER_GRAM = 1;

// Nisab values in USD
const goldNisabValue = GOLD_NISAB_GRAMS * GOLD_PRICE_USD_PER_GRAM;
const silverNisabValue = SILVER_NISAB_GRAMS * SILVER_PRICE_USD_PER_GRAM;


const assetIcons: Record<AssetType, React.ReactNode> = {
    'gold': <Icons.GoldBar className="w-5 h-5 text-primary" />,
    'silver': <Icons.GoldBar className="w-5 h-5 text-gray-400" />,
    'cash': <Wallet className="w-5 h-5 text-primary" />,
    'investments': <TrendingUp className="w-5 h-5 text-primary" />,
    'business': <Store className="w-5 h-5 text-primary" />,
    'livestock': <Icons.Sheep className="w-5 h-5 text-primary" />,
    'agriculture': <Leaf className="w-5 h-5 text-primary" />,
    'rikaz': <Gem className="w-5 h-5 text-primary" />,
}

const assetsWithHawl: AssetType[] = [
  'gold', 'silver', 'cash', 'investments', 'business', 'livestock'
];

interface ZakatCalculatorProps {
  currency: string;
}

export function ZakatCalculator({ currency }: ZakatCalculatorProps) {
  const { t } = useI18n();
  const [result, setResult] = React.useState<CalculateZakatForAssetOutput | null>(null)
  const [livestockType, setLivestockType] = React.useState<LivestockType>('sheep_goats');
  const [agriType, setAgriType] = React.useState<AgriType>('rain-fed');
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetType: "gold",
      value: 0,
      notes: "",
      madhab: "Hanafi",
      hawlMet: false,
    },
  })

  const selectedAssetType = form.watch("assetType");
  const showHawl = assetsWithHawl.includes(selectedAssetType);

  React.useEffect(() => {
    // Reset form fields and result when asset type or language changes
    form.reset({
      assetType: selectedAssetType,
      value: 0,
      notes: "",
      madhab: "Hanafi",
      hawlMet: false,
    });
    setResult(null);
  }, [selectedAssetType, t, form, setResult]);
  
  const formatCurrency = (value: number) => {
    try {
        return value.toLocaleString(undefined, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        });
    } catch (e) {
        return `${currency} ${value.toFixed(2)}`;
    }
  };

  const getLivestockZakat = (count: number, type: LivestockType): string => {
    switch (type) {
        case 'sheep_goats':
            if (count < 40) return t('livestock_result_none');
            if (count <= 120) return t('livestock_sheep_1');
            if (count <= 200) return t('livestock_sheep_2');
            if (count <= 399) return t('livestock_sheep_3');
            return t('livestock_sheep_4', { count: Math.floor(count / 100) });
        case 'cattle':
            if (count < 30) return t('livestock_result_none');
            if (count <= 39) return t('livestock_cattle_1');
            if (count <= 59) return t('livestock_cattle_2');
            if (count <= 69) return t('livestock_cattle_3');
            if (count <= 79) return t('livestock_cattle_4');
            if (count <= 89) return t('livestock_cattle_5');
            if (count <= 99) return t('livestock_cattle_6');
            if (count <= 119) return t('livestock_cattle_7');
            if (count >= 120) {
                const musinnahs = Math.floor(count / 40);
                const tabis = Math.floor((count % 40) / 30);
                return t('livestock_cattle_8', { musinnahs, tabis });
            }
            return t('livestock_complex');
        case 'camels':
            if (count < 5) return t('livestock_result_none');
            if (count <= 9) return t('livestock_camels_1');
            if (count <= 14) return t('livestock_camels_2');
            if (count <= 19) return t('livestock_camels_3');
            if (count <= 24) return t('livestock_camels_4');
            if (count <= 35) return t('livestock_camels_5');
            if (count <= 45) return t('livestock_camels_6');
            if (count <= 60) return t('livestock_camels_7');
            if (count <= 75) return t('livestock_camels_8');
            if (count <= 90) return t('livestock_camels_9');
            if (count <= 120) return t('livestock_camels_10');
            if (count > 120) return t('livestock_camels_11');
            return t('livestock_result_none');
    }
  }

  const onSubmit = (values: FormValues) => {
    const { assetType, value, hawlMet } = values;
    let zakatLiability = 0;
    let explanation = "";
    // Note: Nisab for cash is based on the Gold standard.
    // For simplicity, we use a USD-based Nisab value.
    // A more advanced version could fetch conversion rates.
    const cashNisab = goldNisabValue;

    if (value === 0) {
        explanation = t('enter_value_prompt');
        setResult({ zakatLiability: 0, explanation });
        return;
    }

    switch (assetType) {
        case 'gold':
            const goldWeight = value;
            if (goldWeight < GOLD_NISAB_GRAMS) {
                explanation = t('result_gold_below_nisab', { weight: goldWeight, nisab: GOLD_NISAB_GRAMS });
            } else if (!hawlMet) {
                explanation = t('result_hawl_not_met');
            } else {
                // Zakat is on the weight, so price is not needed for the 2.5% calc
                const zakatWeight = goldWeight * 0.025;
                explanation = t('result_gold_success', { weight: zakatWeight.toFixed(2) });
                // For display, we calculate monetary value, assuming a price.
                zakatLiability = value * GOLD_PRICE_USD_PER_GRAM * 0.025;
            }
            break;
        case 'silver':
            const silverWeight = value;
             if (silverWeight < SILVER_NISAB_GRAMS) {
                explanation = t('result_silver_below_nisab', { weight: silverWeight, nisab: SILVER_NISAB_GRAMS });
            } else if (!hawlMet) {
                explanation = t('result_hawl_not_met');
            } else {
                const zakatWeight = silverWeight * 0.025;
                explanation = t('result_silver_success', { weight: zakatWeight.toFixed(2) });
                zakatLiability = value * SILVER_PRICE_USD_PER_GRAM * 0.025;
            }
            break;
        case 'cash':
        case 'investments':
        case 'business':
            if (value < cashNisab) {
                explanation = t('result_cash_below_nisab', { value: formatCurrency(value), nisab: formatCurrency(cashNisab) });
            } else if (!hawlMet) {
                explanation = t('result_hawl_not_met');
            } else {
                zakatLiability = value * 0.025;
                explanation = t('result_cash_success');
            }
            break;
        case 'livestock':
            const animalCount = Math.floor(value);
            const zakatDueInAnimals = getLivestockZakat(animalCount, livestockType);
            zakatLiability = 0; // Monetary value is not calculated here.
            if (zakatDueInAnimals === t('livestock_result_none')) {
                explanation = t('result_livestock_below_nisab', { count: animalCount, type: t(`livestock_${livestockType}`) });
            } else if (!hawlMet) {
                 explanation = t('result_hawl_not_met');
            }
            else {
                explanation = t('result_livestock_success', { count: animalCount, type: t(`livestock_${livestockType}`), due: zakatDueInAnimals });
            }
            break;
        case 'agriculture':
            const rate = agriType === 'rain-fed' ? 0.10 : 0.05;
            zakatLiability = value * rate;
            explanation = t('result_agriculture_success', { rate: rate * 100, type: t(`agri_${agriType}`) });
            break;
        case 'rikaz':
            zakatLiability = value * 0.20;
            explanation = t('result_rikaz_success');
            break;
    }

    setResult({ zakatLiability, explanation });
  }

  const handleExportPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    const assetType = form.getValues('assetType');

    doc.text("Zakat Calculation Summary", 105, 20, { align: "center" });
    doc.text(`Asset Type: ${t('asset_' + assetType)}`, 20, 40);
    doc.text(`Currency: ${currency}`, 20, 50);

    const zakatDisplay = result.zakatLiability > 0 
        ? formatCurrency(result.zakatLiability)
        : (assetType === 'livestock' ? 'See breakdown' : formatCurrency(0));
    doc.text(`Zakat Due: ${zakatDisplay}`, 20, 60);

    const splitText = doc.splitTextToSize(result.explanation, 170);
    doc.text(splitText, 20, 80);

    doc.save(`zakat-summary.pdf`);
  };

  const handleShare = async () => {
    if (!result) return;
    const assetType = form.getValues('assetType');
    const zakatDisplay = result.zakatLiability > 0 
        ? formatCurrency(result.zakatLiability)
        : (assetType === 'livestock' ? 'See breakdown' : formatCurrency(0));

    const shareData = {
      title: "Zakat Calculation Result",
      text: `Zakat result for ${t('asset_' + assetType)}:\n\nZakat Due: ${zakatDisplay}\n\n${result.explanation}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        toast({
          title: t('copied_to_clipboard_title'),
          description: t('copied_to_clipboard_description'),
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      try {
        await navigator.clipboard.writeText(shareData.text);
        toast({
          title: t('copied_to_clipboard_title'),
          description: t('share_failed_copy_description'),
        });
      } catch (copyError) {
        toast({
          variant: "destructive",
          title: t('share_failed_title'),
          description: t('share_failed_description'),
        });
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="font-headline text-3xl">{t('calculator_title')}</CardTitle>
          <CardDescription className="text-primary-foreground/90">
            {t('calculator_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="assetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('asset_type_label')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('asset_type_placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assetTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                                <div className="flex items-center gap-2">
                                    {assetIcons[type]}
                                    {t(`asset_${type}`)}
                                </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedAssetType === 'livestock' && (
                    <FormItem>
                        <FormLabel>{t('livestock_type_label')}</FormLabel>
                        <Select onValueChange={(value) => setLivestockType(value as LivestockType)} defaultValue={livestockType}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('livestock_type_placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="sheep_goats">{t('livestock_sheep_goats')}</SelectItem>
                                <SelectItem value="cattle">{t('livestock_cattle')}</SelectItem>
                                <SelectItem value="camels">{t('livestock_camels')}</SelectItem>
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
                        {selectedAssetType === 'gold' || selectedAssetType === 'silver'
                          ? t('weight_in_grams_label')
                          : selectedAssetType === 'livestock'
                          ? t('number_of_animals_label')
                          : t('asset_value_in_currency_label', { currency })}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 100" {...field} />
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
                          <FormLabel>{t('hawl_completed_label')}</FormLabel>
                          <FormDescription>
                            {t('hawl_description')}
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

                {selectedAssetType === 'agriculture' && (
                    <FormItem>
                        <FormLabel>{t('irrigation_method_label')}</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={(value) => setAgriType(value as AgriType)} defaultValue={agriType} className="flex pt-2 gap-6">
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <RadioGroupItem value="rain-fed" id="rain-fed" />
                                    </FormControl>
                                    <Label htmlFor="rain-fed" className="font-normal cursor-pointer">{t('agri_rain_fed')}</Label>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <RadioGroupItem value="artificially-irrigated" id="artificially-irrigated" />
                                    </FormControl>
                                    <Label htmlFor="artificially-irrigated" className="font-normal cursor-pointer">{t('agri_artificial')}</Label>
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
                      <FormLabel>{t('notes_label')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t(`notes_placeholder_${selectedAssetType}`)} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t('notes_description')}
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
                      <FormLabel>{t('madhab_label')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('madhab_placeholder')} />
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
                        {t('madhab_description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                {t('calculate_button')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <Card className="min-h-[300px] flex flex-col">
          <CardHeader className="bg-chart-2 text-primary-foreground rounded-t-lg">
            <CardTitle className="font-headline text-2xl">{t('result_title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow pt-6">
            {result && (
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground">{t('result_due_for', { asset: t('asset_' + form.getValues('assetType')) })}</p>
                    {selectedAssetType !== 'livestock' || result.zakatLiability > 0 ? (
                    <p className="text-4xl font-bold text-chart-2">
                        {formatCurrency(result.zakatLiability)}
                    </p>
                    ) : null}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('result_breakdown')}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {result.explanation}
                  </p>
                </div>
              </div>
            )}
            {!result && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>{t('result_placeholder')}</p>
              </div>
            )}
          </CardContent>
          {result && (
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={handleExportPdf}>
                <Download className="mr-2 h-4 w-4" />
                {t('export_pdf_button')}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share className="mr-2 h-4 w-4" />
                {t('share_button')}
              </Button>
            </CardFooter>
          )}
        </Card>
        <p className="text-xs text-muted-foreground px-4 text-center">
            {t('calculator_disclaimer')}
        </p>
      </div>
    </div>
  )
}
