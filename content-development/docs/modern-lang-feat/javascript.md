# 🔮 Modern JavaScript Features

<!-- TrackingCookie-->
{% with pagename="javascript-feat" %}
  {% include 'snippets/tracking-cookie/tracking-cookie-materials.md' %}
{% endwith %}

## 🚗 Know your Runtime

[Node.js](https://nodejs.org/en/){target=_blank} is built against modern versions of the [**V8 JavaScript Engine**](https://v8.dev){target=_blank}. By keeping up-to-date with the latest releases of this engine, this ensures new features from the [**JavaScript ECMA-262 specification**](https://www.ecma-international.org/publications-and-standards/standards/ecma-262/){target=_blank} are brought to Node.js developers in a timely manner, as well as continued performance and stability improvements.

Though we all use the term *JavaScript*, the official name of the language is **ECMAScript**!

Each year there is a new version of the ECMAScript specification with new features and improvements.

ECMAScript versions have been abbreviated to `ES1`, `ES2`, `ES3`, `ES5`, and `ES6`.

Since 2016 new versions are named by year (`ECMAScript 2016` / `2017` / `2018` / etc.).

| Version | Official Name       | Description                                                                                                                                          |
|---------|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ES1`     | ECMAScript 1 (1997) | First edition                                                                                                                                        |
| `ES2`     | ECMAScript 2 (1998) | Editorial changes                                                                                                                                    |
| `ES3`     | ECMAScript 3 (1999) | Added   - regular expressions  - try/catch  - switch  - do-while                                                                                     |
| `ES4`     | ECMAScript 4        | Never released                                                                                                                                       |
| `ES5`     | ECMAScript 5 (2009) | Added   - "strict mode"  - JSON support  - String.trim()  - Array.isArray()  - Array iteration methods  - Allows trailing commas for object literals |
| `ES6`     | ECMAScript 2015     | Added   - let and const  - default parameter values  - Array.find()  - Array.findIndex()                                                             |
| `ES2016`  | ECMAScript 2016     | Added   - exponential operator (**)  - Array.includes()                                                                                              |
| `ES2017`  | ECMAScript 2017     | Added   - string padding  - Object.entries()  - Object.values()  - async functions  - shared memory                                                  |
| `ES2018`  | ECMAScript 2018     | Added   - rest / spread properties  - asynchronous iteration  - Promise.finally()  - Additions to RegExp                                             |
| ...     | ...                 | ...                                                                                                                                                  |
| `ESNext`  | ECMAScript Next   | Modern updates now being released annually.                                                                                                          |

❗️ **It is crucial to know which ECMAScript features are available in your Node.js version**. ❗️

The website [**node.green**](https://node.green){target=_blank} provides an excellent overview over supported ECMAScript features in various versions of Node.js.

For more details please have a look at [ECMAScript 2015 (ES6) and beyond](https://nodejs.org/en/docs/es6/#ecmascript-2015-es6-and-beyond){target=_blank}.

## 🚀 Features

The following ECMAScript features should help you in your everyday developer life. The list is not complete by any means. So always keep an eye on the latest version of the ECMAScript specification.

If you are not sure whether they are available in your Node.js version, please check the [**node.green**](https://node.green){target=_blank} website as many features are not available in older versions.

### `const` and `let`

The [**`const`**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const){target=_blank} and [**`let`**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let){target=_blank} keywords allow to define variables with [block scope](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/block#block_scoping_rules_with_var_or_function_declaration_in_non-strict_mode){target=_blank}. That's why they should always be used instead of [`var`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var){target=_blank}.

Use [**`const`**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const){target=_blank} to define **constants**. Variables declared as *constants* will be **read-only** and cannot be changed through reassignment. However, if a constant is an object or array its properties or items can be updated or removed.

```javascript
// declare constant (object)
const user = {
  name: 'John Doe',
  age: 42
}
// update property
user.age = 43

// reassign throws TypeError: Assignment to constant variable
user = { name: 'Jane Doe', age: 24 }

// declare constant (array)
const users = []

// add item
users.push({ name: 'John Doe', age: 42 })

// reassign throws TypeError: Assignment to constant variable
users = [{ name: 'Jane Doe', age: 24 }]
```

Use [**`let`**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let){target=_blank} to define variables which **can be changed**.

```javascript
// declare variable (object)
let user = {
  name: 'John Doe',
  age: 42
}

// update property
user.age = 43

// reassign allowed
user = {
  name: 'Jane Doe',
  age: 24
}

// declare variable (array)
let users = []

// add item
users.push({
  name: 'John Doe',
  age: 42
})

// reassign allowed
users = [{
  name: 'Jane Doe',
  age: 24
}]
```

!!! tip "Benefit"

    Without block scope, variables are **global** and can be accessed from anywhere in the top scope of current code, leading to potential bugs.

    ```javascript
    {
      const x = 2
      let y = 3
    }
    // x and y can NOT be used here (block scope)

    {
      var z = 1
    }
    // z CAN be used here (global scope)
    ```

### Object Shorthands

#### Shorthand property names

If you want to define an object who's keys have the same name as the variables passed-in as properties, you can use the shorthand and simply pass the key name.

```javascript
const cat = '🐈'
const dog = '🐕'
const rabbit = '🐇'
const horse = '🐴'

const animals = {
  cat,
  dog,
  rabbit,
  horse
}
// animals = { cat: '🐈', dog: '🐕', rabbit: '🐇', horse: '🐴' }
```

!!! tip "Benefit"

    Without the shorthand, you would have to define each key explicitly.

    ```javascript
    const cat = '🐈'
    const dog = '🐕'
    const rabbit = '🐇'
    const horse = '🐴'

    const animals = {
      cat: cat,
      dog: dog,
      rabbit: rabbit,
      horse: horse
    }
    // animals = { cat: '🐈', dog: '🐕', rabbit: '🐇', horse: '🐴' }
    ```

#### Shorthand method names

A function that is a property on an object is called a method. With Shorthand Method Names, you can omit the function keyword completely.

```javascript
const user = {
  name: 'John Doe',
  sayHello() {
    return 'Hello there!'
  }
}
```

!!! tip "Benefit"

    Without the shorthand, you would have to define method explicitly by using the function keyword.

    ```javascript
    const user = {
      name: 'John Doe',
      sayHello: function() {
        return 'Hello there!'
      }
    }
    ```

#### Computed property names

Computed property names are a way to dynamically define properties on an object.

```javascript
const key = 'dog'

const animals = {
  [key]: '🐕',
  ['c' + 'a' + 't']: '🐈'
}
// { dog: '🐕', cat: '🐈' }
```

!!! tip "Benefit"

    Without computed property names one would need to define the object first and then define the properties.

    ```javascript
    const animals = {}
    const key = 'dog'
    animals[key] = '🐕'
    animals['c' + 'a' + 't'] = '🐈'
    // { dog: '🐕', cat: '🐈' }
    ```


### Arrow Functions

[**Arrow functions**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions){target=_blank} provide a shorter syntax compared to regular [function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function){target=_blank}.

That's why they especially come in handy as callbacks.

##### regular function expression

```javascript
const numbers = [1, 2, 3, 4, 5]

const squareNumbers = numbers.map(function (number) {
  return number * number
})

const sum = numbers.reduce(function (accumulator, number) {
  return accumulator + number
}, 0)
```


##### arrow function with body and return

```javascript
const numbers = [1, 2, 3, 4, 5]

const squareNumbers = numbers.map(number => {
  return number * number
})

const sum = numbers.reduce((accumulator, number) => {
  return accumulator + number
}, 0)
```

##### arrow function with implicit return

```javascript
const numbers = [1, 2, 3, 4, 5]

const squareNumbers = numbers.map(number => number * number)

const sum = numbers.reduce((accumulator, number) => accumulator + number, 0)
```

##### arrow function implicitly returning an object

```javascript
const getUser = () => ({ name: 'John Doe', age: 42 })
const user = getUser()
```

Arrow functions do also not bind their own **`this`**, instead they inherit the one from the parent scope ([lexical scoping](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures#lexical_scoping){target=_blank}).

```javascript
// arrow function preserving the 'this' context from parent scope
database.query('SELECT * from users', users => {
  this.users = users
})
```

!!! tip "Benefit"

    Without the arrow function, the parent `this` context will be overwritten by the `function`'s `this` context and has to be preserved.

    ```javascript
    // preserve the 'this' context from parent scope as 'that'
    const that = this
    // function expression with its own 'this' context
    database.query('SELECT * from users', function (users) {
      that.users = users
    })
    ```

    or

    ```javascript
    // function expression with its own 'this' context
    database.query('SELECT * from users', function (users) {
      this.users = users
    }.bind(this)) // preserve the 'this' context from parent scope using 'bind'
    ```

### Default Parameters

In JavaScript, function parameters default to `undefined`. However, it's often useful to set a different default value. This is where [**default parameters**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters){target=_blank} can help.

```javascript

const add = (a, b = 0) => a + b // b defaults to 0
add(2) // 2 (2 + 0)
add(2, 3) // 5 (2 + 3)

const multiply = (a, b = 1) => a * b // b defaults to 1
multiply(2) // 2 (2 * 1)
multiply(2, 3) // 6 (2 * 3)
```

!!! tip "Benefit"

    Without the default parameter one would need to check for `undefined` and assigning a default value before using b.

    ```javascript
    const add = (a, b) => {
      b = (typeof b === 'undefined') ? 0 : b  // b defaults to 0 if undefined
      return a * b
    }

    const multiply = (a, b) => {
      b = (typeof b === 'undefined') ?  1 : b // b defaults to 1 if undefined
      return a * b
    }
    ```

### Rest Parameters

A function definition's last parameter can be prefixed with `"..."`, which will cause all remaining (user supplied) parameters to be placed within a standard [JavaScript array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array){target=_blank}. Only the last parameter in a function definition can be a [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters){target=_blank}!

```javascript
function race(first, second, third, ...last) {
  console.log({
    first,
    second,
    third,
    last
  })
}
race('Mario', 'Luigi', 'Donkey Kong', 'Bowser', 'Koopa Troopa', 'Wario')
/*
{
  first: 'Mario',
  second: 'Luigi'
  third: 'Donkey Kong',
  last: [
    'Bowser',
    'Koopa Troopa',
    'Wario'
  ]
}
*/

const calcSquareNumbers = (...numbers) => numbers.map(n => n * n)
const squareNumbers = calcSquareNumbers(1, 2, 3, 4, 5)
// [1, 4, 9, 16, 25]
```

!!! tip "Benefit"

    Without the *Rest Parameter* one would need to convert the [`arguments`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments){target=_blank} object into an actual array to achieve the same.

    ```javascript
    function calcSquareNumbers() {
      const numbers = [].slice.call(arguments) // convert arguments to an array
      return numbers.map(n => n * n)
    }
    const squareNumbers = calcSquareNumbers(1, 2, 3, 4, 5)
    ```

### Spread Syntax

The [**Spread syntax**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax){target=_blank} (or `"..."` syntax) can be used when all elements from an object or array need to be included in a list of some kind.

#### For array literals or strings:

```javascript
const some = [2, 3]
const more = [5, 6, 7]

// combine arrays by inserting all elements into a new array
const numbers = [
  1,
  ...some,
  4,
  ...more
]
// [1, 2, 3, 4, 5, 6, 7]
```

!!! tip "Benefit"

    Without the spread syntax one would need to use e.g. [Array.concat](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/concat){target=_blank} to combine the arrays.

    ```javascript
    const some = [2, 3]
    const more = [5, 6, 7]

    const numbers = [].concat(
      [1],
      some,
      [4],
      more
    )
    // [1, 2, 3, 4, 5, 6, 7]
    ```

#### For object literals:

```javascript
const pikachu = {
  name: 'Pikachu'
}

const stats = {
  health: 40,
  attack: 60,
  defense: 45
}

// pass all key:value pairs from other object(s) and create a new object
const pokemon = {
  ...pikachu,
  ...stats,
  level: 1,
}
// {name: 'Pikachu', health: 40, attack: 60, defense: 45, level: 1}
```

!!! tip "Benefit"

    Without the spread syntax one would need to use e.g. [Object.assign](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/assign){target=_blank} to merge the objects.

    ```javascript
    const pikachu = {
      name: 'Pikachu'
    }

    const stats = {
      health: 40,
      attack: 60,
      defense: 45
    }

    const pokemon = Object.assign({}, pikachu, stats, { level: 1 })
    // {name: 'Pikachu', health: 40, attack: 60, defense: 45, level: 1}
    ```

#### For function calls:

```javascript
const calcSquareNumbers = (...numbers) => numbers.map(n => n * n)

const numbers = [1, 2, 3, 4, 5]

// pass all elements of numbers as arguments to the calcSquareNumbers function
const squareNumbers = calcSquareNumbers(...numbers)
```

*Not to be mistaken with the [Rest Parameters](#rest-parameters)!*

!!! tip "Benefit"

    Without the spread syntax one would need to use [`Function.apply`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply){target=_blank} to achieve the same.

    ```javascript
    const calcSquareNumbers = (...numbers) => numbers.map(n => n * n)

    const numbers = [1, 2, 3, 4, 5]

    // pass numbers as arguments to the calcSquareNumbers function
    const squareNumbers = calcSquareNumbers.apply(null, numbers)
    ```

### Optional chaining

The [optional chaining operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining){target=_blank} (`?.`) enables you to read the value of a property located deep within a chain of connected objects without having to check that each reference in the chain is valid.

The `?.` operator is like the `.` chaining operator, except that instead of causing an error if a reference is *nullish* (`null` or `undefined`), the expression short-circuits with a return value of `undefined`.

```javascript
const pokemon = {
  name: 'Pikachu',
  stats: {
    health: 40,
    attack: 60,
    defense: 45
  }
}
const foo = pokemon.stats.health.some.invalid.deep.property
// TypeError: Cannot read properties of undefined (reading 'invalid')

const bar = pokemon?.stats?.health?.some?.invalid?.deep?.property
// bar = undefined
```

!!! tip "Benefit"

    The optional chaining operator let's you access deeply nested properties without having to check that each reference in the chain is valid.

    ```javascript
    const bar =
      pokemon &&
      pokemon.stats &&
      pokemon.stats.health &&
      pokemon.stats.health.some &&
      pokemon.stats.health.some.invalid &&
      pokemon.stats.health.some.invalid.deep &&
      pokemon.stats.health.some.invalid.deep.property
    ```

### Destructuring Assignment

The [destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment){target=_blank} syntax is a JavaScript expression that makes it possible to unpack values from arrays, or properties from objects, into distinct variables.

#### Array destructuring

##### basic variable assignment

```javascript
const [a, b] = [1, 2]
// a = 1, b = 2
```

##### variable assignment with default values

```javascript
const [a, b = 3] = [1]
// a = 1, b = 3
```

##### parsing an array returned from a function call

```javascript
const getNumbers() => [1, 2, 3]
const [a, b, c] = getNumbers()
// a = 1, b = 2, c = 3
```

##### parsing an object entry

```javascript
const animals = {
  dog: '🐕',
  cat: '🐈',
  cow: '🐮'
};
for (const [name, emoji] of Object.entries(animals)) {
  console.log(name, emoji)
}
```

##### assigning the rest of an array to a variable

```javascript
const [one, two, ...rest] = [1, 2, 3, 4, 5]
// one = 1, two = 2, rest = [3, 4, 5]
```

!!! tip "Benefit"

    Without the destructuring assignment one would need to access an array item using the index position.

    ```javascript
    const getNumbers = () => [1, 2, 3]

    const numbers = getNumbers()
    const a = numbers[0]
    const b = numbers[1]
    const c = numbers[2]
    // a = 1, b = 2, c = 3
    ```


#### Object destructuring

##### basic variable assignment

```javascript
const user = {
  id: 42,
  name: 'John Doe',
  role: 'developer'
}

const { id, role } = user
// id = 42, role = 'developer'
```

##### assigning to new variable names

```javascript
const { id: newId, role: newRole } = user
// newId = 42, newRole = 'developer'
```

##### assigning to default values

```javascript
const { a = 10, b = 5 } = { a: 3 }
// a = 3, b = 5
```

##### assigning to new variables names and providing default values

```javascript
const { a: newA = 10, b: newB = 5 } = { a: 3 }
// newA = 3, newB = 5
```

##### unpacking fields from objects passed as a function parameter

```javascript
const getUserId = ({ id }) => id
const userId = getUserId(user)
// userId = 42
```

##### nested destructuring

```javascript
const company = {
  name: 'SAP SE',
  address: {
    street: 'Dietmar-Hopp-Allee 16',
    city: 'Walldorf',
    postalCode: '69190'
  }
}
const { address: { street, postalCode } } = company
// street = 'Dietmar-Hopp-Allee 16', postalCode = '69190'
```

!!! tip "Benefit"

    Without the destructuring assignment one would need to access an object property using the property name.

    ```javascript
    const user = {
      id: 42,
      name: 'John Doe',
      role: 'developer'
    }

    const id = user.id
    const role = user.role
    ```

### Classes

[Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes){target=_blank} are a syntactical sugar on top of the [inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain){target=_blank} in JavaScript.

The `class` keyword allows you to define a class and its methods with a much simpler syntax.


```javascript
class User {
  constructor(id, name, role) {
    this.id = id
    this.name = name
    this.role = role
  }

  getId() {
    return this.id
  }

  setId(id) {
    this.id = id
  }

  getName() {
    return this.name
  }

  setName(name) {
    this.name = name
  }

  getRole() {
    return this.role
  }

  setRole(role) {
    this.role = role
  }
}

const user = new User(1, 'John Doe', 'developer')
user.getId() // 1
user.getName() // John Doe
user.getRole() // developer

const anotherUser = new User(2, 'Jane Doe', 'designer')
user.getId() // 2
user.getName() // Jane Doe
anotherUser.getRole() // designer
```

!!! tip "Benefit"

    Without the `class` syntax one would have to define the class and its methods using the `function` and `prototype`.

    ```javascript
    function User(id, name, role) {
      this.id = id
      this.name = name
      this.role = role
    }

    User.prototype.getId = function () {
      return this.id
    }

    User.prototype.setId = function (id) {
      this.id = id
    }

    User.prototype.getName = function () {
      return this.name
    }

    User.prototype.setName = function (name) {
      this.name = name
    }

    User.prototype.getRole = function () {
      return this.role
    }

    User.prototype.setRole = function (role) {
      this.role = role
    }

    const user = new User(1, 'John Doe', 'developer')
    user.getId() // 1
    user.getName() // John Doe
    user.getRole() // developer
    ```

### Private Instance Fields

[Private instance fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields#private_instance_fields){target=_blank} are declared with `#` names (pronounced "hash names").

They allow you to define private fields that are not accessible from outside the class but only from within the class.

```javascript
class User {
  #id = null
  #name = null
  #role = null

  constructor(id, name, role) {
    this.#id = id
    this.#name = name
    this.#role = role
  }

  getId() {
    return this.#id
  }

  setId(id) {
    this.#id = id
  }

  getName() {
    return this.#name
  }

  setName(name) {
    this.#name = name
  }

  getRole() {
    return this.#role
  }

  setRole(role) {
    this.#role = role
  }
}

const user = new User(1, 'John Doe', 'developer')
user.#id // SyntaxError: Private field '#id' must be declared in an enclosing class
```

!!! tip "Benefit"

    Regular instance fields are accessible from outside the class.

    ```javascript
    class User {
      constructor(id, name, role) {
        this.id = id
        this.name = name
        this.role = role
      }

      getId() {
        return this.id
      }

      setId(id) {
        this.id = id
      }

      getName() {
        return this.name
      }

      setName(name) {
        this.name = name
      }

      getRole() {
        return this.role
      }

      setRole(role) {
        this.role = role
      }
    }

    const user = new User(1, 'John Doe', 'developer')
    user.id // 1
    user.id = 42
    user.id // 42
    ```







### Template Strings

[Template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals){target=_blank} (or template literals) are string are enclosed by the backtick (\` \`) characters instead of the double quotes (" ").

Template literals can contain placeholders. These are indicated by the dollar sign and curly braces (`${expression}`). The expressions in the placeholders and the text between the backticks (\` \`)  get concatenated into a single string,

```javascript
const name = 'John Doe'
const age = 42
const message = `Hello ${name}, you are ${age} years old. Next year you will be ${age + 1} years old.`
// Hello John Doe, you are 42 years old. Next year you will be 43 years old.
```

!!! tip "Benefit"

    Without template string one would have to concatenate the strings manually.

    ```javascript
    const name = 'John Doe'
    const age = 42
    const message = 'Hello ' + name + ', you are ' + age + ' years old. Next year you will be ' + (age + 1) + ' years old.'
    // Hello John Doe, you are 42 years old. Next year you will be 43 years old.
    ```

### Numeric separator

The [Numeric Separator](https://github.com/tc39/proposal-numeric-separator){target=_blank} (`"_"`) enables developers to make their numeric literals more readable by creating a visual separation between groups of digits. Actual values stay the same!

```javascript
const notReadableCount = 1000000000  // Is this a billion? a hundred millions? Ten millions?
const readableCount = 1_000_000_000 // Ah, so it's a billion!

const notReadablePrice = 101475938.38 // What scale is this? What power of 10?
const readablePrice = 101_475_938.38  // Ah, this is hundreds of millions!

const oneMillionth = 0.000_001 // This works on fractional numbers too!
```

### Nullish Coalescing Operator

The [nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator){target=_blank} (`??`) is a logical operator that

- returns its right-hand side operand when its left-hand side operand is `null` or `undefined`,

- and otherwise returns its left-hand side operand.

```javascript
null ?? 'default value'
// 'default value'

undefined ?? 'default value'
// 'default value'

0 ?? 42
// 0

"" ?? 'default string'
// ""
```

!!! tip "Benefit"

    In contrast to the [logical or operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR){target=_blank} (`||`) the nullish coalescing operator returns its left-hand side operand even if it is a [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy){target=_blank} value except `null` or `undefined`.

    ```javascript
    0 ?? 1
    // 0

    0 || 1
    // bar = 1

    "" ?? "default string"
    // ""

    "" || "default string"
    // "default string"
    ```

### Logical assignment operators

#### Logical OR assignment operator (`||=`)

The [logical OR assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR_assignment){target=_blank} (`x ||= y`) operator only assigns a value `y` to a variable `x`, if `x` is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy){target=_blank}.

```javascript
let truthy = 1
let falsy = 0

truthy ||= 2
// truthy = 1

falsy ||= 2
// falsy = 2
```

!!! tip "Benefit"

    The logical OR assignment (`x ||= y`) is equivalent to the following code:

    ```javascript
    x || (x = y)
    ```

#### Logical AND assignment operator (`&&=`)

The [logical AND assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND_assignment){target=_blank} (`x &&= y`) operator only assigns a value `y` to variable `x`, if `x` is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy){target=_blank}.

```javascript
let truthy = 1
let falsy = 0

truthy &&= 2
// truthy = 2

falsy &&= 2
// falsy = 0
```

!!! tip "Benefit"

    The logical AND assignment (`x &&= y`) is equivalent to the following code:

    ```javascript
    x && (x = y)
    ```

#### Logical nullish assignment operator (??=)

The [logical nullish assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_nullish_assignment){target=_blank} (`x ??= y`) operator only assigns a value `y` to a variable `x`, if `x` is [nullish](https://developer.mozilla.org/en-US/docs/Glossary/Nullish){target=_blank} (`null` or `undefined`).

```javascript
let truthy = 1
let nullish = null

truthy ??= 2
// truthy = 1

nullish ??= 2
// nullish = 2
```

!!! tip "Benefit"

    The logical nullish assignment (`x ??= y`) is equivalent to the following code:

    ```javascript
    x ?? (x = y)
    ```

### Object methods

The global [**Object**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object){target=_blank} type provides a number of *static* methods that can be used to create and manipulate `objects`, such as:

- [Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys){target=_blank}

- [Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries){target=_blank}

- [Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values){target=_blank}

- [Object.fromEntries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries){target=_blank}

- [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign){target=_blank}

- etc.

For a complete list please have a look at the [documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object#static_methods){target=_blank}.

### String methods

The global [**String**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String){target=_blank} class provides a number of useful *instance* methods for manipulating strings, such as:

- [String.trim](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim){target=_blank}

- [String.includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes){target=_blank}

- [String.matchAll](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll){target=_blank}

- [String.replaceAll](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll){target=_blank}

- etc.

For a complete list please have a look at the [documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#instance_methods){target=_blank}.

### Array methods

The global [**Array**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array){target=_blank} class provides a number of useful *static* and *instance* methods that can be helpful when working with arrays, such as:

- [Array.isArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray){target=_blank}

- [Array.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort){target=_blank}

- [Array.reverse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse){target=_blank}

- [Array.includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes){target=_blank}

- [Array.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find){target=_blank}

- [Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter){target=_blank}

- [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map){target=_blank}

- [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce){target=_blank}

- [Array.flat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat){target=_blank}


For a complete list please have a look at the [documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#constructor){target=_blank}.

### Promise methods

The global [**Promise**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise){target=_blank} object provides a number of useful *static* and *instance* methods that can be helpful when working with promises, such as:

- [Promise.resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve){target=_blank}

- [Promise.reject](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject){target=_blank}

- [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all){target=_blank}

- [Promise.finally](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally){target=_blank}

- [Promise.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race){target=_blank}

- [Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any){target=_blank}

- [Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled){target=_blank}

For a complete list please have a look at the [documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#constructor){target=_blank}.

For a detailed guide on how to use `Promises` please have a look at the [Asynchronous Programming exercise](../../async/nodejs/#2-promises){target=_blank}.


### async / await

The [`async / await` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function){target=_blank} enable asynchronous, Promise-based behavior to be written in a cleaner style, avoiding the need to explicitly configure Promise chains.

For a detailed guide on how to use `async / await` please have a look at the [Asynchronous Programming exercise](../../async/nodejs/#3-async-await){target=_blank}.

```javascript
const fetchMovies = async () => {
  try {
    const response = await fetch('/movies')
    const movies = await response.json()
    return movies
  } catch ({ message}) {
    console.error(`Error fetching movies: ${message}`)
    throw new Error('Failed to fetch movies')
  }
}
```

!!! tip "Benefit"

    Without the `async / await` syntax one would have to use a Promise chain to achieve the same result.

    ```javascript
    const fetchMovies = () => {
      return Promise
        .resolve()
        .then(() => fetch('/movies'))
        .then(response => response.json())
        .catch(({ message }) => {
          console.error(`Error fetching movies: ${message}`)
          return Promise.reject(new Error('Failed to fetch movies'))
        })
    }
    ```

### ECMAScript modules

[ECMAScript modules](https://nodejs.org/api/esm.html#modules-ecmascript-modules){target=_blank} (short *ES modules* or sometimes also *JavaScript modules*) are the new official standard format to package JavaScript code for reuse (vs. [CommonJS modules](https://nodejs.org/api/modules.html#modules-commonjs-modules){target=_blank} which have been used before in Node.js).

#### CommonJS

```javascript
// file: user.js
module.exports = class User {
  // ...
}

// file: other.js
const User = require('./user.js')
```

#### ES Modules

##### default export

```javascript
// file: user.js (or user.mjs)
export default class User {
  // ...
}

// file: other.js
import User from './user.js' // or './user.mjs'
```

##### named exports

```javascript
// file: math.js (or math.mjs)
const add = (a, b) => a + b

const subtract = (a, b) => a - b

const multiply = (a, b) => a * b

const divide = (a, b) => a / b

export { add, subtract, multiply, divide }

// file: other.js
import { add, multiply } from './math.js' // or './math.mjs'
```

##### dynamic imports

The `import()` method is a new feature in ES modules that allows you to dynamically import modules.
Note that it returns a [**Promise**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise){target=_blank} object.

```javascript
if (someCondition) {
  const module = await import('./module.js')
  module.doSomething()
}
```

!!! tip "Benefit"

    ES Modules define a consistent API for importing and exporting modules for the whole JavaScript ecosystem, including Node.js and the browser.

