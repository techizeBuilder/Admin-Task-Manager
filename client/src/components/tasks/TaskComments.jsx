import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Edit, Trash2, AtSign, Reply, Send } from "lucide-react";
import CustomEditor from "../common/CustomEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TaskComments({ taskId, comments, onAddComment, onEditComment, onDeleteComment, currentUser, users = [] }) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedComments, setExpandedComments] = useState({});

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    // Extract mentions from the comment
    const mentionRegex = /@(\w+)/g;
    const mentions = [...newComment.matchAll(mentionRegex)];
    const mentionedUsers = mentions.map(match => {
      const username = match[1];
      return users.find(u => 
        u.firstName?.toLowerCase().includes(username.toLowerCase()) || 
        u.lastName?.toLowerCase().includes(username.toLowerCase()) ||
        u.email?.toLowerCase().includes(username.toLowerCase())
      );
    }).filter(Boolean);

    await onAddComment({
      content: newComment,
      mentions: mentionedUsers,
      taskId,
      parentId: null
    });
    
    setNewComment("");
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim()) return;
    
    // Extract mentions from the reply
    const mentionRegex = /@(\w+)/g;
    const mentions = [...replyText.matchAll(mentionRegex)];
    const mentionedUsers = mentions.map(match => {
      const username = match[1];
      return users.find(u => 
        u.firstName?.toLowerCase().includes(username.toLowerCase()) || 
        u.lastName?.toLowerCase().includes(username.toLowerCase()) ||
        u.email?.toLowerCase().includes(username.toLowerCase())
      );
    }).filter(Boolean);

    await onAddComment({
      content: replyText,
      mentions: mentionedUsers,
      taskId,
      parentId
    });
    
    setReplyText("");
    setReplyingTo(null);
  };

  const toggleReplies = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const getReplies = (parentId) => {
    return comments.filter(comment => comment.parentId === parentId);
  };

  const getTopLevelComments = () => {
    return comments.filter(comment => !comment.parentId);
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    
    await onEditComment(editingId, { content: editText });
    setEditingId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleMentionInput = (text) => {
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const searchTerm = text.slice(lastAtIndex + 1);
      if (searchTerm.length > 0) {
        const suggestions = users.filter(user => 
          user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
        setMentionSuggestions(suggestions);
        setShowMentions(suggestions.length > 0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user) => {
    const lastAtIndex = newComment.lastIndexOf('@');
    const beforeMention = newComment.slice(0, lastAtIndex);
    const afterMention = newComment.slice(lastAtIndex).replace(/@\w*/, `@${user.firstName}`);
    setNewComment(beforeMention + afterMention + ' ');
    setShowMentions(false);
  };

  const renderCommentContent = (content) => {
    // Highlight mentions in comments
    return content.replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Comments ({comments.length})
      </h3>

      {/* Add new comment */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="relative">
            <CustomEditor
              value={newComment}
              onChange={setNewComment}
              placeholder="Add a comment... Use @username to mention someone"
           
              className="border rounded-md"
            />
            
            {showMentions && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {mentionSuggestions.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => insertMention(user)}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.firstName} {user.lastName}</span>
                    <span className="text-xs text-gray-900">{user.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
          
              <span>Use @ to mention users</span>
            </div>
            <Button 
              onClick={handleCommentSubmit}
              disabled={!newComment.trim()}
            >
              Add Comment
            </Button>
          </div>
        </div>
      </Card>

      {/* Comments list */}
      <div className="space-y-3">
        {getTopLevelComments().map((comment) => {
          const replies = getReplies(comment.id);
          return (
            <div key={comment.id} className="space-y-3">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.avatar} />
                    <AvatarFallback>
                      {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 ">
                          {comment.author?.firstName && comment.author?.lastName 
                            ? `${comment.author.firstName} ${comment.author.lastName}`
                            : comment.author?.name || comment.author?.email || 'Unknown User'
                          }
                        </span>
                        <span className="text-xs text-gray-900  ">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        {comment.isEdited && (
                          <Badge variant="secondary" className="text-xs">
                            edited
                          </Badge>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setReplyingTo(comment.id)}>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          {(comment.author?._id === currentUser?._id || currentUser?.role === 'admin') && (
                            <>
                              <DropdownMenuItem onClick={() => handleEdit(comment)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onDeleteComment(comment.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <CustomEditor
                          value={editText}
                          onChange={setEditText}
                      
                          className="border rounded-md"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="text-sm text-gray-900  prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: renderCommentContent(comment.content) 
                        }}
                      />
                    )}
                    
                    {comment.mentions && comment.mentions.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs text-gray-900  ">Mentioned:</span>
                        {comment.mentions.map((user, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {user.firstName} {user.lastName}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Reply form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200">
                        <div className="space-y-2">
                          <CustomEditor
                            value={replyText}
                            onChange={setReplyText}
                            placeholder="Write a reply... Use @username to mention someone"
                         
                            className="border rounded-md"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleReplySubmit(comment.id)}>
                              <Send className="h-4 w-4 mr-1" />
                              Reply
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show/Hide replies toggle */}
                    {replies.length > 0 && (
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleReplies(comment.id)}
                          className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
                        >
                          {expandedComments[comment.id] ? 'Hide' : 'View'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Replies */}
              {expandedComments[comment.id] && replies.length > 0 && (
                <div className="ml-12 space-y-2">
                  {replies.map((reply) => (
                    <Card key={reply.id} className="p-3 bg-gray-900">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={reply.author?.avatar} />
                          <AvatarFallback className="text-xs">
                            {reply.author?.firstName?.[0]}{reply.author?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-xs text-gray-900 ">
                                {reply.author?.firstName && reply.author?.lastName 
                                  ? `${reply.author.firstName} ${reply.author.lastName}`
                                  : reply.author?.name || reply.author?.email || 'Unknown User'
                                }
                              </span>
                              <span className="text-xs text-gray-900">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                              </span>
                              {reply.isEdited && (
                                <Badge variant="secondary" className="text-xs">
                                  edited
                                </Badge>
                              )}
                            </div>
                            
                            {(reply.author?._id === currentUser?._id || currentUser?.role === 'admin') && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(reply)}>
                                    <Edit className="h-3 w-3 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => onDeleteComment(reply.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          
                          <div 
                            className="text-xs text-gray-700 dark:text-gray-300 prose prose-xs max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: renderCommentContent(reply.content) 
                            }}
                          />
                          
                          {reply.mentions && reply.mentions.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-xs text-gray-900">Mentioned:</span>
                              {reply.mentions.map((user, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {user.firstName} {user.lastName}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {getTopLevelComments().length === 0 && (
          <div className="text-center py-8 text-gray-900">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}