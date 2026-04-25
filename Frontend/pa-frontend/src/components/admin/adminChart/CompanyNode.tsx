import ActionMenu from '@/components/three-dots'
import { Position } from '@xyflow/react'
import Image from 'next/image'
import React from 'react'
import { Handle } from 'reactflow'

const CompanyNode = ({ data }: any) => {
    return (
        <div
            className="bg-yellow-50 backdrop-blur-lg border transition-all duration-300 hover:shadow-xl hover:border-blue-400 w-[300px] rounded-2xl p-4 shadow-md text-center cursor-pointer"
            onClick={data.toggleDepartments}  
        >
            <div className="font-bold text-black flex justify-between items-center gap-2">
                <div className="flex justify-center items-center gap-2">
                    <Image src={"/settings/company.png"} width={25} height={25} alt="Company" />
                    {data.name}
                </div>
                <div>
                    {/* <ActionMenu /> */}
                </div>
            </div>
            <div className="flex pl-8 font-semibold text-gray-500">
                {data.users} Departments
            </div>
            <Handle type="source" position={Position.Left} />
        </div>
    );
};

export default CompanyNode
