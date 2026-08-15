"use client";

import Link from "next/link";
import { Separator } from "../ui/separator";
import { usePathname } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Edit, Trash } from "lucide-react";


const initialModules = [
    {
        id: 1,
        title: "Getting Started",
        path: "/help/getting-started",
        subModules: [
            { id: 11, title: "Quick Setup", path: "/help/getting-started/quick-setup", subModules: [] },
            { id: 12, title: "Installation Guide", path: "/help/getting-started/installation", subModules: [] }
        ]
    },
    {
        id: 2,
        title: "User Guide",
        path: "/help/user-guide",
        subModules: [
            { id: 21, title: "Dashboard", path: "/help/user-guide/dashboard", subModules: [] },
            { id: 22, title: "Profile Settings", path: "/help/user-guide/profile", subModules: [] }
        ]
    },
    {
        id: 3,
        title: "FAQ",
        path: "/help/faq",
        subModules: []
    }
];

type Module = {
    id: number;
    title: string;
    path: string;
    subModules: Module[];
};

type ModuleItemProps = {
    module: Module;
    level?: number;
    onAddSubModule: (parentId: number) => void;
    onDelete: (moduleId: number) => void;
    onEdit: (moduleId: number) => void;
};

function ModuleItem({ module, level = 0, onAddSubModule, onDelete, onEdit }: ModuleItemProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const hasSubModules = module.subModules && module.subModules.length > 0;
    const isActive = pathname === module.path;

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasSubModules) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className="w-full">
            <div
                className={clsx(
                    "flex items-center px-4 py-2 relative group",
                    isActive ? "bg-gray-100 font-medium" : "hover:bg-gray-50",
                    level > 0 && "pl-8"
                )}
            >
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                        {hasSubModules && (
                            <button
                                onClick={toggleDropdown}
                                className="mr-2 focus:outline-none"
                            >
                                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                        )}
                        <Link
                            href={module.path}
                            className="text-gray-700 hover:text-gray-900 flex-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {module.title}
                        </Link>
                    </div>

                    <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowOptions(!showOptions);
                            }}
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        {showOptions && (
                            <div
                                className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-md py-1 z-10 w-40"
                                onMouseLeave={() => setShowOptions(false)}
                            >
                                <button
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddSubModule(module.id);
                                        setShowOptions(false);
                                    }}
                                >
                                    <Plus size={14} className="mr-2" />
                                    Add Submodule
                                </button>
                                <button
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(module.id);
                                        setShowOptions(false);
                                    }}
                                >
                                    <Edit size={14} className="mr-2" />
                                    Edit Module
                                </button>
                                <button
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(module.id);
                                        setShowOptions(false);
                                    }}
                                >
                                    <Trash size={14} className="mr-2" />
                                    Delete Module
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isOpen && hasSubModules && (
                <div className="pl-4">
                    {module.subModules.map((subModule) => (
                        <ModuleItem
                            key={subModule.id}
                            module={subModule}
                            level={level + 1}
                            onAddSubModule={onAddSubModule}
                            onDelete={onDelete}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function HelpSupportSidebar() {
    const [modules, setModules] = useState(initialModules);

    const handleAddSubModule = (parentId: any) => {
        // In a real app, you would show a modal or form to collect data
        // For this example, we'll just add a dummy submodule
        const newId = Math.floor(Math.random() * 1000);
        const newSubModule = {
            id: newId,
            title: `New Submodule ${newId}`,
            path: `/help/new-submodule-${newId}`,
            subModules: []
        };

        const updateModulesWithNewSubModule = (modulesList: any, parentModuleId: any) => {
            return modulesList.map((module: any) => {
                if (module.id === parentModuleId) {
                    return {
                        ...module,
                        subModules: [...module.subModules, newSubModule]
                    };
                }

                if (module.subModules && module.subModules.length > 0) {
                    return {
                        ...module,
                        subModules: updateModulesWithNewSubModule(module.subModules, parentModuleId)
                    };
                }

                return module;
            });
        };

        setModules(updateModulesWithNewSubModule(modules, parentId));
    };

    const handleAddModule = () => {
        // Add a new top-level module
        const newId = Math.floor(Math.random() * 1000);
        const newModule = {
            id: newId,
            title: `New Module ${newId}`,
            path: `/help/new-module-${newId}`,
            subModules: []
        };

        setModules([...modules, newModule]);
    };

    const handleDeleteModule = (moduleId: any) => {
        // In a real app, you would show a confirmation dialog

        const deleteModuleById = (modulesList: any, targetId: any) => {
            // Filter out the module with the target ID
            const filteredModules = modulesList.filter((module: any) => module.id !== targetId);

            // Also check submodules and apply the same filtering
            return filteredModules.map((module: any) => {
                if (module.subModules && module.subModules.length > 0) {
                    return {
                        ...module,
                        subModules: deleteModuleById(module.subModules, targetId)
                    };
                }
                return module;
            });
        };

        setModules(deleteModuleById(modules, moduleId));
    };

    const handleEditModule = (moduleId: any) => {
        // In a real app, you would show a modal or form to edit the module
        // For this example, we'll just append "(Edited)" to the module title

        const updateModuleTitle = (modulesList: any, targetId: any) => {
            return modulesList.map((module: any) => {
                if (module.id === targetId) {
                    return {
                        ...module,
                        title: `${module.title} (Edited)`
                    };
                }

                if (module.subModules && module.subModules.length > 0) {
                    return {
                        ...module,
                        subModules: updateModuleTitle(module.subModules, targetId)
                    };
                }

                return module;
            });
        };

        setModules(updateModuleTitle(modules, moduleId));
    };

    return (
        <div className="w-[300px] bg-white shadow flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="text-lg font-medium">Help & Support</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {modules.map((module) => (
                    <ModuleItem
                        key={module.id}
                        module={module}
                        onAddSubModule={handleAddSubModule}
                        onDelete={handleDeleteModule}
                        onEdit={handleEditModule}
                    />
                ))}
            </div>

            <div className="p-4 border-t">
                <button
                    onClick={handleAddModule}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
                >
                    <Plus size={16} />
                    Add New Module
                </button>
            </div>
        </div>
    );
}

export default HelpSupportSidebar;