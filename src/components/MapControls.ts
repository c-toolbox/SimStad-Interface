import { BaseScene } from "@/scenes/BaseScene";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";
import { RoundRectangle } from "./elements/RoundRectangle";
import { SocketManager } from "@/utils/SocketManager";
import { CircleButton } from "./CircleButton";
import { SunDial } from "./SunDial";
import { SeasonDial } from "./SeasonDial";
import { languageManager } from "@/utils/LanguageManager";

const START_DATE = new Date("2023-01-01 00:00:00").getTime();
const END_DATE = new Date("2023-12-31 23:59:59").getTime();

export class MapControls extends Phaser.GameObjects.Container {
	public scene: BaseScene;
	private socket: SocketManager;

	private controlButtons: CircleButton[];
	private dateDial: SeasonDial;
	private hourDial: SunDial;

	private year: number;
	private month: number;
	private day: number;
	private hour: number;

	constructor(scene: BaseScene, socket: SocketManager) {
		super(scene);
		this.scene = scene;
		this.socket = socket;

		this.year = 2024;
		this.month = 1;
		this.day = 1;
		this.hour = 0;

		/* Controls background */

		let controlsBg = new RoundRectangle(scene, {
			x: layout.mapControlsUpper.centerX,
			y: layout.mapControlsUpper.centerY,
			width: layout.mapControlsUpper.width,
			height: layout.mapControlsUpper.height,
			radius: layout.radius,
			color: Color.Slate900,
		});
		this.add(controlsBg);

		/* Control buttons */

		this.controlButtons = [];

		const cll = layout.mapControlsLower;
		// const size = cll.height;
		// const xCoords = [cll.left + size / 2, cll.centerX, cll.right - size / 2];

		// for (let i = 0; i < xCoords.length; i++) {
		// 	let x = xCoords[i];
		// 	let y = cll.centerY;

		// 	let button = new CircleButton(
		// 		this.scene,
		// 		x,
		// 		y,
		// 		0.8 * size,
		// 		"lightbulb",
		// 		Color.Slate700
		// 	);
		// 	// button.on("click", () => {});
		// 	this.add(button);
		// 	this.controlButtons.push(button);
		// }

		// this.controlButtons[2].setTexture("marker");
		// this.controlButtons[2].on("click", () => {
		// 	const thingX = layout.map.centerX;
		// 	const thingY = layout.map.centerY;

		// 	const py = 1 - (thingX - layout.map.left) / layout.map.width;
		// 	const px = 1 - (thingY - layout.map.top) / layout.map.height;
		// 	const x = MIN_X + (MAX_X - MIN_X) * px;
		// 	const y = MIN_Y + (MAX_Y - MIN_Y) * py;
		// 	const color = ColorStr.Yellow500;

		// 	this.socket.sendMapLight("special", x, y, 400, color, "add", true);
		// });

		const cul = layout.mapControlsUpper;

		this.dateDial = new SeasonDial(
			scene,
			cul.left + cul.height / 2,
			cul.centerY,
			cul.height / 2
		);
		this.add(this.dateDial);

		this.hourDial = new SunDial(
			scene,
			cul.right - cul.height / 2,
			cul.centerY,
			cul.height / 2
		);
		this.add(this.hourDial);

		this.dateDial.on("change", (value: number) => {
			this.setDate(value);
		});
		this.hourDial.on("change", (value: number) => {
			this.setHour(value);
		});

		let dummy = scene.add.text(0, 0, "");
		dummy.setVisible(false);
		languageManager.bind(dummy, "", () => {
			this.setDate(this.dateDial.value);
			this.setHour(this.hourDial.value);
		});

		this.dateDial.value = 0.497;
		this.hourDial.value = 0.501;
	}

	update(time: number, delta: number) {
		this.controlButtons.forEach((button) => button.update(time, delta));
		this.dateDial.update(time, delta);
		this.hourDial.update(time, delta);
	}

	setDate(value: number) {
		const date = this.numberToDate(value);
		this.month = date.getMonth() + 1;
		this.day = date.getDate();

		this.dateDial.setLabel(languageManager.getDate(date));
		this.hourDial.setDate(this.month, this.day);

		this.setLight(this.year, this.month, this.day, this.hour);
	}

	setHour(value: number) {
		this.hour = (23 + 59 / 60) * value;

		let hours = Math.floor(this.hour);
		let minutes = Math.floor((this.hour % 1) * 60);
		let date = new Date(`2023-01-01 ${hours}:${minutes}`);
		this.hourDial.setLabel(languageManager.getHour(date));

		this.setLight(this.year, this.month, this.day, this.hour);
	}

	setLight(year: number, month: number, day: number, hour: number) {
		if (this.socket.lightAvailable) {
			this.socket.sendLight(year, month, day, hour);
		}
	}

	resetLight() {
		this.dateDial.value = 0.497;
		this.hourDial.value = 0.501;
	}

	numberToDate(value: number) {
		return new Date(START_DATE + (END_DATE - START_DATE) * value);
	}

	// reset() {}
}
