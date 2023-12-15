import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { TimeSetter } from "@/components/TimeSetter";
import { layoutManager as layout } from "@/utils/LayoutManager";

export class LightPage extends Page {
	private timeSetter: TimeSetter;

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		let title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top,
			size: 100,
			color: "white",
			text: "Light",
		});
		this.add(title);

		this.timeSetter = new TimeSetter(
			scene,
			layout.panelInner.centerX,
			layout.panelInner.centerY
		);
		this.add(this.timeSetter);
		this.timeSetter.on(
			"setTime",
			(year: number, month: number, day: number, hour: number) => {
				// this.emit("setTime", year, month, day, hour);
				this.socket.sendLight(year, month, day, hour);
			}
		);
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.timeSetter.update(time, delta);
	}
}
