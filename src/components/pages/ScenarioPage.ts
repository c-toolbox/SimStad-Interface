import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color, ColorStr } from "@/utils/colors";
import { Legend } from "@/components/Legend";
import { HSVToRGB, colorToString, interpolateColor } from "@/utils/functions";
import { ScenarioKey, Section, scenarioManager } from "@/utils/ScenarioManager";
import { TextButton } from "../TextButton";
import { TestSlider } from "../TestSlider";
import { TabButton } from "../TabButton";
import { ONLINE } from "@/utils/constants";
import { RoundRectangle } from "../elements/RoundRectangle";

export class ScenarioPage extends Page {
	private background: RoundRectangle;
	private foreground: RoundRectangle;
	private subtitle: Phaser.GameObjects.Text;
	private title: Phaser.GameObjects.Text;
	private bread: Phaser.GameObjects.Text[];
	private legend: Legend;
	private backButton: TabButton;
	private tabButtons: TabButton[];
	private layerButtons: TextButton[];
	private layerSlider: TestSlider;

	private currentSection: Section;
	private currentLayerString: string;

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		this.currentLayerString = "";

		this.background = new RoundRectangle(scene, {
			rect: layout.scenario,
			radius: layout.radius,
			color: Color.Slate800,
			bottomLeft: false,
			bottomRight: false,
		});
		this.add(this.background);

