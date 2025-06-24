"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, TrendingUp, Wallet, Share, Download } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  calculateZakatLiability,
  type CalculateZakatLiabilityOutput,
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
import { useToast } from "@/hooks/use-toast"
import { Icons } from "./icons"

const formSchema = z.object({
  cash: z.coerce.number().min(0, { message: "Value must be positive." }),
  gold: z.coerce.number().min(0, { message: "Value must be positive." }),
  investments: z.coerce.number().min(0, { message: "Value must be positive." }),
  madhab: z.enum(['Hanafi', 'Maliki', 'Shafi’i', 'Hanbali']),
})

type FormValues = z.infer<typeof formSchema>

export function ZakatCalculator() {
  const [result, setResult] = React.useState<CalculateZakatLiabilityOutput | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cash: 0,
      gold: 0,
      investments: 0,
      madhab: "Hanafi",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setResult(null)
    try {
      const response = await calculateZakatLiability(values)
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Zakat Calculator</CardTitle>
          <CardDescription>
            Enter your asset values to calculate your Zakat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="cash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        Cash & Savings
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Icons.GoldBar className="w-5 h-5 text-primary" />
                        Gold & Silver Value
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Investments & Stocks
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 15000" {...field} />
                      </FormControl>
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
                  <p className="text-muted-foreground">Total Zakat Due</p>
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
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" className="w-full">
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
