import { BaseScene } from "@/scenes/BaseScene";
import { Color, ColorStr } from "@/utils/colors";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { languageManager as language } from "@/utils/LanguageManager";
import { BlurPostFilter } from "@/utils/pipelines/BlurPostFilter";
import { scenarioManager } from "@/utils/ScenarioManager";
import { Legend } from "@/components/Legend";
import { splitText } from "@/utils/functions";

const screenWidth = 1920;
const screenHeight = 1080;
const margin = 20;
const padding = 70;
const separation = 40;
const radius = 16;
const titleSize = 92;
const breadSize = 40;
const grid = 6;

const bx = margin;
const by = margin;
const bw = screenWidth - 2 * margin;
const bh = screenHeight - 2 * margin;
const body = new Phaser.Geom.Rectangle(bx, by, bw, bh);

const lw = (body.width - 2 * padding - separation) / 1.5;
const lh = body.height - 2 * padding;
const lx = body.left + padding;
const ly = body.top + padding;
const left = new Phaser.Geom.Rectangle(lx, ly, lw, lh);

const rw = body.width - 2 * padding - separation - left.width;
const rh = body.height - 2 * padding;
const rx = body.right - padding - rw;
const ry = body.top + padding;
const right = new Phaser.Geom.Rectangle(rx, ry, rw, rh);

export class LegendScreen extends Phaser.GameObjects.Container {
	public scene: BaseScene;
	public id: string;

	private subtitles: Phaser.GameObjects.Text[];
	private legend: Legend;
	private legendImage: Phaser.GameObjects.Image;

