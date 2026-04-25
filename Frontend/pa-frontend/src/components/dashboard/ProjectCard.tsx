"use client"
import React, { useState } from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '../ui/card'
import {
    Folder,
    FolderClosed,
    MoreVertical,
    Plus,
    FileText,
    Users,
    Eye,
    FileIcon
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import folder from "../../../public/performance/folder.png";
import Image from 'next/image'
import useSessionStore from '@/store/sessionStore'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

type Project = {
    id: string;
    name: string;
    desc: string;
    status: 'active' | 'inactive';
    assignedTeams: {
        team: {
            name: string;
        }
    }[];
    createdAt: string;
    projectDocs: string;
}

const ProjectCard = () => {
    const { data: userSession } = useSession();
    const { setSelectedTask } = useSessionStore();
    const [projectDocsDialogOpen, setProjectDocsDialogOpen] = useState(false);
    const [currentProjectDocs, setCurrentProjectDocs] = useState<{ url: string; originalName: string }[]>([]);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const { session } = useSessionStore((state) => state);
    const router = useRouter();

    const { data: projectResponse, isLoading } = useQuery<{
        data: Project[]
    }>({
        queryKey: ["projects",session?.id],
        queryFn: async () => {
            const response = await axios.get(`${backendUrl}/projects?sessionId=${session?.id}`, {
                headers: {
                    Authorization: `Bearer ${userSession?.user.token}`
                }
            })
            return response.data
        }
    })

    const activeProjects = projectResponse?.data.filter(
        project => project.status === 'active'
    ) || [];

    const inactiveProjects = projectResponse?.data.filter(
        project => project.status === 'inactive'
    ) || [];

    const handleSelectProject = (projectId: string, projectName: string) => () => {
        router.push(`/task`);
        setSelectedTask({
            type: "project",
            id: projectId,
            name: projectName,
        });
    }

    const parseProjectDocs = (docs: string) => {
        try {
            const parsed = JSON.parse(docs || "[]");
            if (Array.isArray(parsed)) {
                return parsed.map(doc => {
                    if (typeof doc === 'string') {
                        return { url: doc, originalName: doc.split('/').pop() || 'Document' };
                    }
                    return {
                        url: doc.url,
                        originalName: doc.originalName || doc.url.split('/').pop() || 'Document'
                    };
                });
            }
            return [];
        } catch (e) {
            if (typeof docs === 'string' && docs.startsWith("http")) {
                return [{ url: docs, originalName: docs.split('/').pop() || 'Document' }];
            }
            return [];
        }
    };

    const handleViewDocsClick = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation(); // Stop event from bubbling up
        const docs = parseProjectDocs(project.projectDocs);
        if (docs.length > 0) {
            setCurrentProjectDocs(docs);
            setProjectDocsDialogOpen(true);
        } else {
            toast({
                title: "No documents available",
                description: "This project doesn't have any documents yet",
                duration: 3000
            });
        }
    };

    const renderProjectItem = (project: Project) => (
        <div
            key={project.id}
            className="group relative flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-lg transition-all duration-300 ease-in-out border border-transparent hover:border-primary-100 hover:shadow-sm"
        >
            <div className="flex items-center space-x-4"  onClick={handleSelectProject(project.id, project.name)}>
                <div>
                    <div className="font-semibold text-gray-800 group-hover:text-secondary-600 transition-colors"  >
                        {project.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                        <Users className="w-3.5 h-3.5 inline-block mr-1" />
                        <span>
                            {project.assignedTeams?.[0]?.team?.name || 'No Team Assigned'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <Badge
                    variant="outline"
                    className={`uppercase text-[10px] tracking-wider px-2 py-1 rounded-full border
                    ${project.status === 'active' ? 'bg-green-100 text-green-600 border-green-300' :
                    'bg-gray-100 text-gray-600 border-gray-300'}`}
                >
                    {project.status.replace('_', ' ')}
                </Badge>
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            {parseProjectDocs(project.projectDocs).length > 0 ? (
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    onClick={(e) => handleViewDocsClick(project, e)}
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>View Project Docs</span>
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    className="gap-2 cursor-pointer"
                                    disabled
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>No Project Docs</span>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <Dialog open={projectDocsDialogOpen} onOpenChange={setProjectDocsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Project Documents</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {currentProjectDocs.length > 0 ? (
                            currentProjectDocs.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <FileIcon className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {doc.originalName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new URL(doc.url).hostname}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(doc.url, '_blank')}
                                    >
                                        View
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No documents available
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )

    return (
        <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-3">
                    My Projects  <span className='bg-gray-300 rounded-full h-6 w-6 flex justify-center items-center text-sm'>{projectResponse?.data?.length}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[450px] overflow-y-auto space-y-4 px-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-pulse text-gray-500">
                            Loading projects...
                        </div>
                    </div>
                ) : (
                    <>
                        {activeProjects.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-600">
                                        Active Projects
                                    </h3>
                                </div>
                                <div className="space-y-2 border-t border-gray-100">
                                    {activeProjects.map(renderProjectItem)}
                                </div>
                            </div>
                        )}
                        {inactiveProjects.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-600">
                                        Inactive Projects
                                    </h3>
                                </div>
                                <div className="space-y-2 border-b border-gray-100">
                                    {inactiveProjects.map(renderProjectItem)}
                                </div>
                            </div>
                        )}
                        {activeProjects.length === 0 && inactiveProjects.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-5 py-10">
                                <Image
                                    src={folder}
                                    alt="No projects"
                                    width={60}
                                    height={60}
                                    className="opacity-80"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-700">No Projects Yet</h2>
                                    <p className="text-sm text-gray-500 mt-1">Get started by creating your first project to stay organized.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default ProjectCard