import { BaseScene } from "@/scenes/BaseScene";
import { CircularSlider } from "./elements/CircularSlider";
import { Color } from "@/utils/colors";
import { interpolateColor } from "@/utils/functions";

export class SeasonDial extends CircularSlider {
	constructor(scene: BaseScene, x: number, y: number, diameter: number) {
		super(scene, x, y, diameter);

		this.resetValue();
		this.setTicks(48, 12, 4, (2 / 6) * Math.PI);
		this.setSymbols(
			["season_fall", "season_winter", "season_spring", "season_summer"],
			0.5 * Math.PI,
			0
		);

		this.drawSeasons();
	}

	resetValue() {
		this._value = 0.497;
	}

	drawSeasons() {
		let stops = [
			[0.0, Color.Green600],
			[0.05, Color.Green600],

			[0.2, Color.Yellow400],
			[0.25, Color.Yellow400],
			[0.3, Color.Yellow400],

			[0.45, Color.Orange600],
			[0.5, Color.Orange600],

			[0.65, Color.Slate900],
			[0.75, Color.Slate900],
			[0.85, Color.Slate900],

			[1.0, Color.Green600],
		];

		function getColor(t: number) {
			for (let i = 0; i < stops.length - 1; i++) {
				if (stops[i][0] <= t && t <= stops[i + 1][0]) {
					let k = (t - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
					return interpolateColor(stops[i][1], stops[i + 1][1], k);
				}
			}
			return 0xff0000;
		}

		this.arcGraphics.clear();

		const steps = 100;

		for (let i = 0; i < steps; i++) {
			let angle1 = (i / steps) * 2 * Math.PI;
			let angle2 = ((i + 1) / steps) * 2 * Math.PI;
			let color1 = getColor(i / steps);
			let color2 = getColor((i + 1) / steps);

			this.drawArcSegment(angle1 + Math.PI, angle2 + Math.PI, color1, color2);
		}
	}
}