	constructor(
		scene: BaseScene,
		scenarioId: string,
		titleText: string,
		breadText: string,
		legendTitle?: string,
		legendColors?: { color: string; text: string; type?: string }[]
	) {
		super(scene, 0, 0);
		this.scene = scene;
		this.id = scenarioId;

		let background = scene.add.rectangle(
			screenWidth / 2,
			screenHeight / 2,
			screenWidth,
			screenHeight,
			Color.Slate950
		);
		this.add(background);
		background.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
			this.emit("click");
		});

		let panel = new RoundRectangle(scene, {
			rect: body,
			radius,
			color: Color.Slate800,
		});
		this.add(panel);

		let title = scene.addText({
			x: left.left,
			y: left.top,
			size: titleSize,
			color: ColorStr.White,
			text: titleText,
		});
		title.setShadow(0, 2, "black", 4);
		this.add(title);

		title.setScale(1);
		if (title.width > left.width) {
			title.displayWidth = left.width;
			if (title.scaleX < 0.9) {
				title.setText(splitText(title.text));
				title.setScale(0.9);
			} else {
				title.scaleY = title.scaleX;
			}
		}

		if (title.displayWidth > left.width) {
			title.setColor(ColorStr.Red700);
		}

		let ty = left.top + title.displayHeight + 1.0 * breadSize;

		const paragraphs = breadText
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => !!line);

		this.subtitles = [];
		paragraphs.forEach((paragraph, index) => {
			let subtitle = scene.addText({
				x: left.left,
				y: ty,
				size: breadSize,
				color: ColorStr.White,
				text: paragraph,
			});
			subtitle.setWordWrapWidth(left.width);
			subtitle.setLineSpacing(0.2 * breadSize);
			subtitle.setShadow(0, 2, "black", 4);
			this.add(subtitle);
			this.subtitles.push(subtitle);

			ty += subtitle.displayHeight + 0.75 * breadSize;
			if (ty > bh) {
				subtitle.setColor(ColorStr.Red700);
			}

			if (this.id == "default") {
				if (index == 1) {
					let x = left.centerX - separation / 2;
					let y = left.bottom - 330;
					let r = 60;

					let panel = new RoundRectangle(scene, {
						x: x,
						y: y + (separation + 1.2 * breadSize) / 2,
						width: left.width - separation,
						height: 310,
						radius,
						color: Color.Slate900,
					});
					panel.setAlpha(0.5);
					this.add(panel);
					this.moveDown(panel);

					subtitle.setFontFamily("Lato-Bold");
					subtitle.setFontSize(1.2 * breadSize);
					subtitle.setColor(ColorStr.Amber400);
					subtitle.setOrigin(0.5, 0.0);
					subtitle.x = x;
					subtitle.y = y + r + separation;

					let circleShadow = this.scene.add.circle(x, y + 2, r, Color.Black);
					this.add(circleShadow);
					circleShadow.setPostPipeline(BlurPostFilter);

					let circle = this.scene.add.circle(x, y, r, Color.Amber400);
					this.add(circle);

					let pointer = this.scene.add.image(circle.x, circle.y, "arrow-left");
					pointer.setScale((1.1 * circle.width) / pointer.width);
					pointer.setTint(Color.Slate950);
					this.add(pointer);

					if (paragraph.includes("vänster")) pointer.setAngle(0);
					if (paragraph.includes("emot")) pointer.setAngle(90);
					if (paragraph.includes("höger")) pointer.setAngle(180);
				}
			}
		});

		/* Legends */

		let lw = right.width;
		let lh = right.height;
		let lx = right.centerX;
		let ly = right.centerY;

		if (legendTitle && legendColors && legendColors.length > 0) {
			this.legend = new Legend(scene, lx, ly, lw, lh, 1.35);
			this.legend.setLegend(legendTitle, legendColors);
			this.add(this.legend);
		} else {
			// let ty = left.top + 1.0 * titleSize + 1.0 * breadSize;
			// this.subtitles.forEach((subtitle) => {
			// 	subtitle.y = ty;
			// 	subtitle.setWordWrapWidth(bw - 2 * padding);
			// 	ty += subtitle.displayHeight + 0.75 * breadSize;
			// });
		}
	}

	addImage(key: string) {
		let shadow = this.scene.add.image(right.centerX, right.centerY + 2, key);
		shadow.setScale(
			Math.min(right.width / shadow.width, right.height / shadow.height)
		);
		shadow.setTint(0);
		shadow.setPostPipeline(BlurPostFilter);
		this.add(shadow);

		this.legendImage = this.scene.add.image(right.centerX, right.centerY, key);
		this.legendImage.setScale(
			Math.min(
				right.width / this.legendImage.width,
				right.height / this.legendImage.height
			)
		);
		this.add(this.legendImage);
	}

	addSource(legendSource: string, hasImage: boolean) {
		if (hasImage) {
			let source = this.scene.addText({
				x: this.legendImage.x + this.legendImage.displayWidth / 2,
				y: this.legendImage.y + this.legendImage.displayHeight / 2 + 8,
				size: 25,
				color: ColorStr.White,
				text: legendSource,
			});
			source.setOrigin(1.0, 0.0);
			source.setShadow(0, 2, "black", 4);
			this.add(source);
		} else {
			let source = this.scene.addText({
				x: this.legend.x + this.legend.displayWidth / 2,
				y: this.legend.y + this.legend.bottom + 8,
				size: 24,
				color: ColorStr.White,
				text: legendSource,
			});
			source.setOrigin(1.0, 0.0);
			source.setShadow(0, 2, "black", 4);
			this.add(source);

			source.x = this.legend.x + this.legend.width / 2;
			source.y = this.legend.bottom + 8;
			source.setWordWrapWidth(this.legend.width);
		}
	}
}

export class LegendScene extends BaseScene {
	private legendScreens: LegendScreen[];
	private currentScreen?: LegendScreen;

	private base64Output: string;

	constructor() {
		super({ key: "LegendScene" });
	}

