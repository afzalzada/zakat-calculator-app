import { Faq } from "@/components/faq";
import { Icons } from "@/components/icons";
import { ZakatCalculator } from "@/components/zakat-calculator";
import { ZakatQA } from "@/components/zakat-qa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8">
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

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-8">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="qa">Q&A</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        <TabsContent value="calculator">
            <ZakatCalculator />
        </TabsContent>
        <TabsContent value="qa">
            <ZakatQA />
        </TabsContent>
        <TabsContent value="faq">
            <Faq />
        </TabsContent>
      </Tabs>

      <footer className="text-center mt-12 text-sm text-muted-foreground">
        <p>Built with care for the Muslim community.</p>
        <p>&copy; {new Date().getFullYear()} Calculate My Zakaat. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
