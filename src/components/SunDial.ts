import { BaseScene } from "@/scenes/BaseScene";
import { CircularSlider } from "./elements/CircularSlider";
import _suntimes from "@/data/norrköping_suntimes.json";
import { interpolateColor } from "@/utils/functions";
import { Color } from "@/utils/colors";
const suntimes = _suntimes as { [date: string]: number[] };

export class SunDial extends CircularSlider {
	private summerTime: boolean;

	constructor(scene: BaseScene, x: number, y: number, diameter: number) {
		super(scene, x, y, diameter);
		this.scene = scene;
		this.summerTime = false;

		this.setTicks(24, 6, 3, -0.5 * Math.PI);
		this.setSymbols(["day_sun", "day_moon"], Math.PI, -0.5 * Math.PI);
	}

	update(time: number, delta: number): void {
		super.update(time, delta);

		const targetAngle = this.summerTime ? 15 : 0;
		this.arcGraphics.angle += (targetAngle - this.arcGraphics.angle) * 0.2;
	}

	setDate(month: number, day: number) {
		this.summerTime =
			(month == 3 && day >= 26) ||
			(month > 3 && month < 10) ||
			(month == 10 && day <= 28);

		let date = `${day}/${month}`;
		let [
			astronomical_dawn,
			nautical_dawn,
			// twilight_dawn,
			civil_dawn,
			// blue_dawn,
			sunrise,
			gold_dawn,
			zenit,
			gold_dusk,
			sunset,
			// blue_dusk,
			civil_dusk,
			// twilight_dusk,
			nautical_dusk,
			astronomical_dusk,
		] = suntimes[date];

		gold_dawn = 0.25 * gold_dawn + 0.75 * zenit;
		gold_dusk = 0.25 * gold_dusk + 0.75 * zenit;

		let stops = [
			[astronomical_dawn, Color.Slate900], // Dark slate
			[nautical_dawn, Color.Indigo950], // Dark blue
			[civil_dawn, Color.Pink900], // Dark pink
			[sunrise, Color.Orange600], // Orange
			[gold_dawn, Color.Blue400], // Light blue
			[zenit, Color.Blue200], // Light blue
			[gold_dusk, Color.Blue400], // Light blue
			[sunset, Color.Orange600], // Orange
			[civil_dusk, Color.Pink900], // Dark pink
			[nautical_dusk, Color.Indigo950], // Dark blue
			[astronomical_dusk, Color.Slate900], // Dark slate
		];
		stops = stops.filter((stop) => stop[0] !== null);

		const colorsByBrightness = [
			Color.Slate900,
			Color.Indigo950,
			Color.Pink900,
			Color.Orange600,
		];
		let darkestIndex = colorsByBrightness.length - 1;
		stops.forEach((stop) => {
			const index = colorsByBrightness.indexOf(stop[1]);
			if (index >= 0 && index < darkestIndex) {
				darkestIndex = index;
			}
		});
		darkestIndex = Math.max(0, darkestIndex - 1);
		const defaultColor = colorsByBrightness[darkestIndex];
		stops.unshift([0.0, defaultColor]);
		stops.push([1.0, defaultColor]);

		function getColor(t: number) {
			for (let i = 0; i < stops.length - 1; i++) {
				if (stops[i][0] <= t && t <= stops[i + 1][0]) {
					let k = (t - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
					return interpolateColor(stops[i][1], stops[i + 1][1], k);
				}
			}
			return defaultColor;
		}

		this.arcGraphics.clear();

		const steps = 100;

		for (let i = 0; i < steps; i++) {
			let angle1 = (i / steps) * 2 * Math.PI + Math.PI / 2;
			let angle2 = ((i + 1) / steps) * 2 * Math.PI + Math.PI / 2;
			let color1 = getColor(i / steps);
			let color2 = getColor((i + 1) / steps);

			if (this.summerTime) {
				angle1 -= (1 / 24) * 2 * Math.PI;
				angle2 -= (1 / 24) * 2 * Math.PI;
			}

			this.drawArcSegment(angle1, angle2, color1, color2);
		}
	}
}
