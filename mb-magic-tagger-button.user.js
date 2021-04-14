// ==UserScript==
// @name          MusicBrainz Magic Tagger Button
// @description   Automatically enable the green tagger button on MusicBrainz.org depending on whether Picard is running.
// @version       0.5.2
// @author        Philipp Wolfer
// @namespace     https://uploadedlobster.com
// @license       MIT
// @icon          https://staticbrainz.org/MB/mblookup-tagger-b8fe559.png
// @match         https://*.musicbrainz.org/release-group/*
// @match         https://*.musicbrainz.org/release/*
// @match         https://*.musicbrainz.org/recording/*
// @match         https://*.musicbrainz.org/cdtoc/*
// @include       /^https://*.musicbrainz.org/search/
// @exclude       /^https://([.*].)?musicbrainz.org/release/add/
// @exclude       /^https://([.*].)?musicbrainz.org/release-group/.*/.*/
// @exclude       /^https://([.*].)?musicbrainz.org/cdtoc/.*/.*/
// @grant         none
// @inject-into   content
// @homepageURL   https://github.com/phw/musicbrainz-magic-tagger-button
// @downloadURL   https://raw.githubusercontent.com/phw/musicbrainz-magic-tagger-button/main/mb-magic-tagger-button.user.js
// ==/UserScript==

const TAGGER_HOST = '127.0.0.1'
const TAGGER_DEFAULT_PORT = 8000
const TAGGER_MAX_PORT = 8010

const TAGGER_ERROR_MESSAGE = 'Loading this release or recording into MusicBrainz Picard failed.\nPlease make sure Picard is running and the browser integration is activated.'
const TAGGER_ICON_SUCCESS = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAANCAMAAAADg7fkAAAAUVBMVEUAAAAzMzM/OzxDQ0NMSUpVVlhaV1hmZmZ2c3R7fHWEhX2Nj4WXmIyZmZmfoaShopOqq5isq6uvmv+zs566ubnDw6fMy6zMzMzW1dXj4+P///9p+Ql3AAAAhElEQVQoz42RUQ+CMAyEe0NBx+aGYNX9/x9qRyFkL9h7uDTdl+aWo1I1Ofov4T6XLrB/nquSEZ7ZQt4ws4lcMId+XEnSzWa0G20rlxMe13En62trOggJ9rHEoSXXUzodpEsZEcFwU3JmHzSnJjsOtznLhGz7uxSE+8tGlm8PW0eit6H3H3qWGo9r6lL+AAAAAElFTkSuQmCC'
const TAGGER_ICON_ERROR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAANCAMAAAADg7fkAAAAUVBMVEUAAAAzMzM/OzxDQ0NMSUpVVlhaV1hmZmZ2c3R7fHWEhX2Nj4WXmIyZmZmfoaShopOqq5isq6uzs566ubnDw6fMy6zMzMzW1dXj4+P/Zmb///8r7DMeAAAAh0lEQVQoz42RyQ6DMAxEM0BpCUkJi2mT///QJpgIq4fWI3k5PI3GsklFc2P+K3OvrnVk428V0sMSacgHFlKRKxbXjyeZ0xzFLV5bmU2Y8LyNJ8llvttBgqxP/l49o/Bk8vKcAjyc9BRehreaM1gncwqu4nz7jKC7PT8Iw6Yj07uH7kdZu+LvH+KRIrjjFXuTAAAAAElFTkSuQmCC'

function logger (level, ...args) {
  if (!console) {
    return
  }

  let func = console.log
  if (level && typeof console[level] === 'function') {
    func = console[level]
  }

  func('[Magic Tagger Button]', ...args)
}

const debug = (...args) => logger('debug', ...args)
const log = (...args) => logger('log', ...args)
const warn = (...args) => logger('warn', ...args)
const error = (...args) => logger('error', ...args)

