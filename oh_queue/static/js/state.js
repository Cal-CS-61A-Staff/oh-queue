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
  helper: ?User,
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
  messages: [],
  nextMessageID: 1,
}

function ticketDisplayTime(ticket: Ticket): string {
  return moment.utc(ticket.created).local().format('h:mm A')
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

function isStaff(state: State): boolean {
  return state.currentUser != null && state.currentUser.isStaff;
}

function getTicket(state: State, id: number): ?Ticket {
  return state.tickets.get(id);
}

function setTicket(state: State, ticket: Ticket): void {
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

/* Return an array of tickets that are pending or assigned, sorted by queue
 * time.
 */
function getActiveTickets(state: State): Array<Ticket> {
  let active = Array.from(state.tickets.values()).filter(isActive);
  return active.sort((a, b) => {
    if (a.created < b.created) {
      return -1;
    } else if (a.created > b.created) {
      return 1;
    } else {
      return 0;
    }
  });
}

function ticketIsMine(state: State, ticket: Ticket): boolean {
  return state.currentUser != null && state.currentUser.id === ticket.user.id;
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

function formatTime(time): string {
  let seconds = pad(time % 60, 2)
  let minutes = pad(parseInt(time / 60), 2)
  return `${minutes}:${seconds}`
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
