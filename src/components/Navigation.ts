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

		let fs = 16; // Font size
		// let s = layout.nav.width; // Button size
		let s = layout.navInner.width; // Button size
		let x = layout.nav.centerX;
		let y = layout.nav.bottom;
		let g = 32;

		y -= fs / 2;
		let scenarioLabel = scene.addText({
			x,
			y,
			size: fs,
			// fontFamily: "Lato-Bold",
			color: "white",
			text: "Scenarios",
		});
		scenarioLabel.setOrigin(0.5, 0.5);
		this.add(scenarioLabel);

		y -= s / 2 + 0.75 * fs;
		let c = Color.Green800;
		this.scenarioButton = new CircleButton(scene, x, y, s, "map", c);
		this.add(this.scenarioButton);

		// fs = 28;
		y -= s / 2 + g + fs / 2;
		let lightLabel = scene.addText({
			x,
			y,
			size: fs,
			// fontFamily: "Lato-Bold",
			color: "white",
			text: "Light",
		});
		lightLabel.setOrigin(0.5, 0.5);
		this.add(lightLabel);

		// s = layout.navInner.width;
		y -= s / 2 + g;
		c = Color.Yellow700;
		this.lightButton = new CircleButton(scene, x, y, s, "sun", c);
		this.add(this.lightButton);

		y -= s / 2 + g + fs / 2;
		let layerLabel = scene.addText({
			x,
			y,
			size: fs,
			// fontFamily: "Lato-Bold",
			color: "white",
			text: "Layers",
		});
		layerLabel.setOrigin(0.5, 0.5);
		this.add(layerLabel);

		y -= s / 2 + 0.75 * fs;
		c = Color.Blue800;
		this.layerButton = new CircleButton(scene, x, y, s, "layers", c);
		this.add(this.layerButton);

		y -= s / 2 + g + fs / 2;
		let debugLabel = scene.addText({
			x,
			y,
			size: fs,
			// fontFamily: "Lato-Bold",
			color: "white",
			text: "Debug",
		});
		debugLabel.setOrigin(0.5, 0.5);
		this.add(debugLabel);

		y -= s / 2 + g;
		c = Color.Slate700;
		this.debugButton = new CircleButton(scene, x, y, s, "gear-code", c);
		this.add(this.debugButton);

		this.scenarioButton.on("click", () => this.emit("state", PageState.Home));
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
