// ==UserScript==
// @name          MusicBrainz auto tagger button
// @description   Automatically enable the green tagger button on MusicBrainz.org depending on whether Picard is running.
// @version       0.2.0
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

function makeRequest (method, url) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.onload = function () {
      resolve({
        method: method,
        url: url,
        status: xhr.status,
        statusText: xhr.statusText,
        response: xhr.response,
        responseText: xhr.responseText,
      })
    }
    xhr.onerror = function () {
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
    if (text.match(/Nothing to see here/)) {
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
  for (let i = 0; i <= 20; i++) {
    const port = PICARD_DEFAULT_PORT + i
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
    }
  } else {
    console.log('Could not find Picard listening for tagger button')
  }
}

run()
