"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Image from "next/image";
import axios from "axios";
import comment from "../../public/okr/feedback/message.png";
import like from "../../public/okr/feedback/like.png";
import profile from "../../public/employee/profile.png";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface CommentProps {
  feedbackId: string;
}

interface CommentData {
  id: number | string;
  name: string | null;
  text: string;
  date: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface Count {
  likes: number;
}

interface Comment {
  id: string;
  text: string;
  sentById: string;
  parentCommentId: string | null;
  tenantId: string;
  feedbackId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  _count: Count;
}

const Comment = ({ feedbackId }: CommentProps) => {
  const [newComment, setNewComment] = useState<string>("");
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string>("");
  const [showMentionList, setShowMentionList] = useState<boolean>(false);
  const [mentionPosition, setMentionPosition] = useState<number>(0);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const { data: session } = useSession();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [showComments, setShowComments] = useState(false);

  const {
    data: comments,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ["comments", feedbackId],
    enabled: showComments && !!session,
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/comment/${feedbackId}`, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return response.data.data;
    },
    
  });

  const { data: owners } = useQuery({
    queryKey: ["owners"],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/owners`, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return response.data
    },
    enabled: showComments && !!session, // Only fetch when comments are shown
  })

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${backendUrl}/comment/create`,
        {
          feedbackId,
          text: newComment,
          mentionedUserIds: Array.from(new Set(mentionedUserIds)) // Remove duplicates
        },
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setNewComment("");
      setMentionedUserIds([]); // Clear mentions after successful submission
      refetch();
      toast({
        title: "Comment added successfully",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error adding comment", error);
      toast({
        title: "Error",
        description: "Failed to add the comment. Please try again later.",
      });
    },
  });

  const handleAddComment = () => {
    if (newComment?.trim()) {
      addCommentMutation.mutate();
    }
  };

  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const toggleReplies = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId], // Toggle visibility for the specific comment
    }));
  }
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await axios.post(
        `${backendUrl}/comment/like`,
        { commentId },
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to toggle like. Please try again later.",
      });
      console.error("Error toggling like:", error);
    },
  });

  const handleLikeToggle = (commendId: string) => {
    likeMutation.mutate(commendId);
  };

  function extractMentionedUserIds(text: string, users: any[]): string[] {
    const mentionedNames = text.match(/@(\w+)/g) || [];
    return users.filter(user => mentionedNames.includes(`@${user.name.toLowerCase()}` as never))
      .map(user => user.id);
  }
  const handleReplySubmit = (parentId: string) => {
    const reply = replyText[parentId];
    if (!reply?.trim()) return;

    const mentionedUsers = extractMentionedUserIds(reply, owners?.data?.users || []);

    axios
      .post(
        `${backendUrl}/comment/create`,
        {
          feedbackId,
          parentCommentId: parentId,
          text: reply,
          mentionedUserIds: mentionedUsers
        },
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      )
      .then(() => {
        refetch();
        setReplyingTo(null);
        setReplyText((prev) => ({ ...prev, [parentId]: "" }));
        toast({
          title: "Reply sent",
          description: "Your reply has been sent.",
          duration: 3000,
        });
      })
      .catch((error) => {
        console.error("Error sending reply", error);
        toast({
          title: "Error",
          description: "Failed to send the reply. Please try again later.",
          duration: 3000,
        });
      });
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const words = name.split(" ");
    return words.length > 1
      ? words[0][0].toUpperCase()
      : words[0][0].toUpperCase();
  };
  const filteredUsers = owners?.data?.users?.filter((owner: any) =>
    owner.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleInputChange = (value: string, commentId?: string) => {
    if (commentId) {
      setReplyText((prev) => ({ ...prev, [commentId]: value }));
      setActiveInputId(commentId); // Set active input to reply
    } else {
      setNewComment(value);
      setActiveInputId("main"); // Set active input to main
    }

    const atIndex = value.lastIndexOf("@");
    if (atIndex !== -1) {
      setMentionQuery(value.slice(atIndex + 1));
      setShowMentionList(true);
      setMentionPosition(atIndex);
    } else {
      setShowMentionList(false);
    }
  };
  const handleUserSelect = (user: any) => {
    const selectedText = `@${user.name} `;

    if (activeInputId === "main") {
      const newText = newComment.slice(0, mentionPosition) + selectedText;
      setNewComment(newText);
      setMentionedUserIds(prev => [...prev, user.id]); // Add user ID to mentioned list
    } else if (activeInputId) {
      const newText = replyText[activeInputId].slice(0, mentionPosition) + selectedText;
      setReplyText((prev) => ({ ...prev, [activeInputId]: newText }));
      // For replies, you might want to track per-comment mentions
    }

    setShowMentionList(false);
    setActiveInputId(null);
  };
  // Enhanced mention list component
  const MentionList = () => {
    if (!showMentionList || !filteredUsers?.length) return null;

    return (
      <div className="absolute bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-52 overflow-auto w-64">
        {filteredUsers.map((user: any) => (
          <div
            key={user.id}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            onClick={() => handleUserSelect(user)}
          >
            <Avatar className="w-6 h-6">
              {user?.avatar ? (
                <AvatarImage
                  src={user.avatar}
                  alt={user.name || "Unknown"}
                  className="rounded-full"
                />
              ) : (
                <AvatarFallback className="text-xs">
                  {getInitials(user?.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-sm truncate">{user.name}</div>
            {user.email && (
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            )}
          </div>
        ))}
      </div>
    );
  };


  return (
    <Sheet>
      <SheetTrigger asChild  onClick={toggleComments}>
        <button>
          <Image src={comment} alt="comment" className="w-7 h-auto" />
        </button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-auto space-y-4 relative">
          {isSuccess &&
            comments.map((comment: any) => (
              <div key={comment.id} className="flex gap-3">
                {/* Avatar */}
                <Link href={`/user-profiles?id=${comment.user?.id}`} className="hover:text-blue-500 flex" passHref>
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    {comment?.user?.avatar ? (
                      <AvatarImage
                        src={comment.user.avatar}
                        alt={comment.user.name || "Unknown"}
                        className="rounded-full object-cover hover:opacity-30"
                      />
                    ) : (
                      <AvatarFallback className="rounded-full bg-muted flex items-center justify-center hover:opacity-30">
                        {getInitials(comment?.user?.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Link>

                <div className="flex-1 relative">
                  <Card className="shadow-none border-0">
                    <CardContent className="p-0">
                      <div className="bg-teal-50 rounded-lg p-3 space-y-1">
                        <div className="flex justify-between w-full">
                          <Link href={`/user-profiles?id=${comment.user?.id}`} className="hover:text-blue-500 flex" passHref>
                            <div className="font-medium text-sm">
                              {comment?.user?.name}
                            </div>
                          </Link>
                          <div className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{comment.text}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span
                          className="text-sm flex justify-center items-center gap-2 text-gray-500"
                          onClick={() => handleLikeToggle(comment.id)}
                        >
                          <Image src={like} alt="like" className="w-4" />
                          {comment._count.likes}
                        </span>
                        <button
                          className="text-blue-600 text-sm hover:text-blue-700"
                          onClick={() => setReplyingTo(comment.id)}
                        >
                          Reply
                        </button>
                        {comment.replies.length > 0 && (
                          <button
                            className="text-blue-600 text-sm hover:text-blue-700"
                            onClick={() => toggleReplies(comment.id)}
                          >
                            {expandedComments[comment.id] ? "Hide Replies" : "Show Replies"}
                          </button>
                        )}
                        <span className="text-sm text-gray-500">
                          {comment.date}
                        </span>
                      </div>
                      {expandedComments[comment.id] && (
                        <div className="ml-6 mt-2 border-l pl-4">
                          {comment.replies.map((reply: any) => (
                            <Card key={reply.id} className="mt-2 p-3 bg-teal-50 border-none shadow-none">
                              <div className="flex gap-3">
                                {/* <Avatar className="w-8 h-8 flex-shrink-0">
                                  {reply.user?.avatar ? (
                                    <AvatarImage src={reply.user.avatar} alt={reply.user.name || "U"} />
                                  ) : (
                                    <AvatarFallback className="rounded-full bg-muted flex items-center justify-center">
                                      {getInitials(reply.user?.name)}
                                    </AvatarFallback>
                                  )}
                                </Avatar> */}
                                <div className="flex-1">
                                  <div className="flex justify-between w-full">
                                    <div className="font-medium text-sm">{reply.user?.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-600">{reply.text}</div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                      )}
                      {replyingTo === comment.id && (
                        <div className="mt-2 flex items-start gap-3 relative">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="rounded-full bg-muted flex items-center justify-center">
                              {getInitials(session?.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 flex-1">
                            <input
                              type="text"
                              value={replyText[comment.id] || ""}
                              onChange={(e) => handleInputChange(e.target.value, comment.id)}
                              placeholder="Write a reply..."
                              className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleReplySubmit(comment.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleReplySubmit(comment.id)}
                              className="text-blue-600 text-sm px-4 hover:text-blue-700"
                            >
                              Send
                            </button>
                          </div>
                          {activeInputId === comment.id && <MentionList />}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
        </div>

        {/* Comment Input */}
        <div className="relative">
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="rounded-full bg-muted flex items-center justify-center">
                {getInitials(session?.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 flex-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <button
                onClick={handleAddComment}
                className="text-blue-600 text-sm px-4 hover:text-blue-700"
              >
                Send
              </button>
            </div>
            {activeInputId === "main" && <MentionList />}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Comment;
