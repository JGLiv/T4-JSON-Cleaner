# T4 Cleaner

This is a simple Node web-app to act as a proxy for mobile and web apps needing JSON data from Terminal 4, as it often needs cleaning in various ways before being used.

### Installation

    npm install -g t4jsoncleaner

### Simple Usage:

    t4jsoncleaner -p 8080 -r http://www.mysite.ac.uk/

### Secure usage:

You will need a key in .p12 format, and a simple JSON file with the passphrase (Remember to keep this secure!), e.g.

file: key.json:

    {
      "passphrase":"mykeypass"
    }

Then you can run:

    t4jsoncleaner -p 8443 -r https://www.mysite.ac.uk/ -k myKey.p12 -c key.json
