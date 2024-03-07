import { BaseScene } from "@/scenes/BaseScene";
import { Color, ColorStr } from "@/utils/colors";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { languageManager as language } from "@/utils/LanguageManager";
import * as dataStadenIRorelse from "@/data/scenarios/Staden_i_rorelse_sv.json";
import * as dataStadenOchKlimatet from "@/data/scenarios/Staden_och_klimatet_sv.json";
import * as dataStadensSammansattning from "@/data/scenarios/Stadens_sammansattning_sv.json";
import * as dataStadensUtveckling from "@/data/scenarios/Stadens_utveckling_sv.json";
import * as dataBilderFranOvan from "@/data/scenarios/Bilder_fran_ovan_sv.json";
import * as dataAI from "@/data/scenarios/AI_sv.json";
import {
	colorToGrayscale,
	colorToNumber,
	interpolateColor,
} from "@/utils/functions";

const screenWidth = 1920;
const screenHeight = 1080;
const margin = 20;
const padding = 70;
const separation = 40;
const radius = 16;
const titleSize = 92;
const breadSize = 40;
const legendTitleSize = 40;
const legendLabelSize = 40;
const grid = 5;

const bx = margin;
const by = margin;
const bw = screenWidth - 2 * margin;
const bh = screenHeight - 2 * margin;
const body = new Phaser.Geom.Rectangle(bx, by, bw, bh);

const lw = (body.width - 2 * padding - separation) / 1.6;
const lh = body.height - 2 * padding;
const lx = body.left + padding;
const ly = body.top + padding;
const left = new Phaser.Geom.Rectangle(lx, ly, lw, lh);

const rw = body.width - 2 * padding - separation - left.width;
const rh = body.height - 2 * padding;
const rx = body.right - padding - rw;
const ry = body.top + padding;
const right = new Phaser.Geom.Rectangle(rx, ry, rw, rh);

export class LargeLegend extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private background: RoundRectangle;
	private graphics: Phaser.GameObjects.Graphics;
	private title: Phaser.GameObjects.Text;
	private labels: Phaser.GameObjects.Text[];

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number
	) {
		super(scene, x, y);
		this.scene = scene;
		this.width = width;
		this.height = height;

		this.background = new RoundRectangle(scene, {
			width,
			height,
			radius,
			color: Color.Slate900,
		});
		this.add(this.background);

		this.graphics = scene.add.graphics();
		this.add(this.graphics);

		this.title = this.scene.addText({
			x: -width / 2 + padding / 2,
			y: -height / 2 + padding / 2,
			size: legendTitleSize,
			fontFamily: "Lato-Bold",
			color: ColorStr.White,
		});
		this.title.setShadow(0, 2, "black", 4);
		this.add(this.title);

		let hr = this.scene.add.rectangle(
			0,
			this.title.y + this.title.displayHeight * 1.25,
			width - padding,
			2,
			Color.White
		);
		this.add(hr);

		this.labels = [];

		const stops: { color: string; text: string }[] = [
			{ color: ColorStr.Red500, text: "1" },
			{ color: ColorStr.Orange500, text: "2" },
			{ color: ColorStr.Yellow500, text: "3" },
		];
		this.setLegend("Title", stops);
	}

	update(time: number, delta: number) {}

	setLegend(title: string, stops: { color: string; text: string }[]) {
		this.graphics.clear();
		this.title.setText(title);

		if (
			this.title.displayWidth >= lw - padding ||
			this.title.text.includes("?")
		) {
			this.title.setColor(ColorStr.Red700);
		}

		this.labels.forEach((text) => text.destroy());
		this.labels = [];

		const ty = this.title.y + this.title.displayHeight * 2.0;
		const th = this.height / 2 - ty - padding / 2;
		const gap = 24;
		const border = 2;
		const count = Math.max(stops.length, 10);
		const height = (th - gap * (count - 1)) / count;
		const width = 2 * height;
		// const dotRadius = size / 2;

		stops.forEach(({ color, text }, index) => {
			let x = this.title.x;
			let y = ty + (height + gap) * index + height / 2;
			let c = colorToNumber(color);
			let gc = 0xffffff - colorToGrayscale(c);
			let bc = interpolateColor(c, gc, 0.3);

			this.graphics.fillStyle(bc);
			// this.graphics.fillCircle(x, y, dotRadius);
			this.graphics.fillRect(x, y - height / 2, width, height);

			this.graphics.fillStyle(colorToNumber(color));
			// this.graphics.fillCircle(x, y, dotRadius - border);
			this.graphics.fillRect(
				x + border,
				y - height / 2 + border,
				width - 2 * border,
				height - 2 * border
			);

			let label = this.scene.addText({
				// x: x + dotRadius + separation,
				x: x + width + gap,
				y,
				size: Math.min(1000 * height, legendLabelSize),
				// fontFamily: "Lato-Regular",
				text,
			});
			label.setOrigin(0, 0.5);
			label.setShadow(0, 2, "black", 4);
			this.add(label);
			this.labels.push(label);
		});

		let newHeight =
			ty +
			(height + gap) * (stops.length - 1) +
			height +
			this.height / 2 +
			padding / 2;
		this.background.setHeight(newHeight);
		this.background.y = -this.height / 2 + newHeight / 2;
	}
}

