import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";
import { Scenario, scenarioManager } from "@/utils/ScenarioManager";
import { ScenarioButton } from "../ScenarioButton";

export class HomePage extends Page {
	scenarioButtons: ScenarioButton[];

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		this.fadeDir *= -1;

		/* Background */

		let background = layout.addRect(scene, layout.panel, Color.Slate900);
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

		let M = 2;
		let N = 4;
		let bg = 48;
		let bw = (layout.panelInner.width - bg * (M - 1)) / M;
		let bh = (layout.panelInner.height - bg * (N - 1)) / N;
		let left = layout.panelInner.centerX - (bw + bg) * ((M - 1) / 2);
		let top = layout.panelInner.centerY - (bh + bg) * ((N - 1) / 2);

		this.scenarioButtons = [];
		scenarioManager.getScenarios().forEach((scenario: Scenario, i: number) => {
			let x = left + (bw + bg) * (i % 2);
			let y = top + (bh + bg) * Math.floor(i / 2);
			let text = scenario.id + "_title";

			let button = new ScenarioButton(
				this.scene,
				x,
				y,
				bw,
				bh,
				text,
				scenario.thumbnail
			);
			button.on(
				"click",
				() => {
					if (this.allowInput()) {
						this.emit("scenario", scenario.id);
					}
				},
				this
			);
			this.add(button);
			this.scenarioButtons.push(button);
		});

		// let nineslice = scene.add.nineslice(
		// 	layout.panel.centerX,
		// 	layout.panel.centerY,
		// 	"nineslice",
		// 	0,
		// 	256,
		// 	256,
		// 	256,
		// 	256,
		// 	256,
		// 	256
		// );
		// nineslice.setScale(8 / 256);
		// nineslice.setTint(Color.Slate700);
		// nineslice.setSize((layout.panel.width - 16) / (8 / 256), (layout.panel.height - 16) / (8 / 256));
		// this.add(nineslice);
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.scenarioButtons.forEach((button) => button.update(time, delta));
	}
}
