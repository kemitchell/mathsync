/* global describe, it */
'use strict';

var utils = require('./utils');
var Promise = require('../lib/promise');

var assert = require('assert');

var item1 = new Int8Array([5]).buffer;
var item2 = new Int8Array([6]).buffer;

function selector(seed, content) {
  if (seed !== 5) {
    return null;
  }
  if (utils.isEqual(content, item1)) {
    return [6, 3, 4];
  } else if (utils.isEqual(content, item2)) {
    return [2, 3, 4];
  }
}

function digester(content) {
  if (utils.isEqual(content, item1)) {
    return new Int8Array([4]).buffer;
  } else if (utils.isEqual(content, item2)) {
    return new Int8Array([8]).buffer;
  }
}

var ibf = require('../lib/ibf');
var emptyContent = ibf(5, digester, selector);

function goThroughJson(origin) {
  return ibf.fromJSON(origin.toJSON(), digester, selector);
}

describe('IBF', function() {
  describe('empty', function() {
    it('has no added element', function() {
      utils.assertThatSetOfArrayEquals(emptyContent.toDifference().added, []);
      utils.assertThatSetOfArrayEquals(goThroughJson(emptyContent).toDifference().added, []);
    });
    it('has no removed element', function() {
      utils.assertThatSetOfArrayEquals(emptyContent.toDifference().removed, []);
      utils.assertThatSetOfArrayEquals(goThroughJson(emptyContent).toDifference().removed, []);
    });
  });
  describe('with one added item', function() {
    var oneItem = emptyContent.plus(item1);

    it('has one added element', function() {
      utils.assertThatSetOfArrayEquals(oneItem.toDifference().added, [item1]);
      utils.assertThatSetOfArrayEquals(goThroughJson(oneItem).toDifference().added, [item1]);
    });
    it('has no removed element', function() {
      utils.assertThatSetOfArrayEquals(oneItem.toDifference().removed, []);
      utils.assertThatSetOfArrayEquals(goThroughJson(oneItem).toDifference().removed, []);
    });
  });
  describe('with one removed item', function() {
    var oneItem = emptyContent.minus(item1);

    it('has no added element', function() {
      utils.assertThatSetOfArrayEquals(oneItem.toDifference().added, []);
      utils.assertThatSetOfArrayEquals(goThroughJson(oneItem).toDifference().added, []);
    });
    it('has one removed element', function() {
      utils.assertThatSetOfArrayEquals(oneItem.toDifference().removed, [item1]);
      utils.assertThatSetOfArrayEquals(goThroughJson(oneItem).toDifference().removed, [item1]);
    });
  });
  describe('with added then removed item', function() {
    var oneItem = emptyContent.plus(item1).minus(item1);

    it('has no added element', function() {
      utils.assertThatSetOfArrayEquals(oneItem.toDifference().added, []);
      utils.assertThatSetOfArrayEquals(goThroughJson(oneItem).toDifference().added, []);
    });
    it('has no removed element', function() {
      utils.assertThatSetOfArrayEquals(oneItem.toDifference().removed, []);
      utils.assertThatSetOfArrayEquals(goThroughJson(oneItem).toDifference().removed, []);
    });
  });
  describe('with removed then added item', function() {
    var oneItem = emptyContent.minus(item1).plus(item1);

    it('has no added element', function() {
      utils.assertThatSetOfArrayEquals(oneItem.toDifference().added, []);
      utils.assertThatSetOfArrayEquals(goThroughJson(oneItem).toDifference().added, []);
    });
    it('has no removed element', function() {
      utils.assertThatSetOfArrayEquals(oneItem.toDifference().removed, []);
      utils.assertThatSetOfArrayEquals(goThroughJson(oneItem).toDifference().removed, []);
    });
  });
  describe('with added items', function() {
    function updater(item, done) {
      item(item1);
      item(item2);
      done();
    }

    it('has two added elements', function() {
      return emptyContent.plusMany(updater).then(function (asyncAdded) {
        utils.assertThatSetOfArrayEquals(asyncAdded.toDifference().added, [item1, item2]);
        utils.assertThatSetOfArrayEquals(goThroughJson(asyncAdded).toDifference().added, [item1, item2]);
      });
    });
    it('has no removed element', function() {
      return emptyContent.plusMany(updater).then(function (asyncAdded) {
        utils.assertThatSetOfArrayEquals(asyncAdded.toDifference().removed, []);
        utils.assertThatSetOfArrayEquals(goThroughJson(asyncAdded).toDifference().removed, []);
      });
    });
  });
  describe('with removed items', function() {
    function updater(item, done) {
      item(item1);
      item(item2);
      done();
    }

    it('has two removed elements', function() {
      return emptyContent.minusMany(updater).then(function (asyncRemoved) {
        utils.assertThatSetOfArrayEquals(asyncRemoved.toDifference().removed, [item1, item2]);
        utils.assertThatSetOfArrayEquals(goThroughJson(asyncRemoved).toDifference().removed, [item1, item2]);
      });
    });
    it('has no added element', function() {
      return emptyContent.minusMany(updater).then(function (asyncRemoved) {
        utils.assertThatSetOfArrayEquals(asyncRemoved.toDifference().added, []);
        utils.assertThatSetOfArrayEquals(goThroughJson(asyncRemoved).toDifference().added, []);
      });
    });
  });
  describe('merge with other', function() {
    var withItem1 = emptyContent.plus(item1);
    var withItem2 = emptyContent.plus(item2);

    it('has elements from both', function() {
      var both = withItem1.plusIbf(withItem2);
      utils.assertThatSetOfArrayEquals(both.toDifference().added, [item1, item2]);
      utils.assertThatSetOfArrayEquals(both.toDifference().removed, []);
    });
    it('fails with ibf of different sizes', function() {
      var size5 = ibf(5, digester, selector);
      var size7 = ibf(7, digester, selector);
      assert.throws(function () {
        size7.plusIbf(size5);
      }, /Cannot merge IBF of different sizes/);
    });
  });
  describe('updater safeness', function () {
    it('ignores added items on done updater', function () {
      var contentPromise;
      return new Promise(function (resolve) {
        contentPromise = emptyContent.plusMany(function (item, done) {
          item(item1);
          done();
          item(item2);
          resolve();
        });
      }).then(function () {
        return contentPromise;
      }).then(function (content) {
        utils.assertThatSetOfArrayEquals(content.toDifference().added, [item1]);
      });
    });
  });
});
