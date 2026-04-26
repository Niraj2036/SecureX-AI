"use client";

import React, { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import {
  ReactFlow,
  ReactFlowProvider,
  MarkerType,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Background,
  Controls,
  Handle,
  Position,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, User, ShieldCheck, UserX } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface OrgUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  designation?: string;
  role?: string;
}

interface OrgTeam {
  id: string;
  name: string;
  lead?: OrgUser | null;
  users: OrgUser[];
}

interface OrgDept {
  id: string;
  name: string;
  lead?: OrgUser | null;
  teams: OrgTeam[];
  directUsers: OrgUser[];
}

interface OrgStructure {
  admins: OrgUser[];
  departments: OrgDept[];
  unassignedUsers: OrgUser[];
}

// ─────────────────────────────────────────────
// Node: Admin
// ─────────────────────────────────────────────
function AdminNode({ data }: { data: any }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        borderRadius: "16px",
        padding: "16px 20px",
        minWidth: "200px",
        boxShadow: "0 8px 32px rgba(124, 58, 237, 0.35)",
        border: "1.5px solid rgba(255,255,255,0.2)",
        color: "#fff",
      }}
    >
      <Handle type="source" position={Position.Bottom} style={{ background: "#7c3aed", border: "2px solid #fff" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ position: "relative" }}>
          {data.avatar ? (
            <img
              src={data.avatar}
              alt={data.name}
              style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.6)" }}
            />
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 700, color: "#fff"
            }}>
              {data.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div style={{
            position: "absolute", bottom: -2, right: -2,
            background: "#10b981", borderRadius: "50%", width: 14, height: 14,
            border: "2px solid #4f46e5"
          }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "#fff" }}>{data.name}</p>
          <p style={{ fontSize: 11, margin: "2px 0 0", color: "rgba(255,255,255,0.75)" }}>{data.designation || data.role}</p>
          <span style={{
            display: "inline-block", marginTop: 4, padding: "2px 8px",
            background: "rgba(255,255,255,0.2)", borderRadius: 20,
            fontSize: 10, fontWeight: 600, color: "#fff", letterSpacing: "0.5px"
          }}>
            <ShieldCheck size={9} style={{ display: "inline", marginRight: 3 }} />
            ADMIN
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Node: Department
// ─────────────────────────────────────────────
function DeptNode({ data }: { data: any }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
        borderRadius: "14px",
        padding: "14px 18px",
        minWidth: "210px",
        boxShadow: "0 6px 24px rgba(37, 99, 235, 0.3)",
        border: "1.5px solid rgba(255,255,255,0.15)",
        color: "#fff",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#2563eb", border: "2px solid #fff" }} />
      <Handle type="source" position={Position.Bottom} style={{ background: "#2563eb", border: "2px solid #fff" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 8 }}>
        <Building2 size={18} color="rgba(255,255,255,0.85)" />
        <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: "#fff" }}>{data.name}</p>
      </div>
      {data.lead && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          {data.lead.avatar ? (
            <img src={data.lead.avatar} style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
              {data.lead.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>{data.lead.name}</span>
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "2px 8px", fontSize: 10, color: "#fff" }}>
          {data.teamCount} {data.teamCount === 1 ? "team" : "teams"}
        </span>
        <span style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "2px 8px", fontSize: 10, color: "#fff" }}>
          {data.userCount} {data.userCount === 1 ? "member" : "members"}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Node: Team
// ─────────────────────────────────────────────
function TeamNode({ data }: { data: any }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
        borderRadius: "12px",
        padding: "12px 16px",
        minWidth: "185px",
        boxShadow: "0 4px 18px rgba(13, 148, 136, 0.28)",
        border: "1.5px solid rgba(255,255,255,0.12)",
        color: "#fff",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#0d9488", border: "2px solid #fff" }} />
      <Handle type="source" position={Position.Bottom} style={{ background: "#0d9488", border: "2px solid #fff" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: 6 }}>
        <Users size={15} color="rgba(255,255,255,0.85)" />
        <p style={{ fontWeight: 700, fontSize: 12, margin: 0, color: "#fff" }}>{data.name}</p>
      </div>
      {data.lead && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
          {data.lead.avatar ? (
            <img src={data.lead.avatar} style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>
              {data.lead.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.85)" }}>Lead: {data.lead.name}</span>
        </div>
      )}
      <span style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: "2px 8px", fontSize: 10, color: "#fff" }}>
        {data.memberCount} {data.memberCount === 1 ? "member" : "members"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Node: User
// ─────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  admin: "#7c3aed",
  dept_head: "#2563eb",
  team_lead: "#0d9488",
  employee: "#64748b",
};

