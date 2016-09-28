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
  created: string,
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
  /* Flashed messages. */
  messages: Array<Message>,
  nextMessageID: number,
};

let initialState: State = {
  currentUser: null,
  loaded: false,
  offline: true,
  tickets: new Map(),
  messages: [],
  nextMessageID: 1,
}

function isActive(ticket: Ticket): boolean {
  return ticket.status === 'pending' || ticket.status === 'assigned';
}

function ticketStatus(state: State, ticket: Ticket): string {
  if (ticket.status === 'assigned' && ticket.helper) {
    let isYou = state.currentUser && state.currentUser.id === ticket.helper.id;
    return 'Being helped by ' + (isYou ? 'you' : ticket.helper.name);
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

/* Return the current user's active ticket. */
function getMyTicket(state: State): ?Ticket {
  if (state.currentUser == null) {
    return null;
  }
  let userID = state.currentUser.id;
  return Array.from(state.tickets.values()).find(ticket =>
    isActive(ticket) && ticket.user.id === userID
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
