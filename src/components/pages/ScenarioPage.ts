import { BaseScene } from "@/scenes/BaseScene";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "./Page";
import { languageManager } from "@/utils/LanguageManager";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color, ColorStr } from "@/utils/colors";
import { Legend } from "@/components/Legend";
import { ScenarioId, Section, scenarioManager } from "@/utils/ScenarioManager";
import { TextButton } from "../TextButton";
import { LayerSlider } from "../LayerSlider";
import { TabButton } from "../TabButton";
import { RoundRectangle } from "../elements/RoundRectangle";
import { BlurPostFilter } from "@/utils/pipelines/BlurPostFilter";
import { splitText } from "@/utils/functions";
import { blocksManager } from "@/utils/BlocksManager";
import { LayerRequestData } from "@/utils/protocol";

export class ScenarioPage extends Page {
	private background: RoundRectangle;
	private foreground: RoundRectangle;
	private subtitle: Phaser.GameObjects.Text;
	private title: Phaser.GameObjects.Text;
	private bread: Phaser.GameObjects.Text[];
	private legend: Legend;
	private legendShadow: Phaser.GameObjects.Image;
	private legendImage: Phaser.GameObjects.Image;
	private legendSource: Phaser.GameObjects.Text;
	private backButton: TabButton;
	private tabButtons: TabButton[];
	private layerButtons: TextButton[];
	private layerSlider: LayerSlider;

	private currentSection: Section;
	private currentLayerString: string;
	public liveTrafficEnabled: boolean;