		this.foreground = new RoundRectangle(scene, {
			rect: layout.scenario,
			radius: layout.radius,
			color: Color.Slate800,
			bottomLeft: false,
			bottomRight: false,
		});
		this.add(this.foreground);

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
			y: this.subtitle.y + 1.3 * this.subtitle.displayHeight,
			size: 58,
			color: "white",
		});
		this.add(this.title);

		this.bread = [];
		for (let i = 0; i < 10; i++) {
			let bread = scene.addText({
				x: layout.scenarioInfo.left,
				size: 28,
				color: "white",
			});
			bread.setVisible(false);
			bread.setLineSpacing(0.25 * 28);
			bread.setWordWrapWidth(layout.scenarioInfo.width);
			this.bread.push(bread);
			this.add(bread);
		}

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
		const bc = Color.Yellow700;

		this.layerButtons = [];
		for (let i = 0; i < 3; i++) {
			let bt = "Layer " + (i + 1);
			let bx = bl.left + (i + 0.5) * bw + i * layout.separation;

			let button = new TextButton(scene, bx, by, bw, bh, bt, bc);
			this.add(button);
			this.layerButtons.push(button);
		}

		/* Tabs */

		const tn = 6;
		const tl = layout.scenarioTabs;
		const ty = tl.centerY;
		const th = tl.height;

		this.tabButtons = [];
		for (let i = 0; i < tn; i++) {
			let button = new TabButton(scene, 0, ty, 100, th, "Tab");
			button.setVisible(false);
			this.add(button);
			this.sendToBack(button);
			this.tabButtons.push(button);
		}

		const tw = 180;
		this.backButton = new TabButton(scene, tl.left + 0.5 * tw, ty, tw, th, "");
		this.add(this.backButton);
		this.sendToBack(this.backButton);
		this.backButton.removeListener("click");
		this.backButton.on("click", () => {
			if (this.allowInput()) {
				this.emit("state", PageState.Home);
			}
		});
		this.backButton.setText("back");
		this.backButton.setHighlight(true);
		// this.backButton.setColor(Color.Slate700);

		/* Slider */

		const sl = layout.scenarioControls;
		const sx = sl.centerX;
		const sy = sl.top;
		const sw = sl.width - 64;
		const sh = 0.7 * sl.height;

		this.layerSlider = new TestSlider(scene, sx, sy, sw, sh, "Slider", 10);
		this.layerSlider.setVisible(false);
		this.add(this.layerSlider);

		/* Fader */

		this.foreground.setAlpha(0);
		this.bringToTop(this.foreground);
		this.foreground.setInteractive();
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

		this.updateTabs(sections.length);
		this.tabButtons.forEach((tab) => tab.setVisible(false));
		sections.forEach((section, index) => {
			this.tabButtons[index].setVisible(true);
			this.tabButtons[index].setText(section.key + "title");
			this.tabButtons[index].removeListener("click");
			this.tabButtons[index].on("click", () => {
				if (this.currentSection != section) {
					this.fadeSection(section);
				}
			});
			this.tabButtons[index].setData("section", section.key);
		});

		let activeSection = sections.find((section) => section.default);
		if (activeSection) {
			this.setSection(activeSection);
		}

		const blocks: { [key in ScenarioKey]: string } = {
			[ScenarioKey.sammansattning]: "VisualCity-Wall_Motion",
			[ScenarioKey.utveckling]: "VisualCity-Wall_Crane",
			[ScenarioKey.rorelse]: "VisualCity-Wall_Tram",
			[ScenarioKey.klimatet]: "VisualCity-Wall_Rain",
			[ScenarioKey.ovan]: "VisualCity-Wall_360",
			[ScenarioKey.ai]: "VisualCity-Wall_360",
		};
		this.activateBlocks(blocks[scenario]);
	}

	updateTabs(count: number) {
		const tn = count;
		const tg = 15;
		const tl = layout.scenarioTabs;
		const tw =
			(tl.width - (tn - 1) * tg - this.backButton.width - layout.separation) /
			tn;

		for (let i = 0; i < tn; i++) {
			let tx = tl.right - (i + 0.5) * tw - i * tg;

			this.tabButtons[i].x = tx;
			this.tabButtons[i].setWidth(tw);
		}

		// this.backButton.x = tl.left + 0.5 * tw;
		// this.backButton.setWidth(tw);
	}

	fadeSection(section: Section) {
		if (this.foreground.alpha > 0) return;

		this.scene.add.tween({
			targets: this.foreground,
			duration: 200,
			ease: "Cubic.Out",
			alpha: { from: 0, to: 1 },
			onComplete: () => {
				this.scene.add.tween({
					targets: this.foreground,
					duration: 200,
					ease: "Cubic.Out",
					alpha: { from: 1, to: 0 },
				});

				this.setSection(section);
			},
		});
	}

	realignText() {
		const breadText = this.bread[9].text;
		const paragraphs = breadText
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => !!line);

		let ty = this.title.y + 1.5 * this.title.displayHeight;

		this.bread.forEach((text) => text.setVisible(false));
		paragraphs.forEach((paragraph, index) => {
			let bread = this.bread[index];
			bread.setVisible(true);
			bread.setText(paragraph);
			bread.y = ty;

			ty += bread.displayHeight + 0.75 * 28;
		});
	}

	setSection(section: Section) {
		this.currentSection = section;

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
			this.bread.forEach((text) =>
				text.setWordWrapWidth(layout.scenarioInfo.width)
			);
		} else {
			this.legend.setVisible(false);
			this.bread.forEach((text) =>
				text.setWordWrapWidth(layout.scenarioInner.width)
			);
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

		languageManager.bind(this.subtitle, section.scenario + "title");
		languageManager.bind(this.title, section.key + "title");
		languageManager.bind(this.bread[9], section.key + "bread", () => {
			this.realignText();
		});

		this.activateDataset(section.defaultLayer);

		this.activateBlocks("SimStad-" + section.legend);
	}

	activateDataset(layerString: string) {
		this.emit("map", layerString);
		this.layerButtons.forEach((button) => {
			button.setHighlight(button.getData("layers") == layerString);
		});

		let newLayers = layerString.split(",");
		let oldLayers = this.currentLayerString.split(",");
		this.currentLayerString = layerString;

		let removedLayers = oldLayers.filter((layer) => !newLayers.includes(layer));
		let removedLayerString = removedLayers.join(",");

		this.socket.sendActivateDataset(layerString);
		this.socket.sendDeactivateDataset(removedLayerString);
	}

	activateBlocks(legend: string) {
		if (!ONLINE) return;

		fetch("https://blocks.c.itn.liu.se:443/rest/script/invoke/WebTask/start", {
			method: "POST",
			body: JSON.stringify({
				task: legend,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		})
			.then((response) => response.json())
			.then((json) => console.log("Blocks:", json));
	}
}
