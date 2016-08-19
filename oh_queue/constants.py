import enum

class TicketStatus(enum.IntEnum):
    pending = 0
    assigned = 1
    resolved = 2
    canceled = 3

class TicketEventType(enum.IntEnum):
    create = 0
    assign = 1
    unassign = 2
    resolve = 3
    cancel = 4
