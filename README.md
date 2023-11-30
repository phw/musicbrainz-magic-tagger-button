# MusicBrainz Magic Tagger Button user script

This is a browser user script to enable the green tagger button ![Open in tagger](https://staticbrainz.org/MB/mblookup-tagger-b8fe559.png)
on [musicbrainz.org](https://musicbrainz.org), which is used to send a release or recording to
[MusicBrainz Picard](https://picard.musicbrainz.org).

It will detect whether Picard is running and will enable the tagger buttons if they are disabled. It
will even auto detect the proper port on which Picard is listening.

In addition this script will improve the tagger buttons themselves. Instead of just being static images
they will change after being clicked, depending on whether the browser integration worked or not.

**Important:** To use this script in Chromium based browsers you must use MusicBrainz Picard 2.6.0b1 or later.
  In Firefox it works also with earlier versions of Picard, but using Picard 2.6 or later is still recommended.


## Installation

Install this script with your favorite user script manager (e.g. [Greasemonkey](https://www.greasespot.net/)
or [Violentmonkey](https://violentmonkey.github.io/)).

The latest version of this script to install is available at:

https://raw.githubusercontent.com/phw/musicbrainz-magic-tagger-button/main/mb-magic-tagger-button.user.js

Alternatively you can get the script from [Greasy Fork](https://greasyfork.org/de/scripts/422670-musicbrainz-magic-tagger-button).


## Gotchas

Some things to be aware off:

- You should use Picard 2.6.0b1 or later. This user script will not work with earlier versions of
  Picard when using Chromium based browsers (e.g. Google Chrome or Microsoft Edge). It currently
  will work on Firefox even with older Picard versions, but this could change in the future.
- This has been tested on latest versions of Firefox, Google Chrome, Microsoft Edge, Opera and Vivaldi
  using Greasemonkey, Violentmonkey and Tampermonkey. It might or might not work on other browsers or
  with other user script managers. The code assumes your browser supports modern JS features (at
  least ES2017).
- For Safari you need the [Userscripts](https://github.com/quoid/userscripts) extension version 4
  (which requires macOS 12.0+) and version 0.7 of MusicBrainz Magic Tagger Button.
  *The user script does not work in Safari with older versions of the Userscripts extension due
  to strict blocking of unencrypted connections even if they are local.*
- I still consider this experimental and a proof of concept. It works for me, but might not for you.
- It is recommended that you have configured Picard to use the default port 8000, but it has to be
  one port between 8000 - 8010.
- If for some obscure reason you have Picard running on a port outside of this port range it won’t
  work, you’ll have to edit the script for this. Or just configure Picard to run on port 8000 again.
- For detecting whether and on which port Picard is running this script performs HTTP GET requests
  on localhost against the above port range. If you have a local web server or anything else
  running on one of those ports better make sure it doesn’t do something unexpected. Proper software
  shouldn’t, but if you have setup a local webserver to delete all your files whenever you open
  https://localhost:8000 don’t come complain here.
- Activating the tagger button requires an automatic page reload. The script tries to avoid page
  reloads unless necessary. Let me know if the reload happens in a situation where it causes issues.


## License

MusicBrainz Magic Tagger Button © 2021-2023 Philipp Wolfer <ph.wolfer@gmail.com>

Published under the MIT license, see [LICENSE](./LICENSE) for details.
