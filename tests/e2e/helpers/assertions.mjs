// @ts-check
/**
 * Test Assertion Library for Opaque-Box E2E Testing
 * Provides strict assertions with clear diagnostic error reporting.
 */

export class AssertionError extends Error {
  /**
   * @param {string} message
   * @param {any} actual
   * @param {any} expected
   */
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new AssertionError(message, false, true);
  }
}

export function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    const msg = message ? `${message} | Expected: ${expectedStr}, got: ${actualStr}` : `Expected ${expectedStr}, but got ${actualStr}`;
    throw new AssertionError(msg, actual, expected);
  }
}

export function assertTrue(val, message = 'Expected true') {
  if (val !== true) {
    throw new AssertionError(message, val, true);
  }
}

export function assertFalse(val, message = 'Expected false') {
  if (val !== false) {
    throw new AssertionError(message, val, false);
  }
}

export function assertMatch(str, regex, message) {
  if (typeof str !== 'string' || !regex.test(str)) {
    const msg = message ? `${message} | Value "${str}" does not match pattern ${regex}` : `Value "${str}" does not match pattern ${regex}`;
    throw new AssertionError(msg, str, regex.toString());
  }
}

export function assertContains(haystack, needle, message) {
  if (Array.isArray(haystack)) {
    if (!haystack.includes(needle)) {
      throw new AssertionError(message || `Array does not contain ${JSON.stringify(needle)}`, haystack, needle);
    }
  } else if (typeof haystack === 'string') {
    if (!haystack.includes(needle)) {
      throw new AssertionError(message || `String does not contain substring "${needle}"`, haystack, needle);
    }
  } else if (typeof haystack === 'object' && haystack !== null) {
    if (!(needle in haystack)) {
      throw new AssertionError(message || `Object does not have key "${needle}"`, Object.keys(haystack), needle);
    }
  } else {
    throw new AssertionError('Haystack is neither array, string, nor object', haystack, needle);
  }
}

export function assertGreaterOrEqual(actual, minimum, message) {
  if (actual < minimum) {
    throw new AssertionError(message || `Expected ${actual} >= ${minimum}`, actual, minimum);
  }
}

export function assertLessOrEqual(actual, maximum, message) {
  if (actual > maximum) {
    throw new AssertionError(message || `Expected ${actual} <= ${maximum}`, actual, maximum);
  }
}

export async function assertThrowsAsync(fn, expectedErrorSubstring, message) {
  let threw = false;
  let thrownError = null;
  try {
    await fn();
  } catch (err) {
    threw = true;
    thrownError = err;
    if (expectedErrorSubstring) {
      const errStr = String(err && err.message ? err.message : err);
      if (!errStr.includes(expectedErrorSubstring)) {
        throw new AssertionError(
          `${message || 'Error message mismatch'}: Expected to include "${expectedErrorSubstring}", got "${errStr}"`,
          errStr,
          expectedErrorSubstring
        );
      }
    }
  }
  if (!threw) {
    throw new AssertionError(message || 'Expected asynchronous function to throw an error, but it succeeded.', null, expectedErrorSubstring);
  }
}

export function assertThrows(fn, expectedErrorSubstring, message) {
  let threw = false;
  let thrownError = null;
  try {
    fn();
  } catch (err) {
    threw = true;
    thrownError = err;
    if (expectedErrorSubstring) {
      const errStr = String(err && err.message ? err.message : err);
      if (!errStr.includes(expectedErrorSubstring)) {
        throw new AssertionError(
          `${message || 'Error message mismatch'}: Expected to include "${expectedErrorSubstring}", got "${errStr}"`,
          errStr,
          expectedErrorSubstring
        );
      }
    }
  }
  if (!threw) {
    throw new AssertionError(message || 'Expected function to throw an error, but it succeeded.', null, expectedErrorSubstring);
  }
}
