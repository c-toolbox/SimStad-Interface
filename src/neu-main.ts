import * as Neutralino from "@neutralinojs/lib";

if (window.NL_TOKEN) {
	Neutralino.init();
	Neutralino.window.center();
	Neutralino.events.on("windowClose", () => {
		Neutralino.app.exit();
	});
}
