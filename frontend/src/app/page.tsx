import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Lightbulb, 
  Calendar, 
  TrendingUp,
  Instagram,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "ანალიტიკა",
    description: "Instagram Graph API-ზე დაფუძნებული სრული ანალიტიკა",
    items: ["Reach & Impressions", "Engagement Rate", "Followers ზრდა", "Profile Visits"]
  },
  {
    icon: Lightbulb,
    title: "AI რჩევები",
    description: "პერსონალიზებული რეკომენდაციები შენი კონტენტისთვის",
    items: ["კონტენტის იდეები", "სათაურები ქართულად/ინგლისურად", "ჰეშთეგების გენერატორი", "საუკეთესო დრო"]
  },
  {
    icon: Calendar,
    title: "დაგეგმვა",
    description: "კონტენტის კალენდარი და A/B testing",
    items: ["კალენდრის მართვა", "A/B Caption Test", "რემაინდერები", "Draft მოდები"]
  }
];

const stats = [
  { label: "გაზრდილი Engagement", value: "+45%", icon: TrendingUp },
  { label: "ახალი Followers", value: "+2.3K", icon: Instagram },
  { label: "დაზოგილი დრო", value: "15 სთ/კვირა", icon: CheckCircle },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center mb-6">
              <Instagram className="h-16 w-16 text-purple-500" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Instagram Growth
              <span className="text-purple-500"> Assistant</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              ანალიტიკა და AI რჩევები Instagram-ის ზრდისთვის. 
              შეისწავლე შენი მეტრიკები, მიიღე პერსონალიზებული რეკომენდაციები და გაზარდე ჩართულობა.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/dashboard">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  დაიწყე ახლავე
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Instagram დაკავშირება
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              შედეგები რომლებსაც ნახავ
            </h2>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-purple-600/10 p-4">
                      <Icon className="h-8 w-8 text-purple-500" />
                    </div>
                    <dt className="text-base leading-7 text-gray-300">{stat.label}</dt>
                    <dd className="text-3xl font-bold leading-9 tracking-tight text-white">
                      {stat.value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24" id="features">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              ძირითადი ფუნქციები
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ყველაფერი რაც გჭირდება Instagram-ის ზრდისთვის
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              სრული ანალიტიკა, AI რჩევები და კონტენტის დაგეგმვა ერთ პლატფორმაზე
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <div className="mb-4 rounded-lg bg-purple-600/10 p-3 w-fit">
                        <Icon className="h-6 w-6 text-purple-500" />
                      </div>
                      <CardTitle className="text-white">{feature.title}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.items.map((item) => (
                          <li key={item} className="flex items-center text-sm text-gray-300">
                            <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              მზად ხარ Instagram-ის ზრდისთვის?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              დაიწყე უფასოდ და ნახე როგორ იზრდება შენი ჩართულობა და გამომწერები
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Instagram-ის დაკავშირება
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}