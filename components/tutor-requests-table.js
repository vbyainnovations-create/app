"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const App = ({ tutorName, initialRequests }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [topicCovered, setTopicCovered] = useState("");
  const [homeworkGiven, setHomeworkGiven] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const openModal = (request) => {
    setSelectedRequest(request);
    setTopicCovered("");
    setHomeworkGiven("");
    setSessionNotes("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const submitSessionReport = async () => {
    if (!selectedRequest) return;

    const topic = topicCovered.trim();
    const homework = homeworkGiven.trim();
    const notes = sessionNotes.trim();

    if (!topic || !homework || !notes) {
      window.alert("Please fill all fields before submitting the session report.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/session-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutor_name: tutorName,
          parent_name: selectedRequest?.parent_name || "",
          subject: selectedRequest?.subject || "",
          topic_cluster: selectedRequest?.topic_cluster || "",
          session_notes: `Topic Covered: ${topic}\n\nSession Notes: ${notes}`,
          homework,
          session_date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit session report");
      }

      closeModal();
      setSuccessMessage("Session report submitted successfully");
    } catch {
      window.alert("Unable to submit session report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {successMessage ? (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Parent Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Class Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Topic Cluster
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Area
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Session Report
                </th>
              </tr>
            </thead>
            <tbody>
              {initialRequests?.length > 0 ? (
                initialRequests.map((request, index) => (
                  <tr
                    key={`${request?.phone || "row"}-${index}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {request?.parent_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {request?.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {request?.class_level || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {request?.subject || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {request?.topic_cluster || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {request?.area || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {request?.status || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 border-slate-300 text-xs"
                        onClick={() => openModal(request)}
                      >
                        Submit Session Report
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No Tutor Assigned requests found for this tutor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">Submit Session Report</h2>
            <p className="mt-1 text-xs text-slate-500">
              {selectedRequest?.parent_name || "Student"} • {selectedRequest?.subject || "Subject"}
            </p>

            <div className="mt-4 space-y-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-slate-700">Topic Covered</label>
                <Input
                  value={topicCovered}
                  onChange={(event) => setTopicCovered(event.target.value)}
                  placeholder="Enter topic covered"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-slate-700">Homework Given</label>
                <Input
                  value={homeworkGiven}
                  onChange={(event) => setHomeworkGiven(event.target.value)}
                  placeholder="Enter homework details"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-slate-700">Session Notes</label>
                <Textarea
                  value={sessionNotes}
                  onChange={(event) => setSessionNotes(event.target.value)}
                  placeholder="Enter session notes"
                  rows={4}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-slate-900 hover:bg-slate-800"
                onClick={submitSessionReport}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default App;
