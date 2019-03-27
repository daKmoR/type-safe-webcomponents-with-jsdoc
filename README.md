---
title: Type-Safe Web Components with JSDoc
published: false
description: Provide the best developer experience by showing awesome intellisense and adding types to your web components.
tags: webcomponents, javascript, type, openwc
---

Writing code is tough and writing it in a way that makes sense to others (or your future self) is even tougher. That's why documentation is a very important part of every software project.

I'm sure we've all found ourselves in the following situation: You're happily coding and just found a nice library that can help you, so you start using it...

```js
import foo from 'foo-lib';

foo.doTheThing(//...
```
But, did `foo.doTheThing()` take a string first and then the number or the other way around?

So you head over to http://foo-lib.org and about 5 clicks later you get to the function signature and find out how to use it. First of all, you're already lucky as not many libraries have good documentation :scream:

However it already painfully shows that the information is not as close to your workflow as it should be. You have to stop coding and search for the info while it could be directly in your editor. :blush:

So we can definitely do better :hugs: Let's get started with a very simple web component.

**Note**: We will be assuming the editor in use is VS Code.

If you wanna play along - all the code is on [github](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc).

### \<title-bar\>

![title-bar](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/title-bar.png)

```html
<title-bar>
  #shadow-root (open)
    <h1>You are awesome</h1>
    <div class="dot" style="left: 0px; top: 0px" title="I am dot"></div>
</title-bar>
```

It's just a little box with a
- title property
- darkMode property/attribute
- formatter function
- a sidebar property on the left

We will use LitElement to create it.

**Note**: We use JavaScript here - but for the most part (exept for the type casting & definitions) the example would be the same for TypeScript.

```js
import { LitElement, html, css } from 'lit-element';

export class TitleBar extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      darkMode: { type: Boolean, reflect: true, attribute: 'dark-mode' },
      bar: { type: Object },
    };
  }

  constructor() {
    super();
    this.title = 'You are awesome';
    this.darkMode = false;
    this.bar = { x: 0, y: 0, title: 'I am dot' };
    this.formatter = null;
  }

  render() {
    // positioning the bar like this is just for illustration purposes => do not do this
    return html`
      <h1>${this.format(this.title)}</h1>
      <div
        class="dot"
        style=${`left: ${this.bar.x}px; top: ${this.bar.y}`}
        title=${this.bar.title}
      ></div>
    `;
  }

  format(value) {
    // we'll get to this later
  }

  static get styles() {
    // we'll get to this later
  }
}

customElements.define('title-bar', TitleBar);
```

### What you get when you use it

Let's query our newly created element. :blush:

```js
const el = document.querySelector('title-bar');
```

Here our editor can't know what `el` actually is so there is no way it can help us in writing better code.
That means no code completion for our own properties even though that information is available.

![autoCompleteMissing](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/autoCompleteMissing.png)

So what we need to do is cast it:

```js
const el = /** @type {TitleBar} */ (document.querySelector('title-bar'));
```

Now we already get auto completion. :tada:

![autoCompleteTypes](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/autoCompleteTypes.png)

However we can still write code like
```js
el.foo = 'bar';
el.title = true;
```
and nobody will complain.

Let's change that :muscle:

### Add type linting

Add a `tsconfig.json` file to your project
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "lib": ["es2017", "dom"],
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "strict": false,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "esModuleInterop": true
  },
  "include": [
    "src",
    "test",
    "node_modules/@open-wc/**/*.js"
  ],
  "exclude": [
    "node_modules/!(@open-wc)"
  ]
}
```

That is all you need to get VS Code to mark the code as having a problem:
```
Property 'foo' does not exist on type 'TitleBar'.
Type 'true' is not assignable to type 'string'.
```

You can even even go further by doing the linting in the console and your continuous integration.

All you need to do is:
```bash
npm i -D typescript
```
And add this script to you package.json
```json
  "scripts": {
    "lint:types": "tsc"
  }
```
Then we can execute it as:
```
npm run lint:types
```

This will give you the same error as above but with a filepath and line number.

So just by doing these few extra things your IDE can help you to stay type safe.

Honestly it will not be a gentle reminder - those red curly lines are hard to ignore and if you need some extra motivation you can hit F8 which will just throw the next error in your face :p.

![showTypeErrors](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/showTypeErrors.png)

## How does it work?

If you are like me you are probably wondering how does it know what properties are of which type? I certainly did not define any types yet!

Typescript can make a lot of assumptions based on your ES6 code. The actual magic lays in the constructor:

```js
constructor() {
  super();
  this.title = 'You are awesome';
  this.darkMode = false;
  this.bar = { x: 0, y: 0, title: 'I am dot' };
  this.formatter = null;
}
```

- title is obviously a string
- darkMode a boolean
- bar an object with x, y as number and title a string

So just by defining your initial values within the constructor most of your types should be good to go. :+1:
(Dont worry — I did not forget formatter, we'll get to it shortly)

Types are already awesome but we can do even better.

### Look at the intellisense in VS Code.

![intellisenseTitleTyped](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/intellisenseTitleTyped.png)

Currently it's really minimal... So let's add some JSDoc:

```js
/**
 * The title to display inside the title bar
 * - should be less then 100 characters
 * - should not contain HTMl
 * - should be between 2-5 words
 *
 * @example
 * // DO:
 * el.title = 'Welcome to the jungle';
 *
 * // DON'T:
 * el.title = 'Info';
 * el.title = 'Welcome to <strong>the</strong> jungle';
 * el.title = 'We like to talk about more then just what sees the eye';
 */
