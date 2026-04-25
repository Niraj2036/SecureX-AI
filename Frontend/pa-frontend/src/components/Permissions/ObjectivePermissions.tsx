
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useDebounce } from '../ui/multiselect';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Search, User, Users, Eye } from 'lucide-react';
import ReactPaginate from 'react-paginate';
import { Employee, ObjectiveVisibility, VisibilityOption } from './Permissions.type';
import Image from 'next/image';
import { Button } from '../ui/button';
import { toast } from '@/hooks/use-toast';


const ObjectivePermissions = () => {
    const [searchText, setSearchText] = useState("");
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const { data: session, status } = useSession();
    const [totalEmployee, setTotalEmployee] = useState<number>(0);
    const [paginationPages, setPaginationPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const debouncedPage = useDebounce(currentPage, 300);
    const debouncedSearch = useDebounce(searchText, 500);
    const [visibilitySettings, setVisibilitySettings] = useState<Record<string, ObjectiveVisibility>>({});
    const [originalVisibilitySettings, setOriginalVisibilitySettings] = useState<Record<string, ObjectiveVisibility>>({});


    const visibilityOptions: VisibilityOption[] = [
        {
            value: 'all',
            label: 'All',
            description: 'Objectives visible to everyone in the organization',
            icon: <Users className="h-4 w-4" />
        },
        {
            value: 'team',
            label: 'Team',
            description: 'Objectives visible only to team members',
            icon: <Users className="h-4 w-4" />
        },
        {
            value: 'self',
            label: 'Self',
            description: 'Objectives visible only to the user',
            icon: <User className="h-4 w-4" />
        }
    ];

    const fetchUserData = async () => {
        const response = await axios.get(
            `${backendUrl}/users?pageNo=${currentPage}${debouncedSearch ? `&search=${debouncedSearch}` : ''}`,
            {
                headers: {
                    Authorization: `Bearer ${session?.user?.token}`,
                },
            }
        );

        return response.data.data;
    };

    const { data: userData = [], isLoading = true, isError } = useQuery({
        queryKey: ["users", debouncedPage, debouncedSearch],
        enabled: status === "authenticated",
        queryFn: fetchUserData,
    });

    useEffect(() => {
        if (userData?.pagination) {
            setTotalEmployee(userData.pagination.totalItems);
            setPaginationPages(userData.pagination.totalPages);
        }
    }, [userData]);

    const queryClient = useQueryClient();

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
    }, [currentPage, queryClient]);

    useEffect(() => {
        if (userData?.data && Array.isArray(userData.data)) {
            const initialSettings: Record<string, ObjectiveVisibility> = {};
            const originalSettings: Record<string, ObjectiveVisibility> = {};
            userData.data.forEach((user: Employee) => {
                const visibility = user.okrVisibility as ObjectiveVisibility || 'team';
                if (!visibilitySettings[user.id]) {
                    initialSettings[user.id] = visibility;
                }
                originalSettings[user.id] = visibility;
            });

            if (Object.keys(initialSettings).length > 0) {
                setVisibilitySettings(prev => ({ ...prev, ...initialSettings }));
            }
            setOriginalVisibilitySettings(originalSettings);
        }
    }, [userData?.data, visibilitySettings]);

    const isVisibilityChanged = (userId: string) => {
        return visibilitySettings[userId] !== originalVisibilitySettings[userId];
    };


    const handleVisibilityChange = (userId: string, visibility: ObjectiveVisibility) => {
        setVisibilitySettings(prev => ({
            ...prev,
            [userId]: visibility
        }));
    };

    const toggleAccordion = (userId: string) => {
        setExpandedUserId(expandedUserId === userId ? null : userId);
    };

    const handlePageChange = (selectedItem: { selected: number }) => {
        const newPage = selectedItem.selected + 1;
        if (newPage >= 1 && newPage <= paginationPages) {
            setCurrentPage(newPage);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setCurrentPage(1);
    };

    const handleSaveVisibility = async (userId: string) => {
        try {
            changeVisibilityMutation.mutate(userId);
        } catch (error) {
            console.error("Error saving visibility settings:", error);
        } finally {
            setOriginalVisibilitySettings(prev => ({
                ...prev,
                [userId]: visibilitySettings[userId]
            }));
        }

    }

    const changeVisibilityMutation = useMutation({
        mutationFn: async (userId: string) => {
            const response = await axios.put(
                `${backendUrl}/users/${userId}/visibility`,
                {
                    userId: userId,
                    visibility: visibilitySettings[userId],
                    type: "okr"
                },
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.token}`,
                    },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            toast({
                title: "Visibility settings updated",
                description: "The visibility settings have been successfully updated.",
                variant: "default",
                duration: 3000,
            })
            queryClient.invalidateQueries({ queryKey: ["users"] });

        },
        onError: (error) => {
            toast({
                title: "Error updating visibility settings",
                description: "There was an error updating the visibility settings. Please try again.",
                variant: "destructive",
                duration: 3000,
            })
            console.error("Error changing visibility:", error);
        }
    })



    if (isError) {
        return <div className="p-8 text-center text-red-500">Error loading users. Please try again.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-xl font-bold mb-2">Objective Permissions</h1>
                <p className="text-gray-600">Manage which objectives users can see across the organization</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchText}
                    onChange={handleSearch}
                />
            </div>
            {
                isLoading ? (
                    <div className='flex justify-center items-center h-64'>
                        Loading...
                    </div>
                ) : (
                    <div className="space-y-2">
                        {userData?.data && Array.isArray(userData.data) ? (
                            userData.data.map((user: Employee) => (
                                <div key={user.id} className="border rounded-lg overflow-hidden">
                                    <div
                                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                                        onClick={() => toggleAccordion(user.id)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {user.avatar ? (
                                                <Image
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    width={40}
                                                    height={40}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-gray-500" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-medium text-base">{user.name}</h3>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <Eye className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">
                                                    {visibilityOptions.find(opt => opt.value === visibilitySettings[user.id])?.label || 'Team'}
                                                </span>
                                            </div>
                                            {expandedUserId === user.id ? (
                                                <ChevronUp className="h-5 w-5 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-gray-500" />
                                            )}
                                        </div>
                                    </div>

                                    {expandedUserId === user.id && (
                                        <div className="p-4 bg-white">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* User Details */}
                                                <div>
                                                    <h4 className="font-medium mb-3">User Details</h4>
                                                    <div className="space-y-2">
                                                        <p className="text-sm">
                                                            <span className="font-medium">Designation:</span> {user.designation}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="font-medium">Department:</span> {user.department?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="font-medium">Team:</span> {user.team?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="font-medium">Manager:</span> {user.manager?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="font-medium">Role:</span> {user.role}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Objective Visibility Settings */}
                                                <div>
                                                    <h4 className="font-medium mb-3">Objective Visibility</h4>
                                                    <div className="space-y-3">
                                                        {visibilityOptions.map(option => (
                                                            <div
                                                                key={option.value}
                                                                className={`p-3 border rounded-md cursor-pointer flex justify-between items-center ${visibilitySettings[user.id] === option.value
                                                                    ? 'border-secondary-500 bg-secondary-50'
                                                                    : 'hover:bg-gray-50'
                                                                    }`}
                                                                onClick={() => handleVisibilityChange(user.id, option.value)}
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="text-black">
                                                                        {option.icon}
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="font-medium">{option.label}</h5>
                                                                        <p className="text-xs text-gray-500">{option.description}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center">
                                                                    {visibilitySettings[user.id] === option.value && (
                                                                        <div className="h-2 w-2 rounded-full bg-secondary-500"></div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {isVisibilityChanged(user.id) && (
                                                            <div className="flex justify-end gap-2 mt-4">
                                                                <button
                                                                    className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100"
                                                                // onClick={() => handleCancelVisibilityChange(user.id)}
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <Button
                                                                    className="px-4 py-2 rounded-md  text-white text-sm hover:bg--700"
                                                                    onClick={() => handleSaveVisibility(user.id)}
                                                                >
                                                                    Save
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">No users found</div>
                        )}
                    </div>
                )
            }

            {/* Pagination */}
            {
                paginationPages > 1 && (
                    <div className="pt-2 my-3">
                        <ReactPaginate
                            previousLabel="Prev"
                            nextLabel="Next"
                            breakLabel="..."
                            pageCount={paginationPages}
                            forcePage={currentPage - 1}
                            marginPagesDisplayed={1}
                            pageRangeDisplayed={3}
                            onPageChange={(selectedItem) => handlePageChange(selectedItem)}
                            containerClassName="flex justify-between items-center w-[250px] mx-auto"
                            pageClassName="px-3 py-2 text-black hover:text-green-800"
                            activeClassName="bg-secondary-400 text-white rounded-md"
                            previousClassName={`px-3 py-2 ${currentPage === 1 ? "text-gray-400" : "text-black hover:text-green-800"}`}
                            nextClassName={`px-3 py-2 ${currentPage === paginationPages ? "text-gray-400" : "text-black hover:text-green-800"}`}
                            disabledClassName="text-gray-400"
                        />
                    </div>
                )
            }
        </div >
    );
};

export default ObjectivePermissions;