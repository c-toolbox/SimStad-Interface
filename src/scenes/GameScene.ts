import { BaseScene } from "@/scenes/BaseScene";
import { BlurPostFilter } from "@/utils/pipelines/BlurPostFilter";
import { Color } from "@/utils/colors";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { Map } from "@/components/Map";

import { SocketManager } from "@/utils/SocketManager";

import { Page, PageState } from "@/components/pages/Page";
import { HomePage } from "@/components/pages/HomePage";
import { ScenariosPage } from "@/components/pages/ScenariosPage";
import { DebugPage } from "@/components/pages/DebugPage";
import { Response, ScenariosResponse } from "@/utils/protocol";

export class GameScene extends BaseScene {
	private attractionOpen: boolean;
	private infoWindowOpen: boolean;
	private blurTween: Phaser.Tweens.Tween;
	private socket: SocketManager;

	private state: PageState;
	private pages: Page[];
	private homePage: HomePage;
	private scenariosPage: ScenariosPage;
	private debugPage: DebugPage;
	private map: Map;

	constructor() {
		super({ key: "GameScene" });
	}

	create(): void {
		this.fade(false, 200, Color.Black);
		this.cameras.main.setBackgroundColor(Color.Slate900);
		this.initBlur();

		this.input.addPointer(10);

		this.socket = new SocketManager(this);
		this.socket.setDepth(1000);
		this.socket.connect();

		this.socket.on(Response.Scenarios, (data: ScenariosResponse) => {
			this.scenariosPage.loadScenarios(data);
		});

		/* Layout */

		let margin = 80;
		let padding = 40;

		let box = new Phaser.Geom.Rectangle(
			margin,
			margin,
			this.W - 2 * margin,
			this.H - 2 * margin
		);

		this.map = new Map(this, 0, 0, box);
		this.map.on(
			"setTime",
			(year: number, month: number, day: number, hour: number) => {
				this.socket.sendLight(year, month, day, hour);
			}
		);
		this.map.on("send", (data: object) => {
			this.socket.send(data);
		});

		let panel = new Phaser.Geom.Rectangle(
			box.left + padding,
			box.top + padding,
			box.width - this.map.width - margin - 2 * padding,
			box.height - 2 * padding
		);

		let leftBackground = new RoundRectangle(this, {
			x: panel.centerX,
			y: panel.centerY,
			width: panel.width + 2 * padding,
			height: panel.height + 2 * padding,
			radius: 16,
			color: Color.Slate800,
		});

		this.pages = [];
		this.homePage = new HomePage(this, PageState.Home, this.socket, panel);
		this.scenariosPage = new ScenariosPage(
			this,
			PageState.Scenarios,
			this.socket,
			panel
		);
		this.debugPage = new DebugPage(this, PageState.Debug, this.socket, panel);
		this.pages.push(this.homePage);
		this.pages.push(this.scenariosPage);
		this.pages.push(this.debugPage);

		this.pages.forEach((page) => {
			page.on("state", (state: PageState) => {
				this.setState(state);
			});

			page.on("send", (data: object) => {
				this.socket.send(data);
			});
		});

		this.restart();
	}

	update(time: number, delta: number) {
		this.pages.forEach((page) => {
			if (this.state == page.state) {
				page.update(time, delta);
			}
		});

		this.map.update(time, delta);
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
