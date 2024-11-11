import { BaseScene } from "@/scenes/BaseScene";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";
import { CircleButton } from "./CircleButton";
import { PageState } from "./pages/Page";

export class Navigation extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	private title: Phaser.GameObjects.Text;
	private scenarioButton: CircleButton;
	private layerButton: CircleButton;
	private debugButton: CircleButton;

	constructor(scene: BaseScene) {
		super(scene, 0, 0);
		this.scene = scene;
		this.scene.add.existing(this);

		let fs = 16; // Font size
		let s = layout.navInner.width; // Button size
		let x = layout.nav.centerX;
		let y = layout.nav.bottom;
		let g = 32;

		y -= 0.5 * s;
		let c = Color.Green800;
		this.scenarioButton = new CircleButton(scene, x, y, s, "book", c);
		this.add(this.scenarioButton);

		y -= 1.75 * s;
		c = Color.Blue800;
		this.layerButton = new CircleButton(scene, x, y, s, "layers", c);
		this.add(this.layerButton);

		y -= 1.75 * s;
		c = Color.Slate700;
		this.debugButton = new CircleButton(scene, x, y, s, "gear-code", c);
		this.add(this.debugButton);

		this.scenarioButton.on("click", () => this.emit("state", PageState.Home));
		this.layerButton.on("click", () => this.emit("state", PageState.Layer));
		this.debugButton.on("click", () => this.emit("state", PageState.Debug));

		this.setGuideMode(false);
	}

	update(time: number, delta: number) {
		this.scenarioButton.update(time, delta);
		this.layerButton.update(time, delta);
		this.debugButton.update(time, delta);
	}

	setState(state: PageState): this {
		this.scenarioButton.setHighlight(state == PageState.Home);
		this.layerButton.setHighlight(state == PageState.Layer);
		this.debugButton.setHighlight(state == PageState.Debug);
		return this;
	}

	setGuideMode(value: boolean) {
		this.scenarioButton.setVisible(value);
		this.layerButton.setVisible(value);
		this.debugButton.setVisible(value);
	}
}
