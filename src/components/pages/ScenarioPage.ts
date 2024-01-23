import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";
import { LargeLegend } from "@/scenes/LegendScene";
import { HSVToRGB, colorToString, interpolateColor } from "@/utils/functions";

export class ScenarioPage extends Page {
	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		let background = layout.addRect(scene, layout.scenario, Color.Slate800);
		this.add(background);

		/* Text */

		let title = scene.addText({
			x: layout.scenarioInfo.left,
			y: layout.scenarioInfo.top,
			size: 64,
			color: "white",
		});
		this.add(title);
		languageManager.bind(title, "bread_title");

		let bread = scene.addText({
			x: layout.scenarioInfo.left,
			y: layout.scenarioInfo.top + 1.5 * title.displayHeight,
			size: 28,
			color: "white",
		});
		this.add(bread);
		languageManager.bind(bread, "bread_text");
		bread.setWordWrapWidth(layout.scenarioInfo.width);

		/* Legend */

		let lw = layout.scenarioLegend.width;
		let lh = layout.scenarioLegend.height;
		let lx = layout.scenarioLegend.centerX;
		let ly = layout.scenarioLegend.centerY;
		let legend = new LargeLegend(scene, lx, ly, lw, lh);
		this.add(legend);
		const stops: { color: string; text: string }[] = [];
		for (let i = 0; i < 8; i++) {
			stops.push({
				color: colorToString(HSVToRGB(i / 8, 1, 1)),
				text: "Label " + (i + 1),
			});
		}
		legend.loadLegend("Title", stops);

		/* Buttons */

		const bl = layout.scenarioControls;
		const bn = 3;
		const bw = (bl.width - (bn - 1) * layout.separation) / bn;
		const by = bl.centerY;
		const bh = bl.height;
		for (let i = 0; i < 3; i++) {
			let t = "Datalayer " + (i + 1);
			let bx = bl.left + (i + 0.5) * bw + i * layout.separation;
			this.addButton(bx, by, bw, bh, t, Color.Red700, () => {});
		}

		/* Tabs */
		const tn = 3;
		const tl = layout.scenarioTabs;
		const tw = (tl.width - (tn - 1) * layout.separation) / tn;
		const ty = tl.centerY;
		const th = tl.height;
		for (let i = 0; i < 3; i++) {
			let t = "Datalayer " + (i + 1);
			let tx = tl.left + (i + 0.5) * tw + i * layout.separation;
			this.addButton(tx, ty, tw, th, t, Color.Slate700, () => {});
		}
	}

	update(time: number, delta: number) {
		super.update(time, delta);
	}
}
