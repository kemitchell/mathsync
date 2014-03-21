(function () {
  'use strict';

  /**
   * Generator functions.
   *
   * <p>Calling them as a function returns an {@link external:Iterator iterator}.</p>
   *
   * @example
   * function* generator() {
   *   yield 1;
   *   yield 2;
   *   yield 3;
   * }
   *
   * @external Generator
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator Generator on Mozilla Developer Network}
   */

  /**
   * An occurrence of a Generator.
   *
   * <p>This is the result of calling a generator function which does <code>yield</code> on each item it wants to
   * expose, or on promise to items it wants to expose. It can actually be a hand made object as long as it respects
   * the contract of this interface.</p>
   *
   * @example
   * function* generator() {
   *   yield 1;
   *   yield 2;
   *   yield 3;
   * }
   * var it = generator();
   *
   * @example
   * var it = (function () {
   *   var i = 0;
   *   var content = [1, 2, 3];
   *   return {
   *     next : function () {
   *       var res;
   *       if (i < content.length) {
   *         res = { done : false, value : content[i] };
   *       } else {
   *         res = { done : true };
   *       }
   *       i++;
   *       return res;
   *     }
   *   };
   * })();
   *
   * @external Iterator
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator Generator on Mozilla Developer Network}
   */
  /**
   * Reads the next item on the iterator.
   *
   * <p>Can either return a value if it is not done, <code>{ done : false, value : 'some value' }</code>, or inform it
   * is done with <code>{ done : true }</code>. <code>value</code> can either be the actual value or a
   * {@link external:Promise promise} which will resolve to the desired value.</p>
   *
   * @returns Object a done marker, or a value container, or a promise-for-value container.
   * @function external:Iterator#next
   */

  function fromArray(array) {
    var i = 0;
    function next() {
      var res;
      if (i < array.length) {
        res = { done: false, value: array[i] };
        i++;
      } else {
        res = { done: true, value: undefined };
      }
      return res;
    }
    return { next: next };
  }

  function count(iterator) {
    var it;
    function next() {
      var upper = iterator.next();
      if (!upper.done) {
        it.count++;
      }
      return upper;
    }
    it = { next: next, count: 0 };
    return it;
  }

  function map(iterator, transform) {
    function next() {
      var upper = iterator.next();
      if (upper.done) {
        return upper;
      } else if (typeof upper.value.then === 'function') {
        return { done: false, value: upper.value.then(transform) };
      } else {
        return { done: false, value: transform(upper.value) };
      }
    }
    return { next: next };
  }

  /**
   * Utilities around iterators.
   *
   * @module iterator
   */
  module.exports = {

    /**
     * Creates an iterator on an array.
     *
     * @function
     * @param {Object[]} array - the array of items to represent.
     * @return {external:Iterator} an iterator which will provide items of the array.
     */
    fromArray: fromArray,

    /**
     * Counts items in an iterator.
     *
     * <p>Each time the <code>next</code> method is called, property <code>count</code> of the iterator is updated with
     * the current number of items already read. Once the iterator is finished, this counter represents the total number
     * of items iterated on and no longer changes.</p>
     *
     * @function
     * @param {external:Iterator} iterator - the original iterator to count items of.
     * @param {external:Iterator} iterator - an iterator which elments will be counted.
     */
    count: count,

    /**
     * Transforms values of an array.
     *
     * <p>Does the transformation synchronously when possible but handles promises returned by the upstream iterator.
     * The transformer function can return {@link external:Promise promises} too.</p>
     *
     * @function
     * @param {external:Iterator} iterator - the original iterator to transform.
     * @param {Function} transform - the function transforming individual items.
     * @return {external:Iterator} an iterator which will provide transformed items.
     */
    map: map
  };
})();