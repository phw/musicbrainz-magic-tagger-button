# MusicBrainz Auto Tagger Button user script

This is a browser user script to enable the green tagger button ![Open in tagger](https://staticbrainz.org/MB/mblookup-tagger-b8fe559.png)
on [musicbrainz.org](https://musicbrainz.org), which is used to send a release to [MusicBrainz Picard](https://picard.musicbrainz.org).

It will detect whether Picard is running and will enable the tagger buttons if they are disabled. It
will even auto detect the proper port on which Picard is listening.


## Installation

Install this script with your favorite user script manager (e.g. [Greasemonkey](https://www.greasespot.net/)
or [Violentmonkey](https://violentmonkey.github.io/)).

The latest version of this script to install is available at:

https://raw.githubusercontent.com/phw/musicbrainz-auto-tagger-button/main/mb-auto-tagger-button.user.js


## Gotchas

Some things to be aware off:

- This has been tested only on latest Firefox with Greasemonkey and Violentmonkey. It might or might
  not work on other browsers. The code assumes your browser supports modern JS features.
- Actually this hasn’t been tested properly at all. It works here for me, but might not for you. For
  now this is a proof of concept.
- For detecting whether and on which port Picard is running this script performs HTTP GET requests
  on localhost against the ports 8000 - 8020. If you have a local web server or anything else
  running on one of those ports better make sure it doesn’t do something unexpected. Proper software
  shouldn’t, but if you have setup a local webserver to delete all your files whenever you open
  https://localhost:8000 don’t come complain here.
- If for some obscure reason you have Picard running on a port outside of this port range it won’t
  work, you’ll have to edit the script for this. Or just configure Picard to run on port 8000 again.
- Activating the tagger button requires an automatic page reload. The script tries to avoid page
  reloads unless necessary. Let me know if the reload happens in a situation where it causes issues.
- Once the tagger button is displayed, it won’t go away even if you close Picard. I found no way to
  tell MB.org to forget about the `tport` parameter again.


## License

MusicBrainz Auto Tagger Button © 2021 Philipp Wolfer <ph.wolfer@gmail.com>

Published under the MIT license, see LICENSE for details.