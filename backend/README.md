Set up FastAPI in docker container and local postgres db

Auth with FastAPI and postgres db

Will need a way to send SSE (Server side events) using a stream that the frontend should read with EventSource API
- essentially send server updates to the frontend, e.g. someone sends a friend request -> frontend needs to receive it.

Will need a way to set up and manage web socket connections in FastAPI + postgres for real time updates from database changes
- essentially like a live chat setup pub/sub with postgres listen/notify
