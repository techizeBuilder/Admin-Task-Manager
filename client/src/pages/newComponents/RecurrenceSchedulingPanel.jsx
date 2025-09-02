import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Repeat } from "lucide-react";

const RecurrenceSchedulingPanel = ({ onScheduleSet, initialData = null }) => {
  const [schedule, setSchedule] = useState({
    patternType: "daily",
    repeatEvery: 1,
    weekdays: [],
    endDate: null,
    ...initialData,
  });

  const handleSave = () => {
    if (onScheduleSet) {
      onScheduleSet(schedule);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Recurrence Schedule
        </CardTitle>
        <CardDescription>
          Set up when this task should repeat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pattern Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repeat Pattern
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["daily", "weekly", "monthly", "yearly"].map((pattern) => (
              <Button
                key={pattern}
                variant={schedule.patternType === pattern ? "default" : "outline"}
                size="sm"
                onClick={() => setSchedule({ ...schedule, patternType: pattern })}
                className="capitalize"
              >
                {pattern}
              </Button>
            ))}
          </div>
        </div>

        {/* Repeat Every */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repeat Every
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="30"
              value={schedule.repeatEvery}
              onChange={(e) => setSchedule({ ...schedule, repeatEvery: parseInt(e.target.value) })}
              className="w-20 px-3 py-1 border border-gray-300 rounded-md"
            />
            <span className="text-sm text-gray-600">
              {schedule.patternType === "daily" && "day(s)"}
              {schedule.patternType === "weekly" && "week(s)"}
              {schedule.patternType === "monthly" && "month(s)"}
              {schedule.patternType === "yearly" && "year(s)"}
            </span>
          </div>
        </div>

        {/* Weekdays (for weekly pattern) */}
        {schedule.patternType === "weekly" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              On Days
            </label>
            <div className="flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <Button
                  key={day}
                  variant={schedule.weekdays?.includes(day) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newWeekdays = schedule.weekdays?.includes(day)
                      ? schedule.weekdays.filter(d => d !== day)
                      : [...(schedule.weekdays || []), day];
                    setSchedule({ ...schedule, weekdays: newWeekdays });
                  }}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Schedule Preview:</h4>
          <p className="text-sm text-gray-600">
            Repeats every {schedule.repeatEvery} {schedule.patternType}
            {schedule.patternType === "weekly" && schedule.weekdays?.length > 0 && 
              ` on ${schedule.weekdays.join(", ")}`
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setSchedule({ patternType: "daily", repeatEvery: 1, weekdays: [] })}>
            Reset
          </Button>
          <Button onClick={handleSave}>
            Apply Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurrenceSchedulingPanel;