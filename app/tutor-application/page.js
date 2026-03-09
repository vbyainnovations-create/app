"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const subjectOptions = [
  "Maths",
  "Science",
  "English",
  "SST",
  "Physics",
  "Chemistry",
  "Biology",
  "Mathematics",
  "Accountancy",
  "Business Studies",
  "Economics",
  "Applied Mathematics",
  "JEE Physics",
  "JEE Chemistry",
  "JEE Mathematics",
  "NEET Physics",
  "NEET Chemistry",
  "NEET Biology",
  "CUET Subjects",
];

const classOptions = [
  "Class 6-10",
  "Class 11-12",
  "JEE Preparation",
  "NEET Preparation",
  "CUET Preparation",
];

const teachingModes = ["Home Tuition", "Online", "Both"];

const toggleValue = (currentValues, value) => {
  if (currentValues.includes(value)) {
    return currentValues.filter((item) => item !== value);
  }

  return [...currentValues, value];
};

const App = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    otp: "",
    email: "",
    city: "",
    area: "",
    subjects: [],
    classes: [],
    mode: "",
    experience: "",
    expectedFees: "",
  });

  const [otpMessage, setOtpMessage] = useState("");

  const onInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onProceed = () => {
    window.alert("Step 1 details captured. Proceeding to verification flow next.");
  };

  return (
    <main className="bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-3 px-4 sm:px-5 md:px-8">
          <Link
            href="/"
            aria-label="Mentora Edutors homepage"
            className="inline-flex items-center"
          >
            <Image
              src="/mentora-logo-clean.png"
              alt="Mentora Edutors"
              width={460}
              height={120}
              priority
              className="h-9 w-auto object-contain sm:h-10"
            />
          </Link>

          <Button asChild variant="outline" className="text-xs sm:text-sm">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </header>

      <section className="container py-8 md:py-12">
        <Card className="mx-auto max-w-5xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              Mentora Educator Application
            </CardTitle>
            <p className="text-sm text-slate-600">
              Step 1: Basic Tutor Details
            </p>
          </CardHeader>

          <CardContent className="space-y-6 p-5 md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(event) => onInputChange("fullName", event.target.value)}
                  placeholder="Enter full name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="emailAddress">Email Address</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={formData.email}
                  onChange={(event) => onInputChange("email", event.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="mobileNumber">Mobile Number with OTP verification</Label>
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <Input
                    id="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={(event) =>
                      onInputChange("mobileNumber", event.target.value)
                    }
                    placeholder="Enter mobile number"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setOtpMessage(
                        "OTP provider setup pending. Share Twilio keys to enable real SMS OTP."
                      )
                    }
                  >
                    Send OTP
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <Input
                    value={formData.otp}
                    onChange={(event) => onInputChange("otp", event.target.value)}
                    placeholder="Enter OTP"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setOtpMessage(
                        "Verification UI ready. Real OTP verification will activate once Twilio keys are added."
                      )
                    }
                  >
                    Verify OTP
                  </Button>
                </div>

                {otpMessage ? (
                  <p className="text-xs text-amber-700">{otpMessage}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(event) => onInputChange("city", event.target.value)}
                  placeholder="Enter city"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="area">Area / Locality</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(event) => onInputChange("area", event.target.value)}
                  placeholder="Enter area / locality"
                />
              </div>

              <div className="grid gap-2">
                <Label>Years of Experience</Label>
                <Input
                  value={formData.experience}
                  onChange={(event) =>
                    onInputChange("experience", event.target.value)
                  }
                  placeholder="e.g. 4"
                />
              </div>

              <div className="grid gap-2">
                <Label>Expected Hourly Fees</Label>
                <Input
                  value={formData.expectedFees}
                  onChange={(event) =>
                    onInputChange("expectedFees", event.target.value)
                  }
                  placeholder="e.g. 800"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="mb-2 block">Subjects taught</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {subjectOptions.map((subject) => (
                    <label
                      key={subject}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() =>
                          onInputChange(
                            "subjects",
                            toggleValue(formData.subjects, subject)
                          )
                        }
                      />
                      <span>{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Classes taught</Label>
                <div className="space-y-2">
                  {classOptions.map((classItem) => (
                    <label
                      key={classItem}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.classes.includes(classItem)}
                        onChange={() =>
                          onInputChange(
                            "classes",
                            toggleValue(formData.classes, classItem)
                          )
                        }
                      />
                      <span>{classItem}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Mode of teaching</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {teachingModes.map((mode) => (
                  <label
                    key={mode}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                      formData.mode === mode
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="teachingMode"
                      checked={formData.mode === mode}
                      onChange={() => onInputChange("mode", mode)}
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <Button className="bg-slate-900 hover:bg-slate-800" onClick={onProceed}>
                Proceed to Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default App;
