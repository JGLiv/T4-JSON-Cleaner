# T4 Cleaner

[![Build Status](https://travis-ci.org/JohnGilbertson/T4-JSON-Cleaner.svg?branch=master)](https://travis-ci.org/JohnGilbertson/T4-JSON-Cleaner)

This is a simple Node web-app to act as a proxy for mobile and web apps needing JSON data from Terminal 4, as it sometimes needs cleaning in various ways before being used. It won't fix every error you might see but is easily extensible.

## Installation

    npm install -g t4jsoncleaner

### Simple Startup:

    t4jsoncleaner -p 8080 -r http://www.mysite.ac.uk/

### Secure Startup:

You will need a key in .p12 format, and a simple JSON file with the passphrase (Remember to keep this secure!), e.g.

file: key.json:

    {
      "passphrase":"mykeypass"
    }

Then you can run:

    t4jsoncleaner -p 8443 -r https://www.mysite.ac.uk/ -k myKey.p12 -c key.json

## Usage

Point a web browser at http://your.server:8080/ (or the https equivalent) and you'll get a very basic interface to test the various filters on your JSON file, and it will tell you the simple endpoint URL to embed in your app/page to access the data with any given filter.

## Adding new filters

Create a new function in filters.js including info attribute for the documentation on the web front-end (don't forget to add them to the module.exports) and then add them into the list in server.js.
