"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import Image from "next/image";
import Inviteusers from "@/components/setting-components/invite-usersheet";
import useSessionStore from "@/store/signupStore";
import { data } from "currency-codes";
import { set } from "date-fns";
import { Button } from "@/components/ui/button";
import add from "../../../../../../public/settings/add.png";

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

  const {
    data: teamData,
    refetch: fetchTeams,
    isLoading: teamsLoading,
  } = useQuery({
    queryKey: ["teams", selectedDepartmentId],
    queryFn: async () => {
      if (!selectedDepartmentId) return { data: [] };
      const response = await axios.get(
        `${backendUrl}/teams/teams/${selectedDepartmentId}`,
        {
          headers: { Authorization: `Bearer ${session?.user?.token}` },
        }
      );

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

  const toggleTeams = useCallback(
    (departmentId: string) => {
      setSelectedDepartmentId((prevId) =>
        prevId === departmentId ? null : departmentId
      );

      setSelectedDepartments((prev) => {
        const newMap = new Map(prev);
        newMap.set(departmentId, !newMap.get(departmentId));
        return newMap;
      });
    },
    []  // Removed fetchTeams from dependencies
  );

  // Effect to fetch teams when department is selected
  useEffect(() => {
    if (selectedDepartmentId) {
      fetchTeams();
    }
  }, [selectedDepartmentId, fetchTeams]);

  const initialNodes = useMemo(
    () => [
      {
        id: "1",
        type: "company",
        position: { x: 300, y: 50 },
        data: {
          name: companyName,
          users: departmentData?.data?.data.length,
          toggleDepartments: () => setShowDepartments((prev) => !prev),
        },
      },
    ],
    [companyName, departmentData]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Single effect to handle all graph updates
  useEffect(() => {
    let newNodes = [...initialNodes];
    let newEdges: Edge[] = [];

    // Add department nodes if needed
    if (showDepartments && departmentData?.data?.data) {
      const departmentNodes = departmentData.data.data.map(
        (dept: any, index: number) => ({
          id: dept.id.toString(),
          type: "department",
          position: { x: 400, y: 200 * (index + 1) },
          data: {
            name: dept.name,
            id: dept.id,
            users: 0, // Will be updated when team data is available
            toggleTeams,
          },
        })
      );

      const departmentEdges = departmentData.data.data.map((dept: any) => ({
        id: `edge-company-${dept.id}`,
        source: "1",
        target: dept.id.toString(),
        type: "smoothstep",
        animated: true,
        className: "animate-fade-in",
      }));

      newNodes = [...newNodes, ...departmentNodes];
      newEdges = [...newEdges, ...departmentEdges];
    }

    // Add team nodes if a department is selected
    if (teamData?.data && selectedDepartmentId) {
      const departmentNode = newNodes.find(
        (node) => node.id === selectedDepartmentId
      );

      if (departmentNode) {
        const departmentPosition = departmentNode.position;

        // Update the department node with correct user count
        const departmentIndex = newNodes.findIndex(node => node.id === selectedDepartmentId);
        if (departmentIndex >= 0) {
          newNodes[departmentIndex] = {
            ...newNodes[departmentIndex],
            data: {
              ...newNodes[departmentIndex].data,
              users: teamData.data.length,
            },
          };
        }

        // Create team nodes
        const teamNodes = teamData.data.map((team: any, index: number) => ({
          id: `team-${team.id}`,
          type: "team",
          position: {
            x: departmentPosition.x + 500 + 400 * index,
            y: departmentPosition.y + 80,
          },
          data: { name: team.name, users: team.users },
        }));

        // Create team edges
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
    <div className="flex p-4 bg-gray-100 min-h-screen">
      <div className="w-1/4 bg-white rounded-lg shadow p-4 mr-2">
        <h2 className="font-semibold text-lg"> Admin</h2>
        <Separator className="mt-4" />
        <br />
        <OkrAdminSideBar />
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-white rounded-lg shadow p-4 ml-2">
        <h1 className="font-semibold text-xl text-slate-600">
          Manage Organization
        </h1>
        <Separator className="mt-4" />
        <p className="p-3">
          Manage your company, department, and team details for efficient
          organization.
        </p>

        <Card className="rounded-lg">
          <div className="bg-secondary-50 rounded-t-lg flex items-center justify-between p-4">
            <div className="flex items-center space-x-4 cursor-pointer hover:opacity-80">
              <div className="flex items-center space-x-2">
                <Image
                  src={"/settings/company.png"}
                  alt="Department"
                  width={24}
                  height={24}
                />
                <p>Company</p>
              </div>
              <div className="flex items-center space-x-2">
                <Image
                  src={"/settings/department.png"}
                  alt="Department"
                  width={24}
                  height={24}
                />
                <p>Department</p>
              </div>
              <div className="flex items-center space-x-2">
                <Image
                  src={"/settings/team.png"}
                  alt="Team"
                  width={24}
                  height={24}
                />
                <p>Team</p>
              </div>
            </div>

            <div className="flex flex-row space-x-4 justify-end">
              <Inviteusers >
                <Button className="rounded-full w-auto mx-5 my-2 ">
                  <Image src={add} alt="add" className="w-4" />
                </Button>
              </Inviteusers>
            </div>
          </div>

          <div className="h-[500px] rounded-md">
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
        </Card>
      </div>
    </div>
  );
};
export default Page;