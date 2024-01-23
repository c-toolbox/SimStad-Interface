import { BaseScene } from "@/scenes/BaseScene";
import { layoutManager as layout, layoutManager } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";
import { RoundRectangle } from "./elements/RoundRectangle";
import { MapLight } from "./MapLight";
import { SocketManager } from "@/utils/SocketManager";
import { Response } from "@/utils/protocol";

// Bottom right
const MIN_X = 129411.4;
const MIN_Y = 6495015.262;

// Top left
const MAX_X = 134211.4;
const MAX_Y = 6498915.262;

export class Map extends Phaser.GameObjects.Container {
	public scene: BaseScene;
	public socket: SocketManager;

	private map: Phaser.GameObjects.Image;
	private layers: Phaser.GameObjects.Image[];
	private lamps: MapLight[];

	constructor(scene: BaseScene, socket: SocketManager) {
		super(scene);
		this.scene = scene;
		this.socket = socket;

		let background = new RoundRectangle(scene, {
			x: layout.map.centerX,
			y: layout.map.centerY,
			width: layout.map.width + 8,
			height: layout.map.height + 8,
			radius: 4,
			color: Color.Slate800,
		});
		this.add(background);

		this.map = scene.add.image(
			layout.map.centerX,
			layout.map.centerY,
			"map/Nkpg/Backgrund_kommun_karta_dark"
		);
		// this.map.angle = -90;
		// this.map.setScale(layout.map.height / this.map.width);
		this.add(this.map);

		this.layers = [];
		for (let i = 0; i < 10; i++) {
			let layer = scene.add.image(
				layout.map.centerX,
				layout.map.centerY,
				"map/CleanColor/White"
			);
			this.add(layer);
			layer.setVisible(false);
			this.layers.push(layer);
		}

		this.width = this.map.displayHeight;

		this.map
			.setInteractive({ useHandCursor: true })
			.on("pointerdown", this.onClick, this);

		/* Controls */

		let controlsBg = new RoundRectangle(scene, {
			x: layout.mapControls.centerX,
			y: layout.mapControls.centerY,
			width: layout.mapControls.width + 8,
			height: layout.mapControls.height + 8,
			radius: 4,
			color: Color.Slate800,
		});
		this.add(background);

		this.socket.on(Response.ResetResponse, () => {
			this.lamps.forEach((lamp) => lamp.destroy());
			this.lamps = [];
		});

		this.lamps = [];
	}

	update(time: number, delta: number) {
		this.lamps.forEach((lamp) => lamp.update(time, delta));
	}

	setLayers(layerString: string) {
		let layerImages = layerString.split(",");
		layerImages = layerImages.filter((layer) => !!layer);
		layerImages = layerImages.map((layer) => "map/" + layer);

		this.layers.forEach((layer) => layer.setVisible(false));
		for (let i = 0; i < layerImages.length; i++) {
			this.layers[i].setVisible(true);
			this.layers[i].setTexture(layerImages[i]);
		}
	}

	onClick(pointer: Phaser.Input.Pointer, localX: number, localY: number) {
		if (this.lamps.length == 0) {
			let lamp = new MapLight(this.scene, pointer.x, pointer.y);
			this.add(lamp);
			this.lamps.push(lamp);

			this.updateLamp(lamp, "add");
			lamp.on("update", () => {
				this.updateLamp(lamp, "update");
			});
		}
	}

	updateLamp(lamp: MapLight, method: "add" | "update" | "delete") {
		const py = 1 - (lamp.x - layout.map.left) / layout.map.width;
		const px = 1 - (lamp.y - layout.map.top) / layout.map.height;
		const x = MIN_X + (MAX_X - MIN_X) * px;
		const y = MIN_Y + (MAX_Y - MIN_Y) * py;

		console.log("LAMP says", method);

		this.socket.sendMapLight("name", x, y, 400, "#777777", method, true);
	}
}
