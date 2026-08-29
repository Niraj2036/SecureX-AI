"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Shield, Clock, FileText, MessageSquare } from "lucide-react";
import { V3PageHeader } from "@/components/v3/V3PageHeader";
import { V3Card } from "@/components/v3/V3Card";

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
          headers: { Authorization: `Bearer ${session.user.token}` },
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
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
          <span className="text-sm">Loading audit history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <V3PageHeader
        title="Security Audit Logs"
        description="Review AI assistant query history and document access audit trail."
        badgeText={`${audits.length} Queries`}
        badgeIcon={<Shield className="h-3 w-3 text-amber-600" />}
      />

      <V3Card className="overflow-hidden p-0">
        <div className="divide-y divide-border/40">
          {audits.length === 0 ? (
            <div className="py-16 text-center">
              <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No query history found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">AI assistant queries will appear here</p>
            </div>
          ) : (
            audits.map((audit, idx) => (
              <div key={audit.query_id} className="p-5 hover:bg-muted/20 transition-colors">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground bg-muted/60 rounded px-2 py-0.5 border border-border/40">
                    #{idx + 1} · {audit.query_id.slice(0, 8)}...
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(audit.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Question */}
                <div className="mb-2 flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Question</p>
                    <p className="text-sm text-foreground">{audit.question}</p>
                  </div>
                </div>

                {/* Answer */}
                <div className="flex items-start gap-2.5 pl-8">
                  <div className="w-full p-3 rounded-lg bg-muted/40 border border-border/40">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Answer</p>
                    <p className="text-xs text-foreground leading-relaxed">{audit.answer}</p>
                  </div>
                </div>

                {/* Accessed docs */}
                {audit.accessed_doc_ids?.length > 0 && (
                  <div className="mt-2 pl-8 flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      {audit.accessed_doc_ids.length} document{audit.accessed_doc_ids.length > 1 ? "s" : ""} accessed
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </V3Card>
    </div>
  );
}