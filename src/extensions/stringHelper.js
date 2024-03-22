import { string } from 'prop-types'

export const StringHelper = {
  /**
   *
   * @param {*} str Can be a string or an `array` of string
   * @returns True if the string(or any string from the given array) is empty, undefined, or whitespaces-only.
   */
  isEmpty (str) {
    if (Array.isArray(str)) {
      return str.some(st => !st && !st.trim())
    }
    return !str && !str.trim()
  },
  /**
   *
   * @param {*} obj The object to run the query on
   * @param {string[]} ignoreProps Array of the properties/object keys to ignore
   * @returns True if any properties of the given object is `null`, `undefined`, `empty` (in case of strings), or `length == 0` (in case of arrays)
   */
  isPropsEmpty (obj = {}, ignoreProps = []) {
    return Object.keys(obj).some(prop => {
      if (!ignoreProps.includes(prop)) {
        if (Array.isArray(obj[prop])) {
          return obj[prop].length <= 0
        } else if (Object.keys(obj[prop]).length > 0) {
          return Object.keys(obj[prop]).some(nestedKey =>
            this.isEmpty(obj[prop][nestedKey])
          )
        }
        return !obj[prop] || (!obj[prop] && !obj[prop].trim())
      }
    })
  },
  hasEmptyNestedProperties (obj) {
    if (typeof obj !== 'object' || obj === null) {
      return false
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key]

        if (
          typeof value === 'string' &&
          (value.trim() === '' || value === null)
        ) {
          return true
        } else if (typeof value === 'number' && value === 0) {
          return true
        } else if (Array.isArray(value) && value.length === 0) {
          return true
        } else if (
          typeof value === 'object' &&
          this.hasEmptyNestedProperties(value)
        ) {
          return true
        }
      }
    }

    return false
  },
  isSame (strings = []) {
    return strings.every(str => str === strings[0])
  }
}

export const validateEmail = email => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
}

/**
 * Function to trim string and add ellipsis at the end of it. Similar to `text-overflow` behaviour from CSS.
 * @param {''} source The source string
 * @param {1} length The length, which the string should be trimmed to. Defaults to `1`
 * @param {''} ellipsis The character to use as the ellipsis. Defaults to `.` (dot)
 * @param {3} ellipsisCount The ellipsis count. Defined how many times to add the specified `ellipsis` at the end of the trimmed string.
 * @returns The trimmed string with added ellipsis suffix
 */
export function trimString (source, length, ellipsis = '.', ellipsisCount = 3) {
  if (length <= 0) {
    console.warn(
      `You wanted to trim the string "${source}" with length set to <= 0. The trimming will fail now.`
    )
    return
  }
  if (source.length <= length) return source

  return source.substring(0, length) + ellipsis.repeat(ellipsisCount)
}

/**
 * Capitalizes the first letter of a string and returns the updated string.
 * @param {''} s Source string
 * @returns
 */
export const capitalizeFirst = s => `${s[0].toUpperCase()}${s.slice(1)}`

export function getURLProtocol (url) {
  const match = /^([a-zA-Z]+):\/\//.exec(url)
  if (match) {
    return match[1]
  } else {
    return null
  }
}
