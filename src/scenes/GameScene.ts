import { BaseScene } from "@/scenes/BaseScene";
import { BlurPostFilter } from "@/utils/pipelines/BlurPostFilter";
import { Color } from "@/utils/colors";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { Navigation } from "@/components/Navigation";

import { SocketManager } from "@/utils/SocketManager";
import { layoutManager as layout } from "@/utils/LayoutManager";

import { Page, PageState } from "@/components/pages/Page";
import { HomePage } from "@/components/pages/HomePage";
import { ScenarioPage } from "@/components/pages/ScenarioPage";
import { ScenariosPage } from "@/components/pages/ScenariosPage";
import { LayerPage } from "@/components/pages/LayerPage";
import { LightPage } from "@/components/pages/LightPage";
import { DebugPage } from "@/components/pages/DebugPage";
import { Response, ScenariosResponse } from "@/utils/protocol";
import { Map } from "@/components/Map";

export class GameScene extends BaseScene {
	private attractionOpen: boolean;
	private infoWindowOpen: boolean;
	private blurTween: Phaser.Tweens.Tween;
	private socket: SocketManager;

	private state: PageState;
	private pages: Page[];
	private homePage: HomePage;
	private scenarioPage: ScenarioPage;
	private scenariosPage: ScenariosPage;
	private layerPage: LayerPage;
	private lightPage: LightPage;
	private debugPage: DebugPage;
	private navigation: Navigation;
	private map: Map;

	constructor() {
		super({ key: "GameScene" });
	}

	create(): void {
		this.fade(false, 200, Color.Black);
		this.cameras.main.setBackgroundColor(Color.Slate900);
		this.initBlur();

		// this.input.dragDistanceThreshold = 16;
		this.input.addPointer(10);

		this.socket = new SocketManager(this);
		this.socket.setDepth(1000);
		this.socket.connect();

		this.socket.on(Response.Scenarios, (data: ScenariosResponse) => {
			this.scenariosPage.loadScenarios(data);
		});

		/* Layout */

		this.pages = [];
		this.homePage = new HomePage(this, PageState.Home, this.socket);
		this.scenarioPage = new ScenarioPage(this, PageState.Scenario, this.socket);
		this.scenariosPage = new ScenariosPage(
			this,
			PageState.Scenarios,
			this.socket
		);
		this.layerPage = new LayerPage(this, PageState.Layer, this.socket);
		this.lightPage = new LightPage(this, PageState.Light, this.socket);
		this.debugPage = new DebugPage(this, PageState.Debug, this.socket);
		this.pages.push(this.homePage);
		this.pages.push(this.scenarioPage);
		this.pages.push(this.scenariosPage);
		this.pages.push(this.layerPage);
		this.pages.push(this.lightPage);
		this.pages.push(this.debugPage);

		this.pages.forEach((page) => {
			page.on("state", (state: PageState) => {
				this.setState(state);
			});

			page.on("send", (data: object) => {
				this.socket.send(data);
			});

			page.on("map", (layers: string) => {
				this.map.setLayers(layers);
			});
		});

		this.navigation = new Navigation(this);
		this.navigation.on("state", (state: PageState) => {
			this.setState(state);
		});

		this.map = new Map(this, this.socket);
		this.add.existing(this.map);

		this.restart();
		// layout.drawLayout(this);
	}

	update(time: number, delta: number) {
		this.pages.forEach((page) => {
			if (this.state == page.state) {
				page.update(time, delta);
			}
		});

		this.map.update(time, delta);

		this.navigation.update(time, delta);
	}

	/* Logic */

	restart() {
		this.setState(PageState.Layer);
	}

	setState(state: PageState) {
		this.state = state;

		// this.navigation.setState(state);

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