export class LegendScreen extends Phaser.GameObjects.Container {
	public id: string;

	private subtitles: Phaser.GameObjects.Text[];

	constructor(
		scene: BaseScene,
		titleText: string,
		breadText: string,
		legendTitle?: string,
		legendColors?: { color: string; text: string }[]
	) {
		super(scene, 0, 0);
		this.scene = scene;

		this.id = titleText
			.toLowerCase()
			.replaceAll(" ", "")
			.replaceAll("-", "")
			.replaceAll("!", "")
			.replaceAll("å", "a")
			.replaceAll("ä", "a")
			.replaceAll("ö", "o");

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

		if (title.displayWidth > left.width) {
			title.setColor(ColorStr.Red700);
		}

		let ty = left.top + 1.0 * titleSize + 1.0 * breadSize;

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

			if (this.id == "centralanorrkoping") {
				if (index == 2) {
					subtitle.setFontSize(1.25 * breadSize);
					subtitle.setColor(ColorStr.Amber400);
				}
			}
		});

		/* Legends */

		let lw = right.width;
		let lh = right.height;
		let lx = right.centerX;
		let ly = right.centerY;

		if (legendTitle && legendColors && legendColors.length > 0) {
			let legend = new LargeLegend(scene, lx, ly, lw, lh);
			legend.setLegend(legendTitle, legendColors);
			this.add(legend);
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
		let image = this.scene.add.image(right.centerX, right.centerY, key);
		image.setScale(
			Math.min(right.width / image.width, right.height / image.height)
		);
		this.add(image);
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
				language.get("legend_default_title"),
				language.get("legend_default_bread") + "\n" + language.get(dirKey)
			);
			legend.id = dirKey.replace("legend_", "").replace("_", "");
			legend.on("click", () => this.select(legend));
			this.legendScreens.push(legend);
			this.add.existing(legend);
			legend.addImage("legend_default");
		});

		let datasets = [
			dataStadenIRorelse,
			dataStadenOchKlimatet,
			dataStadensSammansattning,
			dataStadensUtveckling,
			dataBilderFranOvan,
			dataAI,
		];

		datasets.forEach((dataset) => {
			// scenarioData.scenarios.forEach((scenario) => {
			dataset.Sections.forEach((section) => {
				section.SectionObject.forEach((object) => {
					let legend = new LegendScreen(
						this,
						object.Title,
						object.Text1,
						object.LegendTitle,
						object.LegendColors
					);
					legend.on("click", () => this.select(legend));
					this.legendScreens.push(legend);
					this.add.existing(legend);
				});
			});
			// });
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
