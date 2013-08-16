WIBAM (W2GI Internet Business Acquisition Module)
=================================================

Dependencies
------------

Hardware:

* Raspberry Pi (to use WIBAM-rpi)

Software:

* Node.js (>= 0.10)
* VLC

What is it???
-------------

A bell... that is connected to the internet.

Why????
-------

Many sales offices use a bell to tell every one that a sale has been made or a 
deal has been closed, but anyone in a remote office cannot hear the bell. 
So using a Raspberry Pi, a simple circuit, and a little bit of code, we can make
a bell that rings in many locations at once.

How to run
----------

### Server

Inside WIBAM-server/

```
node index.js
```

The server also includes a simple web server that serves a browser based client 
that can be used for testing with out a Pi. The default port is 8000 but that can
be changed by editing the file config.js.

### Pi

(Note: I have not made a seperate config file for this yet. You will have to edit 
index.js to point to the correct host, port, and audio file.)

On the Pi, inside WIBAM-rpi/

```
npm install vlc
sudo node index.js
```

This will listen for a HIGH signal on gpio pin 4, so attach your circut acordingly.
