import AdminRequestsTable from "@/components/admin-requests-table";

const fetchIntroRequests = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return [];
  }

  const url = `${supabaseUrl}/rest/v1/intro_requests?select=id,parent_name,phone,class_level,subject,topic_cluster,area,created_at,status&order=created_at.desc`;

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
        <AdminRequestsTable initialRequests={requests} />
      </section>
    </main>
  );
};

export default App;
