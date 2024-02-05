import { BaseScene } from "@/scenes/BaseScene";
import _suntimes from "@/assets/data/norrköping_suntimes.json";
import { interpolateColor } from "@/utils/functions";
import { Color, ColorStr } from "@/utils/colors";
const suntimes = _suntimes as { [date: string]: number[] };

export class SunDial extends Phaser.GameObjects.Container {
	public scene: BaseScene;
	private graphics: Phaser.GameObjects.Graphics;
	private labels: Phaser.GameObjects.Text[];
	private innerRadius: number;
	private outerRadius: number;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		innerWidth: number,
		outerWidth: number
	) {
		super(scene, x, y);
		this.scene = scene;

		this.innerRadius = innerWidth / 2;
		this.outerRadius = outerWidth / 2;

		this.graphics = scene.add.graphics();
		this.add(this.graphics);

		this.initLabels();

		this.setDate(7, 1, 12);
	}

	update(time: number, delta: number) {}

	initLabels() {
		this.labels = [];
		const texts = ["18:00", "00:00", "06:00", "12:00"];

		for (let i = 0; i < texts.length; i++) {
			let a = (i / texts.length) * 2 * Math.PI;
			let r = this.innerRadius - (this.outerRadius - this.innerRadius) / 4;
			let x = r * Math.cos(a);
			let y = r * Math.sin(a);

			let label = this.scene.addText({
				x,
				y,
				size: 18,
				fontFamily: "Lato-Bold",
				color: ColorStr.White,
				text: texts[i],
				alpha: 0.5
			});
			label.setOrigin(0.5 + 0.5 * Math.cos(a), 0.5 + 0.5 * Math.sin(a));
			this.add(label);
			this.labels.push(label);
		}
	}

	setDate(month: number, day: number, hour: number) {
		let summertime =
			(month > 3 && month < 10) ||
			(month == 3 && day >= 26) ||
			(month == 10 && day <= 28);

		let date = `${day}/${month}`;
		let [
			astronomical_dawn,
			nautical_dawn,
			twilight_dawn,
			civil_dawn,
			blue_dawn,
			sunrise,
			gold_dawn,
			zenit,
			gold_dusk,
			sunset,
			blue_dusk,
			civil_dusk,
			twilight_dusk,
			nautical_dusk,
			astronomical_dusk,
		] = suntimes[date];

		let stops = [
			[nautical_dusk - 1, 0x1e1b4b], // Dark blue
			[astronomical_dusk - 1, 0x0f172a], // Dark slate

			[astronomical_dawn, 0x0f172a], // Dark slate
			[nautical_dawn, 0x1e1b4b], // Dark blue
			[civil_dawn, 0x831843], // Dark pink
			[sunrise, 0xea580c], // Orange
			[gold_dawn, 0x60a5fa], // Light blue
			[zenit, 0x60a5fa], // Light blue
			[gold_dusk, 0x60a5fa], // Light blue
			[sunset, 0xea580c], // Orange
			[civil_dusk, 0x831843], // Dark pink
			[nautical_dusk, 0x1e1b4b], // Dark blue
			[astronomical_dusk, 0x0f172a], // Dark slate

			[astronomical_dawn + 1, 0x0f172a], // Dark slate
			[nautical_dawn + 1, 0x1e1b4b], // Dark blue
		];
		// stops = stops.map((stop) => {
		// 	if (stop[0] == null) {
		// 		stop[0] = stop[0] < 0.5 ? 0.0 : 1.0;
		// 	}
		// 	return stop;
		// });
		stops = stops.filter((stop) => stop !== null);

		function getColor(t: number) {
			for (let i = 0; i < stops.length - 1; i++) {
				if (stops[i][0] <= t && t <= stops[i + 1][0]) {
					let k = (t - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
					return interpolateColor(stops[i][1], stops[i + 1][1], k);
				}
			}
			return 0xff0000;
		}

		this.graphics.clear();

		const steps = 64;

		for (let i = 0; i < steps; i++) {
			let angle1 = (i / steps) * 2 * Math.PI + Math.PI / 2;
			let angle2 = ((i + 1) / steps) * 2 * Math.PI + Math.PI / 2;
			let color1 = getColor(i / steps);
			let color2 = getColor((i + 1) / steps);

			if (summertime) {
				angle1 -= (1 / 24) * 2 * Math.PI;
				angle2 -= (1 / 24) * 2 * Math.PI;
			}

			this.graphics.fillGradientStyle(color1, color2, color1, 0);
			this.graphics.beginPath();
			this.graphics.moveTo(
				this.innerRadius * Math.cos(angle1),
				this.innerRadius * Math.sin(angle1)
			);
			this.graphics.lineTo(
				this.outerRadius * Math.cos(angle1),
				this.outerRadius * Math.sin(angle1)
			);
			this.graphics.lineTo(
				this.outerRadius * Math.cos(angle2),
				this.outerRadius * Math.sin(angle2)
			);
			this.graphics.fillPath();

			this.graphics.fillGradientStyle(color2, color1, color2, 0);
			this.graphics.beginPath();
			this.graphics.moveTo(
				this.innerRadius * Math.cos(angle1),
				this.innerRadius * Math.sin(angle1)
			);
			this.graphics.lineTo(
				this.innerRadius * Math.cos(angle2),
				this.innerRadius * Math.sin(angle2)
			);
			this.graphics.lineTo(
				this.outerRadius * Math.cos(angle2),
				this.outerRadius * Math.sin(angle2)
			);
			this.graphics.fillPath();
		}

		let r = this.outerRadius - (this.outerRadius - this.innerRadius) / 2;
		let a = (hour / 24) * 2 * Math.PI + Math.PI / 2;
		if (summertime) a -= (1 / 24) * 2 * Math.PI;
		let x = r * Math.cos(a);
		let y = r * Math.sin(a);
		this.graphics.fillStyle(Color.White);
		this.graphics.fillCircle(x, y, 5);

		// for (let i = 0; i < stops.length; i++) {
		// 	let [time, color] = stops[i];
		// 	let r = this.outerRadius + (this.outerRadius - this.innerRadius) / 4;
		// 	let a = time * 2 * Math.PI + Math.PI / 2;
		// 	if (summertime) a -= (1 / 24) * 2 * Math.PI;
		// 	let x = r * Math.cos(a);
		// 	let y = r * Math.sin(a);
		// 	this.graphics.fillStyle(color);
		// 	this.graphics.fillCircle(x, y, 15);
		// }
	}
}
