import { BaseScene } from "@/scenes/BaseScene";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { Color } from "@/utils/colors";

export class DebugPage extends Page {
	constructor(
		scene: BaseScene,
		state: PageState,
		layout: Phaser.Geom.Rectangle
	) {
		super(scene, state, layout);

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
		this.addButton(x, y, w, h, "Ping Request", Color.Red700, () => {
			this.emit("send", {
				type: "PingRequest",
			});
		});

		x += w + s;
		this.addButton(x, y, w, h, "Scenarios Request", Color.Amber700, () => {
			this.emit("send", {
				type: "ScenariosRequest",
			});
		});

		x -= w + s;
		y += h + s;
		this.addButton(x, y, w, h, "MapLightRequest", Color.Lime700, () => {
			this.emit("send", {
				type: "MapLightRequest",
				Name: "#sdlfkjsdlkf",
				Northing: 12231112.24464522,
				Easting: 60434345.00022222,
				Height: 50.0,
				Color: "#ff0000",
				Typeofmessage: "add",
				Enable: true,
			});
		});

		x += w + s;
		this.addButton(x, y, w, h, "Activate Dataset", Color.Blue700, () => {
			this.emit("send", {
				type: "ActiveDatasetRequest",
				datasets: "Nkpg/Cali_1,Nkpg/Cali_2",
			});
		});
	}

	update(time: number, delta: number) {
		super.update(time, delta);
	}
}
