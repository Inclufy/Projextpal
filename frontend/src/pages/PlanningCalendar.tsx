import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PlanningCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState("October");
  const [currentYear, setCurrentYear] = useState("2025");
  
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Calendar grid - starting from 29 (previous month) to show full weeks
  const calendarDays = [
    { day: 29, isPrevMonth: true },
    { day: 30, isPrevMonth: true },
    { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 },
    { day: 6 }, { day: 7 }, { day: 8 }, { day: 9, hasEvent: true }, { day: 10, hasEvent: true }, { day: 11, hasEvent: true }, { day: 12 },
    { day: 13 }, { day: 14 }, { day: 15 }, { day: 16, isSelected: true }, { day: 17 }, { day: 18 }, { day: 19 },
    { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25, isToday: true }, { day: 26 },
    { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 },
    { day: 1, isNextMonth: true }, { day: 2, isNextMonth: true },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Project Calendar</h1>
          <p className="text-muted-foreground">Select a date range to view or add project events.</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          {/* Calendar Header */}
          <div className="bg-primary rounded-lg py-4 px-6 mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-hover">
              <CalendarIcon className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-6">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-hover font-semibold text-lg">
                {currentMonth}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-hover font-semibold text-lg">
                {currentYear}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-hover">
              <CalendarIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center py-3 text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayObj, index) => (
              <div
                key={index}
                className={cn(
                  "aspect-square flex items-center justify-center rounded-lg text-lg font-semibold cursor-pointer transition-colors relative",
                  dayObj.isPrevMonth || dayObj.isNextMonth
                    ? "text-muted-foreground/40"
                    : "text-foreground hover:bg-muted/30",
                  dayObj.isToday && "bg-primary text-primary-foreground hover:bg-primary-hover",
                  dayObj.isSelected && "bg-primary/20 border-2 border-primary"
                )}
              >
                {dayObj.day}
                {dayObj.hasEvent && !dayObj.isPrevMonth && !dayObj.isNextMonth && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary"></div>
                )}
              </div>
            ))}
          </div>

          {/* Add Event Button */}
          <Button variant="ghost" className="mt-6 text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>

          {/* Events List */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Events from Sat Oct 25 2025 to Sat Oct 25 2025
            </h3>
            <p className="text-center py-12 text-muted-foreground">
              No events scheduled in this date range. Click "Add Event" to create one!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningCalendar;
