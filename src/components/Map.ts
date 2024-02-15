import { BaseScene } from "@/scenes/BaseScene";
import { layoutManager as layout, layoutManager } from "@/utils/LayoutManager";
import { Color, ColorStr } from "@/utils/colors";
import { RoundRectangle } from "./elements/RoundRectangle";
import { MapLight } from "./MapLight";
import { SocketManager } from "@/utils/SocketManager";
import { Response } from "@/utils/protocol";
import { CircleButton } from "./CircleButton";

// Bottom right
const MIN_X = 129411.4;
const MIN_Y = 6495015.262;

// Top left
const MAX_X = 134211.4;
const MAX_Y = 6498915.262;

interface MapLayer {
	active: boolean;
	fade: number;
	texture: string;
	image: Phaser.GameObjects.Image;
}

export class Map extends Phaser.GameObjects.Container {
	public scene: BaseScene;
	public socket: SocketManager;

	private map: Phaser.GameObjects.Image;
	private layerContainer: Phaser.GameObjects.Container;
	private layers: MapLayer[];
	private lamps: MapLight[];
	private lampIds: string[];
	private controlButtons: CircleButton[];

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
			"minimaps/Nkpg/Kommunkarta_dark"
		);
		// this.map.angle = -90;
		// this.map.setScale(layout.map.height / this.map.width);
		this.add(this.map);

		this.layerContainer = scene.add.container();
		this.add(this.layerContainer);

		this.layers = [];
		for (let i = 0; i < 10; i++) {
			let layer = scene.add.image(
				layout.map.centerX,
				layout.map.centerY,
				"minimaps/Color/white"
			);
			this.layerContainer.add(layer);
			layer.setVisible(false);
			this.layers.push({
				active: false,
				fade: 0.0,
				texture: "",
				image: layer,
			});
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
			radius: layout.radius,
			color: Color.Slate800,
		});
		this.add(controlsBg);

		/* Control buttons */

		this.controlButtons = [];

		const cil = layout.mapControlsInner;
		const size = cil.height;
		const xCoords = [cil.left + size / 2, cil.centerX, cil.right - size / 2];

		for (let i = 0; i < 3; i++) {
			let x = xCoords[i];
			let y = cil.centerY;

			let button = new CircleButton(
				this.scene,
				x,
				y,
				size,
				"lightbulb",
				Color.Slate700
			);
			// button.on("click", () => {});
			this.add(button);
			this.controlButtons.push(button);
		}

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

		/* Lamps */

		this.lampIds = ["lamp_1", "lamp_2", "lamp_3"];
		this.lamps = [];
		this.socket.on(Response.ResetResponse, () => {
			this.lamps.forEach((lamp) => lamp.destroy());
			this.lamps = [];
		});
	}

	update(time: number, delta: number) {
		this.lamps.forEach((lamp) => lamp.update(time, delta));
		this.controlButtons.forEach((button) => button.update(time, delta));

		this.layers.forEach((layer) => {
			let dx = ((layer.active ? delta : -delta) / 1000) * 5;
			if (layer.texture.includes("Flood")) dx = 1;

			layer.fade = Phaser.Math.Clamp(layer.fade + dx, 0, 1);
			layer.image.setVisible(layer.fade > 0);
			let ease = Phaser.Math.Easing.Sine.Out;
			layer.image.setAlpha(ease(layer.fade));
		});
	}

	setLayers(layerString: string) {
		let textures = layerString.split(",");
		textures = textures.filter((layer) => !!layer);
		textures = textures.map((layer) => "minimaps/" + layer);

		let removedTextures = this.layers
			.filter((layer) => layer.active && !textures.includes(layer.texture))
			.map((layer) => layer.texture);
		let addedTextures = textures.filter(
			(texture) => !this.layers.find((layer) => layer.texture == texture)
		);

		addedTextures.forEach((texture) => {
			this.addLayer(texture);
		});
		removedTextures.forEach((texture) => {
			this.removeLayer(texture);
		});

		if (addedTextures.length > 0) {
			textures.forEach((texture) => {
				let layer = this.layers.find((layer) => layer.texture == texture);
				if (layer) {
					this.layerContainer.bringToTop(layer.image);
				}
			});
		}

		// removedTextures.forEach((texture) => {
		// 	let layer = this.layers.find((layer) => layer.texture == texture);
		// 	if (layer) {
		// 		this.layerContainer.bringToTop(layer.image);
		// 	}
		// });
	}

	addLayer(texture: string) {
		let layer = this.layers.find((layer) => !layer.active && layer.fade == 0);
		if (!layer) {
			layer = this.layers.find((layer) => !layer.active);
		}
		if (layer) {
			layer.active = true;
			layer.texture = texture;
			layer.image.setTexture(texture);
			this.layerContainer.bringToTop(layer.image);

			if (!this.scene.textures.exists(texture)) {
				console.error("Missing texture:", texture);
			}
		}
	}

	removeLayer(texture: string) {
		let layer = this.layers.find((layer) => layer.texture == texture);
		if (layer) {
			layer.active = false;
			layer.texture = "";
		}
	}

	onClick(pointer: Phaser.Input.Pointer, localX: number, localY: number) {
		let lampName = this.lampIds.shift();
		if (lampName) {
			let lamp = new MapLight(this.scene, pointer.x, pointer.y, lampName);
			this.add(lamp);
			this.lamps.push(lamp);

			this.updateLamp(lamp, "add");
			lamp.on("update", () => {
				this.updateLamp(lamp, "update");
			});
			lamp.on("delete", () => {
				this.lamps.splice(this.lamps.indexOf(lamp), 1);
				this.updateLamp(lamp, "delete");
				this.lampIds.push(lamp.name);
				lamp.destroy();
			});
			lamp.on("click", lamp.changeColor);
		}
	}

	updateLamp(lamp: MapLight, method: "add" | "update" | "delete") {
		const py = 1 - (lamp.goalX - layout.map.left) / layout.map.width;
		const px = 1 - (lamp.goalY - layout.map.top) / layout.map.height;
		const x = MIN_X + (MAX_X - MIN_X) * px;
		const y = MIN_Y + (MAX_Y - MIN_Y) * py;
		const color = lamp.color;

		this.socket.sendMapLight(lamp.name, x, y, 150, color, method, true);
	}

	reset() {
		this.setLayers("");
		this.lamps.forEach((lamp) => {
			this.lampIds.push(lamp.name);
			lamp.destroy();
		});
		this.lamps = [];
	}
}
