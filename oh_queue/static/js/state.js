// @flow
/* This file contains functions for manipulating the global state of the app.
 *
 * This file uses flow type annotations for greater safety. To typecheck, run
 *     npm run-script flow
 */

type User = {
  id: number,
  email: string,
  name: string,
  shortName: string,
  isStaff: boolean,
};

type Ticket = {
  id: number,
  status: 'pending' | 'assigned' | 'resolved' | 'deleted' | 'juggled' | 'rerequested',
  user: User,
  created: string,  // ISO 8601 datetime string
  rerequest_threshold: ?string, // ISO 8601 datetime string
  hold_time: ?string, // ISO 8601 datetime string
  rerequest_time: ?string, // ISO 8601 datetime string
  updated: ?string,
  location_id: number,
  assignment_id: number,
  question: string,
  description: ?string,
  helper: ?User,
};

type TicketAssignment = {
  id: number,
  name: string
};

type TicketLocation = {
  id: number,
  name: string
};

type Filter = {
  /* Selected options. null means do not filter by an attribute. */
  assignment_id: ?number,
  location_id: ?number,
  question: ?string,
};

type Message = {
  id: number,
  category: string,  // e.g. "danger", "warning"
  text: string,
  visible: boolean,
};

type Appointment = {
    id: number,
    start_time: string, // datetime string
    duration: number, // seconds
    signups: Array<Signup>,
    capacity: number,
    location_id: number,
    helper: ?User,
}


type Signup = {
    id: number,
    assignment_id: number,
    user: ?User,
    question: ?string,
    description: ?string,
}


type State = {
  /* May be null if the user is not logged in. */
  currentUser: ?User,
  /* True on page load, before the initial websocket connection. */
  loaded: boolean,
  /* True if the websocket has disconnected. */
  offline: boolean,
  /* Ticket assignments */
  assignments: Map<number, TicketAssignment>,
  /* Ticket locations */
  appointments: Array<Appointment>,
  /* Ticket locations */
  locations: Map<number, TicketLocation>,
  /* Server configuration */
  config: Map<string, string>,
  /* All known tickets, including ones that have been resolved or deleted.
   * We may have to load past tickets asynchronously though.
   * This is an ES6 Map from ticket ID to the ticket data.
   */
  tickets: Map<number, Ticket>,
  /* Ticket IDs for any tickets we are currently loading. */
  loadingTickets: Set<number>,
  /* Current ticket filter. */
  filter: Filter,
  /* Selected queue tab. */
  queueTabIndex: number,
  /* Flashed messages. */
  messages: Array<Message>,
  nextMessageID: number,
};

let initialState: State = {
  currentUser: null,
  loaded: false,
  offline: true,
  assignments: {},
  locations: {},
  config: {},
  appointments: [],
  tickets: new Map(),
  loadingTickets: new Set(),
  filter: {
    location_id: null,
    assignment_id: null,
    question: null,
  },
  queueTabIndex: 0,
  messages: [],
  nextMessageID: 1,
}

function ticketDisplayTime(ticket: Ticket): string {
  return moment.utc(ticket.created).local().format('h:mm A')
}

function ticketTimeAgo(ticket: Ticket): string {
  return moment.utc(ticket.created).fromNow()
}

function ticketTimeSinceAssigned(ticket: Ticket): string {
  return moment.utc(ticket.updated).fromNow()
}

function ticketTimeToReRequest(ticket: Ticket): string {
    return moment.utc(ticket.rerequest_threshold).fromNow();
}

function isPending(ticket: Ticket): boolean {
  return ticket.status === 'pending';
}

function isActive(ticket: Ticket): boolean {
  return ['pending', 'assigned', 'juggled', 'rerequested'].includes(ticket.status);
}

function ticketAssignment(state: State, ticket: Ticket): TicketAssignment {
  return state.assignments[ticket.assignment_id];
}

function ticketLocation(state: State, ticket: Ticket): TicketLocation {
  return state.locations[ticket.location_id];
}

function ticketQuestion(state: State, ticket: Ticket): string {
  var question = ticket.question;
  if (!isNaN(question)) {
    question = "Q" + parseInt(question);
  }
  return question;
}

function ticketStatus(state: State, ticket: Ticket): string {
  if (ticket.status === 'assigned' && ticket.helper) {
    return 'Being helped by ' + (isTicketHelper(state, ticket) ? 'you' : ticket.helper.name);
  } else if (ticket.status === 'resolved' && ticket.helper) {
    return 'Resolved by ' + ticket.helper.name;
  } else if (ticket.status === 'deleted') {
    return 'Deleted';
  } else if (ticket.status === "juggled") {
    return "Working solo";
  } else if (ticket.status === "rerequested") {
    return `Waiting for ${isTicketHelper(state, ticket) ? "you" : ticket.helper ? ticket.helper.name : "any assistant"} to come back`
  } else {
    return 'Queued';
  }
}