function makeRequest (method, url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.onload = () => {
      resolve({
        method: method,
        url: url,
        status: xhr.status,
        statusText: xhr.statusText,
        response: xhr.response,
        responseText: xhr.responseText,
      })
    }
    xhr.onerror = () => {
      reject({
        method: method,
        url: url,
        status: xhr.status,
        statusText: xhr.statusText
      })
    }
    xhr.send()
  })
}

async function probeTagger (port) {
  try {
    const response = await makeRequest('GET', `http://${TAGGER_HOST}:${port}`)
    debug(response)
    const text = response.responseText || ''
    if (text.match(/MusicBrainz-Picard/) || text.match(/Nothing to see here/)) {
      return true
    } else {
      return false
    }
  } catch (reason) {
    warn(reason)
    return false
  }
}

async function detectTaggerPort () {
  for (let port = TAGGER_DEFAULT_PORT; port <= TAGGER_MAX_PORT; port++) {
    debug(`Probing port ${port}`)
    if (await probeTagger(port)) {
      return port
    }
  }
}

function findTaggerButton () {
  const buttons = document.getElementsByClassName('tagger-icon')
  if (buttons[0] && buttons[0].href) {
    const url = new URL(buttons[0].href)
    return {
      protocol: url.protocol,
      host: url.host,
      port: parseInt(url.port, 10)
    }
  }
}

function setTaggerButtonStatus (button, icon, title) {
  button.setAttribute('title', title)
  const img = button.getElementsByTagName('img')[0]
  img.setAttribute('src', icon)
}

function improveTaggerButtons () {
  const taggerButtons = document.getElementsByClassName('tagger-icon')

  for (const button of taggerButtons) {
    const newButton = button.cloneNode(true)
    button.parentNode.replaceChild(newButton, button)
    newButton.addEventListener('click', async (event) => {
      event.preventDefault()
      const url = newButton.href
      debug('Tagger button clicked', url)
      try {
        const response = await makeRequest('GET', url)
        if (response.status >= 200 && response.status < 400) {
          debug('Tagger request successful', response.responseText)
          setTaggerButtonStatus(newButton, TAGGER_ICON_SUCCESS, response.responseText)
        } else {
          error('Tagger request was answered with an error', response)
          setTaggerButtonStatus(newButton, TAGGER_ICON_ERROR, TAGGER_ERROR_MESSAGE)
        }
      } catch (reason) {
        error('Tagger request error', reason)
        setTaggerButtonStatus(newButton, TAGGER_ICON_ERROR, TAGGER_ERROR_MESSAGE)
      }
    })
  }
}

function findCurrentlyUsedTaggerPort () {
  const url = new URL(document.location.href)

  const tport = parseInt(url.searchParams.get('tport'), 10)
  if (tport) {
    return tport
  }

  const taggerInfo = findTaggerButton()
  if (taggerInfo) {
    return taggerInfo.port
  }
}

function reloadWithTaggerPort (port) {
  const url = new URL(document.location.href)
  url.searchParams.set('tport', port)
  document.location.href = url
}

function checkCurrentPageExcluded () {
  const url = new URL(document.location.href)

  // Special handling for search pages
  if (url.pathname === '/search' && !['release', 'recording'].includes(url.searchParams.get('type'))) {
    debug(`No tagger buttons on ${url.searchParams.get('type')} search page.`)
    return true
  }

  return false
}

async function run () {
  if (checkCurrentPageExcluded()) {
    return
  }

  log('Initializing MusicBrainz Magic Tagger Button!')

  const currentPort = findCurrentlyUsedTaggerPort()

  if (currentPort) {
    improveTaggerButtons()
  }

  if (currentPort && await probeTagger(currentPort)) {
    log(`Tagger button configured for port ${currentPort}.`)
    return
  }

  const taggerPort = await detectTaggerPort()
  if (taggerPort) {
    log(`Found Picard listening on port ${taggerPort}.`)
    if (currentPort !== taggerPort) {
      log(`Reloading to activate tagger button on port ${taggerPort}...`)
      reloadWithTaggerPort(taggerPort)
    } else {
      debug('Tagger button already active')
    }
  } else {
    log('Could not find Picard listening for tagger button')
  }
}

run()
