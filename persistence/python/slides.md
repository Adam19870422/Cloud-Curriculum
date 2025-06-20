# Python Persistence

---

## Persistence Libraries

- [SQLAlchemy](https://www.sqlalchemy.org/)<!-- .element target="_blank" -->: Python SQL toolkit and Object Relational Mapper

- [psycopg](https://www.psycopg.org/docs/)<!-- .element target="_blank" -->: most popular PostgreSQL database adapter

- Allows us to connect to a PostgreSQL Database
- Supports Connection pooling, simple and parameterized queries

Notes:

- SQLAlchemy consists of two distinct components, known as the `Core` and the `ORM`

    - The `Core` is itself a fully featured SQL abstraction toolkit. It provides tools for managing connectivity to a database, interacting with database queries and results, and programmatic construction of SQL statements
    - The `Object Relational Mapper` builds upon the `Core`, and translates Python classes to tables on relational databases and automatically converts function calls to SQL statements

- SQLAlchemy relies on the [DBAPI](https://peps.python.org/pep-0249/)<!-- .element target="_blank" --> specification to interact with databases like PostgreSQL, MySQL, Oracle, etc.

---

## Database Engines

- SQLAlchemy **Engine** object acts as a central source of connections to a database
- The **Engine** object manages both **Pools** and **Dialect**

```python
from sqlalchemy import create_engine

engine = create_engine("postgresql://username:password@localhost:5432/postgres")

```

Notes:

- The `create_engine()` function usually generates a `QueuePool` which holds some [defaults](https://docs.sqlalchemy.org/en/20/core/engines.html#sqlalchemy.create_engine)<!-- .element target="_blank" -->, like a maximum pool size of 5 connections.
- The `Engine` has not actually tried to connect to the database until the first time it is asked to perform a task against the database - also known as `lazy initialization`.

---

## Queries

- The **Engine** object has two primary endpoints, the **Connection** and **Result**. 

```python
from sqlalchemy import create_engine
from sqlalchemy import text

engine = create_engine("postgresql://username:password@localhost:5432/postgres")
with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM books"))
    print(result.all())

# [('Clean Code', 'Robert C. Martin'),
#  ('Refactoring', 'Martin Fowler')]
```

Notes:

- The `Connection` creates an open resource against the database. In order to limit the use of this object to a specific context, we can use Python context manager, also known as the `with` statement. Database connection will be released automatically at the end of it.
- The `text()` construct is used to write SQL statements as textual SQL.

---

## Query Parameters

- Don't use string concatenation/templates
- RISK OF SQL-INJECTION VULNERABILITY

```python
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(
        text("INSERT INTO books (title, author) VALUES (:title, :author)"), 
        {"title": "Clean Code", "author": "Robert C. Martin"}
    )
```

Notes:

- The text() construct accepts parameters using a colon format `:value`

---

## Commit Changes

- **commit as you go** vs. **begin once**

```python
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(
        text("INSERT INTO books (title, author) VALUES (:title, :author)"), 
        {"title": "Clean Code", "author": "Robert C. Martin"}
    )
    conn.commit()
```

```python
from sqlalchemy import text

with engine.begin() as conn:
    conn.execute(
        text("INSERT INTO books (title, author) VALUES (:title, :author)"), 
        {"title": "Clean Code", "author": "Robert C. Martin"}
    )
```

Notes:

- The default behavior of the Python DBAPI is that a transaction is always in progress; when the connection is released, a `ROLLBACK` is emitted to end the transaction

---

# Questions?
