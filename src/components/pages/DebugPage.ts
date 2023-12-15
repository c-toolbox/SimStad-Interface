import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";

export class DebugPage extends Page {
	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		let title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top,
			size: 100,
			color: "white",
			text: "Debug",
		});
		this.add(title);

		let s = 30;
		let w = 220;
		let h = 64;
		let x = layout.panelInner.left + w / 2;
		let y = layout.panelInner.bottom - h / 2;

		/* Debug buttons */

		w = layout.panelInner.width / 2 - s;
		h = 64;
		x = layout.panelInner.left + w / 2;
		y = layout.panelInner.top + 1.3 * title.displayHeight + h / 2;
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
			this.socket.sendActivateTraffic();
		});

		x += w + s;
		this.addButton(x, y, w, h, "Traffic off", Color.Rose900, () => {
			this.socket.sendDeactivateTraffic();
		});

		x -= w + s;
		y += h + s;
		this.addButton(x, y, w, h, "Render layout", Color.Indigo700, () => {
			layout.drawLayout(this.scene);
		});
	}

	update(time: number, delta: number) {
		super.update(time, delta);
	}
}
