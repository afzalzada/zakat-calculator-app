'use client';
import * as React from 'react';
import { Faq } from "@/components/faq";
import { Icons } from "@/components/icons";
import { ZakatCalculator } from "@/components/zakat-calculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BuyMeACoffeeButton } from './buy-me-a-coffee-button';

export function MainPage() {
  const { t } = useI18n();
  const [year, setYear] = React.useState(new Date().getFullYear());

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-12">
      <header className="relative mb-8">
        <div className="absolute top-0 right-0 z-10">
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
        <ZakatCalculator />
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
                  <BuyMeACoffeeButton />
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
