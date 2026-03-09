const getParentParam = (rawParent) => {
  if (Array.isArray(rawParent)) {
    return (rawParent[0] || "").trim();
  }

  return (rawParent || "").trim();
};

const fetchParentReports = async (parentName) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || !parentName) {
    return [];
  }

  const params = new URLSearchParams({
    select: "session_date,tutor_name,subject,topic_cluster,homework,session_notes,parent_name",
    order: "session_date.desc",
  });

  params.append("parent_name", `ilike.${parentName}`);

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/session_reports?${params.toString()}`,
      {
        method: "GET",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const fetchSessionPackageProgress = async (parentName) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || !parentName) {
    return { totalSessions: 0, completedSessions: 0, remainingSessions: 0 };
  }

  const params = new URLSearchParams({
    select: "total_sessions,sessions_completed,parent_name",
  });

  params.append("parent_name", `ilike.${parentName}`);

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/intro_requests?${params.toString()}`,
      {
        method: "GET",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return { totalSessions: 0, completedSessions: 0, remainingSessions: 0 };
    }

    const data = await response.json();
    const rows = Array.isArray(data) ? data : [];

    const totalSessions = rows.reduce(
      (sum, row) => sum + Number(row?.total_sessions || 0),
      0
    );

    const completedSessions = rows.reduce(
      (sum, row) => sum + Number(row?.sessions_completed || 0),
      0
    );

    const remainingSessions = Math.max(totalSessions - completedSessions, 0);

    return { totalSessions, completedSessions, remainingSessions };
  } catch {
    return { totalSessions: 0, completedSessions: 0, remainingSessions: 0 };
  }
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

const App = async ({ searchParams }) => {
  const parentName = getParentParam(searchParams?.parent);

  if (!parentName) {
    return (
      <main className="bg-background">
        <section className="container flex min-h-[70vh] items-center justify-center py-12">
          <div className="rounded-xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
            <p className="text-lg font-medium text-slate-800">Unauthorized access</p>
          </div>
        </section>
      </main>
    );
  }

  const [reports, sessionProgress] = await Promise.all([
    fetchParentReports(parentName),
    fetchSessionPackageProgress(parentName),
  ]);

  return (
    <main className="bg-background">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container py-4">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
            Mentora Learning Progress
          </h1>
        </div>
      </header>

      <section className="container py-6 md:py-8">
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Session Package Progress
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total Sessions</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {sessionProgress?.totalSessions ?? 0}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Completed</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {sessionProgress?.completedSessions ?? 0}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Remaining</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {sessionProgress?.remainingSessions ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Session Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Tutor Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Topic Covered
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Homework
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports?.length > 0 ? (
                  reports.map((report, index) => (
                    <tr
                      key={`${report?.session_date || "row"}-${index}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {formatDateTime(report?.session_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {report?.tutor_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {report?.subject || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {report?.topic_cluster || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {report?.homework || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {report?.session_notes || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      No session reports available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
};

export default App;
