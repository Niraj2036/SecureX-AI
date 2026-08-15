"use client";

import React, { useEffect } from "react";
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

import { Building2, Users, ShieldCheck, UserX, Network } from "lucide-react";
import { V3PageHeader } from "@/components/v3/V3PageHeader";

// Types
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

// Nodes
function AdminNode({ data }: { data: any }) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-slate-900 text-white rounded-xl p-4 min-w-[210px] shadow-lg border border-white/20">
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !border-2 !border-white" />
      <div className="flex items-center gap-3">
        {data.avatar ? (
          <img src={data.avatar} alt={data.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/60" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
            {data.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-bold text-xs text-white leading-tight">{data.name}</p>
          <p className="text-[10px] text-indigo-200 leading-tight">{data.designation || "Administrator"}</p>
          <span className="mt-1 inline-flex items-center rounded-full bg-white/20 px-1.5 py-0 text-[9px] text-white">
            <ShieldCheck className="h-2.5 w-2.5 mr-1" /> Admin
          </span>
        </div>
      </div>
    </div>
  );
}

function DeptNode({ data }: { data: any }) {
  return (
    <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl p-3.5 min-w-[200px] shadow-md border border-white/20">
      <Handle type="target" position={Position.Top} className="!bg-violet-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!bg-violet-500 !border-2 !border-white" />
      <div className="flex items-center gap-2 mb-1.5">
        <Building2 className="h-4 w-4 text-white/90" />
        <p className="font-bold text-xs text-white leading-tight">{data.name}</p>
      </div>
      {data.lead && (
        <p className="text-[10px] text-white/80 mb-1.5">Lead: {data.lead.name}</p>
      )}
      <div className="flex gap-1.5">
        <span className="bg-white/20 rounded-full px-2 py-0.5 text-[9px] font-medium text-white">
          {data.teamCount} teams
        </span>
        <span className="bg-white/20 rounded-full px-2 py-0.5 text-[9px] font-medium text-white">
          {data.userCount} members
        </span>
      </div>
    </div>
  );
}

function TeamNode({ data }: { data: any }) {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl p-3 min-w-[180px] shadow-sm border border-white/20">
      <Handle type="target" position={Position.Top} className="!bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !border-2 !border-white" />
      <div className="flex items-center gap-2 mb-1">
        <Users className="h-3.5 w-3.5 text-white/90" />
        <p className="font-bold text-xs text-white leading-tight">{data.name}</p>
      </div>
      {data.lead && <p className="text-[10px] text-white/80 mb-1">Lead: {data.lead.name}</p>}
      <span className="bg-white/20 rounded-full px-2 py-0.5 text-[9px] font-medium text-white">
        {data.memberCount} members
      </span>
    </div>
  );
}

const ROLE_COLORS: Record<string, string> = {
  admin: "#6366f1",
  dept_head: "#8b5cf6",
  team_lead: "#3b82f6",
  employee: "#64748b",
};

function UserNode({ data }: { data: any }) {
  const roleColor = ROLE_COLORS[data.role] || "#64748b";
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 w-[160px] shadow-sm border border-border flex flex-col items-center gap-1.5 text-center">
      <Handle type="target" position={Position.Top} style={{ background: roleColor }} />
      <Link href={`/user-profiles?id=${data.id}`}>
        {data.avatar ? (
          <img src={data.avatar} alt={data.name} className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: roleColor }} />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: `${roleColor}20`, color: roleColor }}>
            {data.name?.[0]?.toUpperCase()}
          </div>
        )}
      </Link>
      <div>
        <Link href={`/user-profiles?id=${data.id}`}>
          <p className="font-bold text-xs text-foreground leading-tight hover:underline">{data.name}</p>
        </Link>
        {data.designation && <p className="text-[10px] text-muted-foreground mt-0.5">{data.designation}</p>}
        {data.role && (
          <span className="mt-1 inline-flex items-center rounded-full border px-1.5 py-0 text-[9px] uppercase font-semibold" style={{ borderColor: roleColor, color: roleColor }}>
            {data.role.replace("_", " ")}
          </span>
        )}
      </div>
    </div>
  );
}

const NODE_W = { admin: 210, dept: 200, team: 180, user: 160 };
const GAP = { adminX: 250, deptX: 270, teamX: 220, userX: 180 };
const TIER_Y = { admin: 0, dept: 180, team: 380, user: 580 };

function buildGraph(data: OrgStructure): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!data) return { nodes, edges };

  const { admins = [], departments = [], unassignedUsers = [] } = data;

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

    if (admins.length > 0) {
      edges.push({
        id: `admin0-${deptNodeId}`,
        source: `admin-${admins[0].id}`,
        target: deptNodeId,
        type: "smoothstep",
        style: { stroke: "#6366f1", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
      });
    }

    dept.teams.forEach((team, ti) => {
      const teamOffsetX = (ti - (dept.teams.length - 1) / 2) * GAP.teamX;
      const teamX = deptX + teamOffsetX;
      const teamNodeId = `team-${team.id}`;

      nodes.push({
        id: teamNodeId,
        type: "teamNode",
        position: { x: teamX, y: TIER_Y.team },
        data: { name: team.name, lead: team.lead, memberCount: team.users.length },
        style: { width: NODE_W.team },
      });

      edges.push({
        id: `${deptNodeId}-${teamNodeId}`,
        source: deptNodeId,
        target: teamNodeId,
        type: "smoothstep",
        style: { stroke: "#8b5cf6", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
      });

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
          style: { stroke: "#3b82f6", strokeWidth: 1 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
        });
      });
    });
  });

  return { nodes, edges };
}

const nodeTypes = {
  adminNode: AdminNode,
  deptNode: DeptNode,
  teamNode: TeamNode,
  userNode: UserNode,
};

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
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      {/* V3 Page Header */}
      <V3PageHeader
        title="Organization Hierarchy"
        description="Interactive tree map showing company administrators, departments, teams, and employee reporting structures."
        badgeText="Visual Tree"
        badgeIcon={<Network className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />}
      >
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-medium bg-background border border-border/80 px-3 py-1.5 rounded-lg shadow-sm">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> Admin
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-600" /> Department
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Team
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-500" /> Member
          </span>
        </div>
      </V3PageHeader>

      {/* ReactFlow Canvas */}
      <div className="flex-1 v3-card border border-border/70 overflow-hidden relative min-h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground animate-pulse">
            Loading organization hierarchy tree...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full text-xs text-destructive gap-2">
            <UserX className="h-8 w-8" />
            <span>Unable to load organization structure.</span>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-xs text-muted-foreground gap-2">
            <Users className="h-8 w-8 text-muted-foreground/50" />
            <span>No organization structure defined yet.</span>
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
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.1}
              maxZoom={2}
              className="w-full h-full"
            >
              <Background gap={24} color="#CBD5E1" />
              <Controls />
              <MiniMap
                nodeColor={(n) => {
                  if (n.type === "adminNode") return "#6366f1";
                  if (n.type === "deptNode") return "#8b5cf6";
                  if (n.type === "teamNode") return "#3b82f6";
                  return "#94a3b8";
                }}
                className="rounded-lg border shadow-sm"
              />
            </ReactFlow>
          </ReactFlowProvider>
        )}
      </div>
    </div>
  );
}