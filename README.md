# Timenote

Timenote is a web application to store and navigate personal information such as notes, events, tasks, contacts, pictures, etc.

The primary interface is a vertical scrollable timeline of items, sorted by different indices, such as:

- Creation timestamp: when the item was added. 
- Last open timestamp: when the item was last opened.
- Last edit timestamp: when the item was last edited.
- Intrinsic timestamp: an item-related date, such as the scheduled date of an event.

These indices are not exclusive, and can be combined. Items can appear more than once in the timeline if more than one index is active, or if the item itself has more than one intrinsic date (such as due date/completion date for tasks).

## Implementation

Timenote is implemented as a node.js server with a websocket API, along with a static web front-end.

### Server

The server is an Express application with a primary websocket interface, supporting:

- Real-time search and streaming of items.
- Data modification actions.
- Websocket server using socket.io, for live streaming of items and actions.

To upgrade the connection, clients must do simple HTTP authentication with a preconfigured password.

Data is stored in an SQLite database.

#### Architecture

- `Client`: a class that controls interaction with a single websocket client, created with an already active connection, with life-cycle callbacks to override. `Client` instances have a life-cycle that matches the connection.

- `Item`

### Client

The client is a static single-page web application, made with 


