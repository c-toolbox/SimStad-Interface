import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";
import { Legend } from "@/components/Legend";
import { HSVToRGB, colorToString, interpolateColor } from "@/utils/functions";
import { ScenarioKey, Section, scenarioManager } from "@/utils/ScenarioManager";
import { TextButton } from "../TextButton";
import { TestSlider } from "../TestSlider";
import { TabButton } from "../TabButton";

export class ScenarioPage extends Page {
	private subtitle: Phaser.GameObjects.Text;
	private title: Phaser.GameObjects.Text;
	private bread: Phaser.GameObjects.Text;
	private legend: Legend;
	private backButton: TextButton;
	private tabButtons: TextButton[];
	private layerButtons: TextButton[];
	private layerSlider: TestSlider;

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		let background = layout.addRect(scene, layout.scenario, Color.Slate800);
		this.add(background);

		/* Text */

		this.subtitle = scene.addText({
			x: layout.scenarioInfo.left,
			y: layout.scenarioInfo.top,
			size: 20,
			color: "white",
		});
		this.add(this.subtitle);

		this.title = scene.addText({
			x: layout.scenarioInfo.left,
			y: this.subtitle.y + 1.25 * this.subtitle.displayHeight,
			size: 58,
			color: "white",
		});
		this.add(this.title);

		this.bread = scene.addText({
			x: layout.scenarioInfo.left,
			y: this.title.y + 1.5 * this.title.displayHeight,
			size: 28,
			color: "white",
		});
		this.add(this.bread);
		this.bread.setLineSpacing(0.25 * 28);
		this.bread.setWordWrapWidth(layout.scenarioInfo.width);

		/* Legend */

		let lw = layout.scenarioLegend.width;
		let lh = layout.scenarioLegend.height;
		let lx = layout.scenarioLegend.centerX;
		let ly = layout.scenarioLegend.centerY;
		this.legend = new Legend(scene, lx, ly, lw, lh);
		this.add(this.legend);

		/* Layer buttons */

		const bl = layout.scenarioControls;
		const bn = 3;
		const bw = (bl.width - (bn - 1) * layout.separation) / bn;
		const by = bl.centerY;
		const bh = bl.height;
		const bc = Color.Yellow600;

		this.layerButtons = [];
		for (let i = 0; i < 3; i++) {
			let bt = "Layer " + (i + 1);
			let bx = bl.left + (i + 0.5) * bw + i * layout.separation;

			let button = new TextButton(scene, bx, by, bw, bh, bt, bc);
			this.add(button);
			this.layerButtons.push(button);
		}

		/* Tabs */

		const tn = 5;
		const tl = layout.scenarioTabs;
		const tw = (tl.width - (tn - 1) * layout.separation) / tn;
		const ty = tl.centerY;
		const th = tl.height;
		const tc = Color.Slate700;

		this.tabButtons = [];
		for (let i = 0; i < tn; i++) {
			let tt = "Tab " + (i + 1);
			let tx = tl.right - (i + 0.5) * tw - i * layout.separation;

			let button = new TextButton(scene, tx, ty, tw, th, tt, tc);
			this.add(button);
			this.tabButtons.push(button);
		}

		this.backButton = new TextButton(
			scene,
			tl.left + 0.5 * tw,
			ty,
			tw,
			th,
			"Back",
			tc
		);
		this.add(this.backButton);
		this.backButton.removeListener("click");
		this.backButton.on("click", () => {
			this.emit("state", PageState.Home);
			this.activateDataset("");
		});
		this.backButton.setText("back");

		/* Slider */

		const sl = layout.scenarioControls;
		const sx = sl.centerX;
		const sy = sl.top;
		const sw = 0.5 * sl.width;
		const sh = sl.height / 2;

		this.layerSlider = new TestSlider(scene, sx, sy, sw, sh, "Slider", 10);
		this.layerSlider.setVisible(false);
		this.add(this.layerSlider);
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		this.backButton.update(time, delta);
		this.tabButtons.forEach((button) => button.update(time, delta));
		this.layerButtons.forEach((button) => button.update(time, delta));
		this.layerSlider.update(time, delta);
	}

	setScenario(scenario: ScenarioKey) {
		const sections = scenarioManager.getScenarioSections(scenario);

		if (sections.length > this.tabButtons.length) {
			throw "More sections than tabs";
		}

		this.tabButtons.forEach((tab) => tab.setVisible(false));
		sections.forEach((section, index) => {
			this.tabButtons[index].setVisible(true);
			this.tabButtons[index].setText(section.key + "title");
			this.tabButtons[index].removeListener("click");
			this.tabButtons[index].on("click", () => {
				this.setSection(section);
			});
			this.tabButtons[index].setData("section", section.key);
		});

		let activeSection = sections.find((section) => section.default);
		if (activeSection) {
			this.setSection(activeSection);
		}
	}

	setSection(section: Section) {
		languageManager.bind(this.subtitle, section.scenario + "title");
		languageManager.bind(this.title, section.key + "title");
		languageManager.bind(this.bread, section.key + "bread");

		this.tabButtons.forEach((button) => {
			button.setHighlight(button.getData("section") == section.key);
		});

		if (
			section.layerButtons &&
			section.layerButtons.length > this.layerButtons.length
		) {
			throw "More layers than buttons";
		}

		if (section.legendColors.length > 0) {
			this.legend.setVisible(true);
			this.legend.setLegend(section.key + "legend", section.legendColors);
		} else {
			this.legend.setVisible(false);
		}

		this.layerButtons.forEach((button) => button.setVisible(false));
		if (section.layerButtons) {
			section.layerButtons.forEach((layerString: string, index: number) => {
				let button = this.layerButtons[index];
				const layers = section.layerButtons![index];

				button.setVisible(true);
				button.setText(section.key + "button" + index);
				button.setData("layers", layers);
				button.removeListener("click");
				button.on("click", () => {
					this.activateDataset(layers);
				});
			});
		}

		this.layerSlider.setVisible(false);
		if (section.layerSlider) {
			this.layerSlider.setVisible(true);
			this.layerSlider.value = 0;
			this.layerSlider.setSteps(section.layerSlider.layers.length);
			this.layerSlider.setTitle(section.key + "sliderTitle");
			let labels = [];
			for (let i = 0; i < section.layerSlider.labels; i++) {
				labels.push(section.key + "sliderLabel" + i);
			}
			this.layerSlider.setLabels(labels);

			this.layerSlider.removeListener("onChange");
			this.layerSlider.on("onChange", (value: number) => {
				let layers = section.layerSlider?.layers;
				if (layers) {
					let index = Math.round(value / (1 / (layers.length - 1)));
					this.layerSlider.setLabel(index.toString());
					this.activateDataset(layers[index]);
				}
			});
		}

		this.activateDataset(section.defaultLayer);

		this.activateBlocks(section.legend);
	}

	activateDataset(layers: string) {
		this.emit("map", layers);
		this.socket.sendReset();
		this.socket.sendActivateDataset(layers);

		this.layerButtons.forEach((button) => {
			button.setHighlight(button.getData("layers") == layers);
		});
	}

	activateBlocks(legend: string) {
		fetch("172.19.98.10:443/rest/script/invoke/WebTask/start", {
			method: "POST",
			body: JSON.stringify({
				task: "SimStad-" + legend,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		})
			.then((response) => response.json())
			.then((json) => console.log("Blocks:", json));
	}
}
