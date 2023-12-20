import { BaseScene } from "@/scenes/BaseScene";
import _suntimes from "@/data/norrköping_suntimes.json";
import { colorToNumber, interpolateColor } from "@/utils/functions";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color, ColorStr } from "@/utils/colors";
import { RoundRectangle } from "./elements/RoundRectangle";
const suntimes = _suntimes as { [date: string]: number[] };

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
			color: Color.Slate700,
		});
		this.add(this.background);

		this.graphics = scene.add.graphics();
		this.add(this.graphics);

		this.title = this.scene.addText({
			x: -width / 2 + layout.padding / 2,
			y: -height / 2 + layout.padding / 2,
			size: 28,
			fontFamily: "Lato-Bold",
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
		this.loadLegend("Title", stops);
	}

	update(time: number, delta: number) {}

	loadLegend(title: string, stops: { color: string; text: string }[]) {
		this.graphics.clear();
		this.title.setText(title);

		this.labels.forEach((text) => text.destroy());
		this.labels = [];

		const ty = this.title.y + this.title.displayHeight + 20;
		const th = this.height / 2 - ty - layout.padding / 2;
		const gap = 6;
		const size = (th - gap * (stops.length - 1)) / stops.length;

		stops.forEach(({ color, text }, index) => {
			let x = this.title.x + size / 2;
			let y = ty + (size + gap) * index + size / 2;
			let radius = Math.min(size / 2, 24);

			this.graphics.fillStyle(Color.Slate200);
			this.graphics.fillCircle(x, y, radius);
			this.graphics.fillStyle(colorToNumber(color));
			this.graphics.fillCircle(x, y, radius - 2);

			let label = this.scene.addText({
				x: x + 2 * radius,
				y,
				size: Math.min(size, 24),
				fontFamily: "Lato-Bold",
				text,
			});
			label.setOrigin(0, 0.5);
			this.add(label);
			this.labels.push(label);
		});
	}
}