function UserNode({ data }: { data: any }) {
  const roleColor = ROLE_COLORS[data.role] || "#64748b";
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "12px 14px",
        width: "162px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: `1.5px solid ${roleColor}30`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: roleColor }} />
      <Link href={`/user-profiles?id=${data.id}`} style={{ textDecoration: "none" }}>
        {data.avatar ? (
          <img
            src={data.avatar}
            alt={data.name}
            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: `2px solid ${roleColor}` }}
          />
        ) : (
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: `${roleColor}20`,
            border: `2px solid ${roleColor}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: roleColor
          }}>
            {data.name?.[0]?.toUpperCase()}
          </div>
        )}
      </Link>
      <div style={{ textAlign: "center" }}>
        <Link href={`/user-profiles?id=${data.id}`} style={{ textDecoration: "none" }}>
          <p style={{ fontWeight: 600, fontSize: 12, margin: 0, color: "#1e293b", lineHeight: 1.3 }}>
            {data.name}
          </p>
        </Link>
        {data.designation && (
          <p style={{ fontSize: 10, margin: "2px 0 0", color: "#64748b" }}>{data.designation}</p>
        )}
        {data.role && (
          <span style={{
            display: "inline-block", marginTop: 4, padding: "2px 8px",
            background: `${roleColor}18`, borderRadius: 20,
            fontSize: 9, fontWeight: 600, color: roleColor,
            textTransform: "uppercase", letterSpacing: "0.4px"
          }}>
            {data.role.replace("_", " ")}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Layout transformer
// ─────────────────────────────────────────────
const NODE_W = { admin: 240, dept: 230, team: 200, user: 172 };
const GAP = { adminX: 280, deptX: 300, teamX: 240, userX: 195 };
const TIER_Y = { admin: 0, dept: 200, team: 430, user: 660 };

function buildGraph(data: OrgStructure): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!data) return { nodes, edges };

  const { admins = [], departments = [], unassignedUsers = [] } = data;

  // ── ADMIN TIER ──
  const adminTotalW = admins.length * GAP.adminX;
  admins.forEach((admin, i) => {
    const x = (i - (admins.length - 1) / 2) * GAP.adminX;
    nodes.push({
      id: `admin-${admin.id}`,
      type: "adminNode",
      position: { x, y: TIER_Y.admin },
      data: { ...admin },
      style: { width: NODE_W.admin },
    });
  });

  // ── DEPT TIER ──
  // Calculate total dept width to centre under admins
  const totalDeptW = departments.length * GAP.deptX;

  departments.forEach((dept, di) => {
    const deptX = (di - (departments.length - 1) / 2) * GAP.deptX;
    const deptNodeId = `dept-${dept.id}`;
    const totalUserCount = dept.teams.reduce((s, t) => s + t.users.length, 0) + dept.directUsers.length;

    nodes.push({
      id: deptNodeId,
      type: "deptNode",
      position: { x: deptX, y: TIER_Y.dept },
      data: {
        name: dept.name,
        lead: dept.lead,
        teamCount: dept.teams.length,
        userCount: totalUserCount,
      },
      style: { width: NODE_W.dept },
    });

    // Edge: admin → dept (from first admin if exists, otherwise no connection)
    if (admins.length > 0) {
      edges.push({
        id: `admin0-${deptNodeId}`,
        source: `admin-${admins[0].id}`,
        target: deptNodeId,
        type: "smoothstep",
        animated: false,
        style: { stroke: "#7c3aed", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#7c3aed" },
      });
    }

    // ── TEAM TIER (under dept) ──
    const teams = dept.teams;
    const allTeamSpreads = teams.length || 1;
    // Total horizontal space needed for teams under this dept
    const teamsBlockW = (teams.length - 1) * GAP.teamX;

    teams.forEach((team, ti) => {
      const teamOffsetX = (ti - (teams.length - 1) / 2) * GAP.teamX;
      const teamX = deptX + teamOffsetX;
      const teamNodeId = `team-${team.id}`;

      nodes.push({
        id: teamNodeId,
        type: "teamNode",
        position: { x: teamX, y: TIER_Y.team },
        data: {
          name: team.name,
          lead: team.lead,
          memberCount: team.users.length,
        },
        style: { width: NODE_W.team },
      });

      // Edge: dept → team
      edges.push({
        id: `${deptNodeId}-${teamNodeId}`,
        source: deptNodeId,
        target: teamNodeId,
        type: "smoothstep",
        style: { stroke: "#2563eb", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#2563eb" },
      });

      // ── USER TIER (under team) ──
      team.users.forEach((user, ui) => {
        const userOffsetX = (ui - (team.users.length - 1) / 2) * GAP.userX;
        const userNodeId = `user-${user.id}`;

        nodes.push({
          id: userNodeId,
          type: "userNode",
          position: { x: teamX + userOffsetX, y: TIER_Y.user },
          data: { ...user },
          style: { width: NODE_W.user },
        });

        edges.push({
          id: `${teamNodeId}-${userNodeId}`,
          source: teamNodeId,
          target: userNodeId,
          type: "smoothstep",
          style: { stroke: "#0d9488", strokeWidth: 1 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#0d9488" },
        });
      });
    });

    // ── Direct users of dept (no team) ──
    dept.directUsers.forEach((user, ui) => {
      const baseDeptDirectX = deptX + (teams.length * GAP.teamX) / 2 + GAP.teamX;
      const userOffsetX = (ui - (dept.directUsers.length - 1) / 2) * GAP.userX;
      const userNodeId = `user-${user.id}`;

      // avoid duplicate node if they appear in teams too
      if (!nodes.find((n) => n.id === userNodeId)) {
        nodes.push({
          id: userNodeId,
          type: "userNode",
          position: { x: deptX + userOffsetX, y: TIER_Y.team },
          data: { ...user },
          style: { width: NODE_W.user },
        });

        edges.push({
          id: `${deptNodeId}-direct-${userNodeId}`,
          source: deptNodeId,
          target: userNodeId,
          type: "smoothstep",
          style: { stroke: "#2563eb", strokeWidth: 1, strokeDasharray: "4 3" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#2563eb" },
        });
      }
    });
  });

  // ── Unassigned users ──
  const unassignedY = TIER_Y.user + 160;
  unassignedUsers.forEach((user, ui) => {
    const x = (ui - (unassignedUsers.length - 1) / 2) * GAP.userX;
    const userNodeId = `user-${user.id}`;
    if (!nodes.find((n) => n.id === userNodeId)) {
      nodes.push({
        id: userNodeId,
        type: "userNode",
        position: { x, y: unassignedY },
        data: { ...user },
        style: { width: NODE_W.user, opacity: 0.7 },
      });
    }
  });

  return { nodes, edges };
}

// ─────────────────────────────────────────────
// Node type map
// ─────────────────────────────────────────────
const nodeTypes = {
  adminNode: AdminNode,
  deptNode: DeptNode,
  teamNode: TeamNode,
  userNode: UserNode,
};

// ─────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────
function OrgSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, padding: 60 }}>
      {/* Admin row */}
      <div style={{ display: "flex", gap: 20 }}>
        {[1].map((i) => (
          <div key={i} style={{ width: 220, height: 80, borderRadius: 14, background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        ))}
      </div>
      {/* Dept row */}
      <div style={{ display: "flex", gap: 24 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ width: 200, height: 90, borderRadius: 12, background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        ))}
      </div>
      {/* Team row */}
      <div style={{ display: "flex", gap: 20 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ width: 165, height: 70, borderRadius: 10, background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        ))}
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function OrgChartPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: session } = useSession();

  const { data: orgData, isLoading, isError } = useQuery({
    queryKey: ["org-structure", session?.user?.token],
    enabled: !!session?.user?.token,
    queryFn: async () => {
      const res = await axios.get(`${backendUrl}/users/org-structure`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      return res.data.data as OrgStructure;
    },
  });

  useEffect(() => {
    if (orgData) {
      const { nodes: n, edges: e } = buildGraph(orgData);
      setNodes(n);
      setEdges(e);
    }
  }, [orgData, setNodes, setEdges]);

  return (
    <div className="flex flex-col h-[83%] mx-6 mb-5">
      {/* Legend */}
      <div className="flex items-center gap-5 px-4 py-2 mb-2 bg-white rounded-xl border shadow-sm text-xs font-medium">
        <span className="flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed", display: "inline-block" }} />
          Admin
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
          Department
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#0d9488", display: "inline-block" }} />
          Team
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#64748b", display: "inline-block" }} />
          Member
        </span>
        {orgData && (
          <span className="ml-auto text-slate-500">
            {orgData.admins?.length} admin{orgData.admins?.length !== 1 ? "s" : ""} ·{" "}
            {orgData.departments?.length} dept{orgData.departments?.length !== 1 ? "s" : ""} ·{" "}
            {orgData.departments?.reduce((s, d) => s + d.teams.length, 0)} teams
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 border rounded-xl overflow-hidden bg-slate-50">
        {isLoading ? (
          <OrgSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
            <UserX size={40} className="text-slate-300" />
            <p className="font-medium">Failed to load org structure</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
            <Users size={40} className="text-slate-300" />
            <p className="font-medium">No org structure found</p>
            <p className="text-sm text-slate-400">Invite employees and assign them to departments & teams</p>
          </div>
        ) : (
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              minZoom={0.08}
              maxZoom={2}
              className="w-full h-full"
            >
              <Background color="#e2e8f0" gap={20} />
              <Controls />
              <MiniMap
                nodeColor={(n) => {
                  if (n.type === "adminNode") return "#7c3aed";
                  if (n.type === "deptNode") return "#2563eb";
                  if (n.type === "teamNode") return "#0d9488";
                  return "#94a3b8";
                }}
                style={{ border: "1px solid #e2e8f0", borderRadius: 8 }}
              />
            </ReactFlow>
          </ReactFlowProvider>
        )}
      </div>
    </div>
  );
}
