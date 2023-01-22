# Impact Evaluator - Admin Console

**Description**:

## Dependencies

- Ceramic ComposeDB
- Next.js
- Prisma/SQLite

## Installation and Configuration

The application can either be run inside a docker container or it can be deployed locally on a developer machine.

- [Installation instructions for Docker here](#running-admin-console-and-ceramic-composedb-inside-a-docker-container)
- [Installation instructions to run locally](#running-admin-console-and-ceramic-composedb-locally)

### Running Admin Console and Ceramic composeDB inside a Docker Container

#### Launch the Docker Container

```
docker-compose up
```

#### Deploy the ComposeDB composite

Deploy the composite after all the docker containers are up.

```
npm run deploy:composite
```

### Running Admin Console and Ceramic composeDB Locally

#### Install Ceramic composeDB

```
pnpm add -g @composedb/cli@^0.3.0
pnpm add -D @composedb/devtools@^0.3.0 @composedb/devtools-node@^0.3.0
pnpm add @composedb/client@^0.3.0
pnpm add -D @composedb/types@^0.3.0
```

#### Configure Ceramic

##### Set environment variable

```
export CERAMIC_ENABLE_EXPERIMENTAL_COMPOSE_DB='true'
pnpm dlx @ceramicnetwork/cli daemon
```

##### Generate a DID private key

```
composedb did:generate-private-key
```

##### Getting the DID Value

```
composedb did:from-private-key [hexadecimal-encoded private key string]
```

##### Ceramic Configuration File

The Ceramic node configuration file, which defaults to ~/.ceramic/daemon.config.json on Linux, macOS and WSL (Windows Subsystem for Linux), needs to be edited to specify the admin DIDs allowed to set models for indexing, as well as the indexing configuration:

```
{
  ...
  "http-api": {
    ...
    "admin-dids": ["did:key:..."]
  },
  "indexing": {
    ...
    "allow-queries-before-historical-sync": true
  }
}
```

##### Start the local Ceramic Node

```
pnpm dlx @ceramicnetwork/cli daemon
```

#### Create the Claim composite

##### Converting a Schema to a composite

```
composedb composite:create ./data/linked_claim.graphql --output=linked-claim-composite.json  --ceramic-url=http://0.0.0.0:7007
```

##### Compile the Composite into a runtime definition

In order to interact with a composite at runtime, it is first necessary to create a runtime composite definition file that will be used to configure the client.

```
composedb composite:compile linked-claim-composite.json linked-claim-composite-runtime.json --ceramic-url=http://0.0.0.0:7007

composedb composite:compile linked-claim-composite.json ./__generated__/definition.js --ceramic-url=http://0.0.0.0:7007
```

##### Deploy the composite

```
composedb composite:deploy claim-composite.json --ceramic-url=http://0.0.0.0:7007
```

##### Start the graphQL Server

Start the local server with GraphiQL using the runtime composite:

```
composedb graphql:server --ceramic-url=http://0.0.0.0:7007 --graphiql --port=5001 linked-claim-composite-runtime.json
```

## Usage

### Interacting through the GraphiQL UI

###### Create an instance of a claim

Launch the graphiQL URL in the browser and run the mutation below:

```
mutation {
    createClaim
        (input: { content: { by: "Steve", claim: "My second Claim", round: "round one", credit: 1 } }) {
        document {
            by
        }
    }
}
```

#### Query the first 10 instances of a claim

Launch the graphiQL URL in the browser and run the query below:

```
query {
  ClaimIndex(first: 10) {
    edges {
      node {
        by
      }
    }
  }
}
```

### Interacting with ComposeDB Command Line

##### Get the details of the GraphQL Schema

To check the details of the GraphQL schema built from your runtime composite representation, you can use the graphql:schema CLI command:

```
composedb graphql:schema runtime-composite.json
```

### Interacting with the Admin Console App

##### Create Tasks/Claims

This is a simple UI that allows you to create a task/claim. These are persisted in a local SQLite database. Once they are created, they can then be reviewed and approved (see below).

```
http://localhost:3000/tasks
```

##### Review and approve new Tasks and Claims

This will present a list of Tasks/Claims that have been persisted to a local sqlite database. Once approved, they will be **created in ComposeDB**. As they are persisted to ComposeDB they are also deleted from the local SQLite database.

```
http://localhost:3000/review
```

##### Retrieve the CID for a Task

Once a Task has been persisted to CeramicDB, you can retrieve the CID for that claim using the Stream ID.

```
http://localhost:3000/cid
```
