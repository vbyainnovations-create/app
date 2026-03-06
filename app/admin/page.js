const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const fetchIntroRequests = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return [];
  }

  const url = `${supabaseUrl}/rest/v1/intro_requests?select=parent_name,phone,class_level,subject,topic_cluster,area,created_at&order=created_at.desc`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const App = async ({ searchParams }) => {
  const isAdmin = searchParams?.admin === "true";

  if (!isAdmin) {
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

  const requests = await fetchIntroRequests();

  return (
    <main className="bg-background">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container py-4">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
            Mentora Admin Dashboard
          </h1>
        </div>
      </header>

      <section className="container py-6 md:py-8">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full border-collapse">
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
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests?.length > 0 ? (
                  requests.map((request, index) => (
                    <tr
                      key={`${request?.phone || "row"}-${request?.created_at || index}`}
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
                        {formatDateTime(request?.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
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
      </section>
    </main>
  );
};

export default App;
