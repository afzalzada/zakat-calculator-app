'use client';
import * as React from 'react';
import { Faq } from "@/components/faq";
import { Icons } from "@/components/icons";
import { ZakatCalculator } from "@/components/zakat-calculator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from './ui/button';
import { Coffee } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const currencies = [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SAR', 'AED', 'PKR', 'BDT', 'INR', 'IDR', 'MYR', 'TRY', 'QAR', 'KWD', 'AFN'
];

export function MainPage() {
  const { t } = useI18n();
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [currency, setCurrency] = React.useState('USD');


  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-12">
      <header className="relative mb-8">
        <div className="absolute top-0 right-0 z-10 flex items-center gap-2">
            <Select onValueChange={setCurrency} defaultValue={currency}>
              <SelectTrigger id="currency-main" className="w-[80px]">
                  <SelectValue placeholder="USD" />
              </SelectTrigger>
              <SelectContent>
                  {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <LanguageSwitcher />
        </div>
        
        <div className="text-center pt-14 md:pt-0">
          <div className="flex items-center justify-center gap-4 mb-2">
              <Icons.Logo className="w-12 h-12 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                  {t('appTitle')}
              </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t('appDescription')}
          </p>
        </div>
      </header>

      <section>
        <ZakatCalculator currency={currency} />
      </section>

      <section>
        <Faq />
      </section>

      <section>
        <Card className="max-w-4xl mx-auto border-primary/20">
            <CardHeader className="items-center text-center bg-primary text-primary-foreground rounded-t-lg">
                <CardTitle className="font-headline text-3xl">{t('supportTitle')}</CardTitle>
                <CardDescription className="text-primary-foreground/90">
                    {t('supportDescription')}
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 pt-6 bg-card">
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {t('supportMessage')}
                </p>
                <div className="flex justify-center">
                    <Button asChild size="lg" className="bg-[#FFDD00] text-black hover:bg-[#FFDD00]/90">
                        <a href="https://www.buymeacoffee.com/afzalzada" target="_blank" rel="noopener noreferrer">
                            <Coffee className="mr-2 h-5 w-5" /> {t('donateButton')}
                        </a>
                    </Button>
                </div>
                 <p className="text-xs text-muted-foreground pt-2">{t('supportNote')}</p>
            </CardContent>
        </Card>
      </section>

      <footer className="text-center mt-12 text-sm text-muted-foreground space-y-4">
        <p>{t('footerBuiltWithCare')}</p>
        <p>&copy; {year} AfzalApps. {t('footerAllRightsReserved')}</p>
      </footer>
    </main>
  );
}
