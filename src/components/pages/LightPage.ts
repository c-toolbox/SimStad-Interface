import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { TimeSetter } from "@/components/TimeSetter";
import { Map } from "@/components/Map";
import { SunDial } from "@/components/SunDial";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";

export class LightPage extends Page {
	private timeSetter: TimeSetter;
	private map: Map;
	private sunDial: SunDial;

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		let background = layout.addRect(scene, layout.panel, Color.Slate800);
		this.add(background);

		let title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top,
			size: 64,
			color: "white",
			text: "Light",
		});
		this.add(title);

		let subtitle = scene.addText({
			x: title.x,
			y: title.y + 1.5 * 64,
			size: 28,
			color: "white",
			text: "Settings for time of year and time of day.",
		});
		subtitle.setWordWrapWidth(layout.panelInner.width);
		this.add(subtitle);

		let th = 250;
		let tw = layout.panelInner.width - th - layout.separation;
		this.timeSetter = new TimeSetter(
			scene,
			layout.panelInner.left + tw / 2,
			layout.panelInner.centerY,
			tw,
			th
		);
		this.add(this.timeSetter);
		this.timeSetter.on(
			"setTime",
			(year: number, month: number, day: number, hour: number) => {
				this.socket.sendLight(year, month, day, hour);
				this.sunDial.setDate(month, day, hour);
			}
		);

		this.sunDial = new SunDial(
			scene,
			layout.panelInner.right - th / 2,
			this.timeSetter.y,
			0.75 * th,
			th
		);
		this.add(this.sunDial);

		this.map = new Map(this.scene, socket);
		this.add(this.map);
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.timeSetter.update(time, delta);
		this.map.update(time, delta);
	}
}
