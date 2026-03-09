"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

const docConfig = [
  { key: "aadhaarFront", label: "Aadhaar Card Front" },
  { key: "aadhaarBack", label: "Aadhaar Card Back" },
  { key: "panCard", label: "PAN Card" },
  { key: "liveSelfie", label: "Live Selfie" },
];

const chunkSize = 512 * 1024;

const toggleValue = (currentValues, value) => {
  if (currentValues.includes(value)) {
    return currentValues.filter((item) => item !== value);
  }

  return [...currentValues, value];
};

const App = () => {
  const [step, setStep] = useState(1);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    otp: "",
    otpVerified: false,
    email: "",
    city: "",
    area: "",
    subjects: [],
    classes: [],
    mode: "",
    experience: "",
    expectedFees: "",
    currentAddress: "",
    pincode: "",
  });

  const [otpMessage, setOtpMessage] = useState("");

  const [filesByDoc, setFilesByDoc] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    liveSelfie: null,
  });

  const [uploadState, setUploadState] = useState({
    aadhaarFront: { progress: 0, status: "idle", storagePath: "" },
    aadhaarBack: { progress: 0, status: "idle", storagePath: "" },
    panCard: { progress: 0, status: "idle", storagePath: "" },
    liveSelfie: { progress: 0, status: "idle", storagePath: "" },
  });

  const onInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isStepOneValid = useMemo(() => {
    return Boolean(
      formData.fullName.trim() &&
        formData.mobileNumber.trim() &&
        formData.email.trim() &&
        formData.city.trim() &&
        formData.area.trim() &&
        formData.subjects.length > 0 &&
        formData.classes.length > 0 &&
        formData.mode &&
        formData.experience.trim() &&
        formData.expectedFees.trim()
    );
  }, [formData]);

  const allDocsUploaded = useMemo(() => {
    return docConfig.every((doc) => uploadState[doc.key]?.status === "uploaded");
  }, [uploadState]);

  const canSubmitStepTwo = useMemo(() => {
    return Boolean(
      allDocsUploaded && formData.currentAddress.trim() && formData.pincode.trim()
    );
  }, [allDocsUploaded, formData.currentAddress, formData.pincode]);

  const handleFileSelect = (docKey, file) => {
    setFilesByDoc((prev) => ({
      ...prev,
      [docKey]: file,
    }));

    setUploadState((prev) => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        progress: 0,
        status: "selected",
        storagePath: "",
      },
    }));
  };

  const uploadDocument = async (docKey) => {
    const file = filesByDoc[docKey];

    if (!file) {
      window.alert("Please choose a file first.");
      return;
    }

    const uploadId = `${docKey}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const totalChunks = Math.ceil(file.size / chunkSize);

    try {
      setUploadState((prev) => ({
        ...prev,
        [docKey]: { ...prev[docKey], status: "uploading", progress: 0 },
      }));

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formDataPayload = new FormData();
        formDataPayload.append("uploadId", uploadId);
        formDataPayload.append("docType", docKey);
        formDataPayload.append("chunkIndex", String(chunkIndex));
        formDataPayload.append("totalChunks", String(totalChunks));
        formDataPayload.append("fileName", file.name);
        formDataPayload.append("chunk", chunk);

        const chunkResponse = await fetch("/api/tutor-documents/upload-chunk", {
          method: "POST",
          body: formDataPayload,
        });

        if (!chunkResponse.ok) {
          throw new Error("Chunk upload failed");
        }

        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);

        setUploadState((prev) => ({
          ...prev,
          [docKey]: { ...prev[docKey], progress },
        }));
      }

      const completeResponse = await fetch(
        "/api/tutor-documents/complete-upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uploadId,
            docType: docKey,
            fileName: file.name,
            totalChunks,
          }),
        }
      );

      const completePayload = await completeResponse.json();

      if (!completeResponse.ok) {
        throw new Error(completePayload?.message || "Upload finalization failed");
      }

      setUploadState((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          status: "uploaded",
          progress: 100,
          storagePath: completePayload?.storage_path || "",
        },
      }));
    } catch {
      setUploadState((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          status: "failed",
        },
      }));

      window.alert("Document upload failed. Please try again.");
    }
  };

  const handleSubmitApplication = async () => {
    if (!canSubmitStepTwo) {
      return;
    }

    try {
      setIsSubmittingApplication(true);

      const response = await fetch("/api/tutor-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          mobile_number: formData.mobileNumber,
          email_address: formData.email,
          city: formData.city,
          area_locality: formData.area,
          subjects_taught: formData.subjects,
          classes_taught: formData.classes,
          mode_of_teaching: formData.mode,
          years_of_experience: Number(formData.experience || 0),
          expected_hourly_fees: Number(formData.expectedFees || 0),
          current_address: formData.currentAddress,
          pincode: formData.pincode,
          aadhaar_front_path: uploadState.aadhaarFront.storagePath,
          aadhaar_back_path: uploadState.aadhaarBack.storagePath,
          pan_card_path: uploadState.panCard.storagePath,
          live_selfie_path: uploadState.liveSelfie.storagePath,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Submission failed");
      }

      setSuccessMessage("Application submitted successfully.");
    } catch {
      window.alert("Unable to submit application. Please try again.");
    } finally {
      setIsSubmittingApplication(false);
    }
  };


  if (successMessage) {
    return (
      <main className="bg-background text-foreground">
        <section className="container flex min-h-[80vh] items-center justify-center py-16">
          <Card className="w-full max-w-2xl border-slate-200 shadow-sm">
            <CardContent className="p-8 text-center md:p-10">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Application Submitted Successfully
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
                Thank you for applying to join Mentora Edutors. Your application
                has been successfully submitted. Our team will review your
                details and contact you shortly to proceed with the verification
                process.
              </p>
              <Button asChild className="mt-8 bg-slate-900 hover:bg-slate-800">
                <Link href="/">Return to Homepage</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

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
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div
                className={`rounded-md border px-3 py-2 ${
                  step === 1
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                Step 1: Basic Tutor Details
              </div>
              <div
                className={`rounded-md border px-3 py-2 ${
                  step === 2
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                Step 2: Identity Verification
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-5 md:p-8">
            {successMessage ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {successMessage}
              </div>
            ) : null}

            {step === 1 && (
              <>
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
                  <Button
                    className="bg-slate-900 hover:bg-slate-800"
                    onClick={() => setStep(2)}
                    disabled={!isStepOneValid}
                  >
                    Proceed to Verification
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold text-slate-900">
                  Identity Verification
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  {docConfig.map((doc) => {
                    const docState = uploadState[doc.key];

                    return (
                      <div
                        key={doc.key}
                        className="rounded-lg border border-slate-200 bg-white p-4"
                      >
                        <Label className="mb-2 block">{doc.label}</Label>
                        <Input
                          type="file"
                          onChange={(event) =>
                            handleFileSelect(doc.key, event.target.files?.[0] || null)
                          }
                        />
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => uploadDocument(doc.key)}
                            disabled={!filesByDoc[doc.key] || docState.status === "uploading"}
                          >
                            {docState.status === "uploading"
                              ? "Uploading..."
                              : docState.status === "uploaded"
                                ? "Re-upload"
                                : "Upload"}
                          </Button>
                          <span className="text-xs text-slate-600">
                            {docState.status === "uploaded"
                              ? "Uploaded"
                              : `${docState.progress}%`}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-slate-900 transition-all"
                            style={{ width: `${docState.progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="currentAddress">Current Address</Label>
                    <Textarea
                      id="currentAddress"
                      value={formData.currentAddress}
                      onChange={(event) =>
                        onInputChange("currentAddress", event.target.value)
                      }
                      placeholder="Enter current address"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(event) => onInputChange("pincode", event.target.value)}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back to Step 1
                  </Button>

                  <Button
                    className="bg-slate-900 hover:bg-slate-800"
                    onClick={handleSubmitApplication}
                    disabled={!canSubmitStepTwo || isSubmittingApplication}
                  >
                    {isSubmittingApplication ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default App;
