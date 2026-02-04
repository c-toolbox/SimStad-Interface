import { BaseScene } from "@/scenes/BaseScene";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";
import { RoundRectangle } from "./elements/RoundRectangle";
import { MapLight } from "./MapLight";
import { SocketManager } from "@/utils/SocketManager";
import { Response } from "@/utils/protocol";
import { MapHint } from "./MapHint";
import { MapControls } from "./MapControls";
import { Layer } from "@/utils/interfaces";
import { MapLayer } from "./MapLayer";

export class Map extends Phaser.GameObjects.Container {
	public scene: BaseScene;
	public socket: SocketManager;

	private map: Phaser.GameObjects.Image;
	private mapLayerContainer: Phaser.GameObjects.Container;
	private mapLayers: MapLayer[];
	private mapHint: MapHint;
	private lamps: MapLight[];
	private lampIds: string[];
	private fingerLamp: MapLight;
	private mapControls: MapControls;
	private loader: Phaser.GameObjects.Image;
	private loadingLayers: Set<MapLayer>;

	constructor(scene: BaseScene, socket: SocketManager) {
		super(scene);
		this.scene = scene;
		this.socket = socket;
		this.loadingLayers = new Set();

		let background = new RoundRectangle(scene, {
			x: layout.map.centerX,
			y: layout.map.centerY,
			width: layout.map.width,
			height: layout.map.height,
			radius: 4,
			color: Color.Slate800,
		});
		this.add(background);

		this.map = scene.add.image(layout.map.centerX, layout.map.centerY, "square");
		// this.map.angle = -90;
		const mapScaleX = layout.map.width / this.map.width;
		const mapScaleY = layout.map.height / this.map.height;
		this.map.setScale(mapScaleX, mapScaleY);
		this.add(this.map);

		this.mapLayerContainer = scene.add.container();
		this.add(this.mapLayerContainer);

		this.mapLayers = [];

		this.mapHint = new MapHint(
			scene,
			layout.map.centerX,
			layout.map.bottom - 60,
		);
		this.add(this.mapHint);

		this.width = this.map.displayHeight;

		this.map
			.setInteractive({ useHandCursor: true })
			.on("pointerdown", this.onPointerDown, this);
		// .on("pointermove", this.onPointerMove, this);
		// .on("pointerup", this.onPointerUp, this)
		// .on("pointerout", this.onPointerOut, this);
		// .on("pointerdown", this.onClick, this);

		this.scene.input.on("pointermove", this.onPointerMove, this);
		this.scene.input.on("pointerup", this.onPointerUp, this);

		/* Loader spinner */
		this.loader = scene.add.image(
			layout.map.centerX,
			layout.map.centerY,
			"vis_c_logo_white",
		);
		this.loader.setTint(0xffffff);
		this.loader.setAlpha(0.5);
		this.loader.setScale(0.15);
		this.loader.setVisible(false);
		this.add(this.loader);

		// const fullscreen = new CircleButton(
		// 	scene,
		// 	layout.map.right,
		// 	layout.map.top,
		// 	64,
		// 	"maximize",
		// 	0x000000
		// );
		// fullscreen.setHighlight(false);
		// this.add(fullscreen);

		/* Lamps */

		this.lampIds = ["lamp_1", "lamp_2", "lamp_3"];
		this.lamps = [];
		this.socket.on(Response.Reset, () => {
			this.lamps.forEach((lamp) => lamp.destroy());
			this.lamps = [];
		});

		this.fingerLamp = new MapLight(this.scene, 0, 0, "finger");
		this.fingerLamp.setVisible(false);
		this.add(this.fingerLamp);

		this.mapControls = new MapControls(scene, socket);
		this.add(this.mapControls);
	}

	update(time: number, delta: number) {
		this.fingerLamp.update(time, delta);
		this.lamps.forEach((lamp) => lamp.update(time, delta));
		this.mapControls.update(time, delta);

		/* Update loader spinner */
		if (this.loadingLayers.size > 0) {
			this.loader.angle = time / 2;
			this.loader.setVisible(true);
		} else {
			this.loader.setVisible(false);
		}

		// this.mapLayers.forEach((layer) => {
		// 	let dx = ((layer.active ? delta : -delta) / 1000) * 2;

		// 	if (
		// 		["Flood", "Asfalt", "Byggnad", "Vegitation"].some((name) =>
		// 			layer.texture.includes(name),
		// 		)
		// 	) {
		// 		dx = 1;
		// 	}

		// 	layer.fade = Phaser.Math.Clamp(layer.fade + dx, 0, 1);
		// 	layer.image.setVisible(layer.fade > 0);
		// 	let ease = Phaser.Math.Easing.Sine.Out;
		// 	layer.image.setAlpha(ease(layer.fade));
		// });
	}

