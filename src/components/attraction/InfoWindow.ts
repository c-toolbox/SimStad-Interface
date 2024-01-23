import { languageManager } from "@/utils/LanguageManager";
import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { ScrollArea } from "@/components/elements/ScrollArea";
import { ScrollBar } from "@/components/elements/ScrollBar";
import { SCALE, VERSION } from "@/utils/constants";
import {
	interpolateColor,
	colorToString,
	colorToNumber,
} from "@/utils/functions";

export class InfoWindow extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private box: Phaser.GameObjects.Container;
	private lines: (Phaser.GameObjects.Text | null)[];
	private scrollArea: ScrollArea;
	private scrollBar: ScrollBar;
	private visButton: Button;
	private visClicks: number;
	private guideModeEnabled: boolean;

	private fontSize: number;
	private sep: number;
	private pad: number;
	private shadowSize: number;
	private alphaGoal: number;

	constructor(
		scene: BaseScene,
		backgroundColor: number,
		highlightColor: number
	) {
		super(scene, scene.CX, scene.CY);
		this.scene = scene;
		scene.add.existing(this);

		this.alphaGoal = 0;
		this.setAlpha(0);
		this.setVisible(false);

		this.width = 0.7 * scene.W;
		this.height = 0.8 * scene.H;
		this.fontSize = 12 * 1.6 * SCALE;
		this.sep = this.fontSize;
		this.pad = 3 * this.fontSize;
		this.shadowSize = 4 * SCALE;

		let outside = scene.add.rectangle(0, 0, scene.W, scene.H, 0x000000, 0.6);
		this.add(outside);

		this.box = this.scene.add.container(0, 0);
		this.add(this.box);

		let bg = new RoundRectangle(scene, {
			x: 0,
			y: 0,
			width: this.width,
			height: this.height,
			radius: 10 * SCALE,
			color: backgroundColor,
			alpha: 0.6,
		});
		this.box.add(bg);

		this.scrollArea = new ScrollArea(
			this.scene,
			// 0,0,
			-this.width / 2 + this.pad,
			-this.height / 2 + this.pad,
			0.85 * this.width - 2 * this.pad,
			this.height - 2 * this.pad - this.fontSize - this.sep,
			50 * SCALE
		);
		this.box.add(this.scrollArea);

		this.scrollBar = new ScrollBar(
			this.scene,
			-this.width / 2 + this.pad / 2,
			-this.fontSize,
			6 * SCALE,
			this.scrollArea.height
		);
		this.box.add(this.scrollBar);

		let textColor = "#FFFFFF";
		let highColor = colorToString(highlightColor);
		let lines = [
			{ weight: 700, color: highColor, text: "info_welcome" },
			{ weight: 700, size: 4, text: "info_title" },
			{ weight: 500, text: "info_pitch" },
			null,
			{ weight: 700, size: 1, color: textColor, text: "info_how_1" },
			{ weight: 500, text: "info_how_2" },
			null,
			{ weight: 700, size: 1, color: textColor, text: "info_data_1" },
			{ weight: 500, text: "info_data_2" },
			null,
			{ weight: 700, size: 1, color: textColor, text: "info_who_1" },
			{ weight: 500, text: "info_who_2" },
			null,
			{ weight: 700, size: 1, color: textColor, text: "info_model_1" },
			{ weight: 500, text: "info_model_2" },
			null,
			{ weight: 700, size: 1, color: textColor, text: "info_software_1" },
			{ weight: 500, text: "info_software_2" },
		];

		this.lines = [];
		// let y = -this.height / 2 + this.pad;
		// let y = 0;
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line) {
				let key = line.text;
				// let x = -this.width / 2 + this.pad;
				// let x = 2*SCALE;
				let text = scene.addText({
					x: 0,
					y: 0,
					size: this.fontSize * (1 + (line.size || 0) / 6),
					color: line.color || "#FFF",
					text: "Text",
					weight: line.weight,
				});
				// text.setLineSpacing(10);
				// text.setBlendMode(Phaser.BlendModes.SCREEN);
				text.setPadding(this.shadowSize);
				text.setShadow(0, 0, "#111", this.shadowSize);
				text.setWordWrapWidth(0.85 * this.width - 2 * this.pad);
				languageManager.bind(text, key);
				this.lines.push(text);
				// this.box.add(text);
				this.scrollArea.apply(text);
				// y += text.displayHeight;
			} else {
				this.lines.push(null);
			}
			// y += this.sep;
		}
		this.repositionText();

		let qw = 0.15 * this.width - this.pad;
		let qx = 0.5 * this.width - this.pad;
		let qy = -0.5 * this.height + this.pad;

		// let qrBg = new RoundRectangle(scene, qx-qw/2, qy+qw/2, qw, qw, 4, 0xFFFFFF);
		// this.box.add(qrBg);

		let visLogo = scene.add.image(0, 0, "vis_c_logo");
		visLogo.setScale(qw / visLogo.width);
		// visLogo.setOrigin(1, 0);
		visLogo.setAlpha(1.0);
		visLogo.setTint(highlightColor);
		visLogo.setBlendMode(Phaser.BlendModes.ADD);

		this.visButton = new Button(
			this.scene,
			qx - visLogo.displayWidth / 2,
			qy + visLogo.displayHeight / 2
		);
		this.box.add(this.visButton);
		this.visButton.bindInteractive(visLogo);
		this.visButton.add(visLogo);

		let visText = scene.addText({
			x: this.visButton.x,
			y: this.visButton.y + qw / 2 + this.fontSize,
			size: this.fontSize,
			fontFamily: "Lato-Bold",
			color: "white",
		});
		visText.setOrigin(0.5, 0.0);
		visText.setVisible(false);
		languageManager.bind(visText, "guide_mode");
		this.box.add(visText);

		// Easter egg
		this.guideModeEnabled = false;
		this.visClicks = 0;
		this.visButton.on("click", () => {
			this.visClicks += 1;
			if (this.visClicks % 3 == 0) {
				this.scene.tweens.addCounter({
					from: 0,
					to: 360,
					duration: 1000,
					ease: "Back.InOut",
					onUpdate: (tween) => {
						this.visButton.setAngle(tween.getValue());
						this.visClicks = 0;
					},
				});
				this.scene.addEvent(500, () => {
					this.guideModeEnabled = !this.guideModeEnabled;
					visLogo.setTint(this.guideModeEnabled ? 0xffffff : highlightColor);
					visText.setVisible(this.guideModeEnabled);
				});
			}
		});

		/*
		let visImage = scene.add.image(0, 0, "vis_c_logo");
		visImage.setScale(qw / visImage.width);
		// visImage.setOrigin(1, 0);
		visImage.setAlpha(0.5);
		visImage.setTint(highlightColor);
		visImage.setBlendMode(Phaser.BlendModes.SCREEN);

		qy = 0 * this.height + this.pad;
		let visButton = new Button(this.scene,
			qx - visImage.displayWidth/2,
			qy + visImage.displayHeight/2);
		this.box.add(visButton);
		visButton.bindInteractive(visImage);
		visButton.add(visImage);
		*/

		let cx = this.width / 2 - this.pad;
		let cy = this.height / 2 - this.pad;
		let copyright = scene.addText({
			x: cx,
			y: cy,
			size: this.fontSize,
			color: textColor,
			text: "Copyright",
		}); // light
		copyright.setOrigin(1, 1);
		copyright.setBlendMode(Phaser.BlendModes.SCREEN);
		copyright.setPadding(this.shadowSize);
		copyright.setShadow(0, 0, "#111", this.shadowSize);
		languageManager.bind(
			copyright,
			"info_copyright",
			this.repositionText.bind(this)
		);
		this.box.add(copyright);

		let version = scene.addText({
			x: cx,
			y: cy - 1.4 * this.fontSize,
			size: this.fontSize,
			color: textColor,
			text: VERSION,
		}); // light
		version.setOrigin(1, 1);
		version.setPadding(this.shadowSize);
		version.setShadow(0, 0, "#111", this.shadowSize);
		version.setBlendMode(Phaser.BlendModes.SCREEN);
		this.box.add(version);

		// Dismiss on any clicks
		outside.setInteractive({ useHandCursor: true }).on(
			"pointerdown",
			() => {
				if (this.isOpen) {
					this.hide();
				}
			},
			this
		);
	}

	repositionText() {
		// let y = -this.height / 2 + this.pad;
		let y = 0;
		for (let i = 0; i < this.lines.length; i++) {
			if (this.lines[i]) {
				this.lines[i]!.y = y;
				y += this.lines[i]!.height;
			}
			y += this.sep - this.shadowSize;
		}

		this.scrollArea.updateSize();
	}

	show() {
		this.alphaGoal = 1;
		this.scrollArea.reset();
	}

	hide() {
		this.alphaGoal = 0;
		this.emit("close");

		this.visClicks = 0;
	}

	public get isOpen(): boolean {
		return this.alpha == 1;
	}

	public get isClosed(): boolean {
		return this.alpha == 0;
	}

	update(time: number, delta: number) {
		const duration = 250;
		this.alpha += Phaser.Math.Clamp(
			this.alphaGoal - this.alpha,
			-delta / duration,
			delta / duration
		);
		this.box.y = Phaser.Math.Easing.Cubic.In(1 - this.alpha) * 20 * SCALE;
		this.setVisible(this.alpha > 0);
		this.scrollArea.update(time, delta);
		this.scrollBar.set(this.scrollArea.getScroll());

		this.visButton.setScale(1.0 - 0.05 * this.visButton.holdSmooth);
	}
}
