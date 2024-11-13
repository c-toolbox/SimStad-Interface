import { BaseScene } from "@/scenes/BaseScene";
import { colorToNumber, splitText } from "@/utils/functions";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color, ColorStr } from "@/utils/colors";
import { RoundRectangle } from "./elements/RoundRectangle";
import { languageManager } from "@/utils/LanguageManager";

interface Stop {
	color: string;
	text: string;
	type?: string;
}

export class Legend extends Phaser.GameObjects.Container {
	public scene: BaseScene;
	private rescale: number;

	private background: RoundRectangle;
	private graphics: Phaser.GameObjects.Graphics;
	private title: Phaser.GameObjects.Text;
	private labels: Phaser.GameObjects.Text[];
	private symbols: Phaser.GameObjects.Image[];

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number,
		rescale = 1.0
	) {
		super(scene, x, y);
		this.scene = scene;
		this.width = width;
		this.height = height;
		this.rescale = rescale;

		this.background = new RoundRectangle(scene, {
			width,
			height,
			radius: layout.radius * rescale,
			color: Color.Slate900,
		});
		this.add(this.background);

		this.graphics = scene.add.graphics();
		this.add(this.graphics);

		this.title = this.scene.addText({
			x: -width / 2 + this.padding / 2,
			y: -height / 2 + this.padding / 2,
			size: 28 * rescale,
			fontFamily: "Lato-Bold",
			color: "white",
		});
		this.add(this.title);

		let hr = this.scene.add.rectangle(
			0,
			this.title.y + this.title.displayHeight + 8 * rescale,
			width - this.padding,
			2,
			Color.White
		);
		this.add(hr);

		this.labels = [];
		this.symbols = [];
	}

	setLegend(title: string, stops: Stop[]) {
		this.graphics.clear();
		this.setTitle(title);

		const padding = 80 * this.rescale;

		this.labels.forEach((text) => text.destroy());
		this.labels = [];

		this.symbols.forEach((text) => text.destroy());
		this.symbols = [];

		const ty = this.title.y + this.title.displayHeight * 2.0;
		const th = this.height / 2 - ty - padding / 2;
		const count = Math.max(stops.length, 10);
		const hgap = 28 * this.rescale;
		const vgap = (24 - 2 * (Math.max(stops.length, 10) - 10)) * this.rescale;
		const height = (th - vgap * (count - 1)) / count;
		const width = 2 * height;

		stops.forEach(({ color, type }, index) => {
			let x = this.title.x;
			let y = ty + (height + vgap) * index + height / 2;

			const icon = `symbol_${type ?? "rectangle"}`;
			let symbol = this.scene.add.image(x + width / 2, y, icon);
			symbol.setScale(height / symbol.height);
			symbol.setTint(colorToNumber(color));
			this.symbols.push(symbol);
			this.add(symbol);

			let label = this.scene.addText({
				x: x + width + vgap / 2,
				y,
				size: Math.min(1000 * height, 28 * this.rescale),
			});
			label.setOrigin(0, 0.5);
			this.labels.push(label);
			this.add(label);

			const maxWidth = this.width / 2 - vgap / 2 - label.x;
			if (languageManager.get(title + index)) {
				languageManager.bind(label, title + index, () => {
					if (label.displayWidth > maxWidth && label.text.includes(" ")) {
						label.setText(splitText(label.text));
					}
					if (label.displayWidth > maxWidth) {
						label.displayWidth = maxWidth;
						label.scaleY = label.scaleX;
					}
					if (label.text.includes("\n")) {
						label.scaleX = Math.min(0.75, label.scaleX);
						label.scaleY = label.scaleX;
					}
				});
			}
		});

		let newHeight =
			ty +
			(height + vgap) * (stops.length - 1) +
			height / 2 +
			this.height / 2 +
			padding / 2;
		this.background.setHeight(newHeight);
		this.background.y = -this.height / 2 + newHeight / 2;
	}

	setTitle(key: string) {
		if (languageManager.get(key)) {
			languageManager.bind(this.title, key, () => {
				this.title.setScale(1);
				if (this.title.displayWidth > this.width - this.padding) {
					this.title.displayWidth = this.width - this.padding;
				}
			});
		} else {
			this.title.setText(key);
		}
	}

	get padding() {
		return layout.padding * this.rescale * this.rescale;
	}

	get bottom() {
		return this.y + this.background.y + this.background.height / 2;
	}
}
