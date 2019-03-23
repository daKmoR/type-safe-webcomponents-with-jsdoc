---
title: Type safe web components with JSDoc
published: false
description:
tags: webcomponents, javascript, type, openwc
---

Writing code is tough and writing it in a way that makes sense to others (or yourself in 3 weeks) is even tougher. That's probably the reason why documentation is a very important part of every software project.

I'm pretty sure you can relate to this situation. I'm happily coding and I just found a nice library that can help me with it so you import it.

```js
import foo from 'foo-lib';

foo.doTheThing(//...
```
was it a string first and then the number or the other way around?

So you head over to http://foo-lib.org and about 5 clicks late you get to the function signiture and find out how to use it.

First of you are already lucky as not many libraries have good documentation :scream:

However it already painfully shows that the information is not as close to your workflow as it should be. You have to stop coding and search for the info while it could be directly in your editor. :blush:

Don't get me wrong not every documentation should be right in there - that would just be too much. So we are getting to into another complicated matter and that is that documentation usually has to cover a huge amount of different users (with vastly different skills and backgrounds) and levels of programming detail.

So in order that we can talk about this here we need to do some broader generalizations. So we will split documentation into different categories
1. **Landing page documentation**: used to spark initial interest in people => needs to be handmade (written, designed and implemented)
2. **General documentation**: should show the big picture between all the features => needs to be written by hand hopefully in markdown so it can serve on github/npmjs and can be used to auto-generate a nice looking docs webpage.
3. **API documentation**: should be close to the code?


We will now only focus on API documentation. Also we will be assuming the editor in use is VS Code.

Let's get started with a very simple web component.


```html
<title-bar>
  #shadow-root (open)
    <h1>You are awesome</h1>
    <div class="dot" style="left: 0px; top: 0" title="I am dot"></div>
</title-bar>
```

It's just a little box with a
- title
- darkMode
- formatter function
- bar on the left

We will use LitElement to create it.

**Note**: We use JavaScript here - but for the most part (exept for the type casting & definitions) it would be the same for TypeScript.

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
    // not relevant now
  }

  static get styles() {
    // not relevant now
  }
}

customElements.define('title-bar', TitleBar);
```

Now if we or our users start using this component our editor already knows a lot of information however it's not utalized.

```js
const el = document.querySelector('title-bar');
```

Here our editor can't know what `el` actually is so there is no way it can help us in writing better code. That means no code completion for our own properties even though that information is available.

![autoCompleteMissing](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/autoCompleteMissing.png)

What we need to do is cast it.

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

You can even even go further by doing the linting in the console and your continous integration.

All you need to do is
```bash
npm i -D typescript
```
Add this to you package.json
```json
  "scripts": {
    "lint:types": "tsc"
  }
```
And execute it via
```
npm run lint:types
```

That will give you the same error as above but with filepath and line number.

So just by doing these few extra things your IDE can help you to stay type save.

Honestly it will not be a gentile reminder - those red curly lines are hard to ignore and if you need an extra motivation you can hit F8 which will just throw the next error in your face :p.

![showTypeErrors](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/showTypeErrors.png)

## How does it work?

If you are like me you are probably wondering how does it know what properties are of which type? I certainly did not define any types.

Typescript can make a lot of assumptions based on your es6 code. The actual magic lays in the constructor.

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
(I did not forget formatter - we will adress it later)


I mean types are already awesome but we can do even better. Look at the intellisense in VS Code.

![intellisenseTitleTyped](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/intellisenseTitleTyped.png)

really minimal... let's add some JSDoc.

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

Now if we look at
```js
this.formatter = null;
```

There is now way to see from this line what that property will hold.
You could assign an empty/default function like
```js
this.formatter = value => `${value}`;
```
but that does not make sense in all case.
In our example we would like to skip the formatting if there is no formatter function.
Having a default function would defeat it's purpose.
In these cases it's mandatory to provide a `@type` and you can do so via a JSDoc.

```js
/**
 * You can provide a specific formatter that will change the way the title
 * get's displayed.
 *
 * *Note*: Changeing the formatter does NOT trigger a rerender.
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

Also the directly shown example really makes it way easier to create your own formatter.

![intellisenseFormatterTypedJsDoc](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/intellisenseFormatterTypedJsDoc.png)

There is one more property which does not look too nice and that is the bar.

![intellisenseBarTyped](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/raw/master/images/intellisenseBarTyped.png)

I mean type safetly already works which is great but you only know that x is a number there is no additional info.
That can be improved with JSDocs as well.

So we define a special type called `Bar`.
```js
/**
 * This is an visible bar that gets displayed at the appropriate coordinates.
 * It has a height of 100%. An optional title can be provided.
 *
 * @typedef {Object} Bar
 * @property {number} x The distance from the left
 * @property {number} y The distance from the top
 * @property {string} [title] Optional title that will set as an attribute (defaults to '')
 */
```
Doing so we can also define certain properties as optional.
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

*not a super useful example but good for illustration perposes*

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

Or if you want to have an onion type (e.g. allow strings AND numbers).
Be sure to only document what you actually need as with this method you override the default types and that means they could get out of sync.

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

If you really need to add very specific descriptions to every object options then you need to dublicate the typings.

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
Equiped with these options for properties/functions you should be fine for most web components.

- Set defaults for properties in constructor and the type will be there automatically
- If you do not have default make sure to add `@types`
- Add additional information/docs/examples as JSDoc for a nicer experience
- Make sure to type cast your dom results
- Add type linting via console/continious intergration to make sure they are correct
- Inform your users how they can consume your types

If you need more information on additional JSDoc features for types take a look at [Type Safe JavaScript with JSDoc](https://medium.com/@trukrs/type-safe-javascript-with-jsdoc-7a2a63209b76).

The full code can be found on [github](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc).
To see how your users will get it look at the [tests](https://github.com/daKmoR/type-safe-webcomponents-with-jsdoc/blob/master/test/title-bar.test.js).

Follow me on [Twitter](https://twitter.com/daKmoR).
If you have any interest in web component make sure to check out [open-wc.org](https://open-wc.org).