	constructor(scene: BaseScene, state: PageState, socket: SocketManager) {
		super(scene, state, socket);

		this.currentLayerString = "";
		this.liveTrafficEnabled = false;

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
		this.subtitle.setShadow(0, 2, "#00000077", 4);
		this.add(this.subtitle);

		this.title = scene.addText({
			x: layout.scenarioInfo.left,
			y: this.subtitle.y + 1.2 * this.subtitle.displayHeight,
			size: 58,
			color: "white",
		});
		this.title.setShadow(0, 2, "#00000077", 4);
		this.add(this.title);

		let ay = this.title.y + 1.3 * this.title.displayHeight;
		let ah = layout.scenarioInner.height - (ay - layout.scenarioInner.top);

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
			bread.setShadow(0, 2, "#00000077", 4);
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

		this.legendShadow = scene.add.image(
			layout.scenarioLegend.centerX,
			layout.scenarioLegend.centerY + 2,
			"legend_default"
		);
		this.legendShadow.setOrigin(0.5, 0.0);
		this.legendShadow.setTint(0);
		this.legendShadow.setAlpha(0.5);
		this.legendShadow.setPostPipeline(BlurPostFilter);
		this.add(this.legendShadow);

		this.legendImage = scene.add.image(
			layout.scenarioLegend.centerX,
			layout.scenarioLegend.centerY,
			"legend_default"
		);
		this.legendImage.setOrigin(0.5, 0.0);
		this.add(this.legendImage);

		this.legendSource = scene.addText({
			size: 18,
			color: ColorStr.White,
			text: "Source",
		});
		this.legendSource.setOrigin(1.0, 0.0);
		this.legendSource.setShadow(0, 2, "#00000077", 4);
		this.add(this.legendSource);

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

		const tn = 13;
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

		/* Slider */

		const sl = layout.scenarioControls;
		const sx = sl.centerX;
		const sy = sl.top;
		const sw = sl.width - 64;
		const sh = 0.7 * sl.height;

		this.layerSlider = new LayerSlider(scene, sx, sy, sw, sh, "Slider", 10);
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

	setScenario(scenarioId: ScenarioId) {
		const sections = scenarioManager.getScenario(scenarioId).sections;

		if (sections.length > this.tabButtons.length) {
			throw "More sections than tabs";
		}

		this.updateTabs(sections.length);
		this.tabButtons.forEach((tab) => tab.setVisible(false));
		sections.forEach((section, index) => {
			let textKey = `${scenarioId}_${section.key}_tab`;
			if (!languageManager.get(textKey, false)) {
				textKey = `${scenarioId}_${section.key}_title`;
			}

			this.tabButtons[index].setVisible(true);
			this.tabButtons[index].setText(textKey);
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
			this.setSection(activeSection, false);

			this.emit("resetLight");
			this.socket.fadeLight(() => {
				this.setSection(activeSection!);
			});
		}

		blocksManager.setWallVideo(scenarioId);

		this.liveTrafficEnabled = scenarioId == "rorelse";
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
	}

	fadeSection(section: Section) {
		if (this.foreground.alpha > 0) return;

		this.scene.add.tween({
			targets: this.foreground,
			duration: 500,
			ease: "Cubic.Out",
			alpha: { from: 0, to: 1 },
			onComplete: () => {
				this.scene.add.tween({
					targets: this.foreground,
					duration: 500,
					ease: "Cubic.Out",
					alpha: { from: 1, to: 0 },
				});
			},
		});

		this.emit("resetLight");
		this.socket.fadeLight(() => this.setSection(section));
	}

	realignText() {
		let ay = this.title.y + 1.3 * this.title.displayHeight;
		let ah = layout.scenarioInner.height - (ay - layout.scenarioInner.top);
		if (this.layerSlider.visible) {
			ah -= 3 * this.layerSlider.height + layout.separation;
		}
		if (this.layerButtons[0].visible) {
			ah -= layout.scenarioControls.height + layout.separation;
		}

		const breadText = this.bread[9].text;
		const paragraphs = breadText
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => !!line);

		let ty = this.title.y + 1.3 * this.title.displayHeight;

		this.bread.forEach((text) => text.setVisible(false));
		paragraphs.forEach((paragraph, index) => {
			let bread = this.bread[index];
			bread.setVisible(true);
			bread.setText(paragraph);
			bread.y = ty;

			const rightBottom = this.legend.bottom;
			if (!this.legendImage.visible && ty > rightBottom) {
				bread.setWordWrapWidth(layout.scenarioInner.width);
			} else {
				bread.setWordWrapWidth(layout.scenarioInfo.width);
			}

			ty += bread.displayHeight + 0.75 * 28;
		});
	}

	setSection(section: Section, sendDataset = true) {
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
			this.legend.setLegend(
				`${section.scenarioId}_${section.key}_legend`,
				section.legendColors
			);
		} else {
			this.legend.setVisible(false);
		}

		if (this.scene.textures.exists(section.legendImage)) {
			this.legendShadow.setVisible(true);
			this.legendImage.setVisible(true);
			this.setLegendImage(section.legendImage);
		} else {
			this.legendShadow.setVisible(false);
			this.legendImage.setVisible(false);
		}

		this.setLegendSource(
			`${section.scenarioId}_${section.key}_legend_source`,
			this.scene.textures.exists(section.legendImage)
		);

		this.layerButtons.forEach((button) => button.setVisible(false));
		if (section.layerButtons) {
			section.layerButtons.forEach((layerString: string, index: number) => {
				let button = this.layerButtons[index];
				const layers = section.layerButtons![index];

				button.setVisible(true);
				button.setText(`${section.scenarioId}_${section.key}_button${index}`);
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
			this.layerSlider.setTitle(
				`${section.scenarioId}_${section.key}_sliderTitle`
			);
			let labels = [];
			for (let i = 0; i < section.layerSlider.labels; i++) {
				labels.push(`${section.scenarioId}_${section.key}_sliderLabel${i}`);
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

		languageManager.bind(this.subtitle, `${section.scenarioId}_title`);
		languageManager.bind(
			this.title,
			`${section.scenarioId}_${section.key}_title`,
			() => {
				this.title.setScale(1);
				if (this.title.width > layout.scenarioInfo.width) {
					this.title.displayWidth = layout.scenarioInfo.width;
					if (this.title.scaleX < 0.9) {
						this.title.setText(splitText(this.title.text));
						this.title.setScale(0.9);
					} else {
						this.title.scaleY = this.title.scaleX;
					}
				}
			}
		);
		languageManager.bind(
			this.bread[9],
			`${section.scenarioId}_${section.key}_bread`,
			() => {
				this.realignText();
			}
		);

		if (sendDataset) {
			this.activateDataset(section.defaultLayer);
			blocksManager.setLegend(section);
		}
	}

	setLegendImage(key: string) {
		this.legendImage.setTexture(key);
		this.legendImage.setScale(
			Math.min(
				layout.scenarioLegend.width / this.legendImage.width,
				layout.scenarioLegend.height / this.legendImage.height
			)
		);
		this.legendImage.y = this.title.y;

		this.legendShadow.setTexture(key);
		this.legendShadow.y = this.legendImage.y + 2;
		this.legendShadow.setScale(this.legendImage.scaleX);
	}

	setLegendSource(key: string, hasImage: boolean) {
		this.legendSource.setVisible(true);

		if (hasImage) {
			this.legendSource.x =
				this.legendImage.x + this.legendImage.displayWidth / 2;
			this.legendSource.y =
				this.legendImage.y + this.legendImage.displayHeight + 8;
			this.legendSource.setWordWrapWidth(this.legendImage.displayWidth);
		} else {
			this.legendSource.x = this.legend.x + this.legend.width / 2;
			this.legendSource.y = this.legend.bottom + 8;
			this.legendSource.setWordWrapWidth(this.legend.width);
		}

		if (languageManager.get(key, false)) {
			languageManager.bind(this.legendSource, key);
		} else {
			this.legendSource.setText("");
		}

		const s = this.legendSource;
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

		const layerData: LayerRequestData[] = [];
		newLayers.forEach((layer) => {
			layerData.push({
				type: "image",
				name: layer,
			});
		});

		if (this.liveTrafficEnabled) {
			layerData.push({
				type: "ndi",
				name: "LiveTraffic",
				ndi: {
					stream: "TrafficOverlayNDI",
				},
			});
		}

		this.socket.sendLayers(layerData);
	}
}
