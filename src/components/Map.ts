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
import { MapSliceButton } from "./MapSliceButton";
import { MapPinButton } from "./MapPinButton";
import { MapSliceKnob } from "./MapSliceKnob";

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

	private mapSliceButton: MapSliceButton;
	private mapPinButton: MapPinButton;
	private mapSliceKnob: MapSliceKnob;
	private mapPin: Phaser.GameObjects.Image;

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

		this.map = scene.add.image(
			layout.map.centerX,
			layout.map.centerY,
			"square",
		);
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

		this.mapSliceButton = new MapSliceButton(
			scene,
			layout.map.right - 40,
			layout.map.top + 40,
			60,
		);
		this.add(this.mapSliceButton);
		this.mapSliceButton.on("click", () => {
			this.mapHint.setVisible(false);
			this.emit("toggleMapSlice");
		});

		this.mapPinButton = new MapPinButton(
			scene,
			layout.map.left + 40,
			layout.map.bottom - 40,
			60,
		);
		this.add(this.mapPinButton);
		this.mapPinButton.on("click", () => {
			this.mapHint.setVisible(false);
			this.scene.tweens.add({
				targets: this.mapPin,
				alpha: { from: 1.0, to: 0.4 },
				ease: Phaser.Math.Easing.Cubic.In,
			});
			this.emit("pin");
		});

		this.mapPin = scene.add.image(0, 0, "tack");

		this.mapPin.setScale((0.25 * layout.map.height) / this.mapPin.height);
		this.add(this.mapPin);

		this.mapSliceKnob = new MapSliceKnob(
			scene,
			layout.map.centerX,
			layout.map.centerY,
			60,
		);
		this.add(this.mapSliceKnob);
		this.mapSliceKnob.on("sliceValue", (value: number) => {
			this.emit("sliceValue", value);
		});
	}

	update(time: number, delta: number) {
		this.fingerLamp.update(time, delta);
		this.lamps.forEach((lamp) => lamp.update(time, delta));
		this.mapControls.update(time, delta);
		this.mapSliceButton.update(time, delta);
		this.mapPinButton.update(time, delta);
		this.mapSliceKnob.update(time, delta);

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

	setLayers(layers: Layer[], flush: boolean = true) {
		if (flush) {
			// Destroy all existing layers and create new ones
			this.mapLayers.forEach((mapLayer) => mapLayer.destroy());
			this.mapLayers = [];
			this.loadingLayers.clear();

			layers.forEach((layer) => {
				const mapLayer = new MapLayer(this.scene);
				this.mapLayerContainer.add(mapLayer);
				this.mapLayers.push(mapLayer);
				this.bringToTop(mapLayer);

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
		} else {
			// Update existing layers without recreating
			layers.forEach((layer, index) => {
				if (index < this.mapLayers.length) {
					this.mapLayers[index].setLayer(layer);
				}
			});
		}

		this.mapPin.setPosition(
			layout.map.left + layout.map.width * (1 - this.sliceValue / 2),
			layout.map.centerY,
		);
		const remainingWidth =
			(layout.map.width * this.sliceValue) / this.mapPin.displayWidth;
		this.mapPin.setCrop(
			this.mapPin.width * ((1 - remainingWidth) / 2),
			this.mapPin.height * 0,
			this.mapPin.width * remainingWidth,
			this.mapPin.height * 1,
		);

		this.bringToTop(this.mapPin);
		this.bringToTop(this.fingerLamp);
	}

	setSliceEnabled(enabled: boolean) {
		this.mapSliceButton.setHighlight(enabled);
		this.mapSliceKnob.setVisible(enabled);
		this.mapPinButton.setVisible(enabled);
		this.mapPin.setVisible(enabled);
	}

	setSliceValue(value: number, animate: boolean) {
		this.mapSliceKnob.setValue(value, animate);
	}

	setSlicePinnable(canPin: boolean) {
		console.log("canPin", canPin);
		this.mapPinButton.setHighlight(canPin);
		this.mapPin.setAlpha(0.4);
	}

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
		this.resetLightControls();

		this.lamps.forEach((lamp) => {
			this.lampIds.push(lamp.name);
			lamp.destroy();
		});
		this.lamps = [];
		this.mapHint.setVisible(true);
		// this.mapSliceButton.setVisible(false);
	}

	resetLightControls() {
		this.mapControls.resetLight();
	}

	get sliceValue(): number {
		return this.mapSliceKnob.value;
	}
}
