import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";
import { scenarioManager } from "@/utils/ScenarioManager";

export class HomePage extends Page {
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

		let scenariosKeys = scenarioManager.getScenarioKeys();
		let bg = 32;
		let bw = (layout.panelInner.width - bg) / 2;
		let bh = 64;
		for (let i = 0; i < scenariosKeys.length; i++) {
			let button = this.addButton(
				layout.panelInner.left + bw / 2 + (i % 2) * (bw + bg),
				layout.panelInner.bottom - bh / 2 - Math.floor(i / 2) * (bh + bg),
				bw,
				bh,
				scenariosKeys[i] + "title",
				Color.Yellow600,
				() => {
					this.emit("scenario", scenariosKeys[i]);
				}
			);
		}

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
	}
}
