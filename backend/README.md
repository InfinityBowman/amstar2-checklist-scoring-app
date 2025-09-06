Set up FastAPI in docker container and local postgres db

Auth with FastAPI and postgres db

- see https://github.com/fastapi/full-stack-fastapi-template
- I was looking at using Fief but it looks like a pain to self host
- Keep it simple for now just do email auth and give the frontend a jwt with email verification
  - See that fastapi template above for email templates

Will need a way to send SSE (Server side events) using a stream that the frontend should read with EventSource API

- essentially send server updates to the frontend, e.g. someone sends a friend request -> frontend needs to receive it.
- see https://developer.mozilla.org/en-US/docs/Web/API/EventSource

Will need a way to set up and manage web socket connections in FastAPI + postgres for real time updates from database changes

- essentially like a live chat setup pub/sub with postgres listen/notify
