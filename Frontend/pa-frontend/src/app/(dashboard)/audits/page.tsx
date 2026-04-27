"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

type Audit = {
  query_id: string;
  question: string;
  answer: string;
  timestamp: string;
  accessed_doc_ids: string[];
};

export default function AuditsPage() {
  const { data: session } = useSession();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAudits() {
      if (!session?.user?.token) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/rag/audits`, {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAudits(data.audits || []);
        }
      } catch (error) {
        console.error("Failed to fetch audits:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAudits();
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full h-full">
      <Card className="w-full h-full flex flex-col">
        <CardHeader>
          <CardTitle>My Query Audits</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <ScrollArea className="h-[calc(100vh-12rem)] rounded-md border">
            <div className="p-4 space-y-4">
              {audits.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No query history found.
                </div>
              ) : (
                audits.map((audit) => (
                  <div key={audit.query_id} className="border rounded-lg p-4 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-start text-sm text-slate-500 mb-2">
                      <span className="font-mono text-xs">{audit.query_id}</span>
                      <span>{new Date(audit.timestamp).toLocaleString()}</span>
                    </div>
                    <div>
                      <strong className="text-slate-900">Q:</strong> <span className="text-slate-700">{audit.question}</span>
                    </div>
                    <div>
                      <strong className="text-slate-900">A:</strong> <span className="text-slate-700">{audit.answer}</span>
                    </div>
                    {audit.accessed_doc_ids?.length > 0 && (
                      <div className="text-xs text-slate-500 mt-2 pt-2 border-t">
                        Accessed Documents: {audit.accessed_doc_ids.length}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
