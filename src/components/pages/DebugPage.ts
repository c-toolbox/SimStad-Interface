import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Legend } from "@/components/Legend";

export class DebugPage extends Page {
	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		let background = layout.addRect(scene, layout.panel, Color.Slate800);
		this.add(background);

		let title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top,
			size: 64,
			color: "white",
			text: "Debug",
		});
		this.add(title);

		let subtitle = scene.addText({
			x: title.x,
			y: title.y + 1.5 * 64,
			size: 28,
			color: "white",
			text: "Debug page with direct access to certain behind the scenes calls.",
		});
		this.add(subtitle);

		let s = 30;
		let w = layout.panelInner.width / 2 - s / 2 - 100;
		let h = 64;
		let x = layout.panelInner.centerX - w / 2 - s / 2;
		let y = subtitle.y + 1.5 * subtitle.displayHeight + h;

		/* Debug buttons */

		this.addButton(x, y, w, h, "Ping", Color.Cyan700, () => {
			this.socket.sendPing();
		});

		x += w + s;
		this.addButton(x, y, w, h, "Recache database", Color.Cyan700, () =>
			this.socket.sendReCacheDatabase()
		);

		x -= w + s;
		y += h + s;
		this.addButton(x, y, w, h, "Add light", Color.Green700, () => {
			this.socket.send({
				type: "MapLightRequest",
				name: "something",
				northing: (129411.4 + 134211.4) / 2,
				easting: (6495015.262 + 6498915.262) / 2,
				height: 200.0,
				color: "#ffffff",
				typeofmessage: "add",
				enable: true,
			});
		});

		x += w + s;
		this.addButton(x, y, w, h, "Remove light", Color.Red800, () => {
			this.socket.send({
				type: "MapLightRequest",
				name: "something",
				northing: (129411.4 + 134211.4) / 2,
				easting: (6495015.262 + 6498915.262) / 2,
				height: 200.0,
				color: "#ffffff",
				typeofmessage: "delete",
				enable: true,
			});
		});

		x -= w + s;
		y += h + s;
		this.addButton(x, y, w, h, "Add marker", Color.Green700, () => {
			this.socket.send({
				type: "MapMarkerRequest",
				northing: (129411.4 + 134211.4) / 2,
				easting: (6495015.262 + 6498915.262) / 2,
				typeofmessage: "On", // On/Off/3sec/5sec/..
				enable: true,
			});
		});

		x += w + s;
		this.addButton(x, y, w, h, "Remove marker", Color.Red800, () => {
			this.socket.send({
				type: "MapMarkerRequest",
				northing: (129411.4 + 134211.4) / 2,
				easting: (6495015.262 + 6498915.262) / 2,
				typeofmessage: "Off",
				enable: true,
			});
		});

		x -= w + s;
		y += h + s;
		this.addButton(x, y, w, h, "Traffic on", Color.Green700, () => {
			this.socket.sendActivateTraffic();
		});

		x += w + s;
		this.addButton(x, y, w, h, "Traffic off", Color.Red800, () => {
			this.socket.sendDeactivateTraffic();
		});

		x -= w + s;
		y += h + s;
		this.addButton(x, y, w, h, "River on", Color.Green700, () => {
			this.socket.send({
				type: "ActivateDatasetRequest",
				datasets: "RiverFlow",
			});
		});

		x += w + s;
		this.addButton(x, y, w, h, "River off", Color.Red800, () => {
			this.socket.send({
				type: "DeactivateDatasetRequest",
				datasets: "RiverFlow",
			});
		});

		x -= w + s;
		y += h + s;
		this.addButton(x, y, w, h, "Activate Movie", Color.Green700, () => {
			this.socket.send({
				type: "ActivateDatasetRequest",
				datasets: "Idle/Idle_Movie",
			});
		});

		x += w + s;
		this.addButton(x, y, w, h, "Deactivate Movie", Color.Red800, () => {
			this.socket.sendReset();
		});

		x -= w + s;
		y += h + s;
		this.addButton(x, y, w, h, "Show logging", Color.Green700, () => {
			this.socket.setLoggingEnabled(true);
		});

		x += w + s;
		this.addButton(x, y, w, h, "Hide logging", Color.Red800, () => {
			this.socket.setLoggingEnabled(false);
		});
	}

	update(time: number, delta: number) {
		super.update(time, delta);
	}
}
