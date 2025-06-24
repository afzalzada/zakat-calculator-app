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
    question: "What are the types of Zakat?",
    answer: "Zakat is broadly categorized into two main types: Zakat al-Mal (Zakat on Wealth) and Zakat al-Fitr (Zakat of Breaking the Fast).\n\n1. ZAKAT AL-MAL (ZAKAT ON WEALTH)\nThis is the annual Zakat calculated on the overall wealth of an individual that has been in their possession for a full lunar year and is above the Nisab threshold. The types of assets subject to Zakat al-Mal include:\n\n*   Personal Wealth: Gold, silver, cash at home or in bank accounts, and stocks.\n*   Business Wealth: Trading goods, business inventory, and profits.\n*   Agricultural Produce (Ushr): Zakat on crops and harvest. The rate is typically 10% for land irrigated naturally (by rain) and 5% for land irrigated by artificial means.\n*   Livestock (An'am): Zakat on grazing animals like camels, cattle, sheep, and goats, with specific Nisab thresholds and rates for each category.\n*   Extracted Resources (Rikaz): Zakat on discovered treasures or natural resources, typically at a rate of 20%.\n\n2. ZAKAT AL-FITR (FITRANA)\nThis is a charitable donation that must be given by every Muslim, including dependents, before the Eid al-Fitr prayer at the end of Ramadan. It is a fixed amount (traditionally a Sa' - about 3kg) of a staple food item like dates, barley, or wheat, or its monetary equivalent. Its purpose is to purify those who fasted and to ensure the poor can celebrate Eid.",
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
                        <AccordionContent className="text-muted-foreground whitespace-pre-wrap">
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
    </Card>
  )
}
