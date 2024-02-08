import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";
import { ScenarioKey, scenarioManager } from "@/utils/ScenarioManager";
import { ScenarioButton } from "../ScenarioButton";

export class HomePage extends Page {
	scenarioButtons: ScenarioButton[];

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		/* Background */

		let background = layout.addRect(scene, layout.panel, Color.Slate800);
		this.add(background);

		/* Text */

		let title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top,
			size: 64,
			color: "white",
		});
		this.add(title);

		let bread = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top + 1.5 * title.displayHeight,
			size: 28,
			color: "white",
		});
		this.add(bread);
		bread.setWordWrapWidth(layout.panelInner.width);

		/* Scenario buttons */

		const chapters: { [key in ScenarioKey]: string } = {
			rorelse: "tram",
			klimatet: "umbrella",
			sammansattning: "crowd",
			utveckling: "cranes",
			// "sunlight"
		};

		let bg = 32;
		let bw = (layout.panelInner.width - bg) / 2;
		let bh = bw / 2;
		this.scenarioButtons = [];
		Object.values(ScenarioKey).forEach((key: ScenarioKey, i: number) => {
			let x = layout.panelInner.left + bw / 2 + (i % 2) * (bw + bg);
			let y = layout.panelInner.centerY + bh / 2 - Math.floor(i / 2) * (bh + bg);
			let w = bw;
			let h = bh;
			let text = key + "title";
			let color = Color.Yellow600;

			let button = new ScenarioButton(
				this.scene,
				x,
				y,
				w,
				h,
				text,
				color,
				chapters[key]
			);
			button.on(
				"click",
				() => {
					this.emit("scenario", key);
				},
				this
			);
			this.add(button);
			this.scenarioButtons.push(button);
		});

		// let cx = layout.panelInner.centerX;
		// let cy = layout.panelInner.centerY;
		// let w = 512;
		// let h = 160;
		// let c1 = scene.add.image(cx-w, cy-h, "crowd");
		// c1.setScale(400 / 512);
		// this.add(c1);
		// let c2 = scene.add.image(cx, cy-h, "sunlight");
		// c2.setScale(400 / 512);
		// this.add(c2);
		// let c3 = scene.add.image(cx-w, cy, "umbrella");
		// c3.setScale(400 / 512);
		// this.add(c3);
		// let c4 = scene.add.image(cx, cy, "tram");
		// c4.setScale(400 / 512);
		// this.add(c4);
		// let c5 = scene.add.image(cx-w, cy+h, "cranes");
		// c5.setScale(400 / 512);
		// this.add(c5);
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.scenarioButtons.forEach((button) => button.update(time, delta));
	}
}