this.title = 'You are awesome';
```

![intellisenseTitleTypedJsDoc](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/intellisenseTitleTypedJsDoc.png)

much better :blush:

**Note**: You do not need to add the `@type` here as it's clear that it's a string and if you add it - it may get out of sync at some point.

### Manually set types

If we look at

```js
this.formatter = null;
```

There is no way to see from this line alone what the property will hold.
You could assign an empty/default function like
```js
this.formatter = value => `${value}`;
```
but this does not make sense in all case.
In our example we would like to skip the formatting if there is no formatter function.
Having a default function would defeat it's purpose.
In these cases it's mandatory to provide a `@type` and you can do so using JSDoc.

```js
/**
 * You can provide a specific formatter that will change the way the title
 * gets displayed.
 *
 * *Note*: Changing the formatter does NOT trigger a rerender.
 *
 * @example
 * el.formatter = (value) => `${value} for real!`;
 *
 * @type {Function}
 */
this.formatter = null;
```

That way if you provide a wrong type it will show an error.

```js
el.formatter = false;
// Type 'false' is not assignable to type 'Function'.
```

Also the immediately appearing `@example` really makes it easy to create your own formatter.

![intellisenseFormatterTypedJsDoc](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/intellisenseFormatterTypedJsDoc.png)

### Setup your own types and use them

There is one more property that doesn't look too nice yet, and that is the `bar` property.

![intellisenseBarTyped](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/intellisenseBarTyped.png)

Our type safety already works here, which is great, but we only know that x is a number; there is no additional info.
We can improve this with JSDocs as well.

So we define a special type called `Bar`.
```js
/**
 * This is a visible bar that gets displayed at the appropriate coordinates.
 * It has a height of 100%. An optional title can be provided.
 *
 * @typedef {Object} Bar
 * @property {number} x The distance from the left
 * @property {number} y The distance from the top
 * @property {string} [title] Optional title that will be set as an attribute (defaults to '')
 */
```
Doing so we can also define certain properties as being optional.
The only thing we need to do then is to assign it.

```js
/**
 * @type {Bar}
 */
this.bar = { x: 0, y: 0, title: 'I am dot' };
```

![intellisenseBarTypedJsDoc](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/intellisenseBarTypedJsDoc.png)

### Add types to function parameters

Let's create a simple format function which will allow for prefix/suffix by default and if you need more you can just override the `formatter`.

*Note: this is not a super useful example but good enough for illustration purposes*

```js
format(value = '', { prefix, suffix = '' } = { prefix: '' }) {
  let formattedValue = value;
  if (this.formatter) {
    formattedValue = this.formatter(value);
  }
  return `${prefix}${formattedValue}${suffix}`;
}
```

Again just by using default options it already knows all the types.

![intellisenseFormatTyped](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/intellisenseFormatTyped.png)

So just adding a little documentation is probably all you need.

```js
/**
 * This function can prefix/suffix your string.
 *
 * @example
 * el.format('foo', { prefix: '...' });
 */
