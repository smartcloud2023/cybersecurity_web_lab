const plans = [
  { name: "Free", price: "£0", access: "Starter labs" },
  { name: "Pro", price: "£15–£25/mo", access: "Core pathway" },
  { name: "Professional", price: "£40–£60/mo", access: "Advanced labs" },
  { name: "Team", price: "Per-seat", access: "Instructor/team tools" },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Pricing</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-lg border border-black/10 p-5 dark:border-white/10"
          >
            <h2 className="font-medium">{plan.name}</h2>
            <p className="mt-1 text-lg">{plan.price}</p>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
              {plan.access}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
