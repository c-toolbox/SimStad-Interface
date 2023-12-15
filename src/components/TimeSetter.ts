import { BaseScene } from "@/scenes/BaseScene";
import { RoundRectangle } from "./elements/RoundRectangle";
import { TestSlider } from "./TestSlider";
import { SunDial } from "@/components/SunDial";
import { Color } from "@/utils/colors";
import { languageManager } from "@/utils/LanguageManager";
import { layoutManager as layout } from "@/utils/LayoutManager";

const START_DATE = new Date("2023-01-01 00:00:00").getTime();
const END_DATE = new Date("2023-12-31 23:59:59").getTime();

export class TimeSetter extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private background: RoundRectangle;
	private dateSlider: TestSlider;
	private hourSlider: TestSlider;
	private sunDial: SunDial;

	private year: number;
	private month: number;
	private day: number;
	private hour: number;

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);
		this.scene = scene;
		scene.add.existing(this);

		this.width = 550;
		this.height = 250;

		this.year = 2023;
		this.month = 1;
		this.day = 1;
		this.hour = 0;

		this.background = new RoundRectangle(scene, {
			x: 0,
			y: 0,
			width: this.width,
			height: this.height,
			radius: layout.radius,
			color: Color.Slate700,
		});
		this.add(this.background);

		this.sunDial = new SunDial(scene, 0, 10);
		this.add(this.sunDial);

		this.dateSlider = new TestSlider(scene, 0, -50, "Date");
		this.dateSlider.on("onChange", this.setDate, this);
		this.dateSlider.value = 0.497;
		this.add(this.dateSlider);

		this.hourSlider = new TestSlider(scene, 0, 70, "Time");
		this.hourSlider.on("onChange", this.setHour, this);
		this.hourSlider.value = 0.501;
		this.add(this.hourSlider);

		let dummy = scene.add.text(0, 0, "");
		dummy.setVisible(false);
		languageManager.bind(dummy, "", () => {
			this.setDate(this.dateSlider.value);
			this.setHour(this.hourSlider.value);
		});
	}

	update(time: number, delta: number) {
		this.dateSlider.update(time, delta);
		this.hourSlider.update(time, delta);
	}

	setDate(value: number) {
		const date = this.numberToDate(value);
		this.month = date.getMonth() + 1;
		this.day = date.getDate();

		this.dateSlider.setLabel(languageManager.getDate(date));
		this.emit("setTime", this.year, this.month, this.day, this.hour);
		this.updateSunDial();
	}

	setHour(value: number) {
		this.hour = (23 + 59 / 60) * value;

		let hours = Math.floor(this.hour);
		let minutes = Math.floor((this.hour % 1) * 60);
		let date = new Date(`2023-01-01 ${hours}:${minutes}`);
		this.hourSlider.setLabel(languageManager.getHour(date));

		this.emit("setTime", this.year, this.month, this.day, this.hour);
		this.updateSunDial();
	}

	numberToDate(value: number) {
		return new Date(START_DATE + (END_DATE - START_DATE) * value);
	}

	updateSunDial() {
		this.sunDial.setDate(this.month, this.day, this.hour);
	}
}
