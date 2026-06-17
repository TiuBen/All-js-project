import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import TestFlightsPlanTable from "@/components/TestFlightsPlanTable";

function CalendarFlightsPage() {
    const [date, setDate] = useState<Date | undefined>(Date.now());

    return (
        <div className="flex flex-col gap-2 p-2  w-full h-full">
            <div className="flex flex-row">
                <div className="flex flex-row gap-2 items-center text-xl font-semibold">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                data-empty={!date}
                                className="data-[empty=true]:text-muted-foreground max-w-fit justify-start text-left font-normal"
                            >
                                <CalendarIcon />
                                {date ? format(date, "yyyy-MM-dd") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={setDate} locale={zhCN} />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div>
                <TestFlightsPlanTable />
            </div>
        </div>
    );
}

export default CalendarFlightsPage;
