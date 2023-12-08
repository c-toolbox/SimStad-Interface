import { BaseScene } from "@/scenes/BaseScene";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { Color } from "@/utils/colors";

import scenarioData from "@/data/scenarios.json";
import { ScrollArea } from "../elements/ScrollArea";
import { RoundRectangle } from "../elements/RoundRectangle";

export class ScenariosPage extends Page {
	private scrollArea: ScrollArea;

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
			text: "Scenarios",
		});
		this.add(title);

		let s = 20;
		let w = 220;
		let h = 64;
		let x = layout.left + w / 2;
		let y = layout.bottom - h / 2;
		this.addButton(x, y, w, h, "Back", Color.Slate600, () => {
			this.emit("state", PageState.Home);
		});
		this.addButton(layout.right - w / 2, y, w, h, "Reset", Color.Rose800, () => {
			this.emit("send", {
				type: "ResetDatasets",
			});
		});

		this.scrollArea = new ScrollArea(
			scene,
			layout.left,
			layout.top + 1.25 * title.displayHeight,
			layout.width,
			layout.height - 1.25 * title.displayHeight - h - s,
			0
		);
		this.add(this.scrollArea);

		let areaBackground = new RoundRectangle(scene, {
			x: this.scrollArea.centerX,
			y: this.scrollArea.centerY,
			width: this.scrollArea.width,
			height: this.scrollArea.height,
			radius: 16,
			color: Color.Slate700,
		});
		this.add(areaBackground);
		this.sendToBack(areaBackground);

		let i = 0;

		x = s;
		y = 1.5 * s;
		w = (this.scrollArea.width - 4 * s) / 3;

		scenarioData.scenarios.forEach((scenario) => {
			let label = this.scene.addText({
				x: this.scrollArea.width / 2,
				y: y,
				size: 30,
				text: scenario.title,
			});
			label.setOrigin(0.5);
			this.scrollArea.apply(label);

			let sx = s;
			let sy = y;
			let sw = this.scrollArea.width / 2 - 2 * s - label.displayWidth / 2;
			let sh = 1;
			let hrLeft = this.scene.add.rectangle(sx, sy, sw, sh, Color.White);
			hrLeft.setOrigin(0, 0.5);
			this.scrollArea.apply(hrLeft);

			sx = this.scrollArea.width - s;
			let hrRight = this.scene.add.rectangle(sx, sy, sw, sh, Color.White);
			hrRight.setOrigin(1.0, 0.5);
			this.scrollArea.apply(hrRight);

			y += 70;

			let bx = w / 2 + s;

			scenario.sections.forEach((section) => {
				section.sectionObject.forEach((object) => {
					let button = this.addButton(
						bx,
						y,
						w,
						h,
						object.title.replace("\\n", ""),
						Color.Green700,
						() => {
							this.emit("send", {
								type: "ActivateDatasets",
								datasets: object.filenames,
							});
						}
					);
					this.scrollArea.apply(button);

					bx += w + s;
					if (bx + w / 2 > this.scrollArea.width) {
						bx = w / 2 + s;
						y += h + s;
					}
				});
			});

			y += 110;
		});
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.scrollArea.update(time, delta);
	}
}
