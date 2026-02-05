import { BaseScene } from "@/scenes/BaseScene";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Layer } from "@/utils/interfaces";
import { colorToNumber } from "@/utils/functions";
import { contentManager } from "@/utils/ContentManager";
import { LazyImage } from "@/components/elements/LazyImage";

export class MapLayer extends LazyImage {
	public layer: Layer;

	constructor(scene: BaseScene) {
		super(scene, layout.map.centerX, layout.map.centerY);
	}

	setLayer(layer: Layer) {
		this.layer = layer;

		this.setTint(0xffffff);
		this.setAlpha(layer.opacity ?? 1);

		switch (layer.type) {
			case "image":
			case "movie":
				const raster = contentManager.layerToRaster(layer);
				if (raster) {
					this.setTexture(raster.minimap);
				} else {
					console.error(`Raster not found for layer: '${layer.raster}'`);
					this.setTexture("square");
					this.emit("loaded", true);
				}
				break;

			case "color":
				this.setTexture("square");
				this.setTint(colorToNumber(layer.color));
				this.emit("loaded", true);
				break;

			case "flow":
				this.setAlpha(0);
				this.setTexture("square");
				this.emit("loaded", true);
				break;

			case "ndi":
				this.setAlpha(0);
				this.setTexture("square");
				this.emit("loaded", true);
				break;

			default:
				throw Error(`Unknown layer type: '${layer}'`);
		}
	}

	setTexture(key: string): this {
		super.setTexture(key);
		this.resize();
		return this;
	}

	protected refreshTexture(isLoaded: boolean): void {
		super.refreshTexture(isLoaded);
		this.resize();
	}

	resize() {
		this.setAngle(layout.mapAngle);

		if (layout.mapAngle % 180 == 0) {
			this.setScale(
				layout.map.width / this.width,
				layout.map.height / this.height,
			);
		} else {
			this.setScale(
				layout.map.width / this.height,
				layout.map.height / this.width,
			);
		}

		if (this.layer?.crop?.type === "slice") {
			const { min_u, max_u, min_v, max_v } = this.layer.crop.slice;

			const corners = [
				[min_u, min_v],
				[max_u, min_v],
				[min_u, max_v],
				[max_u, max_v],
			].map(([u, v]) => this.rotateUV(u, v, layout.mapAngle));

			const us = corners.map((c) => c[0]);
			const vs = corners.map((c) => c[1]);

			const left = Math.min(...us);
			const top = Math.min(...vs);
			const width = Math.max(...us) - left;
			const height = Math.max(...vs) - top;

			this.setCrop(
				this.width * left,
				this.height * top,
				this.width * width,
				this.height * height,
			);
		}
	}

	rotateUV(u: number, v: number, angle: number) {
		switch (angle) {
			case 90:
				return [v, 1 - u];
			case 180:
				return [u, v];
			case 270:
				return [1 - v, u];
			default:
				return [1 - u, 1 - v];
		}
	}
}
