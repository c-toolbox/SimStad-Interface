import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { Color } from "@/utils/colors";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { interpolateColor, splitText } from "@/utils/functions";
import { languageManager } from "@/utils/LanguageManager";

export class TabButton extends Button {
	private border: RoundRectangle;
	private background: RoundRectangle;
	private title: Phaser.GameObjects.Text;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number,
		text: string
	) {
		super(scene, x, y);
		this.width = width;
		this.height = height;

		this.border = new RoundRectangle(scene, {
			y: -8,
			width: this.width + 8,
			height: this.height + 8 + 16,
			radius: layout.radius + 4,
			color: Color.White,
			topLeft: false,
			topRight: false,
		});
		this.border.setVisible(false);
		this.add(this.border);

		this.background = new RoundRectangle(scene, {
			y: -16,
			width: this.width,
			height: this.height + 32,
			radius: layout.radius,
			color: Color.Slate700,
			topLeft: false,
			topRight: false,
		});
		this.add(this.background);

		this.title = scene.addText({
			size: 32,
			fontFamily: "Lato-Bold",
			color: "white",
			text: text,
		});
		this.title.setShadow(0, 0, "black", 4);
		this.title.setOrigin(0.5);
		this.title.setAlign("center");
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

		this.setHighlight(false);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.1 * this.holdSmooth);
	}

	setDraggable() {
		this.bindInteractive(this.background, true);
	}

	setWidth(width: number) {
		this.background.setWidth(width);
		this.background.input?.hitArea.setSize(
			this.background.width,
			this.background.height
		);
	}

	setHighlight(value: boolean) {
		// this.border.setVisible(value);
		this.background.setColor(value ? Color.Slate800 : Color.Slate900);
		this.title.setAlpha(value ? 1.0 : 0.5);
	}

	setColor(color: number) {
		this.background.setColor(color);
	}

	setText(key: string) {
		if (languageManager.get(key, false)) {
			languageManager.bind(this.title, key, this.rescaleText.bind(this));
		} else {
			this.title.setText(key);
			this.rescaleText();
		}
	}

	rescaleText() {
		this.title.setScale(1);
		if (this.title.displayWidth > this.background.width - 20) {
			this.title.setText(splitText(this.title.text));
			this.title.displayWidth = this.background.width - 20;
			this.title.scaleY = Math.min(0.8, this.title.scaleX);
			this.title.scaleX = this.title.scaleY;
		}
	}

	getText() {
		return this.title.text;
	}
}
