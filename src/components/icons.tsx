import type { LucideProps } from "lucide-react"
import { HandCoins } from "lucide-react"

export const Icons = {
  Logo: (props: LucideProps) => (
    <HandCoins {...props} />
  ),
  GoldBar: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 12h12" />
    </svg>
  ),
};
