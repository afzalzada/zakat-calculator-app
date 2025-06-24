import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const faqItems = [
  {
    question: "What is Zakat?",
    answer: "Zakat is a mandatory charitable contribution for Muslims who meet certain wealth criteria. It is one of the Five Pillars of Islam and is considered an act of worship. The word 'Zakat' means 'to purify', and it is believed that paying Zakat purifies one's wealth.",
  },
  {
    question: "Who pays Zakat?",
    answer: "Zakat is obligatory for any adult, sane Muslim who owns wealth above a certain threshold, known as the Nisab, for a full lunar year (hawl). The wealth must be productive or have the potential for growth.",
  },
  {
    question: "What is Nisab?",
    answer: "Nisab is the minimum amount of wealth a Muslim must own before they are obligated to pay Zakat. This threshold is traditionally set to the value of 85 grams of pure gold or 595 grams of pure silver. The value of Nisab changes daily based on market rates for gold and silver. You should check the current rates from a reliable local source when calculating your Zakat.",
  },
  {
    question: "References from Trusted Sunni Sources",
    answer: "The obligation of Zakat is established in the Qur'an and the Sunnah of the Prophet Muhammad (peace be upon him).\n\nQur'an: \"And establish prayer and give zakat and bow with those who bow [in worship and obedience].\" (Surah Al-Baqarah 2:43)\n\nHadith: The Prophet Muhammad (peace be upon him) said, \"Islam is built upon five [pillars]: the testimony that there is no god but Allah and that Muhammad is the Messenger of Allah, establishing the prayer, giving Zakat, making the pilgrimage to the House, and fasting Ramadan.\" (Sahih al-Bukhari, Sahih Muslim)",
  },
]

export function Faq() {
  return (
    <Card className="max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle className="font-headline text-3xl">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="font-semibold text-left">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
    </Card>
  )
}