function ticketPosition(state: State, ticket: Ticket): ?string {
  let index = getTickets(state, 'pending').findIndex(pendingTicket =>
    pendingTicket.id === ticket.id
  );
  if (index != -1) {
    return '#' + (index + 1);
  }
}

function isStaff(state: State): boolean {
  return state.currentUser != null && state.currentUser.isStaff;
}

function getTicket(state: State, id: number): ?Ticket {
  return state.tickets.get(id);
}

function setTicket(state: State, ticket: Ticket): void {
  if (ticketIsMine(state, ticket)) {
    let oldTicket = getMyTicket(state);
    if (oldTicket) {
      if (oldTicket.status === "pending" && ticket.status === "assigned") {
        var location = ticketLocation(state, ticket);
        notifyUser("Your name is being called",
                   ticket.helper.name + " is looking for you in "+ location.name,
                   ticket.id + '.assign');
      } else if (oldTicket.status === 'assigned' && ticket.status !== 'assigned') {
        cancelNotification(ticket.id + '.assign');
      }
    }
  }
  state.tickets.set(ticket.id, ticket);
}

function loadTicket(state: State, id: number): void {
  state.loadingTickets.add(id);
}

function isLoading(state: State, id: number): boolean {
  return state.loadingTickets.has(id);
}

function receiveTicket(state: State, id: number, ticket: ?Ticket) {
  if (ticket != null) {
    setTicket(state, ticket);
  }
  state.loadingTickets.delete(id);
}

/* Return an array of pending tickets, sorted by queue time.
 */
function getTickets(state: State, status: string): Array<Ticket> {
  return Array.from(state.tickets.values()).filter(
    (ticket) => ticket.status === status
  ).sort((a, b) => {
    if (a.created < b.created) {
      return -1;
    } else if (a.created > b.created) {
      return 1;
    } else {
      return 0;
    }
  });
}

function applyFilter(filter: Filter, tickets: Array<Ticket>): Array<Ticket> {
  let assignmentId = parseInt(filter.assignment_id);
  if (!isNaN(assignmentId)) {
    tickets = tickets.filter((ticket) => ticket.assignment_id === assignmentId);
  }
  let locationId = parseInt(filter.location_id);
  if (!isNaN(locationId)) {
    tickets = tickets.filter((ticket) => ticket.location_id === locationId);
  }
  if (filter.question) {
    tickets = tickets.filter((ticket) => ticket.question === filter.question);
  }
  return tickets;
}

function ticketIsMine(state: State, ticket: Ticket): boolean {
  return state.currentUser != null && ticket.user && state.currentUser.id === ticket.user.id;
}

function isTicketHelper(state: State, ticket: Ticket): boolean {
  return state.currentUser && ticket.helper && state.currentUser.id === ticket.helper.id;
}

/* Return the current user's active ticket. */
function getMyTicket(state: State): ?Ticket {
  return Array.from(state.tickets.values()).find(ticket =>
    isActive(ticket) && ticketIsMine(state, ticket)
  );
}


/* Return the first ticket the current user is helping. */
function getHelpingTicket(state: State): ?Ticket {
  return Array.from(state.tickets.values()).find(ticket =>
    isActive(ticket) && isTicketHelper(state, ticket)
  );
}

function addMessage(state: State, text: string, category: string): void {
  state.messages.push({
    id: state.nextMessageID,
    text,
    category,
    visible: true,
  });
  state.nextMessageID += 1;
}

function clearMessage(state: State, id: number): void {
  let message = state.messages.find((message) => message.id === id);
  if (message) {
    message.visible = false;
  }
}

const appointmentTimeComparator = (a, b) => moment(a.start_time).isAfter(moment(b.start_time)) ? 1 : -1;

function getMySignups(state: State) {
    if (!state.currentUser) {
        return [];
    }
    const mySignups = [];
    for (const appointment of state.appointments) {
        for (const signup of appointment.signups) {
            if (signup.user && signup.user.id === state.currentUser.id) {
                mySignups.push({ appointment, signup });
            }
        }
    }
    return mySignups;
}

function isSoon(timeString) {
    return moment(timeString).isBefore(moment().add(2, "hours"));
}

function getMyAppointmentsStaff(state: State) {
    if (!state.currentUser) {
        return [];
    }
    const myAppointments = [];
    for (const appointment of state.appointments) {
        if (!appointment.helper || appointment.helper.id === state.currentUser.id) {
            myAppointments.push(appointment);
        }
    }
    return myAppointments;
}
