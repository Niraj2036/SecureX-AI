"use client"

import { useSession } from 'next-auth/react';
import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { V3Button } from '@/components/v3/V3Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

const Page = () => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for avatar handling
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAvatarChanged, setIsAvatarChanged] = useState(false);

    const { data: userData, error, isLoading } = useQuery({
        queryKey: ['userProfile', session],
        queryFn: async () => {
            const response = await axios.get(`${backendUrl}/me`, {
                headers: {
                    Authorization: `Bearer ${session?.user.token}`
                }
            });
            return response.data.data;
        },
    });

    // Avatar upload mutation
    const avatarMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('logo', file); // Changed from 'avatar' to 'logo'

            const response = await axios.post(`${backendUrl}/users/update-logo`, formData, {
                headers: {
                    Authorization: `Bearer ${session?.user.token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['userProfileDetails'] });
            setIsAvatarChanged(false);
            setSelectedFile(null);
            setAvatarPreview(null);
        }
    });

    useEffect(() => {
        if (userData) {
            setValue('firstName', userData.name?.split(' ')[0] || '');
            setValue('lastName', userData.name?.split(' ')[1] || '');
            setValue('email', userData.email || '');
            setValue('phone', userData.mobile || '');
            setValue('jobTitle', userData.designation || '');
            setValue('manager', userData.manager?.name || '');
            setValue('department', userData.department?.name || 'N/A');
            setValue('team', userData.team?.name || '');
            setValue('joinDate', new Date(userData.joiningDate) || '');
            setValue('password', '12345678');
        }
    }, [userData, setValue]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Only JPEG, PNG, and GIF images are allowed');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            setSelectedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            setIsAvatarChanged(true);
        }
    };

    const handleSaveAvatar = async () => {
        if (selectedFile) {
            try {
                await avatarMutation.mutateAsync(selectedFile);
                // showSuccessToast('Avatar updated successfully');
            } catch (error: any) {
                console.error('Avatar upload failed:', error);
                // showErrorToast(error.response?.data?.message || 'Failed to update avatar');
            }
        }
    };

    const handleCancelAvatar = () => {
        setAvatarPreview(null);
        setSelectedFile(null);
        setIsAvatarChanged(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = (data: any) => {
        console.log('Form Data:', data);
    };

    if (error instanceof Error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="p-6 space-y-6 w-full mx-auto ">
            <span className='font-bold'>Profile</span>
            <div className='w-full border rounded-lg flex flex-col justify-center items-center p-6'>
                <div className="relative group mb-4">
                    {avatarPreview ? (
                        <Image
                            src={avatarPreview}
                            alt="Profile Preview"
                            className="h-24 w-24 rounded-full object-cover"
                            width={96}
                            height={96}
                        />
                    ) : userData?.avatar ? (
                        <Image
                            src={userData.avatar}
                            alt="Profile Avatar"
                            className="h-24 w-24 rounded-full object-cover"
                            width={96}
                            height={96}
                        />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-500 text-lg">No Avatar</span>
                        </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label
                            htmlFor="avatar-upload"
                            className="cursor-pointer bg-black bg-opacity-50 text-white p-2 rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input
                                id="avatar-upload"
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Avatar action buttons */}
                {isAvatarChanged && (
                    <div className="flex gap-2 mb-4">
                        <V3Button
                            type="button"
                            onClick={handleSaveAvatar}
                            isLoading={avatarMutation.isPending}
                        >
                            {avatarMutation.isPending ? 'Uploading...' : 'Save Avatar'}
                        </V3Button>
                        <V3Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelAvatar}
                            disabled={avatarMutation.isPending}
                        >
                            Cancel
                        </V3Button>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-lg mx-auto">
                    <div className="space-y-2">
                        <label htmlFor="firstName" className="text-xs font-semibold text-foreground block">First Name</label>
                        <input id="firstName" placeholder="First Name" {...register('firstName', { required: 'First name is required' })} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                        {errors.firstName && <span className="text-red-500 text-sm">{String(errors.firstName.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="lastName" className="text-xs font-semibold text-foreground block">Last Name</label>
                        <input id="lastName" placeholder="Last Name" {...register('lastName', { required: 'Last name is required' })} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                        {errors.lastName && <span className="text-red-500 text-sm">{String(errors.lastName.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-semibold text-foreground block">Email Address</label>
                        <input id="email" type="email" placeholder="Email Address" {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' } })} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                        {errors.email && <span className="text-red-500 text-sm">{String(errors.email.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-xs font-semibold text-foreground block">Phone Number</label>
                        <input id="phone" type="tel" placeholder="Phone Number" {...register('phone', { required: 'Phone number is required' })} className="w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                        {errors.phone && <span className="text-red-500 text-sm">{String(errors.phone.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-xs font-semibold text-foreground block">Password <Link href="/auth/forgot-password" className="text-sm text-indigo-600 hover:underline">Forgot Password?</Link></label>
                        <input id="password" type="password" placeholder="Password" {...register('password', { required: 'Password is required' })} disabled className="w-full h-9 rounded-lg border border-border/80 bg-muted px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-all opacity-60" />
                        {errors.password && <span className="text-red-500 text-sm">{String(errors.password.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="jobTitle" className="text-xs font-semibold text-foreground block">Job Title</label>
                        <input id="jobTitle" placeholder="Job Title" {...register('jobTitle', { required: 'Job title is required' })} disabled className="w-full h-9 rounded-lg border border-border/80 bg-muted px-3 text-xs text-foreground placeholder:text-muted-foreground transition-all opacity-60" />
                        {errors.jobTitle && <span className="text-red-500 text-sm">{String(errors.jobTitle.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="manager" className="text-xs font-semibold text-foreground block">Manager</label>
                        <input id="manager" placeholder="Manager" disabled {...register('manager')} className="w-full h-9 rounded-lg border border-border/80 bg-muted px-3 text-xs text-foreground placeholder:text-muted-foreground transition-all opacity-60" />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="department" className="text-xs font-semibold text-foreground block">Department</label>
                        <input id="department" placeholder="Department" disabled {...register('department')} className="w-full h-9 rounded-lg border border-border/80 bg-muted px-3 text-xs text-foreground placeholder:text-muted-foreground transition-all opacity-60" />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="team" className="text-xs font-semibold text-foreground block">Team</label>
                        <input id="team" placeholder="Team" {...register('team')} disabled className="w-full h-9 rounded-lg border border-border/80 bg-muted px-3 text-xs text-foreground placeholder:text-muted-foreground transition-all opacity-60" />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="joinDate" className="text-xs font-semibold text-foreground block">Join Date</label>
                        <input id="joinDate" type="date" {...register('joinDate', { required: 'Join date is required' })} disabled className="w-full h-9 rounded-lg border border-border/80 bg-muted px-3 text-xs text-foreground placeholder:text-muted-foreground transition-all opacity-60" />
                        {errors.joinDate && <span className="text-red-500 text-sm">{String(errors.joinDate.message)}</span>}
                    </div>

                    <V3Button type="submit" className="mt-4 w-full">Save Profile</V3Button>
                </form>
            </div>
        </div>
    );
};

export default Page