# Persistence Fundamentals

---

## Database

![relational-dbs](images/relational-dbs.svg) <!-- .element height="400rem" -->

Notes:

- There are many providers for relational database systems
- For the exercise we have to decide on one but the concepts are the same for all.
- So any skills learned should be transferrable.

---

## ACID

- **Atomicity**: All changes to data are performed as if they were a single operation. (All or None).
- **Consistency**: Data is in a consistent state when a transaction starts and when it ends.
- **Isolation**: The intermediate state of transactions is invisible to other transactions.
- **Durability**: After a transaction successfully completes, changes to data persist and are not undone, even in the event of systemic failure.

Notes:
- ACID is an acronym for a set of properties for db transactions used to make sure data is valid
  - Atomicity: transaction are often composed of multiple statements. Guarantee that each transaction is treated as a single unit/operation
  - Consistency: ensures that a transaction can only bring the db from one valid state to another valid state.
  - Isolation: ensures that concurrent execution of transactions leaves the db in the same state like they were executed sequentially
  - Durability: once transactions are committed, they will remain committed even in the case of system failure (e.g. power outage, crash)

---

## ORM (Object-Relational Mapping)

- Object model ⚡ Relational model
- ORM addresses this impedance mismatch
- Translates between objects and table entries
- Many ORM frameworks exist with varying approaches

---

## Layering

- Sometimes persistence and business logic cannot be clearly separated
- Examples:
  - Operations that are more efficient to do on the database
  - Composed operations that need to run in a transaction
- Possible solution: [DAO pattern](https://www.baeldung.com/java-dao-pattern)

Notes:
- "The Data Access Object (DAO) pattern is a pattern that allows to isolate the application/business layer from the persistence layer using an abstract API.
The functionality of this API is to hide from the application all the complexities involved in performing CRUD operations in the underlying storage mechanism."

---

## Schema Migrations

- Requirements change. Your database schema will have to adapt.
- Applying a schema migration to a production database is always a risk:
  - Corrupt data present in database
  - Unknown implied dependencies in the data
  - People directly changing the database
  - Mistakes in assumptions how data should be migrated
  - Bugs in the schema migration tools

Notes:

- Migration tools can be seen as "Version Control for the database".

---

## Testing

- Integrate with framework and (potentially) db
- The closer the test setup is to production, the higher the confidence
- Database options: in-memory, docker-based, (shared) remote test db, etc.
- Schema setup options: generate schema from code, restore a database dump, etc.
- Integrate migrations into your tests and put them under version control

---

## Connection URI

```
postgres://johndoe:secret123@localhost:5432/my-db
```

```
mysql://johndoe:secret123@localhost:3306/my-db?useSSL=false&serverTimezone=UTC
```

Notes:
- `postgres://`: protocol identifiying the database driver
- `johndoe:secret123@`: username and password of the db user
- `localhost:5432`:  host and port number, where the db instance is running
- `/my-db`: name of the database

---

## Connection Pooling

- Opening a database connection is costly
- Instead, opened connections are maintained and kept in a cache ("pool") so that they can be reused when required in the future
- Cuts down on the amount of time waiting to establish a connection

Notes:

- In Java the JPA-Provider manages the connection pool.
- Several database clients for Node.JS also provide connection pools.

---

<!-- ## NoSQL Technologies

- CAP theorem
![](https://www.researchgate.net/profile/Joao_Lourenco11/publication/282519669/figure/fig1/AS:281002732736529@1444007680733/CAP-theorem-with-databases-that-choose-CA-CP-and-AP.png "")
Image stolen from https://www.researchgate.net/figure/CAP-theorem-with-databases-that-choose-CA-CP-and-AP_fig1_282519669

--- -->

# Questions?
