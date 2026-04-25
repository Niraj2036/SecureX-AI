"use client"

import { useSession } from 'next-auth/react';
import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
                        <Button
                            type="button"
                            onClick={handleSaveAvatar}
                            disabled={avatarMutation.isPending}
                        >
                            {avatarMutation.isPending ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </div>
                            ) : 'Save Avatar'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelAvatar}
                            disabled={avatarMutation.isPending}
                        >
                            Cancel
                        </Button>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-lg mx-auto">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="First Name" {...register('firstName', { required: 'First name is required' })} />
                        {errors.firstName && <span className="text-red-500 text-sm">{String(errors.firstName.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Last Name" {...register('lastName', { required: 'Last name is required' })} />
                        {errors.lastName && <span className="text-red-500 text-sm">{String(errors.lastName.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="Email Address" {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' } })} />
                        {errors.email && <span className="text-red-500 text-sm">{String(errors.email.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="Phone Number" {...register('phone', { required: 'Phone number is required' })} />
                        {errors.phone && <span className="text-red-500 text-sm">{String(errors.phone.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password  <Link
                            href="/auth/forgot-password"
                            className="text-sm text-teal-600 hover:underline"
                        >
                            Forgot Password?
                        </Link></Label>
                        <Input id="password" type="password" placeholder="Password" {...register('password', { required: 'Password is required' })} disabled />
                        {errors.password && <span className="text-red-500 text-sm">{String(errors.password.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input id="jobTitle" placeholder="Job Title" {...register('jobTitle', { required: 'Job title is required' })} disabled />
                        {errors.jobTitle && <span className="text-red-500 text-sm">{String(errors.jobTitle.message)}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="manager">Manager</Label>
                        <Input id="manager" placeholder="Manager" disabled {...register('manager')} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" placeholder="Department" disabled {...register('department')} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="team">Team</Label>
                        <Input id="team" placeholder="Team" {...register('team')} disabled />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="joinDate">Join Date</Label>
                        <Input id="joinDate" type="date" {...register('joinDate', { required: 'Join date is required' })} disabled />
                        {errors.joinDate && <span className="text-red-500 text-sm">{String(errors.joinDate.message)}</span>}
                    </div>

                    <Button type="submit" className="mt-4 w-full">Submit</Button>
                </form>
            </div>
        </div>
    );
};

export default Page