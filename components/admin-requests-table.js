"use client";

import { useState } from "react";

const statusOptions = [
  "New",
  "Contacted",
  "Tutor Assigned",
  "Completed",
  "Closed",
];

const statusBadgeMap = {
  New: "bg-blue-100 text-blue-700 border-blue-200",
  Contacted: "bg-orange-100 text-orange-700 border-orange-200",
  "Tutor Assigned": "bg-purple-100 text-purple-700 border-purple-200",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Closed: "bg-slate-100 text-slate-700 border-slate-200",
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getSafeStatus = (status) => {
  return statusOptions.includes(status) ? status : "New";
};

const App = ({ initialRequests }) => {
  const [requests, setRequests] = useState(
    (initialRequests || []).map((request) => ({
      ...request,
      status: getSafeStatus(request?.status),
    }))
  );

  const [updatingId, setUpdatingId] = useState("");

  const handleStatusChange = async (id, nextStatus) => {
    const idValue = String(id);

    const previousStatus =
      requests.find((request) => String(request?.id) === idValue)?.status || "New";

    setRequests((prev) =>
      prev.map((request) =>
        String(request?.id) === idValue
          ? { ...request, status: nextStatus }
          : request
      )
    );

    try {
      setUpdatingId(idValue);

      const response = await fetch("/api/intro-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: nextStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }
    } catch {
      setRequests((prev) =>
        prev.map((request) =>
          String(request?.id) === idValue
            ? { ...request, status: previousStatus }
            : request
        )
      );

      window.alert("Unable to update status. Please try again.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
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
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {requests?.length > 0 ? (
              requests.map((request, index) => {
                const status = getSafeStatus(request?.status);

                return (
                  <tr
                    key={`${request?.id || "row"}-${index}`}
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeMap[status]}`}
                        >
                          {status}
                        </span>
                        <select
                          value={status}
                          onChange={(event) =>
                            handleStatusChange(request?.id, event.target.value)
                          }
                          disabled={updatingId === String(request?.id)}
                          className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
                        >
                          {statusOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {formatDateTime(request?.created_at)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  No intro session requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
