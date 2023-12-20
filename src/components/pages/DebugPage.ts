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
			text: "Debug page with direct access to certain behind the scenes calls. Intended for advanced mode.",
		});
		this.add(subtitle);

		let s = 30;
		let w = layout.panelInner.width / 3 - s * (2 / 3);
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

		/* Legends */

		let lw = layout.panelInner.width / 3 - layout.separation * (2 / 3);
		let lh = layout.panelInner.bottom - y - h / 2 - layout.separation;
		let ly = layout.panelInner.bottom - lh / 2;

		let lx = layout.panelInner.centerX - lw - layout.separation;
		let legend1 = new Legend(scene, lx, ly, lw, lh);
		this.add(legend1);
		lx = layout.panelInner.centerX;
		let legend2 = new Legend(scene, lx, ly, lw, lh);
		this.add(legend2);
		lx = layout.panelInner.centerX + lw + layout.separation;
		lh = layout.panelInner.height;
		ly = layout.panelInner.centerY;
		let legend3 = new Legend(scene, lx, ly, lw, lh);
		this.add(legend3);

		const stops1: { color: string; text: string }[] = [
			{ color: "#00aaff", text: "0,1 – 0,2 meter" },
			{ color: "#0000ff", text: "0,2 – 0,3 meter" },
			{ color: "#000078", text: "0,3 – 0,5 meter" },
			{ color: "#ffff00", text: "0,5 – 1 meter" },
			{ color: "#ff0000", text: "mer än 1 meter" },
		];
		legend1.loadLegend("Extrema regn – 100 år", stops1);

		const stops2: { color: string; text: string }[] = [
			{ color: "#f8fd35", text: "1 – 232" },
			{ color: "#fbd708", text: "232 – 630" },
			{ color: "#fc9f01", text: "630 – 1189" },
			{ color: "#f94804", text: "1189 – 1775" },
			{ color: "#d51b1c", text: "1775 – 2438" },
			{ color: "#8f110e", text: "2438 – 5739" },
		];
		legend2.loadLegend("Arbetsplatstäthet 2050", stops2);

		const stops3: { color: string; text: string }[] = [
			{ color: "#440154", text: "<1800" },
			{ color: "#482576", text: "1800 – 1850" },
			{ color: "#414387", text: "1850 – 1900" },
			{ color: "#345f8d", text: "1900 – 1920" },
			{ color: "#2a788e", text: "1920 – 1940" },
			{ color: "#21908d", text: "1940 – 1960" },
			{ color: "#23a884", text: "1960 – 1980" },
			{ color: "#43bf70", text: "1980 – 2000" },
			{ color: "#7ad151", text: "2000 – 2010" },
			{ color: "#bcdf27", text: "2010 – 2020" },
			{ color: "#fde725", text: "2020 – 2023" },
		];
		legend3.loadLegend("Byggnadsår", stops3);
	}

	update(time: number, delta: number) {
		super.update(time, delta);
	}
}
