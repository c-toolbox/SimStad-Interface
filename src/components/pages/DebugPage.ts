import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { Color } from "@/utils/colors";

export class DebugPage extends Page {
	constructor(
		scene: BaseScene,
		state: PageState,
		socket: SocketManager,
		layout: Phaser.Geom.Rectangle
	) {
		super(scene, state, socket, layout);

		let title = scene.addText({
			x: layout.left,
			y: layout.top,
			size: 100,
			color: "white",
			text: "Debug",
		});
		this.add(title);

		let s = 30;
		let w = 220;
		let h = 64;
		let x = layout.left + w / 2;
		let y = layout.bottom - h / 2;
		this.addButton(x, y, w, h, "Back", Color.Slate600, () => {
			this.emit("state", PageState.Home);
		});

		/* Debug buttons */

		w = layout.width / 2 - s;
		h = 64;
		x = layout.left + w / 2;
		y = layout.top + 1.3 * title.displayHeight + h / 2;
		this.addButton(x, y, w, h, "Ping", Color.Red700, () => {
			this.socket.send({
				type: "PingRequest",
			});
		});

		x += w + s;
		this.addButton(x, y, w, h, "Fetch scenarios", Color.Amber700, () => {
			this.socket.send({
				type: "ScenariosRequest",
			});
		});

		x -= w + s;
		y += h + s;
		this.addButton(x, y, w, h, "Add light", Color.Lime700, () => {
			this.socket.send({
				type: "MapLightRequest",
				Name: "something",
				Northing: 12231112.24464522,
				Easting: 60434345.00022222,
				Height: 50.0,
				Color: "#ff0000",
				Typeofmessage: "add",
				Enable: true,
			});
		});

		x += w + s;
		this.addButton(x, y, w, h, "KOllektivTrafik", Color.Blue700, () => {
			this.socket.send({
				type: "ActivateDatasetRequest",
				datasets: "Nkpg/KOllektivTraffik",
			});
		});

		x -= w + s;
		y += h + s;
		this.addButton(x, y, w, h, "Traffic on", Color.Rose700, () => {
			this.socket.send({
				type: "ActivateDatasetRequest",
				datasets: "ActivateTraffic",
			});
		});
		
		x += w + s;
		this.addButton(x, y, w, h, "Traffic off", Color.Rose900, () => {
			this.socket.send({
				type: "ActivateDatasetRequest",
				datasets: "DeactivateTraffic",
			});
		});

		// let icons = [
		// 	"map",
		// 	"layers",
		// 	"sunrise",
		// 	"gears",
		// 	"sun",
		// 	"list",
		// 	"gear-code",
		// 	"arrow-left",
		// 	"arrows-rotate",
		// 	"projector",
		// 	"wifi",
		// 	"wifi-slash",
		// 	"server",
		// 	"lightbulb",
		// 	"globe",
		// 	"arrows-swap",
		// ];
		// icons.map((key, index) => {
		// 	let s = 100;
		// 	let x = layout.left + s / 2 + s * (index % 4);
		// 	let y = layout.centerY + s * Math.floor(index / 4);
		// 	let icon = scene.add.image(x, y, key);
		// 	icon.setScale(s / icon.width);
		// 	this.add(icon);
		// });
	}

	update(time: number, delta: number) {
		super.update(time, delta);
	}
}
