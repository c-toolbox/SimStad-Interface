import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { interpolateColor } from "@/utils/functions";
import { languageManager } from "@/utils/LanguageManager";

export class TextButton extends Button {
	private border: RoundRectangle;
	private background: RoundRectangle;
	private title: Phaser.GameObjects.Text;

	private color: number;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number,
		text: string,
		color: number
	) {
		super(scene, x, y);
		this.width = width;
		this.height = height;
		this.color = color;

		this.border = new RoundRectangle(scene, {
			width: this.width + 8,
			height: this.height + 8,
			radius: layout.radius + 4,
			color: Color.White,
		});
		this.border.setVisible(false);
		this.add(this.border);

		this.background = new RoundRectangle(scene, {
			width: this.width,
			height: this.height,
			radius: layout.radius,
			color: color,
		});
		this.add(this.background);

		this.title = scene.addText({
			size: 32,
			fontFamily: "Lato-Bold",
			color: "white",
			text: text,
		});
		this.title.setOrigin(0.5);
		this.setText(text);
		this.add(this.title);

		this.bindInteractive(this.background);
		this.background.on("wheel", (...args: any) => this.emit("wheel", ...args));
		this.background.on("dragstart", (...args: any) =>
			this.emit("dragstart", ...args)
		);
		this.background.on("drag", (...args: any) => this.emit("drag", ...args));
		this.background.on("dragend", (...args: any) =>
			this.emit("dragend", ...args)
		);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.1 * this.holdSmooth);
	}

	setDraggable() {
		this.bindInteractive(this.background, true);
	}

	setHighlight(value: boolean) {
		this.border.setVisible(value);

		let t = value ? 0.2 : 0.0;
		let color = interpolateColor(this.color, Color.White, t);
		this.background.setColor(color);
	}

	setText(key: string) {
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

	getText() {
		return this.title.text;
	}
}
