# Open Smart Environment - HTML5 frontend
OSE package providing an mobile-first HTML5 user interface.

Each browser page (tab) displaying the OSE frontend is an [OSE
instance](http://opensmartenvironment.github.io/doc/#oseinstance). As part of the base [OSE plugin](http://opensmartenvironment.github.io/doc/#oseplugin) configuration, a
[peer](http://opensmartenvironment.github.io/doc/#peer), representing the backend OSE instance, is created and
connected to.

The connection is realized via a WebSocket in a standard OSE
[peer-to-peer](http://opensmartenvironment.github.io/doc/#peer-to-peer) way. All information needed for displaying requested
content is exchanged through this WebSocket channel. After a
successful connection is established, content is displayed using
dynamic injection.

## Features
- HTML5 user interface optimized for phones and tablets

## Important links
This package is a part of the OSE suite. For more information, see the following links:
- [HTML5 frontend documentation](http://opensmartenvironment.github.io/doc/#html5)
- [OSE suite documentation](http://opensmartenvironment.github.io/doc/)
- [All packages](https://github.com/opensmartenvironment/)

## About OSE
<b>Open Smart Environment software is a suite for creating
multi-instance applications that work as a single whole.</b><br>
Imagine, for example, a personal mesh running on various devices
including HTPCs, phones, tablets, workstations, servers, Raspberry
Pis, home automation gadgets, wearables, drones, etc.

OSE software consists of several npm packages: a [framework](http://opensmartenvironment.github.io/doc/#framework) running
on Node.js, an [HTML5 frontend](http://opensmartenvironment.github.io/doc/#html5frontend), extending
packages and a set of example applications.

<a href="http://opensmartenvironment.github.io/doc/resource/ose.svg"><img width=100% src="http://opensmartenvironment.github.io/doc/resource/ose.svg"></a>

**Set-up of current example applications.** Here,
OSE provides a [Media player](http://opensmartenvironment.github.io/doc/#example-player) running on an HTPC
that can be controlled by an IR remote through
[LIRC](http://opensmartenvironment.github.io/doc/#example-lirc) and is capable of playing streams from a
[DVB streamer](http://opensmartenvironment.github.io/doc/#example-dvb) and control devices through GPIO
pins on a [Raspberry Pi](http://opensmartenvironment.github.io/doc/#example-rpi)

For more information about OSE see **[the documentation](http://opensmartenvironment.github.io/doc/)**.

## Status
- Pre-alpha stage (insecure and buggy)
- Unstable API
- Patchy documentation
- No test suite

This is not yet a piece of download-and-use software. It is important
to understand the basic principles covered by the
[documentation](http://opensmartenvironment.github.io/doc/).

## Platforms
OSE has the following prerequisites:
- Node.js (>0.10) running on Debian Jessie and Raspbian
- Firefox 37 or newer with Web Components enabled

## Licence
This software is released under the terms of the [GNU General
Public Licence v3.0](http://www.gnu.org/copyleft/gpl.html) or
later.