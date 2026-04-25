import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/card';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import Comment from '../comment';
import ReactPaginate from 'react-paginate';

const UserRecognition = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const { data: userSession } = useSession();
    const searchParams = useSearchParams();
    const userId = searchParams.get("id");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Match this with your backend's default pageSize

    const { data: userFeedbackData, isLoading } = useQuery({
        queryKey: ["userFeedback", userId, currentPage],
        queryFn: async () => {
            const response = await axios.post(`${backendUrl}/feedback/feedbackForUserProfile/`, {
                userId: userId,
                pageNo: currentPage,
                pageSize: pageSize,
            }, {
                headers: { Authorization: `Bearer ${userSession?.user.token}` },
            });
            return response.data;
        },
    });

    const handlePageChange = (selectedItem: { selected: number }) => {
        setCurrentPage(selectedItem.selected + 1);
    };

    // Calculate total pages from the metadata returned by the API
    const totalPages = userFeedbackData?.metadata?.totalPages || 1;

    return (
        <Card className="border-none shadow-none px-4 mt-0">
            <CardHeader className="text-left text-xl font-semibold ">
                Recognition
            </CardHeader>
            <div className="overflow-auto rounded-md border border-gray-200 mb-4">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/20 text-gray-700">
                            <TableHead className="w-[180px]">Sent To</TableHead>
                            <TableHead>Badge</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Sent On</TableHead>
                            <TableHead>Sender</TableHead>
                            <TableHead>Viewers</TableHead>
                            <TableHead className="text-center">Comment</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <TableRow key={index}>
                                    {Array(7).fill(null).map((_, i) => (
                                        <TableCell key={i} className="py-4">
                                            <div className="animate-pulse bg-gray-200 h-5 rounded-md w-full"></div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : userFeedbackData?.data?.length > 0 ? (
                            userFeedbackData.data.map((item: any) => (
                                <TableRow key={item?.id} className="hover:bg-muted transition-colors">
                                    <TableCell>
                                        <Link href={`/user-profiles?id=${item?.receiver?.id}`} className="flex items-center gap-2 hover:text-primary">
                                            <Avatar className="h-7 w-7">
                                                {item?.receiver?.avatar ? (
                                                    <AvatarImage src={item.receiver.avatar} alt={item.receiver.name || "U"} />
                                                ) : (
                                                    <AvatarFallback>{item.receiver?.name[0]?.toUpperCase() || "U"}</AvatarFallback>
                                                )}
                                            </Avatar>
                                            <span className="truncate">{item?.receiver?.name || "Unknown"}</span>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            className="flex items-center justify-center rounded-full p-2"
                                            style={{ backgroundColor: item?.badge.backgroundColour }}
                                            title={item?.badge.title}
                                        >
                                            <Image
                                                src={`/okr/feedback/${item?.badge.image_url}`}
                                                width={28}
                                                height={28}
                                                alt={item?.badge.title}
                                                className="rounded-full"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs whitespace-normal">
                                        {item?.content || item?.message} {/* Updated to use content which comes from the API */}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(item?.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/user-profiles?id=${item?.sender?.id}`} className="flex items-center gap-2 hover:text-primary">
                                            <Avatar className="h-7 w-7">
                                                {item?.sender?.avatar ? (
                                                    <AvatarImage src={item.sender.avatar} alt={item.sender.name || "U"} />
                                                ) : (
                                                    <AvatarFallback>{item.sender?.name[0]?.toUpperCase() || "U"}</AvatarFallback>
                                                )}
                                            </Avatar>
                                            <span className="truncate">{item?.sender?.name || "Unknown"}</span>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="capitalize">{item?.viewerScope}</TableCell>
                                    <TableCell className="text-center">
                                        <Comment feedbackId={item.id}/>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <h3 className="text-xl font-semibold text-muted-foreground">No Feedback Yet</h3>
                                        <p className="text-sm text-gray-500 max-w-md">
                                            Feedback from your teammates will appear here once it&apos;s shared. Encourage your team to start giving feedback!
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Pagination */}
            {userFeedbackData?.data?.length > 0 && (
                <div className="flex justify-center mt-4">
                    <ReactPaginate
                        previousLabel="Previous"
                        nextLabel="Next"
                        breakLabel="..."
                        pageCount={totalPages}
                        forcePage={currentPage - 1}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={3}
                        onPageChange={handlePageChange}
                        containerClassName="flex items-center gap-2"
                        pageClassName="px-3 py-1 rounded hover:bg-gray-100"
                        activeClassName="bg-primary text-white"
                        previousClassName="px-3 py-1 rounded hover:bg-gray-100"
                        nextClassName="px-3 py-1 rounded hover:bg-gray-100"
                        disabledClassName="opacity-50 cursor-not-allowed"
                        breakClassName="px-2"
                    />
                </div>
            )}
        </Card>
    );
};

export default UserRecognition;