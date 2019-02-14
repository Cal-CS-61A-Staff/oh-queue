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
  status: 'pending' | 'assigned' | 'resolved' | 'deleted',
  user: User,
  created: string,  // ISO 8601 datetime string
  location: string,
  assignment: string,
  question: string,
  description: ?string,
  helper: ?User,
};

type Filter = {
  /* Selected options. null means do not filter by an attribute. */
  location: ?string,
  assignment: ?string,
  question: ?string,
};

type Message = {
  id: number,
  category: string,  // e.g. "danger", "warning"
  text: string,
  visible: boolean,
};

type State = {
  /* May be null if the user is not logged in. */
  currentUser: ?User,
  /* True on page load, before the initial websocket connection. */
  loaded: boolean,
  /* True if the websocket has disconnected. */
  offline: boolean,
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
  tickets: new Map(),
  loadingTickets: new Set(),
  filter: {
    location: null,
    assignment: null,
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

function isPending(ticket: Ticket): boolean {
  return ticket.status === 'pending';
}
function isActive(ticket: Ticket): boolean {
  return ticket.status === 'assigned';
}

function isActive(ticket: Ticket): boolean {
  return ticket.status === 'pending' || ticket.status === 'assigned';
}


function ticketStatus(state: State, ticket: Ticket): string {
  if (ticket.status === 'assigned' && ticket.helper) {
    return 'Being helped by ' + (isTicketHelper(state, ticket) ? 'you' : ticket.helper.name);
  } else if (ticket.status === 'resolved' && ticket.helper) {
    return 'Resolved by ' + ticket.helper.name;
  } else if (ticket.status === 'deleted') {
    return 'Deleted';
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
    if (oldTicket && oldTicket.status === "pending" && ticket.status === "assigned") {
      notifyUser("Your name is being called",
                 ticket.helper.name + " is looking for you in "+ ticket.location);
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
  if (filter.location) {
    tickets = tickets.filter((ticket) => ticket.location === filter.location);
  }
  if (filter.assignment) {
    tickets = tickets.filter((ticket) => ticket.assignment === filter.assignment);
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

const ASSIGNMENTS = preval`
  if (process.env.ASSIGNMENTS) {
    module.exports = process.env.ASSIGNMENTS.split(',');
  } else {
    module.exports = ['Any'];
  }
`;

const LOCATIONS = preval`
  if (process.env.LOCATIONS) {
    module.exports = process.env.LOCATIONS.split(',');
  } else {
    module.exports = ['Any'];
  }
`;
