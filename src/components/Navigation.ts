import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { Color } from "@/utils/colors";
import { iconSizes } from "@/assets/assets";
import { CircleButton } from "./CircleButton";
import { PageState } from "./pages/Page";

export class Navigation extends Phaser.GameObjects.Container {
	public scene: BaseScene;

	// private background: RoundRectangle;
	private title: Phaser.GameObjects.Text;
	private scenarioButton: CircleButton;
	private layerButton: CircleButton;
	private lightButton: CircleButton;
	private debugButton: CircleButton;

	constructor(scene: BaseScene) {
		super(scene, 0, 0);
		this.scene = scene;
		this.scene.add.existing(this);

		// this.background = new RoundRectangle(scene, {
		// 	rect: layout.nav,
		// 	radius: layout.radius,
		// 	color: Color.Slate800,
		// });
		// this.add(this.background);

		let s = layout.nav.height;
		let x = layout.nav.left + s / 2;
		let y = layout.navInner.centerY;
		let g = 32;
		let c = Color.Green800;

		this.scenarioButton = new CircleButton(scene, x, y, s, "map", c);
		this.add(this.scenarioButton);

		x += layout.nav.height / 2 + layout.navInner.height / 2 + g;
		s = layout.navInner.height;
		this.layerButton = new CircleButton(scene, x, y, s, "layers", c);
		this.add(this.layerButton);

		x += s + g;
		this.lightButton = new CircleButton(scene, x, y, s, "sunrise", c);
		this.add(this.lightButton);

		x += s + g;
		this.debugButton = new CircleButton(scene, x, y, s, "gears", c);
		this.add(this.debugButton);

		this.scenarioButton.on("click", () =>
			this.emit("state", PageState.Scenarios)
		);
		this.layerButton.on("click", () => this.emit("state", PageState.Layer));
		this.lightButton.on("click", () => this.emit("state", PageState.Light));
		this.debugButton.on("click", () => this.emit("state", PageState.Debug));
	}

	update(time: number, delta: number) {
		this.scenarioButton.update(time, delta);
		this.layerButton.update(time, delta);
		this.lightButton.update(time, delta);
		this.debugButton.update(time, delta);
	}

	setState(state: PageState): this {
		this.scenarioButton.setHighlight(state == PageState.Scenarios);
		this.layerButton.setHighlight(state == PageState.Layer);
		this.lightButton.setHighlight(state == PageState.Light);
		this.debugButton.setHighlight(state == PageState.Debug);
		return this;
	}
}
