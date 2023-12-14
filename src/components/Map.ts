import { BaseScene } from "@/scenes/BaseScene";
import { Color } from "@/utils/colors";
import { TimeSetter } from "@/components/TimeSetter";

// Bottom right
const MIN_X = 129411.4;
const MIN_Y = 6495015.262;

// Top left
const MAX_X = 134211.4;
const MAX_Y = 6498915.262;

export class Map extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private map: Phaser.GameObjects.Image;
	private timeSetter: TimeSetter;
	private layout: Phaser.Geom.Rectangle;

	private lamps: Phaser.GameObjects.Image[];

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		layout: Phaser.Geom.Rectangle
	) {
		super(scene, x, y);
		this.scene = scene;
		this.layout = layout;

		this.map = scene.add.image(0, 0, "karta");
		this.map.angle = -90;
		this.map.setScale(layout.height / this.map.width);
		this.map.setPosition(
			layout.right - this.map.displayHeight / 2,
			layout.centerY
		);

		this.width = this.map.displayHeight;

		this.timeSetter = new TimeSetter(scene, this.map.x, layout.bottom - 150);
		// this.timeSetter.setVisible(false);
		this.timeSetter.on(
			"setTime",
			(year: number, month: number, day: number, hour: number) => {
				this.emit("setTime", year, month, day, hour);
			}
		);

		this.map
			.setInteractive({ useHandCursor: true, draggable: true })
			.on("pointerdown", this.onClick, this)
			.on("drag", this.onDrag, this);

		this.lamps = [];
	}

	update(time: number, delta: number) {
		this.timeSetter.update(time, delta);
	}

	onClick(pointer: Phaser.Input.Pointer, localX: number, localY: number) {
		const py = 1 - localY / this.map.height;
		const px = localX / this.map.width;

		const x = MIN_X + (MAX_X - MIN_X) * px;
		const y = MIN_Y + (MAX_Y - MIN_Y) * py;

		console.log(x, y);

		this.emit("send", {
			type: "MapLightRequest",
			name: "name",
			northing: x,
			easting: y,
			height: 60,
			color: "#0000FF",
			typeofmessage: this.lamps.length > 0 ? "update" : "add",
			enable: true,
		});

		let ix = pointer.x;
		let iy = pointer.y;

		if (this.lamps.length == 0) {
			let lamp = this.scene.add.image(ix, iy, "lightbulb");
			lamp.setScale(96 / lamp.width);
			this.lamps.push(lamp);
		}
		this.lamps[0].setPosition(ix, iy);
	}

	onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
		// if (this.lamps.length > 0) {
		// 	this.lamps[0].setPosition(pointer.x, pointer.y);
		// }
	}
}
