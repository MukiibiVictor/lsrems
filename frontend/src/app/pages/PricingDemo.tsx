import { Check, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export function PricingDemo() {
  const plans = [
    {
      name: "Grow",
      price: "$58",
      period: "month/per user",
      description: "Add calling for $33/user",
      note: "+ tax, where applicable",
      features: [
        "Basic land surveying",
        "Property documentation",
        "Customer management",
        "Basic reporting",
        "Email support"
      ],
      borderColor: "card-border-blue",
      buttonClass: "gradient-blue",
      popular: false
    },
    {
      name: "Pro",
      price: "$416",
      period: "month/includes 10 users",
      description: "Additional users $41/month",
      note: "+ tax, where applicable",
      features: [
        "Advanced surveying tools",
        "Complete documentation suite",
        "Advanced customer portal",
        "Detailed analytics",
        "Priority support",
        "API access"
      ],
      borderColor: "card-border-yellow",
      buttonClass: "gradient-orange",
      popular: true
    },
    {
      name: "Platform",
      price: "$833",
      period: "month/includes 30 users",
      description: "Additional users $17/month",
      note: "+ tax, where applicable",
      features: [
        "Enterprise surveying suite",
        "White-label solutions",
        "Advanced integrations",
        "Custom workflows",
        "Dedicated support",
        "SLA guarantee"
      ],
      borderColor: "card-border-pink",
      buttonClass: "gradient-purple",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen clean-bg py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple pricing, free trial,
            <br />
            no contracts
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Every plan includes 7-day-a-week phone and email support.
          </p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-gray-600">Monthly</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" />
              <div className="w-12 h-6 bg-gray-300 rounded-full shadow-inner"></div>
              <div className="absolute w-5 h-5 bg-white rounded-full shadow top-0.5 left-0.5 transition-transform"></div>
            </div>
            <span className="text-gray-900 font-medium">Yearly</span>
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              Get 2 months free
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card ${plan.borderColor} ${
                plan.popular ? 'pricing-card-featured' : ''
              } relative`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-white px-4 py-1 text-sm font-medium shadow-lg">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 text-sm">{plan.period}</span>
                </div>
                <p className="text-xs text-gray-500">{plan.note}</p>
              </div>

              <div className="mb-8">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 font-medium">
                    Billed annually, includes 2 months
                  </p>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className={`w-full h-12 text-white ${plan.buttonClass} btn-glow hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}>
                Start Free Trial
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Need a custom solution for your organization?
          </p>
          <Button variant="outline" className="hover-lift">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}