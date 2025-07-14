import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Edit, Trash2, AtSign } from "lucide-react";
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
      taskId
    });
    
    setNewComment("");
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
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* Add new comment */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                handleMentionInput(e.target.value);
              }}
              placeholder="Add a comment... Use @username to mention someone"
              className="min-h-[80px]"
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
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <AtSign className="h-4 w-4" />
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
        {comments.map((comment) => (
          <Card key={comment.id} className="p-4">
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
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {comment.author?.firstName} {comment.author?.lastName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    {comment.isEdited && (
                      <Badge variant="secondary" className="text-xs">
                        edited
                      </Badge>
                    )}
                  </div>
                  
                  {(comment.author?._id === currentUser?._id || currentUser?.role === 'admin') && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[60px]"
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
                    className="text-sm text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ 
                      __html: renderCommentContent(comment.content) 
                    }}
                  />
                )}
                
                {comment.mentions && comment.mentions.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-gray-500">Mentioned:</span>
                    {comment.mentions.map((user, index) => (
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
        
        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}