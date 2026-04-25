"use client";

import EmployeeNode from "@/components/employee-node";
import SearchInput from "@/components/ui/serach-input";
import { MarkerType, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { Hand, Minus, MousePointer2, Plus } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  ConnectionMode,
  Panel,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import filter from "../../../../../public/employee/filter.png";
import sort from "../../../../../public/employee/sort.png";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const nodeTypes = {
  employee: EmployeeNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const transformDataToNodesAndEdges = (
  data: any,
  parentId: string | null = null,
  x: number = 0,
  y: number = 0,
  highlightedParentId: string | null = null,
  depth: number = 0 // Track the current depth
) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  if (!data) return { nodes, edges };

  // Node dimensions estimation based on content
  const getNodeDimensions = (data: any) => {
    const nameLengthFactor = data.Name ? data.Name.length * 8 : 0;
    const designationFactor = data.Designation ? 100 : 0;
    const departmentFactor = data.Department?.name ? 100 : 0;

    return {
      width: Math.max(200, nameLengthFactor + 40), // minimum 200px width
      height: Math.max(100, 80 + (data.Department?.name ? 20 : 0)), // taller if has department
    };
  };

  const spacingConfig = {
    maxHorizontal: 800,
    minHorizontal: 400,
    verticalBase: 250,
    verticalIncrement: 100,
    reductionFactor: 0.85,
    nodePadding: 150, 
  };

  const children = data.children || [];
  const childrenCount = children.length;

  const currentNodeDims = getNodeDimensions(data);
  let horizontalSpacing = Math.max(
    spacingConfig.maxHorizontal *
    Math.pow(spacingConfig.reductionFactor, depth),
    spacingConfig.minHorizontal
  );

  const maxChildWidth = children.reduce((max: any, child: any) => {
    const dims = getNodeDimensions(child);
    return Math.max(max, dims.width);
  }, 0);

  horizontalSpacing = Math.max(
    horizontalSpacing,
    maxChildWidth + spacingConfig.nodePadding * 2
  );

  const verticalSpacing =
    spacingConfig.verticalBase + depth * spacingConfig.verticalIncrement;

  const nodeStyle = {
    base: {
      padding: "15px",
      borderRadius: "8px",
      border: "1px solid #e0e0e0",
      backgroundColor: "#ffffff",
    },
    highlighted: {
      border: "2px solid #3182ce",
      boxShadow: "0 0 0 2px rgba(49, 130, 206, 0.2)",
      backgroundColor: "#ebf8ff",
    },
    department: {
      backgroundColor: data.Department?.name ? "#f7fafc" : undefined,
      border: data.Department?.name ? "1px dashed #cbd5e0" : undefined,
    },
  };

  const edgeStyle = {
    base: {
      stroke: "#cbd5e0",
      strokeWidth: 1.5,
      animated: true,
    },
    highlighted: {
      stroke: "#3182ce",
      strokeWidth: 2,
      animated: true,
    },
  };

  const isHighlightedParent = data.Id === highlightedParentId;

  const node: Node = {
    id: data.Id,
    type: "employee",
    data: {
      id: data.Id,
      name: data.Name,
      email: data.Email,
      avatar: data.Avatar,
      team: data.Team?.name,
      department: data.Department?.name,
      designation: data.Designation,
      role: data.Role,
      childrenCount: childrenCount,
      // isHighlighted: isHighlightedParent,
      depth,
      dimensions: currentNodeDims,
      children:data?.children
    },
    position: { x, y },
    draggable: true,
    style: {
      ...nodeStyle.base,
      ...(isHighlightedParent ? nodeStyle.highlighted : {}),
      ...nodeStyle.department,
      width: `${currentNodeDims.width}px`,
      height: `${currentNodeDims.height}px`,
    },
  };

  nodes.push(node);

  if (parentId) {
    edges.push({
      id: `${parentId}-${data.Id}`,
      source: parentId,
      target: data.Id,
      type: "smoothstep",
      animated: isHighlightedParent,
      style: isHighlightedParent ? edgeStyle.highlighted : edgeStyle.base,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: isHighlightedParent ? "#3182ce" : "#cbd5e0",
      },
    });
  }

  // Stop processing children if depth >= 3
  if (childrenCount > 0 && depth < 3) {
    const totalWidth = (childrenCount - 1) * horizontalSpacing;
    const childX = x - totalWidth / 2;
    const childY = y + verticalSpacing;
    const processedChildren = new Map();

    const childPositions = children.map((child: any, index: number) => {
      const xPos = childX + index * horizontalSpacing;
      return {
        id: child.Id,
        x: xPos,
        width: getNodeDimensions(child).width,
      };
    });

    for (let i = 1; i < childPositions.length; i++) {
      const current = childPositions[i];
      const previous = childPositions[i - 1];
      const minSpacing = spacingConfig.nodePadding;

      const overlap = previous.x + previous.width + minSpacing - current.x;
      if (overlap > 0) {
        for (let j = i; j < childPositions.length; j++) {
          childPositions[j].x += overlap;
        }
      }
    }

    // Process children with adjusted positions
    childPositions.forEach((position: any, index: any) => {
      const child = children[index];
      const childKey = `${child.Id}-${depth + 1}`;

      let childLayout;
      if (processedChildren.has(childKey)) {
        childLayout = processedChildren.get(childKey);
      } else {
        childLayout = transformDataToNodesAndEdges(
          child,
          data.Id,
          position.x,
          childY,
          highlightedParentId,
          depth + 1 // Increment depth for child nodes
        );
        processedChildren.set(childKey, childLayout);
      }

      nodes.push(...childLayout.nodes);
      edges.push(...childLayout.edges);
    });
  }

  return { nodes, edges };
};
export default function OrgChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: userSession } = useSession();

  const onInit = useCallback(() => {
    // Center the view
    setTimeout(() => {
      const element = document.querySelector(".react-flow__viewport");
      if (element) {
        (element as HTMLElement).style.transform =
          "translate(0px, 0px) scale(0.85)";
      }
    }, 100);
  }, []);

  const {
    data: orgChartData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["OrgChart", userSession?.user.token],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/company/orgChart`, {
        headers: { Authorization: `Bearer ${userSession?.user.token}` },
      });
      return response.data.data;
    },
  });

  useEffect(() => {
    if (orgChartData) {
      const { nodes: transformedNodes, edges: transformedEdges } =
        transformDataToNodesAndEdges(orgChartData);
      setNodes(transformedNodes);
      setEdges(transformedEdges);
    }
  }, [orgChartData, setNodes, setEdges]);

  return (
    <div className="h-[83%] border-t rounded-md mx-6 mb-5 rounded-x">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Strict}
          onInit={onInit}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
          defaultEdgeOptions={{
            type: "smoothstep",
            style: { stroke: "#94a3b8", strokeWidth: 2 },
          }}
          className="w-full h-full border-b border-r border-l rounded-b-md"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

const CustomControls = ({
  setNodes,
  nodes,
  onChangeQuery,
}: {
  setNodes: (nodes: Node[]) => void;
  nodes: Node[];
  onChangeQuery: (query: string) => void;
}) => {
  const { zoomIn, zoomOut, getZoom, fitView } = useReactFlow();

  return (
    <div
      className="flex justify-between p-4 pointer-events-auto border-b border-r border-l rounded-t-md  "
      style={{ pointerEvents: "auto" }}
    >
      <div className="flex gap-2 z-50">
        <SearchInput
          className="border rounded-full"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target) {
              onChangeQuery(e.target.value);
            }
          }}
          placeholder="Search..."
        />
        <Image src={filter} alt="filter" className="w-20 h-9 " />
        <Image src={sort} alt="sorting" className="w-20 h-9 " />
      </div>

      <div className="flex gap-2 ">
        <div className="h-9 w-9 bg-[#EDF0F2] flex justify-center items-center rounded-full cursor-pointer">
          <Hand size={12} />
        </div>
        <div className="h-9 w-9 bg-[#EDF0F2] flex justify-center items-center rounded-full cursor-pointer">
          <MousePointer2 size={12} />
        </div>
        <div className="h-9 w-28 gap-2 z-50 bg-white border flex justify-center items-center rounded-full">
          <button
            onClick={() => zoomOut()}
            className="bg-[#EDF0F2] h-5 w-5 flex justify-center items-center rounded-full"
          >
            <Minus size={11} />
          </button>
          {Math.round(getZoom() * 100)}%
          <button
            onClick={() => zoomIn()}
            className="bg-[#EDF0F2] h-5 w-5 flex justify-center items-center rounded-full"
          >
            <Plus size={11} />
          </button>
        </div>
      </div>
    </div>
  );
};
