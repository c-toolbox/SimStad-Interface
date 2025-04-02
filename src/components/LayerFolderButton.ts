import { BaseScene } from "@/scenes/BaseScene";
import { LayerButton } from "./LayerButton";
import { layerManager } from "@/utils/LayerManager";
import { Color } from "@/utils/colors";

export class LayerFolderButton extends LayerButton {
	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number,
		folder: string
	) {
		super(scene, x, y, width, height, folder);

		let layersInFolder = layerManager.getLayers(folder);

		const N = Math.min(layersInFolder.length, 6);

		const picks = Array.from({ length: N }, (_, i) =>
			Math.floor((i / (N - 1)) * (layersInFolder.length - 1))
		);

		picks.reverse().forEach((pick, i) => {
			const layer = layersInFolder[pick];
			const image = scene.add.image(0, 0, layer);
			image.setScale(width / image.width);
			this.add(image);

			const dh = width / N;
			image.setCrop(
				(dh / image.scaleX) * i,
				0,
				dh / image.scaleX,
				width / image.scaleX
			);
		});

		// this.background.setAlpha(0.01);
		this.bringToTop(this.image);
		this.image.setTint(Color.Slate900);
		this.image.setTexture("folder");
		this.image.setScale(1.01 * (width / this.image.width));
		// this.bringToTop(this.titleBackground);
		this.titleBackground.setVisible(false);
		this.bringToTop(this.title);

		const isSequenceFolder = layersInFolder.every((layer) => {
			return layer.split("/")[1].startsWith(folder);
		});
		this.image.setTint(isSequenceFolder ? Color.Red900 : Color.Slate900);
	}
}
