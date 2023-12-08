import { BaseScene } from "@/scenes/BaseScene";
import { BlurPostFilter } from "@/utils/pipelines/BlurPostFilter";
import { Color } from "@/utils/colors";

import { TimeSetter } from "@/components/TimeSetter";
import { SocketManager } from "@/utils/SocketManager";
import { Page, PageState } from "@/components/pages/Page";
import { HomePage } from "@/components/pages/HomePage";
import { ScenariosPage } from "@/components/pages/ScenariosPage";

import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { DebugPage } from "@/components/pages/DebugPage";

export class GameScene extends BaseScene {
	private attractionOpen: boolean;
	private infoWindowOpen: boolean;
	private blurTween: Phaser.Tweens.Tween;

	private state: PageState;
	private pages: Page[];

	private socket: SocketManager;

	private debugTexts: Phaser.GameObjects.Text[];
	private timeSetter: TimeSetter;

	constructor() {
		super({ key: "GameScene" });
	}

	create(): void {
		this.fade(false, 200, Color.Black);
		this.cameras.main.setBackgroundColor(Color.Slate900);
		this.initBlur();

		this.socket = new SocketManager(this);
		this.socket.connect();
		this.socket.on("message", this.onSocketMessage, this);
		this.socket.on("debug", this.addDebugMessage, this);

		// this.background = this.add.image(0, 0, "background");
		// this.background.setOrigin(0);
		// this.fitToScreen(this.background);

		let margin = 100;
		let padding = 40;

		let layout = new Phaser.Geom.Rectangle(
			margin,
			margin,
			this.W - 2 * margin,
			this.H - 2 * margin
		);

		let map = this.add.image(0, 0, "karta");
		map.angle = -90;
		map.setScale(layout.height / map.width);
		map.setPosition(layout.right - map.displayHeight / 2, layout.centerY);

		let leftLayout = new Phaser.Geom.Rectangle(
			layout.left + padding,
			layout.top + padding,
			layout.width - map.displayHeight - margin - 2 * padding,
			layout.height - 2 * padding
		);

		let leftBackground = new RoundRectangle(this, {
			x: leftLayout.centerX,
			y: leftLayout.centerY,
			width: leftLayout.width + 2 * padding,
			height: leftLayout.height + 2 * padding,
			radius: 16,
			color: Color.Slate800,
		});

		this.pages = [];
		this.pages.push(new HomePage(this, PageState.Home, leftLayout));
		this.pages.push(new ScenariosPage(this, PageState.Scenarios, leftLayout));
		this.pages.push(new DebugPage(this, PageState.Debug, leftLayout));

		this.pages.forEach((page) => {
			page.on("state", (state: PageState) => {
				this.setState(state);
			});

			page.on("send", (data: object) => {
				this.socket.send(data);
			});
		});

		this.timeSetter = new TimeSetter(this, map.x, layout.bottom - 150);
		this.timeSetter.on(
			"setTime",
			(year: number, month: number, day: number, hour: number) => {
				this.socket.sendLightRequest(year, month, day, hour);
			}
		);

		this.debugTexts = [];

		this.restart();
	}

	update(time: number, delta: number) {
		this.pages.forEach((page) => {
			page.update(time, delta);
		});

		this.timeSetter.update(time, delta);
	}

	/* Logic */

	restart() {
		this.setState(PageState.Home);
	}

	setState(state: PageState) {
		this.state = state;

		this.pages.forEach((page) => {
			page.setVisible(page.state == state);
		});
	}

	onSocketMessage(data: any) {
		console.log(data);
		// Insert logic here
		if (data.type == "ScenarioResponse") {
		}

		if (data.type == "PingResponse") {
		}
	}

	addDebugMessage(text: string, dim = false) {
		if (text.length > 1000) {
			text = "<data>";
		}

		let temp = this.addText({
			size: 30,
			color: dim ? "#3b82f6" : "white",
			text,
		});
		temp.setOrigin(1);
		temp.setStroke("black", 4);
		temp.x = this.W - 50;
		temp.y = this.H - 50;

		this.debugTexts.forEach((text) => {
			text.y -= 30 * 1.5;
		});
		this.debugTexts.push(temp);

		var tween = this.tweens.addCounter({
			from: 0,
			to: 1,
			ease: "Linear",
			duration: 5000,
			onUpdate: (tween, targets, key, current, previous, param) => {
				var value = current;
				temp.setAlpha(2 - 2 * current);
			},
			onComplete: () => {
				temp.destroy();
				this.debugTexts.splice(this.debugTexts.indexOf(temp), 1);
			},
		});
	}

	/* Blur */

	initBlur(): void {
		// Listen for events from the UI scene
		this.scene.get("UIScene").events.on(
			"attraction",
			(state: boolean) => {
				this.attractionOpen = state;

				this.updateBlur();
				// this.foodWeb.toggleAttraction(state);
			},
			this
		);

		this.scene.get("UIScene").events.on(
			"info",
			(state: boolean) => {
				this.infoWindowOpen = state;
				this.updateBlur();
			},
			this
		);

		this.scene.get("UIScene").events.on(
			"restart",
			() => {
				this.restart();
			},
			this
		);
	}

	updateBlur(): void {
		let filter = this.cameras.main.getPostPipeline(
			BlurPostFilter
		) as BlurPostFilter;
		let isActive = this.cameras.main.hasPostPipeline;
		let shouldBeActive = this.attractionOpen || this.infoWindowOpen;

		if (shouldBeActive) {
			if (!isActive) {
				this.cameras.main.setPostPipeline(BlurPostFilter);
				filter = this.cameras.main.getPostPipeline(
					BlurPostFilter
				) as BlurPostFilter;
			}

			if (this.blurTween) {
				this.blurTween.stop();
			}

			this.blurTween = this.tweens.add({
				targets: filter,
				steps: { from: filter.steps, to: 5 },
				offsetX: { from: filter.offsetX, to: 2.4 },
				offsetY: { from: filter.offsetY, to: 2.4 },
				ease: "Linear",
				duration: 250,
			});
		} else {
			if (this.blurTween) {
				this.blurTween.stop();
			}

			this.blurTween = this.tweens.add({
				targets: filter,
				steps: { from: filter.steps, to: 0 },
				offsetX: { from: filter.offsetX, to: 0 },
				offsetY: { from: filter.offsetY, to: 0 },
				ease: "Linear",
				duration: 250,
				onComplete: () => {
					this.cameras.main.resetPostPipeline();
				},
			});
		}
	}
}
