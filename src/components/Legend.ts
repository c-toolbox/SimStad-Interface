import { BaseScene } from "@/scenes/BaseScene";
import {
	colorToGrayscale,
	colorToNumber,
	interpolateColor,
} from "@/utils/functions";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color, ColorStr } from "@/utils/colors";
import { RoundRectangle } from "./elements/RoundRectangle";
import { languageManager } from "@/utils/LanguageManager";

export class Legend extends Phaser.GameObjects.Container {
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
			radius: layout.radius,
			color: Color.Slate900,
		});
		this.add(this.background);

		this.graphics = scene.add.graphics();
		this.add(this.graphics);

		this.title = this.scene.addText({
			x: -width / 2 + layout.padding / 2,
			y: -height / 2 + layout.padding / 2,
			size: 28,
			fontFamily: "Lato-Bold",
			color: "white",
		});
		this.add(this.title);

		let hr = this.scene.add.rectangle(
			0,
			this.title.y + this.title.displayHeight + 4,
			width - layout.padding,
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
		this.setTitle(title);

		const legendTitleSize = 28;
		const legendLabelSize = 28;
		const padding = 80;

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
			});
			label.setOrigin(0, 0.5);
			this.add(label);
			this.labels.push(label);

			const maxWidth = this.width / 2 - 20 - label.x;
			if (languageManager.get(title + index, false)) {
				languageManager.bind(label, title + index, () => {
					if (label.displayWidth > maxWidth) {
						label.displayWidth = maxWidth;
					}
				});
			}
		});
	}

	setTitle(key: string) {
		if (languageManager.get(key, false)) {
			languageManager.bind(this.title, key, () => {
				this.title.setScale(1);
				if (this.title.displayWidth > this.background.width - 40) {
					this.title.displayWidth = this.background.width - 40;
				}
			});
		} else {
			this.title.setText(key);
		}
	}
}
