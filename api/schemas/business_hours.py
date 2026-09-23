from typing import List, Optional
from pydantic import BaseModel, Field

class TimeSlot(BaseModel):
    start: str = Field(..., description="Start time in HH:MM format (24-hour)")
    end: str = Field(..., description="End time in HH:MM format (24-hour)")

class WeeklySchedule(BaseModel):
    monday: List[TimeSlot] = Field(default_factory=list)
    tuesday: List[TimeSlot] = Field(default_factory=list)
    wednesday: List[TimeSlot] = Field(default_factory=list)
    thursday: List[TimeSlot] = Field(default_factory=list)
    friday: List[TimeSlot] = Field(default_factory=list)
    saturday: List[TimeSlot] = Field(default_factory=list)
    sunday: List[TimeSlot] = Field(default_factory=list)

class BusinessHoursConfiguration(BaseModel):
    enabled: bool = Field(default=False)
    timezone: str = Field(default="UTC")
    after_hours_workflow_id: Optional[int] = None
    schedule: WeeklySchedule = Field(default_factory=WeeklySchedule)
