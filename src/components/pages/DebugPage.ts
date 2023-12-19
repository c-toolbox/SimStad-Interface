import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";

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
			text: "Debug page with direct access to certain behind the scenes calls. Intended for advanced mode.",
		});
		this.add(subtitle);

		let s = 30;
		let w = layout.panelInner.width / 2 - s / 2;
		let h = 64;
		let x = layout.panelInner.left + w / 2;
		let y = subtitle.y + 1.5 * subtitle.displayHeight + h;

		/* Debug buttons */

		this.addButton(x, y, w, h, "Ping", Color.Red700, () => {
			this.socket.sendPing();
		});

		x += w + s;
		this.addButton(x, y, w, h, "Reload scenarios", Color.Amber700, () =>
			this.socket.sendScenariosRequest()
		);

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
		this.addButton(x, y, w, h, "Render layout", Color.Pink800, () => {
			layout.drawLayout(this.scene);
		});

		x -= w + s;
		y += h + s;
		this.addButton(x, y, w, h, "Traffic on", Color.Indigo600, () => {
			this.socket.sendActivateTraffic();
		});

		x += w + s;
		this.addButton(x, y, w, h, "Traffic off", Color.Indigo800, () => {
			this.socket.sendDeactivateTraffic();
		});
	}

	update(time: number, delta: number) {
		super.update(time, delta);
	}
}