format(value = '', { prefix = '', suffix = '' } = {}) {
```

![intellisenseFormatTypedJsDocsOnlyDescription](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/intellisenseFormatTypedJsDocsOnlyDescription.png)

Or if you want to have an union type (e.g. allow strings AND numbers).
Be sure to only document what you actually need as with this method you override the default types and that means things could get out of sync.

```js
/**
 * This function can prefix/suffix your string.
 *
 * @example
 * el.format('foo', { prefix: '...' });
 *
 * @param {string|number} value String to format
 */
format(value, { prefix = '', suffix = '' } = {}) {
```

![intellisenseFormatTypedJsDoc](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/intellisenseFormatTypedJsDoc.png)

If you really need to add very specific descriptions to every object options then you need to duplicate the typings.

```js
/**
 * This function can prefix/suffix your string.
 *
 * @example
 * el.format('foo', { prefix: '...' });
 *
 * @param {string} value String to format
 * @param {Object} opts Options
 * @param {string} opts.prefix Mandatory and will be added before the string
 * @param {string} [opts.suffix] Optional and will be added after the string
 */
format(value, { prefix, suffix = '' } = { prefix: '' }) {
```

![intellisenseFormatTypedJsDocExtraAllOptions](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/intellisenseFormatTypedJsDocExtraAllOptions.png)

### Importing Types across files

Files never live in isolation so there might come a point where you want to use a type within another location.
Let's take our good old friend the ToDo List as an example.
You will have `todo-item.js` & `todo-list.js`.

The item will have a constructor like this.

```js
constructor() {
  super();
  /**
   * What you need to do
   */
  this.label = '';

  /**
   * How important is it? 1-10
   *
   * 1 = less important; 10 = very important
   */
  this.priority = 1;

  /**
   * Is this task done already?
   */
  this.done = false;
}
```

So how can I reuse those type in `todo-list.js`.

Let's assume the following structure:
```html
<todo-list>
  <todo-item .label=${One} .priority=${5} .done=${true}></todo-item>
  <todo-item .label=${Two} .priority=${8} .done=${false}></todo-item>
</todo-list>
```

and we would like to calculate some statistics.

```js
calculateStats() {
  const items = Array.from(
    this.querySelectorAll('todo-item'),
  );

  let doneCounter = 0;
  let prioritySum = 0;
  items.forEach(item => {
    doneCounter += item.done ? 1 : 0;
    prioritySum += item.prio;
  });
  console.log('Done tasks', doneCounter);
  console.log('Average priority', prioritySum / items.length);
}
```

The above code actually has an error in it :scream:
`item.prio` does not exists. Types could have saved us here, but how?

First let's import the type
```js
/**
 * @typedef {import('./todo-item.js').ToDoItem} ToDoItem
 */
```

and then we type cast it.

```js
const items = /** @type {ToDoItem[]} */ (Array.from(
  this.querySelectorAll('todo-item'),
));
```

And there we already see the type error :muscle:

![importCast](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/importCast.png)

### Use Data Objects to create Custom Elements

In most cases we do not only want to access an existing DOM and type cast the result but we would like to actually render those elements from a data array.

Here is the example array
```js
this.dataItems = [
  { label: 'Item 1', priority: 5, done: false },
  { label: 'Item 2', priority: 2, done: true },
  { label: 'Item 3', priority: 7, done: false },
];
```

and then we render it

```js
return html`
  ${this.dataItems.map(
    item => html`
      <todo-item .label=${item.label} .priority=${item.priority} .done=${item.done}></todo-item>
    `,
  )}
`;
```

How can we make this type safe?

Unfortunately, simply casting it via `@type {ToDoItem[]}` does not really work out :sob:

![ElementAsObjectFail](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/ElementAsObjectFail.png)

It expects the object to be a full representation of an HTMLElement and of course our little 3 property object does miss quite some properties there.

What we can do is to have a `Data Representation` of our web component. e.g. define what is needed to create such an element in the dom.

```js
/**
 * Object Data representation of ToDoItem
 *
 * @typedef {Object} ToDoItemData
 * @property {string} label
 * @property {number} priority
 * @property {Boolean} done
 */
```

We can then import and type cast it

```js
/**
 * @typedef {import('./todo-item.js').ToDoItemData} ToDoItemData
 * @typedef {import('./todo-item.js').ToDoItem} ToDoItem
 */

// [...]

constructor() {
  super();
  /**
   * @type {ToDoItemData[]}
   */
  this.dataItems = [
    { label: 'Item 1', priority: 5, done: false },
    { label: 'Item 2', priority: 2, done: true },
    { label: 'Item 3', priority: 7, done: false },
  ];
}
```

And :tada: type safety for web component AND its data.

![ItemDataTypeErrors](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/ItemDataTypeErrors.png)


## Let your users consume your types

One thing that is a little tougher if you have types not as definition files is how you can make them available.

Generally speaking you will need to ask your users to add a `tsconfig.json` like this
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "lib": ["es2017", "dom"],
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "strict": false,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "esModuleInterop": true
  },
  "include": [
    "**/*.js",
    "node_modules/<your-package-name>/**/*.js"
  ],
  "exclude": [
    "node_modules/!(<your-package-name>)"
  ]
}
```

The important part is the `include` and not `exclude` of your package name.

For full TypeScript project you might want to do a little more like have 2 `tsconfigs.json` one for linting and one for buildling (as allowJs prevent automatic creation of definitino files).

You can find more details about such an approach at [Setup For Typescript on Open Web Components](https://open-wc.org/developing/types.html#setup-for-typescript).


## Quick recap:
Equipped with these options for properties/functions you should be fine for most web components.

- Set defaults for properties in constructor and the type will be there automatically
- If you do not have a default make sure to add `@types`
- Add additional information/docs/examples as JSDoc for a nicer developer experience
- Make sure to type cast your dom results
- Add type linting via console/continuous integration to make sure they are correct
- Inform your users how they can consume your types
- Bookmark the [Typescript JSDoc Reference](https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript)

If you need more information on additional JSDoc features for types take a look at [Type Safe JavaScript with JSDoc](https://medium.com/@trukrs/type-safe-javascript-with-jsdoc-7a2a63209b76). I highly recommend reading it!

The full code can be found on [github](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc).
To see how your users will get it look at the [tests](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/blob/master/test/title-bar.test.js).


## What's next?

These are steps that can help make web components simpler and saver to use.
Not everything here is useful for every situation and there will be definitly situation where we don't have a recipe yet.
If you encouter any issues (hopefully + solution) please let us know and we will add it to this "Cookbook for types with web components".

Follow me on [Twitter](https://twitter.com/daKmoR).
If you have any interest in web component make sure to check out [open-wc.org](https://open-wc.org).