	create(): void {
		this.fade(false, 200, Color.Black);
		this.cameras.main.setBackgroundColor(Color.Slate900);

		this.legendScreens = [];

		const defaultDirs = [
			"legend_default_forward",
			"legend_default_right",
			"legend_default_left",
		];

		defaultDirs.forEach((dirKey) => {
			let legend = new LegendScreen(
				this,
				"default",
				language.get("legend_default_title"),
				language.get("legend_default_bread") + "\n" + language.get(dirKey)
			);
			legend.id = dirKey.replace("legend_", "").replace("_", "");
			legend.on("click", () => this.select(legend));
			this.legendScreens.push(legend);
			this.add.existing(legend);
			legend.addImage("legend_default");
		});

		const scenarios = scenarioManager.getScenarios();
		scenarios.forEach((scenario) => {
			scenario.sections.forEach((section) => {
				const base = `${section.scenarioId}_${section.key}`;
				const titleText = language.get(`${base}_title`);
				const breadText = language.get(`${base}_bread`);
				const legendTitle = `${base}_legend`;
				const legendColors = section.legendColors;

				let legend = new LegendScreen(
					this,
					section.scenarioId,
					titleText,
					breadText,
					legendTitle,
					legendColors
				);
				legend.on("click", () => this.select(legend));
				this.legendScreens.push(legend);
				this.add.existing(legend);

				const hasImage = this.textures.exists(section.legendImage);
				if (hasImage) {
					legend.addImage(section.legendImage);
				}
				if (section.legendSource) {
					legend.addSource(section.legendSource, hasImage);
				}
			});
		});

		// scenarioDataEn.scenarios.forEach((scenario) => {
		// 	console.log(scenario.Title);
		// 	scenario.Sections.forEach((section) => {
		// 		console.log(section.Label1);
		// 		section.SectionObject.forEach((object) => {
		// 			let legend = new LegendScreen(
		// 				this,
		// 				object.Title,
		// 				object.Text1,
		// 				object.LegendColors
		// 			);
		// 			legend.on("click", () => this.select(legend));
		// 			this.legendScreens.push(legend);
		// 			this.add.existing(legend);
		// 		});
		// 	});
		// });

		this.input.keyboard?.on("keydown-L", this.drawLayout, this);

		this.input.keyboard?.on("keydown-ESC", this.reset, this);
		this.reset();

		this.input.keyboard?.on("keydown-SPACE", () => {
			this.automaticDownload();
			// console.log(this.game.canvas);
			// console.log(this.game.canvas.toDataURL("image/png"));
		});

		const nextScreen = (dir: number) => {
			if (this.currentScreen) {
				const max = this.legendScreens.length;
				const index = this.legendScreens.indexOf(this.currentScreen);
				const newIndex = (index + dir + max) % max;
				this.reset();
				this.select(this.legendScreens[newIndex]);
			}
		};
		this.input.keyboard?.on("keydown-RIGHT", () => nextScreen(1));
		this.input.keyboard?.on("keydown-LEFT", () => nextScreen(-1));
	}

	update(time: number, delta: number) {}

	reset() {
		this.currentScreen = undefined;
		this.legendScreens.forEach((screen, index) => {
			const x = (index % grid) * (screenWidth / grid);
			const y = Math.floor(index / grid) * (screenHeight / grid);
			screen.setVisible(true);
			screen.setPosition(x, y);
			screen.setScale(1 / grid);
		});
	}

	select(screen: LegendScreen) {
		this.currentScreen = screen;
		this.legendScreens.forEach((screen) => screen.setVisible(false));
		screen.setVisible(true);
		screen.setScale(1);
		screen.setPosition(0, 0);
	}

	drawLayout() {
		const graphics = this.add.graphics();
		graphics.clear();

		const rects = [
			[body, Color.Gray600],
			[left, Color.Purple600],
			[right, Color.Fuchsia600],
		];

		rects.forEach(([rect, color]) => {
			graphics.lineStyle(2, color as number);
			graphics.strokeRectShape(rect as Phaser.Geom.Rectangle);
		});
	}

	automaticDownload() {
		this.base64Output = "";

		this.legendScreens.forEach((legend, index) => {
			this.addEvent(200 * index, () => {
				this.select(legend);
				this.addEvent(100, () => {
					let base64 = this.game.canvas.toDataURL();
					this.base64Output += legend.id + " " + base64 + "\n";
				});
			});
		});

		this.addEvent(1000 + 200 * this.legendScreens.length, () => {
			this.downloadText("images.txt", this.base64Output);
			this.reset();
		});
	}

	downloadText(filename: string, text: string) {
		var element = document.createElement("a");
		element.setAttribute(
			"href",
			"data:text/plain;charset=utf-8," + encodeURIComponent(text)
		);
		element.setAttribute("download", filename);

		element.style.display = "none";
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}
}
