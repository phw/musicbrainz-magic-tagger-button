// ==UserScript==
// @name          MusicBrainz auto tagger button
// @description   Automatically enable the green tagger button on MusicBrainz.org depending on whether Picard is running.
// @version       0.4.0
// @author        Philipp Wolfer
// @namespace     https://uploadedlobster.com
// @icon          https://staticbrainz.org/MB/mblookup-tagger-b8fe559.png
// @match         https://*.musicbrainz.org/release-group/*
// @match         https://*.musicbrainz.org/release/*
// @match         https://*.musicbrainz.org/recording/*
// @match         https://*.musicbrainz.org/cdtoc/*
// @include       /^https://*.musicbrainz.org/search/
// @exclude       /^https://([.*].)?musicbrainz.org/release-group/.*/.*/
// @exclude       /^https://([.*].)?musicbrainz.org/cdtoc/.*/.*/
// @grant         none
// @inject-into   content
// @homepageURL   https://github.com/phw/musicbrainz-auto-tagger-button
// @downloadURL   https://raw.githubusercontent.com/phw/musicbrainz-auto-tagger-button/main/mb-auto-tagger-button.user.js
// ==/UserScript==

const PICARD_URL = 'http://127.0.0.1'
const PICARD_DEFAULT_PORT = 8000
const PICARD_MAX_PORT = 8010

const TAGGER_ERROR_MESSAGE = 'Loading this release or recording into MusicBrainz Picard failed.\nPlease make sure Picard is running and the browser integration is activated.'
const TAGGER_ICON_SUCCESS = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAANCAMAAAADg7fkAAAAUVBMVEUAAAAzMzM/OzxDQ0NMSUpVVlhaV1hmZmZ2c3R7fHWEhX2Nj4WXmIyZmZmfoaShopOqq5isq6uvmv+zs566ubnDw6fMy6zMzMzW1dXj4+P///9p+Ql3AAAAhElEQVQoz42RUQ+CMAyEe0NBx+aGYNX9/x9qRyFkL9h7uDTdl+aWo1I1Ofov4T6XLrB/nquSEZ7ZQt4ws4lcMId+XEnSzWa0G20rlxMe13En62trOggJ9rHEoSXXUzodpEsZEcFwU3JmHzSnJjsOtznLhGz7uxSE+8tGlm8PW0eit6H3H3qWGo9r6lL+AAAAAElFTkSuQmCC'
const TAGGER_ICON_ERROR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAANCAMAAAADg7fkAAAAUVBMVEUAAAAzMzM/OzxDQ0NMSUpVVlhaV1hmZmZ2c3R7fHWEhX2Nj4WXmIyZmZmfoaShopOqq5isq6uzs566ubnDw6fMy6zMzMzW1dXj4+P/Zmb///8r7DMeAAAAh0lEQVQoz42RyQ6DMAxEM0BpCUkJi2mT///QJpgIq4fWI3k5PI3GsklFc2P+K3OvrnVk428V0sMSacgHFlKRKxbXjyeZ0xzFLV5bmU2Y8LyNJ8llvttBgqxP/l49o/Bk8vKcAjyc9BRehreaM1gncwqu4nz7jKC7PT8Iw6Yj07uH7kdZu+LvH+KRIrjjFXuTAAAAAElFTkSuQmCC'

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
    const response = await makeRequest('GET', PICARD_URL + ':' + port)
    console.debug(response)
    const text = response.responseText || ''
    if (text.match(/MusicBrainz-Picard/) || text.match(/Nothing to see here/)) {
      return true
    } else {
      return false
    }
  } catch (reason) {
    console.warn(reason)
    return false
  }
}

async function detectTaggerPort () {
  for (let port = PICARD_DEFAULT_PORT; port <= PICARD_MAX_PORT; port++) {
    console.debug(`Probing port ${port}`)
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
      console.debug('Tagger button clicked', url)
      try {
        const response = await makeRequest('GET', url)
        if (response.status >= 200 && response.status < 400) {
          console.debug('Tagger request successful', response.responseText)
          setTaggerButtonStatus(newButton, TAGGER_ICON_SUCCESS, response.responseText)
        } else {
          console.error('Tagger request was answered with an error', response)
          setTaggerButtonStatus(newButton, TAGGER_ICON_ERROR, TAGGER_ERROR_MESSAGE)
        }
      } catch (reason) {
        console.error('Tagger request error', reason)
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
  console.log(url)
  document.location.href = url
}

function checkCurrentPageExcluded () {
  const url = new URL(document.location.href)

  // Special handling for search pages
  if (url.pathname === '/search' && !['release', 'recording'].includes(url.searchParams.get('type'))) {
    console.debug(`No tagger buttons on ${url.searchParams.get('type')} search page.`)
    return true
  }

  return false
}

async function run () {
  console.log('MusicBrainz auto tagger button!')

  if (checkCurrentPageExcluded()) {
    return
  }

  const currentPort = findCurrentlyUsedTaggerPort()

  if (currentPort && await probeTagger(currentPort)) {
    console.log(`Tagger button configured for port ${currentPort}.`)
    improveTaggerButtons()
    return
  }

  const taggerPort = await detectTaggerPort()
  if (taggerPort) {
    console.log(`Found Picard listening on port ${taggerPort}.`)
    if (currentPort !== taggerPort) {
      console.log('Reloading to activate tagger button...')
      reloadWithTaggerPort(taggerPort)
    } else {
      console.debug('Tagger button already active')
      improveTaggerButtons()
    }
  } else {
    console.log('Could not find Picard listening for tagger button')
  }
}

run()
