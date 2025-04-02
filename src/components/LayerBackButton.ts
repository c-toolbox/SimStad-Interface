import { BaseScene } from "@/scenes/BaseScene";
import { LayerButton } from "./LayerButton";

export class LayerBackButton extends LayerButton {
	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number
	) {
		super(scene, x, y, width, height, "back");

		this.setTexture("folder-up", false);
		this.titleBackground.setVisible(false);
		this.title.setVisible(false);
	}
}
