"use client";

import { useMemo, useState } from "react";
import Script from "next/script";
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

const paymentPackages = [
  { id: "single-session", label: "1 Session", amount: 800 },
  { id: "ten-session-package", label: "10 Sessions Package", amount: 7600 },
];

const getPackageById = (id) => {
  return paymentPackages.find((item) => item.id === id) || paymentPackages[0];
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookingSaved, setIsBookingSaved] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(
    paymentPackages[0].id
  );
  const razorpayPublicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

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

    if (isBookingSaved) {
      return Boolean(selectedPackageId);
    }

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

  const handleNext = async () => {
    if (!canMoveNext()) return;

    if (currentStep === 5 && !isBookingSaved) {
      try {
        setIsSubmitting(true);

        const response = await fetch("/api/intro-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parent_name: formData.parentName,
            phone: formData.phoneNumber,
            class_level: classOptions.find((item) => item.id === selectedClassType)
              ?.label,
            subject: selectedSubject,
            topic_cluster: selectedCluster,
            area: formData.location,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit booking request");
        }

        setIsBookingSaved(true);
      } catch (error) {
        window.alert(
          "We couldn't submit your request right now. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (currentStep === 5 && isBookingSaved) {
      try {
        setIsSubmitting(true);

        if (typeof window === "undefined" || !window.Razorpay) {
          throw new Error("Razorpay SDK not loaded");
        }

        if (!razorpayPublicKey) {
          throw new Error("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID");
        }

        const selectedPackage = getPackageById(selectedPackageId);

        const createOrderResponse = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parent_name: formData.parentName,
            phone: formData.phoneNumber,
            amount: selectedPackage.amount,
          }),
        });

        const orderData = await createOrderResponse.json();

        if (!createOrderResponse.ok) {
          throw new Error(orderData?.message || "Unable to create payment order");
        }

        const razorpay = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Mentora Edutors",
          description: selectedPackage.label,
          order_id: orderData.order_id,
          handler: async (responsePayload) => {
            try {
              const verifyResponse = await fetch("/api/payments/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  parent_name: formData.parentName,
                  phone: formData.phoneNumber,
                  amount: selectedPackage.amount,
                  razorpay_order_id: responsePayload?.razorpay_order_id,
                  razorpay_payment_id: responsePayload?.razorpay_payment_id,
                  razorpay_signature: responsePayload?.razorpay_signature,
                }),
              });

              if (!verifyResponse.ok) {
                throw new Error("Payment verification failed");
              }

              setIsSubmitted(true);
            } catch {
              window.alert("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: formData.parentName,
            contact: formData.phoneNumber,
          },
          theme: {
            color: "#0f172a",
          },
        });

        razorpay.on("payment.failed", async (failureData) => {
          await fetch("/api/payments/failed", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              parent_name: formData.parentName,
              phone: formData.phoneNumber,
              amount: selectedPackage.amount,
              payment_id:
                failureData?.error?.metadata?.payment_id ||
                failureData?.error?.metadata?.razorpay_payment_id ||
                "",
            }),
          });
        });

        razorpay.open();
      } catch {
        window.alert("Unable to start payment. Please try again.");
      } finally {
        setIsSubmitting(false);
      }

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
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />
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

            {currentStep === 5 && !isBookingSaved && (
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

            {currentStep === 5 && isBookingSaved && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 md:p-5">
                <p className="text-sm font-medium text-slate-700">Payment Options</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {paymentPackages.map((pkg) => {
                    const active = selectedPackageId === pkg.id;

                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`rounded-lg border bg-white p-4 text-left transition-all ${
                          active
                            ? "border-slate-900 ring-1 ring-slate-900"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-900">{pkg.label}</p>
                        <p className="mt-1 text-lg font-semibold text-emerald-700">
                          ₹{pkg.amount}
                        </p>
                      </button>
                    );
                  })}
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
                disabled={!canMoveNext() || isSubmitting}
                className="bg-slate-900 hover:bg-slate-800"
              >
                {currentStep === 5
                  ? isBookingSaved
                    ? "Proceed to Payment"
                    : "Submit Booking Request"
                  : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      </main>
    </>
  );
};

export default App;
