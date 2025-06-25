import { Faq } from "@/components/faq";
import { Icons } from "@/components/icons";
import { ZakatCalculator } from "@/components/zakat-calculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8 space-y-12">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
            <Icons.Logo className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                Calculate My Zakaat
            </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          An intelligent assistant for your Zakat obligations.
        </p>
      </header>

      <section>
        <ZakatCalculator />
      </section>

      <section>
        <Faq />
      </section>

      <section>
        <Card className="max-w-4xl mx-auto bg-secondary/50 border-primary/20">
            <CardHeader className="items-center text-center bg-primary text-primary-foreground rounded-t-lg">
                <CardTitle className="font-headline text-3xl">Support This Project</CardTitle>
                <CardDescription className="text-primary-foreground/90">
                    This app is free, ad-free, and built for the Ummah.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 pt-6">
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    As an individual developer, your support helps cover server costs and allows me to continue improving this tool for our community. Your contribution, no matter how small, is deeply appreciated.
                </p>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <a href="https://bitpay.com/pay/YOUR_BITPAY_ID" target="_blank" rel="noopener noreferrer">
                        <Heart className="mr-2 h-5 w-5" />
                        Donate with Crypto via BitPay
                    </a>
                </Button>
                 <p className="text-xs text-muted-foreground pt-2">Please replace "YOUR_BITPAY_ID" in the code with your actual BitPay link.</p>
            </CardContent>
        </Card>
      </section>

      <footer className="text-center mt-12 text-sm text-muted-foreground">
        <p>Built with care for the Muslim community.</p>
        <p>&copy; {new Date().getFullYear()} AfzalApps. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
