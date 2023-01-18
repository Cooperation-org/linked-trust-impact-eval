## Run composeDB and the Node application in a docker container

```
docker-compose up
```

## Deploy composite

Deploy the composite after all the docker containers are up.

```
npm run deploy:composite
```

## Create Tasks/Claims

This is a simple UI that allows you to create a task/claim. These are persisted in a local SQLite database. Once they are created, they can then be reviewed and approved (see below).

```
http://localhost:3000/tasks
```

## Review and approve new Tasks and Claims

This will present a list of Tasks/Claims that have been persisted to a local sqlite database. Once approved, they will be **created in ComposeDB**. As they are persisted to ComposeDB they are also deleted from the local SQLite database.

```
http://localhost:3000/review
```
