import { Handle, Position } from "reactflow"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, UsersRound } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { useSession } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"

interface EmployeeNodeProps {
  data: {
    id: string;
    name: string;
    avatar?: string;
    designation?: string;
    childrenCount?: number;
    isHighlighted?: boolean;
    depth: number;
    children?: { id: string; name: string; avatar?: string; designation?: string; childrenCount?: number; isHighlighted?: boolean; depth: number; }[];
  };
}

export default function EmployeeNode({ data }: EmployeeNodeProps) {
  console.log(data)
  const { data: userSession } = useSession();
  const isCurrentUser = data.name === userSession?.user?.name;
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  // const handleChildClick = (index: number) => {
  //   setSelectedChild(index + 1);
  //   setIsPopoverOpen(false);
  //   console.log(`Selected child: ${index + 1}`);
  // };

  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  return (
    <>
      {isCurrentUser && (
        <div className="absolute top-[-1.8rem] left-1/2 -translate-x-1/2 bg-yellow-300 px-4 font-bold py-1 rounded-2xl text-xl z-10">
          You
          <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-yellow-300"></div>
        </div>
      )}

      <div className="relative flex flex-col items-center">
        <div className="bg-white rounded-lg p-4 w-[200px] border">
          <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
          <div className="flex flex-col items-center gap-3">
            {/* Avatar Section */}
            <Link href={`/user-profiles?id=${data.id}`} className="hover:text-blue-500 flex" passHref>
              <Avatar className="h-16 w-16">
                {data?.avatar ? (
                  <AvatarImage className="rounded-full hover:opacity-50" src={data.avatar} alt={data.name}  />
                ) : (
                  <AvatarFallback className="flex items-center justify-center hover:opacity-50 rounded-full bg-gray-300 h-16 w-16 text-lg font-semibold text-gray-700">
                    {data.name ? data.name[0]?.toUpperCase() : "U"}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>

            {/* Name & Designation */}
            <div className="text-center">
              <Link href={`/user-profiles?id=${data.id}`} className="hover:text-blue-500 flex" passHref>
                <h3 className="font-semibold text-lg text-gray-800 hover:text-blue-500 flex items-center gap-2">
                  {data.name?.toUpperCase()}
                </h3>
              </Link>
              {data?.designation && (
                <Badge variant="secondary" className="mt-1 bg-teal-500 text-white px-2 py-1 rounded-xl">
                  {data?.designation}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {typeof data?.childrenCount === "number" && data.childrenCount > 0 && (
          <div className="relative flex flex-col justify-center items-center hover:cursor-pointer">
            <div
              className="w-full bg-white rounded-3xl p-1 flex border justify-center items-center mt-2 hover:bg-gray-100"
            >
              <div className="text-lg flex gap-2 font-extrabold text-gray-600 justify-center items-center bg-gray-100 px-3 py-1 rounded-3xl">
                <UsersRound size="20" fill="#000000" className="font-bold" />
                {selectedChild === null ? data.childrenCount : selectedChild}
              </div>
              <div className="text-center mt-1 mx-2">
                <p className="font-bold mb-1">Open</p>
                {/* <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 4.5L6 8L9.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg> */}
              </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground mt-2" />
          </div>
        )}
      </div>
    </>
  );

}


const DownSvgIcon = () => {
  return (
    <svg id='Sort_Down_24' width='16' height='16' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0' />
      <g transform="matrix(0.91 0 0 0.91 12 12)" >
        <path style={{ stroke: 'none', strokeWidth: 1, strokeDasharray: 'none', strokeLinecap: 'butt', strokeDashoffset: 0, strokeLinejoin: 'miter', strokeMiterlimit: 4, fill: 'rgb(0,0,0)', fillRule: 'nonzero', opacity: 1 }} transform=" translate(-15, -17)" d="M 15 23 C 14.744 23 14.488 22.902 14.293 22.707 L 4.292999999999999 12.707 C 4.007 12.421000000000001 3.9209999999999994 11.991000000000001 4.076 11.617 C 4.23 11.243 4.596 11 5 11 L 25 11 C 25.404 11 25.77 11.243 25.924 11.617 C 26.079 11.991000000000001 25.993 12.421000000000001 25.707 12.707 L 15.707 22.707 C 15.512 22.902 15.256 23 15 23 z" stroke-linecap="round" />
      </g>
    </svg>
  )
}