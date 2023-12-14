import { BaseScene } from "@/scenes/BaseScene";
import { interpolateColor } from "@/utils/functions";
import { Color } from "@/utils/colors";

export class LoadingIcon extends Phaser.GameObjects.Container {
	public scene: BaseScene;
	private graphics: Phaser.GameObjects.Graphics;

	private color: number;
	private radius: number;
	private points: number;
	private time: number;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		color: number = 0xffffff,
		radius: number = 400,
		points: number = 50
	) {
		super(scene, x, y);
		this.scene = scene;
		this.scene.add.existing(this);

		this.color = color;
		this.radius = radius;
		this.points = points;
		this.time = 0;

		this.graphics = scene.add.graphics();
		this.add(this.graphics);
	}

	update(time: number, delta: number) {
		if (!this.visible) {
			this.time = 0;
			return;
		}

		this.time += 4 * (delta / 1000);

		let angle = this.time + 0.5 * Math.sin(-this.time);

		this.graphics.clear();

		this.drawArc(0x3e0001, 7, 2, 1.0 * Math.PI + 2 * angle, -1.0 * Math.PI); // Brown
		this.drawArc(0xa32466, 7, 2, 1.75 * Math.PI + 2 * angle, -1.0 * Math.PI); // Purple
		this.drawArc(0xa41d21, 5, 1, 0.5 * Math.PI + 2 * angle, 0.75 * Math.PI); // Dark red inner
		this.drawArc(0xa41d21, 8, 2, 0.25 * Math.PI + 2 * angle, 0.5 * Math.PI); // Dark red wide
		this.drawArc(0x43793a, 5, 1, 1.0 * Math.PI + 2 * angle, 0.5 * Math.PI); // Dark green inner
		this.drawArc(0x1b4f70, 5, 1, 1.25 * Math.PI + 3 * angle, 0.5 * Math.PI); // Dark blue inner

		this.drawArc(0xca2027, 9, 1, 0.5 * Math.PI + 3 * angle, 0.5 * Math.PI); // Red outer
		this.drawArc(0xf47921, 6, 3, 0.5 * Math.PI + 2 * angle, 0.75 * Math.PI); // Orange wide
		this.drawArc(0xfec028, 7, 3, 0.75 * Math.PI + 2 * angle, 0.75 * Math.PI); // Yellow wide
		this.drawArc(0x57a145, 6, 3, 1.0 * Math.PI + 2 * angle, 0.5 * Math.PI); // Green wide
		this.drawArc(0x1b81b9, 8, 2, 1.25 * Math.PI + 1 * angle, 0.25 * Math.PI); // Blue wide outer
		this.drawArc(0x1b81b9, 6, 1, 1.25 * Math.PI + 3 * angle, 0.5 * Math.PI); // Blue thin inner

		this.drawArc(0x57a145, 7, 1, 1.0 * Math.PI + 3 * angle, 0.5 * Math.PI); // Green thin
		this.drawArc(0xf47921, 7, 1, 0.25 * Math.PI + 3 * angle, 0.5 * Math.PI); // Orange thin
	}

	drawArc(
		color: number,
		radius: number,
		thickness: number,
		startAngle: number,
		arcAngle: number
	) {
		// this.graphics.fillStyle(color);
		this.graphics.fillStyle(this.color, 1.0);

		radius *= this.radius / 10;
		thickness *= this.radius / 10;

		arcAngle = arcAngle % (4 * Math.PI);
		if (arcAngle < 0) arcAngle += 4 * Math.PI;
		if (arcAngle > 2 * Math.PI) {
			arcAngle = 4 * Math.PI - arcAngle;
			startAngle -= arcAngle;
		}

		let angle = 0.0;
		let step = (2 * Math.PI) / this.points;
		while (angle != arcAngle) {
			let nextAngle = angle + step;
			if (nextAngle > arcAngle) nextAngle = arcAngle;
			let outrad = radius + thickness;

			this.graphics.beginPath();
			this.graphics.moveTo(
				radius * Math.cos(startAngle + angle),
				radius * Math.sin(startAngle + angle)
			);
			this.graphics.lineTo(
				radius * Math.cos(startAngle + nextAngle),
				radius * Math.sin(startAngle + nextAngle)
			);
			this.graphics.lineTo(
				outrad * Math.cos(startAngle + nextAngle),
				outrad * Math.sin(startAngle + nextAngle)
			);
			this.graphics.lineTo(
				outrad * Math.cos(startAngle + angle),
				outrad * Math.sin(startAngle + angle)
			);
			this.graphics.fillPath();

			angle = nextAngle;
		}
	}
}
