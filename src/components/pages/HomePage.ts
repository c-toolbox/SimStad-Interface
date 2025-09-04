import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";
import { Scenario, scenarioManager } from "@/utils/ScenarioManager";
import { ScenarioButton } from "../ScenarioButton";
import { languageManager } from "@/utils/LanguageManager";

export class HomePage extends Page {
	private title: Phaser.GameObjects.Text;
	private areas: Phaser.Geom.Rectangle[];
	private scenarioButtons: ScenarioButton[];

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		this.fadeDir *= -1;
		this.areas = this.getAreas();

		/* Background */

		let background = layout.addRect(scene, layout.panel, Color.Slate900);
		this.add(background);

		/* Text */

		this.title = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top - 10,
			size: 64,
			color: "white",
		});
		this.title.setShadow(0, 2, "#00000099", 8);
		languageManager.bind(this.title, "home_title");
		this.add(this.title);

		let bread = scene.addText({
			x: layout.panelInner.left,
			y: layout.panelInner.top + 66,
			size: 28,
			color: "white",
		});
		bread.setShadow(0, 2, "#00000099", 8);
		bread.setWordWrapWidth(layout.panelInner.width);
		languageManager.bind(bread, "home_bread");
		this.add(bread);

		let subtitle = scene.addText({
			x: layout.panelInner.left,
			y: this.areas[2].top - 64,
			size: 28,
			color: "white",
		});
		languageManager.bind(subtitle, "home_subtitle");
		subtitle.setShadow(0, 2, "#00000099", 8);
		subtitle.setWordWrapWidth(layout.panelInner.width);
		this.add(subtitle);

		/* Scenario buttons */

		this.scenarioButtons = [];
		scenarioManager.getScenarios().forEach((scenario: Scenario, i: number) => {
			let area = this.areas[i];
			let text = scenario.id + "_title";

			if (!area) {
				return console.error(
					`HomePage.getAreas has run out of areas. You are attempting to display too many scenarios.`
				);
			}

			let button = new ScenarioButton(
				this.scene,
				area.centerX,
				area.centerY,
				area.width,
				area.height,
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
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.scenarioButtons.forEach((button) => button.update(time, delta));
	}

	getAreas() {
		const areas: Phaser.Geom.Rectangle[] = [];
		const panel = layout.panelInner;

		const upperHeight = 0.3 * panel.height;
		const lowerHeight = 0.4 * panel.height;
		const gap = 48;

		const upperRects = this.getGrid(
			2,
			1,
			panel.left,
			panel.bottom - lowerHeight - upperHeight - 2 * gap,
			panel.width,
			panel.height / 4,
			gap
		);
		areas.push(...upperRects);

		const lowerRects = this.getGrid(
			3,
			2,
			panel.left,
			panel.bottom - lowerHeight,
			panel.width,
			lowerHeight,
			gap
		);
		areas.push(...lowerRects);

		return areas;
	}

	getGrid(
		M: number,
		N: number,
		left: number,
		top: number,
		width: number,
		height: number,
		gap: number
	): Phaser.Geom.Rectangle[] {
		let rectWidth = (width - gap * (M - 1)) / M;
		let rectHeight = (height - gap * (N - 1)) / N;

		let rects: Phaser.Geom.Rectangle[] = [];
		for (let i = 0; i < M * N; i++) {
			let x = left + (rectWidth + gap) * (i % M);
			let y = top + (rectHeight + gap) * Math.floor(i / M);
			rects.push(new Phaser.Geom.Rectangle(x, y, rectWidth, rectHeight));
		}
		return rects;
	}
}
