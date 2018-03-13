# dotenv-safe

Identical to [`env-yaml`](https://github.com/jrwells/env-yaml), but ensures that all necessary environment variables are defined after reading from `.env.yml`.
These needed variables are read from `.env.example.yml`, which should be commited along with your project.

# Installation

```
npm install --save dotenv-yaml-safe
```

```
yarn add dotenv-yaml-safe
```

# Example

```yaml
# .env.example.yml, committed to repo
SECRET:
TOKEN:
KEY:
```

```yaml
# .env.yml, private
SECRET: topsecret
TOKEN:
```

```js
// index.js
require('dotenv-yaml-safe').config();
```

Since the provided `.env.yml` file does not contain all the variables defined in
`.env.example.yml`, an exception is thrown:

```
MissingEnvVarsError: The following variables were defined in .env.example but are not present in the environment:
  TOKEN, KEY
Make sure to add them to .env or directly to the environment.

If you expect any of these variables to be empty, you can use the allowEmptyValues option:
require('dotenv-yaml-safe').config({
  allowEmptyValues: true
});
```

Not all the variables have to be defined in `.env`, they can be supplied externally.
For example, the following would work:

```
$ TOKEN=abc KEY=xyz node index.js
```

# Usage

Requiring and loading is identical:

```js
require('dotenv-yaml-safe').config();
```

This will load environment variables from `.env` as usual, but will also read any variables defined in `.env.example.yml`.
If any variables are already defined in the environment before reading from `.env.yml`, they will not be overwritten.
If any variables are missing from the environment, a [`MissingEnvVarsError`](MissingEnvVarsError.js) will be thrown, which lists the missing variables.
Otherwise, returns an object with the following format:

```js
{
  parsed: { SECRET: 'topsecret', TOKEN: null },          // parsed representation of .env
  required: { SECRET: 'topsecret', TOKEN: 'external' } // key/value pairs required by .env.example
                                                       // and defined by environment
}
```

If all the required variables were successfully read but an error was thrown when trying to read the `.env.yml` file, the error will be included in the result object under the `error` key.

`dotenv-safe` compares the actual environment after loading `.env.yml` (if any) with the example file, so it will work correctly if environment variables are missing in `.env.yml` but provided through other means such as a shell script.

# Options

[Same options and methods supported by `env-yaml`](https://github.com/jrwells/env-yaml#options).

```js
require('dotenv-yaml-safe').config({
    allowEmptyValues: true,
    example: './.my-env-example-filename.yml'
});
```

## `allowEmptyValues`

If a variable is defined in the example file and has an empty value in the environment, enabling this option will not throw an error after loading.
Defaults to `false`.

## `example`

Path to example environment file.
Defaults to `.env.example.yml`.

# Credits and Motivation

Based on the work of [Robert Wells (env-yaml)](https://github.com/jrwells/env-yaml) and [Rodrigo López Dato (dotenv-safe)](https://github.com/rolodato/dotenv-safe).

I came across dotenv-safe and would it to add to my existing project but I'm using YAML-based configuration so I ported dotenv-safe using env-yaml as its parser. This is useful for NodeJS apps that can be morphed to use [Serverless Framework](https://serverless.com).
