import { BaseScene } from "@/scenes/BaseScene";
import { Color } from "@/utils/colors";
import { Button } from "./Button";

export class CircularSlider extends Button {
	public scene: BaseScene;

	protected knobRadius: number;
	protected knobSize: number;
	protected arcRadius: number;
	protected arcWidth: number;
	protected symbolRadius: number;
	protected symbolSize: number;

	protected _value: number;
	protected prevValue: number;
	protected knobAngle: number;

	protected hitarea: Phaser.GameObjects.Ellipse;
	protected background: Phaser.GameObjects.Arc;
	protected arcGraphics: Phaser.GameObjects.Graphics;
	protected ticksGraphics: Phaser.GameObjects.Graphics;
	protected symbols: Phaser.GameObjects.Container;
	protected knob: Phaser.GameObjects.Container;
	protected knobOuter: Phaser.GameObjects.Image;
	protected knobInner: Phaser.GameObjects.Image;
	protected label: Phaser.GameObjects.Text;

	constructor(scene: BaseScene, x: number, y: number, radius: number) {
		super(scene, x, y);
		this.scene = scene;

		this._value = 0;
		this.prevValue = 0;
		this.knobAngle = 0;

		/* Sizes */

		this.knobRadius = 0.8 * radius;
		this.knobSize = 0.3 * radius;

		this.arcRadius = this.knobRadius;
		this.arcWidth = 0.1 * radius;

		this.symbolRadius = this.arcRadius - 0.3 * radius;
		this.symbolSize = 0.25 * radius;

		/* Graphics */

		this.hitarea = scene.add.ellipse(0, 0, 2 * radius, 2 * radius, 0, 0.001);
		this.add(this.hitarea);

		this.background = scene.add.circle(0, 0, this.symbolRadius, Color.Slate800);
		this.add(this.background);

		this.arcGraphics = scene.add.graphics();
		this.add(this.arcGraphics);

		this.ticksGraphics = scene.add.graphics();
		this.add(this.ticksGraphics);

		this.symbols = scene.add.container();
		this.add(this.symbols);

		this.knob = scene.add.container();
		this.add(this.knob);

		this.knobOuter = scene.add.image(0, 0, "circle");
		this.knobOuter.setScale((this.knobSize + 8) / this.knobOuter.width);
		this.knobOuter.setTint(Color.Slate900);
		this.knob.add(this.knobOuter);

		this.knobInner = scene.add.image(0, 0, "circle");
		this.knobInner.setScale(this.knobSize / this.knobInner.width);
		this.knob.add(this.knobInner);

		this.label = scene.addText({
			size: 24,
			fontFamily: "Lato-Bold",
		});
		this.label.setOrigin(0.5);
		this.add(this.label);

		/* Input */

		this.bindInteractive(this.hitarea, true);
		this.hitarea.on("pointerdown", this.onDrag, this);
		this.hitarea.on("drag", this.onDrag, this);
	}

	update(time: number, delta: number) {
		let targetAngle = this.value * 2 * Math.PI + Math.PI / 2;
		while (targetAngle < this.knobAngle - Math.PI)
			this.knobAngle -= 2 * Math.PI;
		while (targetAngle > this.knobAngle + Math.PI)
			this.knobAngle += 2 * Math.PI;

		this.knobAngle += 0.2 * (targetAngle - this.knobAngle);

		let x = this.knobRadius * Math.cos(this.knobAngle);
		let y = this.knobRadius * Math.sin(this.knobAngle);
		this.knob.setPosition(x, y);

		this.knob.setScale(1.0 - 0.1 * this.holdSmooth);

		// if (!this.hold && this.value != 0) {
		// 	this.setValue(0);
		// }
	}

	setTicks(
		tickCount: number,
		bigModulo: number,
		smallModulo: number,
		angleOffset: number = 0
	) {
		const alpha = 1.0;

		const startAngle = Math.PI / 2;
		const stepAngle = (1 / tickCount) * 2 * Math.PI;

		this.ticksGraphics.clear();
		this.ticksGraphics.lineStyle(2, 0xffffff, alpha);
		this.ticksGraphics.fillStyle(0xffffff, alpha);
		// this.ticksGraphics.strokeCircle(0, 0, this.knobRadius);

		for (let i = 0; i < tickCount; i++) {
			let angle = i * stepAngle + startAngle + angleOffset;

			const scale =
				i % bigModulo == 0 ? 0.5 : i % smallModulo == 0 ? 0.3 : 0.12;

			this.ticksGraphics.fillCircle(
				this.knobRadius * Math.cos(angle),
				this.knobRadius * Math.sin(angle),
				(this.arcWidth / 2) * scale
			);
		}
	}

	setSymbols(symbols: string[], angleStep: number, angleOffset: number) {
		symbols.forEach((symbol, i) => {
			const angle = i * angleStep + angleOffset;
			const radius = this.symbolRadius;
			const x = radius * Math.cos(angle);
			const y = radius * Math.sin(angle);

			const circle = this.scene.add.circle(
				x,
				y,
				this.symbolSize / 2,
				Color.Slate900
			);
			this.symbols.add(circle);

			const icon = this.scene.add.image(x, y, symbol);
			icon.setTint(Color.Slate600);
			icon.setScale(this.symbolSize / icon.width);
			this.symbols.add(icon);
		});
	}

	drawArcSegment(
		angle1: number,
		angle2: number,
		color1: number,
		color2: number
	) {
		const r1 = this.arcRadius - this.arcWidth / 2;
		const r2 = this.arcRadius + this.arcWidth / 2;

		this.arcGraphics.fillGradientStyle(color1, color2, color1, 0);
		this.arcGraphics.beginPath();
		this.arcGraphics.moveTo(r1 * Math.cos(angle1), r1 * Math.sin(angle1));
		this.arcGraphics.lineTo(r2 * Math.cos(angle1), r2 * Math.sin(angle1));
		this.arcGraphics.lineTo(r2 * Math.cos(angle2), r2 * Math.sin(angle2));
		this.arcGraphics.fillPath();

		this.arcGraphics.fillGradientStyle(color2, color1, color2, 0);
		this.arcGraphics.beginPath();
		this.arcGraphics.moveTo(r1 * Math.cos(angle1), r1 * Math.sin(angle1));
		this.arcGraphics.lineTo(r1 * Math.cos(angle2), r1 * Math.sin(angle2));
		this.arcGraphics.lineTo(r2 * Math.cos(angle2), r2 * Math.sin(angle2));
		this.arcGraphics.fillPath();
	}

	setLabel(text: string) {
		this.label.setText(text);
	}

	onDrag(pointer: Phaser.Input.Pointer) {
		let x = pointer.x - this.x;
		let y = pointer.y - this.y;
		let angle = Math.atan2(y, x) - Math.PI / 2;
		let value = angle / (2 * Math.PI);
		this.value = (value + 1) % 1;
	}

	get value(): number {
		return this._value;
	}

	set value(value: number) {
		this._value = value;
		if (this._value != this.prevValue) {
			this.emit("change", value);
		}
		this.prevValue = value;
	}
}
