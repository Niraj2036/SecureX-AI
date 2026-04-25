"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Button } from "../ui/button";
import { BookCheck, Check, CheckCircle, Circle, Clipboard, Flag, Info, UserIcon } from "lucide-react";
import Image from "next/image";
import useSessionStore from "@/store/sessionStore";
import folder from "../../../public/performance/folder.png";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";


const TaskCard = () => {
    const { data: userSession } = useSession();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const { session, setSelectedTask, selectedTask,userRole } = useSessionStore((state) => state);
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("pending");

    const completeTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            const response = await axios.get(
                `${backendUrl}/tasks/complete/${taskId}`,
                { headers: { Authorization: `Bearer ${userSession?.user.token}` } }
            );
            return response.data;
        },
        onSuccess: (taskId: string) => {
            queryClient.invalidateQueries({ queryKey: ["sections", selectedTask?.id] });
            toast({
                title: "Task Marked as completed ",
                description: "Task completed successfully!",
                variant: "default",
                duration: 3000,
            })
            setCompletedTasks((prev) => ({
                ...prev,
                [taskId]: !prev[taskId],
            }));
        },
        onError: (error) => {
            toast({
                title: "Something went wrong",
                description: "Unable to mark the task as completed",
                variant: "default",
                duration: 3000,
            })
            console.error(error);
        }
    });
    const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({});

    const handleToggleTask = (taskId: string) => {
        completeTaskMutation.mutate(taskId);
    };

    const { data: taskList, isLoading } = useQuery({
        queryKey: ["sections", selectedTask?.id],
        queryFn: async () => {
            const response = await axios.post(
                `${backendUrl}/section/getAll`,
                {
                    type: selectedTask?.type === "objective" ? "Objective" : "Project",
                    parentId: selectedTask?.id,
                    sessionId: session?.id,
                },
                {
                    headers: { Authorization: `Bearer ${userSession?.user.token}` },
                }
            );
            return response.data;
        },
    });

    const { data: okrList, isLoading: isOkrLoading } = useQuery({
        queryKey: ["okrList", session?.id],
        queryFn: async () => {
            const isAdmin = userRole === "admin";
            const url = isAdmin
                ? `${backendUrl}/objectives/for-session`
                : `${backendUrl}/templates/getOkrForUser`;
            const response = await axios.post(
                url,
                { sessionId: session?.id,id: userSession?.user.id },
                { headers: { Authorization: `Bearer ${userSession?.user.token}` } }
            );
            return response.data.data;
        },
        enabled: !!userSession?.user.token,
    });

    const { data: projectList, isLoading: isProjectLoading } = useQuery({
        queryKey: ["projectList", session?.id],
        queryFn: async () => {
            const response = await axios.get(`${backendUrl}/projects?sessionId=${session?.id}`, {
                headers: { Authorization: `Bearer ${userSession?.user.token}` },
            });
            return response.data.data;
        },
    });

    const isSelectLoading = isOkrLoading || isProjectLoading;
    type PriorityConfig = {
        [key in 'high' | 'medium' | 'low']: {
            color: string;
            icon: React.JSX.Element;
        }
    };


    const priorityConfig: PriorityConfig = {
        high: {
            color: "bg-red-50 text-red-600 border-red-200",
            icon: <Flag className="w-4 h-4 text-red-500 fill-red-100" />
        },
        medium: {
            color: "bg-yellow-50 text-yellow-600 border-yellow-200",
            icon: <Flag className="w-4 h-4 text-yellow-500 fill-yellow-100" />
        },
        low: {
            color: "bg-green-50 text-green-600 border-green-200",
            icon: <Flag className="w-4 h-4 text-green-500 fill-green-100" />
        }
    };
    const taskStatusConfig: { [key in 'pending' | 'in_progress' | 'completed' | 'cancelled']: { color: string; label: string } } = {
        pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
        in_progress: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "In Progress" },
        completed: { color: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
        cancelled: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Cancelled" },
    };


    // Compute counts (default to 0 if taskList or data is undefined)
    const pendingCount = taskList?.data?.reduce(
        (count: number, section: { tasks: { status: string }[] }) =>
            count + section.tasks.filter(task => task.status !== "completed").length,
        0
    ) ?? 0;

    const completedCount = taskList?.data?.reduce(
        (count: number, section: { tasks: { status: string }[] }) =>
            count + section.tasks.filter(task => task.status === "completed").length,
        0
    ) ?? 0;

    return (
        <Card className="shadow-sm border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2 bg-gradient-to-r ">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        My Tasks
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Showing tasks from the last 7 days</p>
                            </TooltipContent>
                        </Tooltip>
                    </CardTitle>
                    {isSelectLoading ? (
                        <div className="h-full w-20">
                            <div className="h-12 w-full bg-neutral-50 rounded-md"></div>
                        </div>
                    ) : (
                        <Select
                            onValueChange={(value) => {
                                const [type, id] = value.split("-");
                                if (type !== "okr" && type !== "project") return;
                                const selectedItem =
                                    type === "okr"
                                        ? okrList.find((item: any) => item.id === id)
                                        : projectList.find((item: any) => item.id === id);
                                if (selectedItem) {
                                    setSelectedTask({
                                        type: type === "okr" ? "objective" : "project",
                                        id,
                                        name: selectedItem.title || selectedItem.name,
                                    });
                                }
                            }}
                            value={
                                selectedTask
                                    ? `${selectedTask.type === "objective" ? "okr" : "project"}-${selectedTask.id}`
                                    : undefined
                            }
                        >
                            <SelectTrigger className="w-42 flex items-center justify-between gap-x-4 bg-white shadow-sm">
                                <SelectValue placeholder="Choose an Objective/Project" />
                            </SelectTrigger>
                            <SelectContent>
                                {okrList?.length > 0 && (
                                    <>
                                        <div className="px-3 py-1 text-xs text-gray-400 uppercase">Objectives</div>
                                        {okrList.map((item: any) => (
                                            <SelectItem
                                                key={`okr-${item.id}`}
                                                value={`okr-${item.id}`}
                                                className="hover:bg-secondary-100"
                                            >
                                                <div className="flex justify-between items-center gap-2">
                                                    <Image
                                                        src="/objective/target.png"
                                                        alt="team"
                                                        width={50}
                                                        height={50}
                                                        className="bg-neutral-100 w-7 h-7 p-2 rounded-full"
                                                    />
                                                    <div>{item.title}</div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                                {projectList?.length > 0 && (
                                    <>
                                        <div className="px-3 py-1 text-xs text-gray-400 uppercase">Projects</div>
                                        {projectList.map((item: any) => (
                                            <SelectItem
                                                key={`project-${item.id}`}
                                                value={`project-${item.id}`}
                                                className="hover:bg-secondary-100"
                                            >
                                                <div className="flex justify-between items-center gap-2">
                                                    <Image
                                                        src={folder}
                                                        alt="team"
                                                        width={50}
                                                        height={50}
                                                        className="bg-neutral-100 w-7 h-7 p-2 rounded-full"
                                                    />
                                                    <div>{item.name}</div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </CardHeader>

            <CardContent className="h-[410px] overflow-y-scroll space-y-4 p-4">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-12 w-full bg-neutral-50 rounded-md"></div>
                        </div>
                    ))
                ) : (
                    <>
                        <Tabs defaultValue="pending" onValueChange={setActiveTab}>
                            <TabsList className="grid w-[50%] grid-cols-2">
                                <TabsTrigger value="pending">
                                    Pending ({pendingCount})
                                </TabsTrigger>
                                <TabsTrigger value="completed">
                                    Completed ({completedCount})
                                </TabsTrigger>
                            </TabsList>
                            <Accordion
                                type="multiple"
                                className="w-full"
                                defaultValue={taskList?.data?.length ? [taskList.data[0].id] : []}
                            >
                                {taskList?.data?.length ? (
                                    taskList.data.map((section: any) => {
                                        const filteredTasks = section.tasks.filter((task: any) => {
                                            const taskDate = new Date(task.createdAt);
                                            const sevenDaysAgo = new Date();
                                            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                                            return taskDate >= sevenDaysAgo && (
                                                activeTab === "pending"
                                                    ? task.status !== "completed"
                                                    : task.status === "completed"
                                            );
                                        });

                                        return (
                                            <AccordionItem key={section.id} value={section.id} className="border-none my-2">
                                                <AccordionTrigger className="hover:bg-gray-100 bg-gray-50 border px-2 rounded-md text-lg">
                                                    {section.name}
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    {filteredTasks.length > 0 ? (
                                                        filteredTasks.map((task: { id: string; name: string; dueDate: string; status: 'pending' | 'in_progress' | 'completed' | 'cancelled'; priority: keyof PriorityConfig }) => {
                                                            const { color: priorityColor, icon: priorityIcon } = priorityConfig[task.priority] || priorityConfig.low;

                                                            return (
                                                                <div
                                                                    key={task.id}
                                                                    className="group relative bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out mb-3"
                                                                >
                                                                    <div className="p-4 space-y-3">
                                                                        <div className="flex justify-between items-center">
                                                                            <div className="flex items-center space-x-3">
                                                                                <button
                                                                                    onClick={() => handleToggleTask(task.id)}
                                                                                    className="transition-transform hover:scale-110 focus:outline-none"
                                                                                >
                                                                                    {task.status === "completed" ? (
                                                                                        <CheckCircle className="text-green-500 w-6 h-6" />
                                                                                    ) : (
                                                                                        <Circle className="text-gray-500 w-6 h-6" />
                                                                                    )}
                                                                                </button>

                                                                                <div className="">
                                                                                    <h3
                                                                                        className={`font-semibold text-gray-800 text-base ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
                                                                                    >
                                                                                        {task.name}
                                                                                    </h3>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <div className={`flex items-center space-x-2 px-2 py-1 rounded-full ${priorityColor} border`}>
                                                                                {priorityIcon}
                                                                                <span className="text-xs font-medium">
                                                                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border-dotted border-2 border-gray-300 rounded-lg mt-2">
                                                            <BookCheck />
                                                            <h3 className="text-lg font-medium text-gray-700 mb-1">No tasks found</h3>
                                                            <p className="text-gray-500 mb-4 max-w-md">
                                                                {"You're all caught up! Enjoy your free time or add a new task."}
                                                            </p>
                                                        </div>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center h-[350px] w-full text-gray-500 space-y-4">
                                        <BookCheck />
                                        <div>
                                            <h2 className="text-lg font-semibold">No Sections Yet</h2>
                                            <p className="text-sm">You haven’t added any sections or tasks yet. Start by creating a section to organize your tasks.</p>
                                        </div>
                                    </div>

                                )}
                            </Accordion>

                        </Tabs>
                    </>
                )}
            </CardContent>

        </Card >
    );
};

export default TaskCard;