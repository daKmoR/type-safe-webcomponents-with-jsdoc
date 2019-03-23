/* eslint-disable no-unused-expressions */
import { fixture, expect } from '@open-wc/testing/index.js';

import { TitleBar } from '../src/title-bar.js';
// eslint-disable-next-line no-unused-vars
import { TitleBarTypes } from '../src/title-bar-types.js';

describe('Title Bar', () => {
  it('has 2 property that triggers rendering', async () => {
    expect(Object.keys(TitleBar.properties)).to.have.lengthOf(2);
  });

  it('has a default property title', async () => {
    const noType = await fixture('<title-bar></title-bar>');
    const noDoc = /** @type {TitleBar} */ (await fixture('<title-bar></title-bar>'));
    const el = /** @type {TitleBarTypes} */ (await fixture('<title-bar-types></title-bar-types>'));

    expect(noType.title).to.equal('You are awesome');
    expect(noDoc.title).to.equal('You are awesome');
    expect(el.title).to.equal('You are awesome');

    noType.darkMode = true;
    noDoc.darkMode = true;
    el.darkMode = true;

    noType.bar = { x: 1, y: 2 };
    // noDoc.bar = { x: 1, y: 2 }; // without JSDoc you can't have optional properties
    el.bar = { x: 1, y: 2 };

    noType.formatter = value => `${value} for real!`;
    noDoc.formatter = value => `${value} for real!`;
    el.formatter = value => `${value} for real!`;

    // // example type errors variations
    // noType.title = true;
    // noDoc.title = true;
    // el.title = true;

    // noType.darkMode = 'foo';
    // noDoc.darkMode = 'foo';
    // el.darkMode = 'foo';

    // noType.bar = true;
    // noDoc.bar = true;
    // el.bar = true;

    // noType.formatter = true;
    // noDoc.formatter = true;
    // el.formatter = true;

    // example type error
    // el.title = true;
    // el.darkMode = 'foo';
    // el.bar = 12;
  });
});
