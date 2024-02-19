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

		const chapters: { [key in ScenarioKey]: string } = {
			sammansattning: "crowd",
			utveckling: "cranes",
			rorelse: "tram",
			klimatet: "umbrella",
			ovan: "history",
			ai: "ai",
			// "sunlight"
		};

		let bg = 64;
		let bw = (layout.panelInner.width - bg) / 2 - 50;
		let bh = bw / 2;
		this.scenarioButtons = [];
		Object.values(ScenarioKey).forEach((key: ScenarioKey, i: number) => {
			let x = layout.panelInner.centerX - (bw + bg) / 2 + (i % 2) * (bw + bg);
			let y =
				layout.panelInner.centerY - bh - bg + Math.floor(i / 2) * (bh + bg);
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

			if (key == ScenarioKey.ai) {
				button.disable();
			}
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
