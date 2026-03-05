"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const stepLabels = [
  "Select Class",
  "Select Subject",
  "Select Topic Cluster",
  "Session Recommendation",
  "Book Free Intro Session",
];

const classOptions = [
  { id: "class-6-10", label: "Class 6–10" },
  { id: "class-11-12", label: "Class 11–12" },
  { id: "jee", label: "JEE Preparation" },
  { id: "neet", label: "NEET Preparation" },
  { id: "cuet", label: "CUET Preparation" },
];

const subjectMap = {
  "class-6-10": ["Maths", "Science", "English", "SST"],
  "class-11-12": [
    "Physics",
    "Chemistry",
    "Biology",
    "Mathematics",
    "Accountancy",
    "Business Studies",
    "Economics",
    "Applied Mathematics",
    "English",
  ],
  jee: ["JEE Physics", "JEE Chemistry", "JEE Mathematics"],
  neet: ["NEET Physics", "NEET Chemistry", "NEET Biology"],
  cuet: [
    "Physics",
    "Chemistry",
    "Biology",
    "Mathematics",
    "Applied Mathematics",
    "Accountancy",
    "Business Studies",
    "Economics",
    "English",
  ],
};

const App = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClassType, setSelectedClassType] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCluster, setSelectedCluster] = useState("");
  const [formData, setFormData] = useState({
    parentName: "",
    phoneNumber: "",
    location: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableSubjects = useMemo(() => {
    return subjectMap[selectedClassType] || [];
  }, [selectedClassType]);

  const topicClusters = useMemo(() => {
    if (!selectedSubject) return [];

    return [
      `${selectedSubject}: Foundation & Core Concepts`,
      `${selectedSubject}: Practice & Problem Solving`,
      `${selectedSubject}: Revision & Test Readiness`,
    ];
  }, [selectedSubject]);

  const progress = ((currentStep - 1) / (stepLabels.length - 1)) * 100;

  const canMoveNext = () => {
    if (currentStep === 1) return Boolean(selectedClassType);
    if (currentStep === 2) return Boolean(selectedSubject);
    if (currentStep === 3) return Boolean(selectedCluster);
    if (currentStep === 4) return true;

    return Boolean(
      formData.parentName.trim() &&
        formData.phoneNumber.trim() &&
        formData.location.trim()
    );
  };

  const onClassSelect = (id) => {
    setSelectedClassType(id);
    setSelectedSubject("");
    setSelectedCluster("");
  };

  const handleNext = () => {
    if (!canMoveNext()) return;

    if (currentStep === 5) {
      setIsSubmitted(true);
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (isSubmitted) {
    return (
      <main className="bg-background">
        <section className="container flex min-h-[80vh] items-center justify-center py-16">
          <Card className="w-full max-w-2xl border-slate-200">
            <CardContent className="p-8 text-center md:p-10">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Thank You
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
                Thank you. Your request for a free intro session has been
                received. Our team will contact you shortly.
              </p>
              <Button asChild className="mt-8 bg-slate-900 hover:bg-slate-800">
                <Link href="/">Back to Homepage</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-background">
      <section className="container py-8 md:py-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Homepage
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Book Your Free Intro Session
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            A guided booking flow for structured home learning and competitive
            preparation.
          </p>
        </div>

        <div className="mb-7 space-y-4 rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-900 to-emerald-700 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {stepLabels.map((step, index) => {
              const stepNumber = index + 1;
              const active = stepNumber === currentStep;
              const done = stepNumber < currentStep;

              return (
                <div
                  key={step}
                  className={`rounded-md border px-3 py-2 text-xs transition-colors md:text-sm ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : done
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <p className="font-semibold">Step {stepNumber}</p>
                  <p className="mt-0.5 leading-snug">{step}</p>
                </div>
              );
            })}
          </div>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">
              Step {currentStep}: {stepLabels[currentStep - 1]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 1 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {classOptions.map((option) => {
                  const isActive = selectedClassType === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onClassSelect(option.id)}
                      className={`rounded-lg border p-4 text-left transition-all ${
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-medium">{option.label}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableSubjects.map((subject) => {
                  const isActive = selectedSubject === subject;

                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => {
                        setSelectedSubject(subject);
                        setSelectedCluster("");
                      }}
                      className={`rounded-lg border p-4 text-left transition-all ${
                        isActive
                          ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-medium">{subject}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid gap-3">
                {topicClusters.map((cluster) => {
                  const isActive = selectedCluster === cluster;

                  return (
                    <button
                      key={cluster}
                      type="button"
                      onClick={() => setSelectedCluster(cluster)}
                      className={`rounded-lg border p-4 text-left transition-all ${
                        isActive
                          ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-medium">{cluster}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {currentStep === 4 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-medium text-emerald-800">
                  Session Recommendation
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  Recommended plan: 8 sessions × 90 minutes
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  This sample recommendation is shown as a starting point and can
                  be refined after the intro session.
                </p>
              </div>
            )}

            {currentStep === 5 && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="parentName">Parent Name</Label>
                  <Input
                    id="parentName"
                    placeholder="Enter parent name"
                    value={formData.parentName}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        parentName: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">Area / Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter area or locality"
                    value={formData.location}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                disabled={!canMoveNext()}
                className="bg-slate-900 hover:bg-slate-800"
              >
                {currentStep === 5 ? "Submit Booking Request" : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default App;
