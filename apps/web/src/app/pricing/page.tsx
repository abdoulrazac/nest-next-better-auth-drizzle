import type { Metadata } from "next";
import { Nav } from "../../components/nav";
import { Footer } from "../../components/footer";

export const metadata: Metadata = { title: "Pricing" };

const plans = [
  {
    name: "Open Source",
    price: "Free",
    description: "Everything you need to get started.",
    features: [
      "Unlimited projects",
      "Full source code",
      "Community support",
      "MIT license",
    ],
    cta: "Get started",
    href: "/docs",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$0",
    description: "This is a boilerplate — fork it and build your own pricing.",
    features: [
      "Everything in Open Source",
      "Premium support",
      "Custom integrations",
      "SLA",
    ],
    cta: "Coming soon",
    href: "#",
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Simple pricing</h1>
          <p className="text-muted-foreground">
            Start for free. Add your own tiers as you grow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 ${plan.highlight ? "border-primary ring-1 ring-primary" : ""}`}
            >
              <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
              <p className="text-3xl font-bold mb-2">{plan.price}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>
              <ul className="space-y-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm flex items-center gap-2">
                    <span className="text-primary">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href={plan.href}
                className={`inline-flex w-full h-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border hover:bg-accent"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
