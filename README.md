# DigitalTwinCity Interface

Phaser-driven interface for DigitalTwinCity.

## Quick start
### Prerequisites
* Git installed.
* Node 18+ installed.

### Steps
1. Clone the repository
2. `npm install`
3. `npm run dev`

Remember to update [`game.config.json`](game.config.json) accordingly.

## Building

1. `npm run build`
2. Build goes to `/dist` directory

## Debugging
This assumes you have VS Code and Chrome installed

* Hit F5 to debug
    * This will launch Vite and Chrome
    * You can now add breakpoints in VS Code
* Hit Shift+F5 twice to stop debugging

## System requirements
### Web
A modern up-to-date web browser

### Windows
* Microsoft Edge 89 or newer
* [WebView2](https://go.microsoft.com/fwlink/p/?LinkId=2124703) installed (Windows 11 has this preinstalled)

### MacOS
* Safari 15 or newer

### Linux
* WebKitGTK installed

## Notes
### Mac
The app is unsigned when built, so you need to follow these steps when distributing:
1. First you need to extract the .app from the .dmg before attempting to run the game.
2. Second, try running the game, a popup will say the app is unverified.
3. Right click/Open the context menu on the .app, hold option, click open.
4. Click open in the popup.

The game will start normally from now on.

### Linux
You may have to mark the games as executable before it will let you run them.

There have been reports of the game freezing, so the web version might be preferred in that case. 
