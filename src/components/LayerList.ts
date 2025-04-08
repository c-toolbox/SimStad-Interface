import { BaseScene } from "@/scenes/BaseScene";
import { Color } from "@/utils/colors";
import { layoutManager } from "@/utils/LayoutManager";
import { LayerListImage } from "./LayerListImage";

export class LayerList extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private snapPositions: { x: number; y: number }[];
	private layers: LayerListImage[];

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y);
		this.scene = scene;

		// Background
		this.add(layoutManager.addRect(scene, this.layout, Color.Slate900));

		// Layers
		this.snapPositions = [];
		this.layers = [];
		this.updateSnapPositions(0);

		const N = 10;
		for (let i = 0; i < N; i++) {
			const layer = new LayerListImage(scene, this.layout.height);
			this.layers.push(layer);
			this.add(layer);

			layer.on("drag", this.repositionLayers, this);
			layer.on("drop", this.sendUpdatedOrder, this);
			layer.on("click", () => {
				layer.setVisible(false);
				this.layers = this.layers.filter((l) => l !== layer).concat(layer);
				this.sendUpdatedOrder();
			});
		}
		this.setLayers([]);
	}

	update(time: number, delta: number) {
		this.layers.forEach((layer, index) => layer.update(time, delta));
	}

	setLayers(layers: string[]) {
		this.updateSnapPositions(Math.max(layers.length, 4));

		this.layers.sort((a, b) =>
			a.visible === b.visible ? 0 : a.visible ? -1 : 1
		);
		this.layers.forEach((layer, i) => {
			if (i < layers.length) {
				const isNew = !layer.visible;
				layer.setVisible(true);
				layer.setLayer(i, layers[i]);

				let { x, y } = this.snapPositions[i];
				if (isNew) {
					layer.playBounce();
					x += 10;
				}
				layer.setSnapPosition(x, y, isNew);
			} else {
				layer.setVisible(false);
			}
		});

		this.repositionLayers();
	}

	repositionLayers() {
		this.layers.sort((a, b) => {
			if (a.visible !== b.visible) {
				return a.visible ? -1 : 1;
			}
			return a.x - b.x;
		});

		this.layers.forEach((layer, index) => {
			if (index < this.snapPositions.length) {
				const { x, y } = this.snapPositions[index];
				layer.setSnapPosition(x, y, false);
				this.bringToTop(layer);
			}
		});
	}

	updateSnapPositions(count: number) {
		const size = this.layout.height;
		const sep = (this.layout.width - count * size) / (count - 1);
		const left = this.layout.left + size / 2;

		this.snapPositions = [];
		for (let i = 0; i < count; i++) {
			this.snapPositions.push({
				x: left + i * (size + sep),
				y: this.layout.centerY,
			});
		}
	}

	sendUpdatedOrder() {
		const layers = this.layers
			.filter((layer) => layer.visible && layer.name)
			.map((layer) => layer.name);

		this.emit("updateOrder", layers);
	}

	private get layout() {
		return layoutManager.mapControlsLower;
	}
}
