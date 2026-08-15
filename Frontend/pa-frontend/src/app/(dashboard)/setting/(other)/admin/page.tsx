"use client";

import OkrAdminSideBar from "@/components/setting-components/ork-admin-sidebar";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { ReactFlowProvider } from "reactflow";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import DepartmentNode from "@/components/admin/adminChart/DepartmentNode";
import TeamNode from "@/components/admin/adminChart/TeamNode";
import CompanyNode from "@/components/admin/adminChart/CompanyNode";
import Inviteusers from "@/components/setting-components/invite-usersheet";
import useSessionStore from "@/store/signupStore";
import { UserPlus, Building2, Network } from "lucide-react";
import { V3PageHeader } from "@/components/v3/V3PageHeader";
import { V3Card } from "@/components/v3/V3Card";
import { V3Button } from "@/components/v3/V3Button";

const nodeTypes = {
  department: DepartmentNode,
  team: TeamNode,
  company: CompanyNode,
};

const Page = () => {
  const { data: session } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const [showDepartments, setShowDepartments] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<Map<string, boolean>>(new Map());
  const { companyName } = useSessionStore((state) => state);

  const { data: departmentData } = useQuery({
    queryKey: ["department", session?.user?.token],
    queryFn: async () => {
      if (!session?.user?.token) return { data: { data: [] } };
      const response = await axios.get(`${backendUrl}/teams/dept`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      return response.data;
    },
    enabled: !!session?.user?.token,
  });

  const { data: teamData, refetch: fetchTeams, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams", selectedDepartmentId],
    queryFn: async () => {
      if (!selectedDepartmentId) return { data: [] };
      const response = await axios.get(`${backendUrl}/teams/teams/${selectedDepartmentId}`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      const teamsData = response.data.data.data;
      const sanitizedData = teamsData.map((team: any) => ({
        id: team.id,
        name: team.name,
        users: team.users.length,
      }));
      return { data: sanitizedData };
    },
    enabled: !!selectedDepartmentId,
  });

  const toggleTeams = useCallback((departmentId: string) => {
    setSelectedDepartmentId((prevId) => prevId === departmentId ? null : departmentId);
    setSelectedDepartments((prev) => {
      const newMap = new Map(prev);
      newMap.set(departmentId, !newMap.get(departmentId));
      return newMap;
    });
  }, []);

  useEffect(() => {
    if (selectedDepartmentId) fetchTeams();
  }, [selectedDepartmentId, fetchTeams]);

  const initialNodes = useMemo(
    () => [{
      id: "1",
      type: "company",
      position: { x: 300, y: 50 },
      data: {
        name: companyName,
        users: departmentData?.data?.data.length,
        toggleDepartments: () => setShowDepartments((prev) => !prev),
      },
    }],
    [companyName, departmentData]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    let newNodes = [...initialNodes];
    let newEdges: Edge[] = [];

    if (showDepartments && departmentData?.data?.data) {
      const departmentNodes = departmentData.data.data.map((dept: any, index: number) => ({
        id: dept.id.toString(),
        type: "department",
        position: { x: 400, y: 200 * (index + 1) },
        data: { name: dept.name, id: dept.id, users: 0, toggleTeams },
      }));

      const departmentEdges = departmentData.data.data.map((dept: any) => ({
        id: `edge-company-${dept.id}`,
        source: "1",
        target: dept.id.toString(),
        type: "smoothstep",
        animated: true,
      }));

      newNodes = [...newNodes, ...departmentNodes];
      newEdges = [...newEdges, ...departmentEdges];
    }

    if (teamData?.data && selectedDepartmentId) {
      const departmentNode = newNodes.find((node) => node.id === selectedDepartmentId);
      if (departmentNode) {
        const departmentPosition = departmentNode.position;
        const departmentIndex = newNodes.findIndex((node) => node.id === selectedDepartmentId);
        if (departmentIndex >= 0) {
          newNodes[departmentIndex] = {
            ...newNodes[departmentIndex],
            data: { ...newNodes[departmentIndex].data, users: teamData.data.length },
          };
        }

        const teamNodes = teamData.data.map((team: any, index: number) => ({
          id: `team-${team.id}`,
          type: "team",
          position: { x: departmentPosition.x + 500 + 400 * index, y: departmentPosition.y + 80 },
          data: { name: team.name, users: team.users },
        }));

        const teamEdges = teamData.data.map((team: any) => ({
          id: `edge-dept-${selectedDepartmentId}-team-${team.id}`,
          source: selectedDepartmentId,
          target: `team-${team.id}`,
          type: "smoothstep",
          animated: true,
        }));

        newNodes = [...newNodes, ...teamNodes];
        newEdges = [...newEdges, ...teamEdges];
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [showDepartments, departmentData, teamData, selectedDepartmentId, initialNodes, toggleTeams, setNodes, setEdges]);

  return (
    <div className="space-y-6">
      <V3PageHeader
        title="Organization Chart"
        description="Visual org structure showing company, departments, and teams hierarchy."
        badgeText="Interactive Chart"
        badgeIcon={<Network className="h-3 w-3 text-indigo-600" />}
      >
        <Inviteusers>
          <V3Button>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Invite User
          </V3Button>
        </Inviteusers>
      </V3PageHeader>

      <div className="flex gap-6">
        {/* Left Sidebar */}
        <V3Card className="w-56 flex-shrink-0 p-4 h-fit">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Navigation</p>
          <OkrAdminSideBar />
        </V3Card>

        {/* Chart Container */}
        <V3Card className="flex-1 overflow-hidden p-0">
          {/* Chart Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                <span>Company</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                <span>Department</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Team</span>
              </div>
            </div>
          </div>

          <div className="h-[520px]">
            <ReactFlowProvider>
              <ReactFlow
                className="w-full h-full"
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                maxZoom={1}
                minZoom={0.2}
                fitView
              >
                <Background gap={20} size={1.2} />
                <Controls />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </V3Card>
      </div>
    </div>
  );
};

export default Page;