	setLayers(layers: Layer[]) {
		this.mapLayers.forEach((mapLayer) => mapLayer.destroy());
		this.mapLayers = [];
		this.loadingLayers.clear();

		// let removedTextures = this.mapLayers
		// 	.filter((layer) => layer.active && !textures.includes(layer.texture))
		// 	.map((layer) => layer.texture);
		// let addedTextures = textures.filter(
		// 	(texture) => !this.mapLayers.find((layer) => layer.texture == texture),
		// );

		// addedTextures.forEach((texture) => {
		// 	this.addLayer(texture);
		// });
		// removedTextures.forEach((texture) => {
		// 	this.removeLayer(texture);
		// });

		// layers.forEach((a) => {
		// 	let layer = this.mapLayers.find((layer) => layer.texture == texture);
		// 	if (layer) {
		// 		this.mapLayerContainer.bringToTop(layer.image);
		// 	}
		// });

		layers.forEach((layer) => {
			const mapLayer = new MapLayer(this.scene);
			this.mapLayerContainer.add(mapLayer);
			this.mapLayers.push(mapLayer);
			this.bringToTop(mapLayer);

			/* Track loading state for image-type layers */
			this.loadingLayers.add(mapLayer);

			mapLayer.on("loaded", (loaded: boolean) => {
				if (loaded) {
					this.loadingLayers.delete(mapLayer);
				} else {
					this.loadingLayers.add(mapLayer);
				}
			});

			mapLayer.setLayer(layer);
		});

		this.bringToTop(this.fingerLamp);
	}

	// removeLayer(layer: Layer) {
	// let layer = this.mapLayers.find((layer) => layer.texture == texture);
	// if (layer) {
	// 	layer.active = false;
	// 	layer.texture = "";
	// }
	// }

	// onClick(pointer: Phaser.Input.Pointer, localX: number, localY: number) {
	// 	let lampName = this.lampIds.shift();
	// 	if (lampName) {
	// 		let lamp = new MapLight(this.scene, pointer.x, pointer.y, lampName);
	// 		this.add(lamp);
	// 		this.lamps.push(lamp);

	// 		this.updateLamp(lamp, "add");
	// 		lamp.on("update", () => {
	// 			this.updateLamp(lamp, "update");
	// 		});
	// 		lamp.on("delete", () => {
	// 			this.lamps.splice(this.lamps.indexOf(lamp), 1);
	// 			this.updateLamp(lamp, "delete");
	// 			this.lampIds.push(lamp.name);
	// 			lamp.destroy();
	// 		});
	// 		lamp.on("click", lamp.changeColor);
	// 	}
	// }

	onPointerDown(pointer: Phaser.Input.Pointer) {
		if (pointer.identifier != 0) return;

		this.mapHint.setVisible(false);
		this.fingerLamp.setVisible(true);
		this.fingerLamp.x = pointer.x;
		this.fingerLamp.y = pointer.y;
		this.fingerLamp.goalX = pointer.x;
		this.fingerLamp.goalY = pointer.y;
		this.updateLamp(this.fingerLamp, "add");
		this.updateLamp(this.fingerLamp, "update");
	}

	onPointerMove(pointer: Phaser.Input.Pointer) {
		if (pointer.identifier != 0) return;

		if (this.fingerLamp.visible) {
			this.fingerLamp.setGoal(pointer.x, pointer.y);
			this.updateLamp(this.fingerLamp, "update");
		}
	}

	onPointerOut(pointer: Phaser.Input.Pointer) {
		if (pointer.identifier != 0) return;

		this.onPointerUp(pointer);
	}

	onPointerUp(pointer: Phaser.Input.Pointer) {
		if (pointer.identifier != 0) return;

		if (this.fingerLamp.visible) {
			this.fingerLamp.setVisible(false);
			this.updateLamp(this.fingerLamp, "delete");
		}
	}

	updateLamp(lamp: MapLight, method: "add" | "update" | "delete") {
		const px = 1 - (lamp.goalX - layout.map.left) / layout.map.width;
		const py = 1 - (lamp.goalY - layout.map.top) / layout.map.height;
		// const x = MIN_X + (MAX_X - MIN_X) * px;
		// const y = MIN_Y + (MAX_Y - MIN_Y) * py;

		if (method != "delete") {
			this.socket.sendSetMarker(
				lamp.name,
				px,
				py,
				0.012,
				lamp.color,
				100,
				1,
				1,
			);
		} else {
			this.socket.sendRemoveMarker(lamp.name);
		}
	}

	reset() {
		// this.setLayers("");
		this.resetLightControls();

		this.lamps.forEach((lamp) => {
			this.lampIds.push(lamp.name);
			lamp.destroy();
		});
		this.lamps = [];
		this.mapHint.setVisible(true);
	}

	resetLightControls() {
		this.mapControls.resetLight();
	}
}
