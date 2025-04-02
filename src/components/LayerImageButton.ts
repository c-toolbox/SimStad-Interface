import { BaseScene } from "@/scenes/BaseScene";
import { LayerButton } from "./LayerButton";
import { Color } from "@/utils/colors";

export class LayerImageButton extends LayerButton {
	private orderBg: Phaser.GameObjects.Image;
	private orderText: Phaser.GameObjects.Text;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number,
		layer: string
	) {
		super(scene, x, y, width, height, layer);

		this.setTexture(layer, true);

		/* Order number */

		this.orderBg = scene.add.image(0, 0, "border");
		this.orderBg.setScale((this.width / this.orderBg.width) * 1.02);
		this.add(this.orderBg);

		const size = this.width * 0.17;
		this.orderText = scene.addText({
			x: -this.width * 0.42,
			y: -this.width * 0.42,
			size: size,
			fontFamily: "Lato-Bold",
			color: "black",
			text: "0",
		});
		this.orderText.setOrigin(0.5);
		this.add(this.orderText);

		/* Init */

		this.setSelected(false);
	}

	setSelected(value: boolean) {
		this.selected = value;
		// this.border.setVisible(value);
		this.border.setColor(this.selected ? Color.White : Color.Slate800);

		this.orderBg.setVisible(value);
		this.orderText.setVisible(value);
	}

	setOrder(order: number) {
		this.orderText.setText(order.toString());
	}
}
