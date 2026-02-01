import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";

const ExecutionMeeting = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // October 2025
  
  const meetingTypes = ["Weekly Status", "Program Board", "Steering Committee"];
  const sessionOrganization = [
    { id: "workshops", label: "Workshops", checked: true },
    { id: "agenda", label: "Agenda", checked: true },
    { id: "preread", label: "Pre-read files", checked: true },
    { id: "attendee", label: "Attendee list", checked: false },
  ];

  const upcomingMeetings = [
    { title: "Weekly Update meeting", date: "7-10-2025", time: "11:00" },
    { title: "Weekly Update meeting", date: "14-10-2025", time: "11:00" },
    { title: "Weekly Update meeting", date: "21-10-2025", time: "11:00" },
    { title: "Weekly Update meeting", date: "28-10-2025", time: "11:00" },
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const meetingDays = [7, 14, 21, 28];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-2">Meeting Scheduling</h2>
            <p className="text-sm text-muted-foreground mb-6">Setup recurring and ad-hoc meetings</p>
            
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">Types</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {meetingTypes.map((type) => (
                  <Badge key={type} variant="outline" className="text-sm">
                    {type}
                  </Badge>
                ))}
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Meeting
              </Button>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Session Organization</h3>
              <div className="space-y-3">
                {sessionOrganization.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox id={item.id} defaultChecked={item.checked} />
                    <label htmlFor={item.id} className="text-sm text-foreground cursor-pointer">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-foreground">{monthName}</h2>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-6">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const hasMeeting = meetingDays.includes(day);
                return (
                  <div
                    key={day}
                    className={`text-center p-2 rounded-md cursor-pointer hover:bg-accent ${
                      hasMeeting ? 'font-semibold' : ''
                    }`}
                  >
                    <div className="text-foreground">{day}</div>
                    {hasMeeting && (
                      <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Upcoming Meetings</h3>
              <div className="space-y-3 mb-6">
                {upcomingMeetings.map((meeting, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="text-foreground font-medium">{meeting.title}</div>
                    <div className="ml-auto text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {meeting.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meeting.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <div className="inline-flex flex-col items-center gap-4 p-6">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Select a meeting from the calendar to view details
                  </p>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New Meeting
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExecutionMeeting;
