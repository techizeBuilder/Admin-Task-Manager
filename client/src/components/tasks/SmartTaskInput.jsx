import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Hash, Clock } from "lucide-react";

export function SmartTaskInput({ onTaskCreate, users = [], projects = [] }) {
  const [input, setInput] = useState("");
  const [parsedData, setParsedData] = useState(null);

  const parseTaskInput = (text) => {
    if (!text.trim()) {
      setParsedData(null);
      return;
    }

    const parsed = {
      title: "",
      description: "",
      dueDate: null,
      assignees: [],
      tags: [],
      priority: "medium",
      mentions: []
    };

    // Extract mentions (@username)
    const mentionRegex = /@(\w+)/g;
    const mentions = [...text.matchAll(mentionRegex)];
    mentions.forEach(match => {
      const username = match[1];
      const user = users.find(u => u.firstName?.toLowerCase().includes(username.toLowerCase()) || 
                                   u.lastName?.toLowerCase().includes(username.toLowerCase()) ||
                                   u.email?.toLowerCase().includes(username.toLowerCase()));
      if (user) {
        parsed.mentions.push(user);
        parsed.assignees.push(user);
      }
    });

    // Extract tags (#tagname)
    const tagRegex = /#(\w+)/g;
    const tags = [...text.matchAll(tagRegex)];
    tags.forEach(match => {
      parsed.tags.push(match[1]);
    });

    // Extract due dates (basic patterns)
    const dueDatePatterns = [
      /\b(?:by|due|until)\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      /\b(?:by|due|until)\s+(\d{1,2}\/\d{1,2}\/?\d{0,4})\b/i,
      /\b(?:by|due|until)\s+(\d{1,2}-\d{1,2}-?\d{0,4})\b/i
    ];

    for (const pattern of dueDatePatterns) {
      const match = text.match(pattern);
      if (match) {
        const dateStr = match[1];
        if (dateStr.toLowerCase() === 'today') {
          parsed.dueDate = new Date().toISOString().split('T')[0];
        } else if (dateStr.toLowerCase() === 'tomorrow') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          parsed.dueDate = tomorrow.toISOString().split('T')[0];
        } else {
          // Try to parse the date string
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            parsed.dueDate = date.toISOString().split('T')[0];
          }
        }
        break;
      }
    }

    // Extract priority
    if (/\b(?:urgent|high|critical)\b/i.test(text)) {
      parsed.priority = "high";
    } else if (/\b(?:low|minor)\b/i.test(text)) {
      parsed.priority = "low";
    }

    // Clean title (remove extracted parts)
    let cleanTitle = text
      .replace(mentionRegex, '')
      .replace(tagRegex, '')
      .replace(/\b(?:by|due|until)\s+[^\s]+/gi, '')
      .replace(/\b(?:urgent|high|critical|low|minor)\b/gi, '')
      .trim();

    parsed.title = cleanTitle || text.slice(0, 50);

    setParsedData(parsed);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    parseTaskInput(value);
  };

  const handleSubmit = () => {
    if (parsedData && parsedData.title) {
      onTaskCreate(parsedData);
      setInput("");
      setParsedData(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your task... e.g., 'Submit report by Friday @john #finance urgent'"
          className="flex-1"
        />
        <Button 
          onClick={handleSubmit}
          disabled={!parsedData?.title}
        >
          Create Task
        </Button>
      </div>

      {parsedData && parsedData.title && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-blue-700 dark:text-blue-300">
                Parsed Task:
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Title:</span>
                <span className="text-sm">{parsedData.title}</span>
              </div>

              {parsedData.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Due: {parsedData.dueDate}</span>
                </div>
              )}

              {parsedData.assignees.length > 0 && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Assigned to:</span>
                  {parsedData.assignees.map((user, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {user.firstName} {user.lastName}
                    </Badge>
                  ))}
                </div>
              )}

              {parsedData.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Tags:</span>
                  {parsedData.tags.map((tag, index) => (
                    <Badge key={index} className="text-xs bg-green-100 text-green-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Priority:</span>
                <Badge 
                  className={`text-xs ${
                    parsedData.priority === 'high' ? 'bg-red-100 text-red-800' :
                    parsedData.priority === 'low' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}
                >
                  {parsedData.priority}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}