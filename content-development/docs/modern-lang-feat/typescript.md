# 🔮 Typescript

<!-- TrackingCookie-->
{% with pagename="typescript-feat" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}


## 🚀 Features

Before you dive into important concepts and language features in Typescript, it is important to know [Modern JavaScript Features](./javascript.md){target=_blank}, the underlying language. In the end, the Typescript language is compiled (a.k.a transpiled) into `ECMAScript` language before being evaluated by Node.js. By extension, it is possible to use `ECMAScript` script in a Typescript project.
Of course, depending on the `tsconfig.json` in your project root you can define how strict Typescript should check your types (and if you allow `ECMAScript` script or not).

The following list of features should help you in your everyday developer life. The list is not complete by any means. If  you want to gain more insight, you can always refer to the [official site](https://www.typescriptlang.org/){target=_blank} and [handbook](https://www.typescriptlang.org/docs/handbook/intro.html){target=_blank}.


### Important Types and Generics

In general, the Typescript language compiler is quite talented in type inference, meaning it is "smart" enough to derive the type of a value from its definition or the surrounding scope. It is recommended to use type inference wherever possible. The best Typescript code looks like Javascript code, but supports features like autocompletion and type checking for a better Developer Experience (DX).

In the following examples, we explicitly add type definitions to explain concepts, even though it would not be necessary in production code.

#### Enumerations

Enums are a feature of Typescript which is not really a type but that helps the developer structures the code by listing the possibilities for a given value.

```typescript
enum Direction = {
  Up,
  Down,
  Left,
  Right
}

function move(direction: Direction) {
  if (direction === Direction.Up) {
    /* ... */
  } /* ... */
}

```

They can be associated with numeric or string values.

```typescript
enum Direction = {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}

```

#### A word about the `any` type

Declaring the type as `any` disables checking entirely *(it literally means **any** type)*. You will lose all the benefits Typescript provides and be back to Javascript coding. Therefore, **avoid using `any` whenever possible**.


#### The `unknown` type

In contrast to `any`, you can use `unknown` to explicitly tell Typescript that the type of a value is not known. Using `unknown` will result in errors, if you try to assign a non-`any` or non-`unknown` type to it. This will force you to check the type of the value explicitly using a check at runtime.

```typescript
function checkNumber(input: unknown): number {
  if (typeof input === 'number') {
    return input
  if (typeof input !== 'number') {
    throw Error('Not of type number')
  }
}

function someAPI(value: unknown) {
  const checkedNumber=checkNumber(value)
  // Typescript knows value is a number
}
```

#### The `never` type
The `never` type indicates a value that will never occur. It is used to represent a value that can't be reached or doesn't exist. This can be useful for narrowing down types in conditional branches, error handling, or for cases where a function never returns a value.

```typescript
function fail(msg: string): never {
  throw new Error(msg);
}
```

#### The `Array<T>` generic

If you want to have an array where every entry is of type `T` you can use the generic `Array<T>` type or `T[]`

```typescript

const numbers: number[] = [1, 2, 3]

const names: Array<string> = ['John', 'Jane', 'Jack']

```

#### The `Promise<T>` generic

A generic Promise type that resolves to a value of type `T`

```typescript

const wait: (milliseconds: number) => Promise<string> = (milliseconds) => new Promise((resolve, reject) => {
  setTimeout(() => resolve('The promise resolves to a string'), milliseconds)
})

```

#### The `Partial<T>` generic

Sometimes, it is handy to only accept an argument which has some, but not necessarily all properties of a defined type.

```typescript
type User = {
  name: string,
  age: number,
}

function update(input: Partial<User>): User {
  return {
    name: 'John',
    age: 24,
    ...input
  }
}

update({ age: 25 }) // returns { name: 'John', age: 25 }
update({ name: 'Doe' }) // returns { name: 'Doe', age: 24 }

```

#### The `Pick<T, keyof T>` generic

In the previous example, if you want to have a concrete subset of properties (not just any subset), use the `Pick` generic.

```typescript
type User = {
  name: string,
  age: number,
  email: string
}

type Human = Pick<User, 'name' | 'age'> // { name: string, age: number }
```

### Classes & Interfaces

#### Interfaces

In addition to classes, Typescript comes with interfaces. A general rule of thumb is to use an interface over a type in case you need to have methods. Likewise in other OOP programming languages, classes can implement interfaces.

```typescript
interface UserInterface {
  getId(): number
  getName(): string
  setName(name: string): void
}

class User implements UserInterface {
  // ...
}
```


#### Private Instance Fields

Even though `ECMAScript` comes equipped with [Private instance fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields#private_instance_fields){target=_blank} since Node 16, Typescript has its own way of defining private fields using the `private` keyword. The main difference is that  Typescript `private` fields are only checked at compile-time, at runtime they are public (in contrast to the `#field` feature of Node.js) . See also [Typescript caveats](https://www.typescriptlang.org/docs/handbook/2/classes.html#caveats){target=_blank}.

```typescript
class User {
  private name: string

  constructor(name: string) { 
    this.name = name
  }

  getName() {
    return this.name
  }
}

const user = new User('John Doe')
user.getName() // John Doe
user.name // TypescriptError: Property 'name' is private and only accessible within class 'User'
```

#### Syntactic sugar for instance field initialization

In the class constructor you can skip the assignment of instance fields. Typescript will automatically add the constructor arguments as fields implicitly.
The example works for `public` and `protected` fields as well.


```typescript
class User {
  constructor(private id: number, private name: string) { }
  // ...
}

// is the same as 
class User {
  private id: number
  private name: string

  constructor(id: number, name: string) {
    this.id = id
    this.name = name
  }

  // ...
}
```

### ECMAScript modules

Depending on the `tsconfig.json`, Typescript supports the ECMAScript modules `import` syntax. This is true for all the exercises in the Cloud Native Developer Journey, if not stated otherwise.

