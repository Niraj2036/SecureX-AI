function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Integration Cards */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        {/* Live Excel Integration */}
        <div className="aspect-video flex items-center justify-center rounded-xl animate-pulse bg-gray-200 p-4">
          <span className="text-lg font-semibold text-green-800">Excel Integration (Coming Soon)</span>
        </div>

        {/* Coming Soon HRIS Integrations */}
        <div className="aspect-video flex items-center justify-center rounded-xl animate-pulse bg-gray-200 p-4">
          <span className="text-lg font-semibold text-gray-600">HRIS Integration (Coming Soon)</span>
        </div>
      </div>
        <div className="min-h-[50vh] flex items-center justify-center rounded-xl animate-pulse bg-gray-200 p-4">
          <span className="text-lg font-semibold text-gray-600">Another HRIS (Coming Soon)</span>
        </div>

      {/* Placeholder for additional content */}
      {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
    </div>
  );
}

export default Page;
