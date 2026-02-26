import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  CircleCheckBig,
  ClipboardList,
  GraduationCap,
  Home,
  Route,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const howItWorksSteps = [
  {
    title: "Select class and subject",
    description:
      "Tell us the class level and subjects your child needs support in.",
    icon: ClipboardList,
  },
  {
    title: "Get structured session plan",
    description:
      "Receive a clear learning roadmap designed for consistency and outcomes.",
    icon: Route,
  },
  {
    title: "Free intro session",
    description:
      "Attend a no-cost introductory session to align goals and teaching fit.",
    icon: CalendarCheck,
  },
  {
    title: "Continue with assigned educator",
    description:
      "Move ahead with a verified educator matched by Mentora’s academic team.",
    icon: UserCheck,
  },
];

const programs = [
  {
    title: "School Learning (Class 6–12)",
    description:
      "Curriculum-aligned support for stronger fundamentals, concept clarity, and better school outcomes.",
    icon: GraduationCap,
  },
  {
    title: "Competitive Preparation (JEE, NEET, CUET)",
    description:
      "Structured prep with focused practice, topic mastery, and disciplined progress tracking.",
    icon: BookOpenCheck,
  },
  {
    title: "Home Sessions",
    description:
      "Reliable at-home learning experience with process-led instruction and parent visibility.",
    icon: Home,
  },
];

const trustItems = [
  {
    title: "Verified educators",
    description: "Screened and reviewed before onboarding.",
    icon: CircleCheckBig,
  },
  {
    title: "Standardised pricing",
    description: "Transparent fee structures across programs.",
    icon: ShieldCheck,
  },
  {
    title: "Admin-controlled allocation",
    description: "Educator assignment managed by Mentora academics.",
    icon: ClipboardList,
  },
  {
    title: "Progress tracking",
    description: "Consistent visibility on milestones and learning continuity.",
    icon: CalendarCheck,
  },
];

const footerLinks = ["About", "Programs", "For Tutors", "Login"];

const App = () => {
  return (
    <main className="bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/"
            aria-label="Mentora Edutors homepage"
            className="inline-flex items-center"
          >
            <Image
              src="/mentora-logo.png"
              alt="Mentora Edutors"
              width={460}
              height={120}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <a
              href="#programs"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
            >
              Programs
            </a>
            <a
              href="#trust"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
            >
              Why Mentora
            </a>
            <a
              href="#for-tutors"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
            >
              For Tutors
            </a>
          </div>

          <Button
            variant="outline"
            className="border-emerald-700/30 text-emerald-800 transition-all duration-300 hover:border-emerald-700 hover:bg-emerald-50"
            disabled
          >
            Book Free Intro Session
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(15,23,42,0.08),_transparent_45%)]" />
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 inline-flex items-center rounded-full border border-emerald-800/20 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-900">
              Parent-Facing Learning Platform
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
              Structured Home Learning for Classes 6–12
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-relaxed text-slate-600 md:text-lg">
              Personalised home tutoring and competitive prep (JEE, NEET,
              CUET)
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group min-w-[210px] bg-slate-900 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <Link href="#how-mentora-works">
                  How Mentora Works
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="min-w-[210px] border-emerald-700/30 text-emerald-800 transition-all duration-300 hover:bg-emerald-50"
                disabled
              >
                Book Free Intro Session
              </Button>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Intro session booking will open shortly.
            </p>
          </div>
        </div>
      </section>

      <section id="how-mentora-works" className="container py-16 md:py-20">
        <div className="mb-10 flex flex-col gap-3 md:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-900">
            How Mentora Works
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            A clear four-step journey for parents and students
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {howItWorksSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <Card
                key={step.title}
                className="group border-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-sm"
              >
                <CardHeader>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <CardTitle className="flex items-start gap-2 text-base text-slate-900">
                    <Icon className="mt-0.5 h-4 w-4 text-emerald-700" />
                    <span>{step.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="programs" className="border-y border-border/40 bg-slate-50/60 py-16 md:py-20">
        <div className="container">
          <div className="mb-10 md:mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-900">
              Programs
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Designed for academic consistency and competitive confidence
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => {
              const Icon = program.icon;

              return (
                <Card
                  key={program.title}
                  className="h-full border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-800/30 hover:shadow-sm"
                >
                  <CardHeader>
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg leading-snug text-slate-900">
                      {program.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed text-slate-600">
                      {program.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="trust" className="container py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-900">
              Trust & Governance
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Built with academic quality controls parents can rely on
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
              Mentora Edutors operates with a process-first model so every
              student receives consistent educator quality, clear structure, and
              measurable learning continuity.
            </p>
          </div>

          <div className="grid gap-3">
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-lg border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-emerald-800/30 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-md bg-slate-900 p-2 text-white transition-colors duration-300 group-hover:bg-emerald-800">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="for-tutors" className="container pb-16 md:pb-20">
        <div className="rounded-2xl border border-emerald-900/20 bg-gradient-to-r from-emerald-50 to-white p-8 md:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-900">
                Educator Network
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Join Mentora as an Educator
              </h2>
            </div>

            <Button
              variant="outline"
              className="border-slate-300 bg-white text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-900 hover:bg-slate-50"
            >
              Apply as Tutor
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-slate-950 py-10 text-slate-300">
        <div className="container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Mentora Edutors</p>
            <p className="mt-1 text-xs text-slate-400">
              Structured learning support for classes 6–12 and competitive prep.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-5 text-sm">
            {footerLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="transition-colors duration-300 hover:text-white"
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
};

export default App;
