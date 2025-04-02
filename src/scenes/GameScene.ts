import { BaseScene } from "@/scenes/BaseScene";
import { BlurPostFilter } from "@/utils/pipelines/BlurPostFilter";
import { Color } from "@/utils/colors";
import { Navigation } from "@/components/Navigation";
import { Map } from "@/components/Map";
import { ScenarioId } from "@/utils/ScenarioManager";

import { Page, PageState } from "@/components/pages/Page";
import { HomePage } from "@/components/pages/HomePage";
import { ScenarioPage } from "@/components/pages/ScenarioPage";
import { ScenariosPage } from "@/components/pages/ScenariosPage";
import { LayerPage } from "@/components/pages/LayerPage";
import { DebugPage } from "@/components/pages/DebugPage";
import { LoggingOverlay } from "@/components/pages/LoggingOverlay";

import { SocketManager } from "@/utils/SocketManager";
import { Response, ScenariosResponse } from "@/utils/protocol";
import { blocksManager } from "@/utils/BlocksManager";

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
	private debugPage: DebugPage;
	private loggingOverlay: LoggingOverlay;
	private navigation: Navigation;
	private map: Map;

	constructor() {
		super({ key: "GameScene" });
	}

	create(): void {
		this.fade(false, 200, Color.Black);
		this.cameras.main.setBackgroundColor(Color.Slate950);
		this.initBlur();

		// this.input.dragDistanceThreshold = 16;
		this.input.addPointer(1);

		this.socket = new SocketManager(this);
		this.socket.setDepth(1000);
		this.socket.connect();

		this.socket.on(Response.Scenarios, (data: ScenariosResponse) => {
			this.scenariosPage.loadScenarios(data);
		});
		this.socket.on("reconnect", () => {
			this.socket.sendReset();
			this.restart();
			this.socket.send({
				type: "DeactivateDatasetRequest",
				datasets: "RiverFlow",
			});
		});
		this.socket.on("onCacheProgress", () => {
			this.events.emit("onCacheProgress");
		});
		this.socket.on("onCacheComplete", () => {
			this.events.emit("onCacheComplete");
			this.layerPage.loadFolders();
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
		this.debugPage = new DebugPage(this, PageState.Debug, this.socket);
		this.pages.push(this.homePage);
		this.pages.push(this.scenarioPage);
		this.pages.push(this.scenariosPage);
		this.pages.push(this.layerPage);
		this.pages.push(this.debugPage);

		this.pages.forEach((page) => {
			page.on("state", (state: PageState) => {
				this.setState(state, true);
			});

			page.on("send", (data: object) => {
				this.socket.send(data);
			});

			page.on("map", (layers: string) => {
				this.map.setLayers(layers);
				this.layerPage.setLayers(layers);
			});

			page.on("scenario", (scenarioId: ScenarioId) => {
				this.setState(PageState.Scenario);
				this.scenarioPage.setScenario(scenarioId);
			});

			page.on("resetLight", () => {
				this.map.resetLightControls();
			});

			page.on("logging", (active: boolean) => {
				this.loggingOverlay.setVisible(active);
			});
		});

		this.loggingOverlay = new LoggingOverlay(
			this,
			PageState.Logging,
			this.socket
		);
		this.loggingOverlay.setDepth(3);
		this.loggingOverlay.setVisible(false);

		this.navigation = new Navigation(this);
		this.navigation.on("state", (state: PageState) => {
			this.setState(state);
		});

		this.map = new Map(this, this.socket);
		this.map.setDepth(1);
		this.add.existing(this.map);

		this.setState(PageState.Home);
	}

	update(time: number, delta: number) {
		this.pages.forEach((page) => {
			if (this.state == page.state) {
				page.update(time, delta);
			}
		});

		this.loggingOverlay.update(time, delta);

		this.map.update(time, delta);

		this.navigation.update(time, delta);
	}

	/* Logic */

	restart() {
		this.map.reset();
		this.debugPage.reset();
		this.setState(PageState.Home);
	}

	setState(state: PageState, smooth = false) {
		this.state = state;

		this.navigation.setState(state);

		this.pages.forEach((page) => {
			page.setVisible(page.state == state);
			page.setDepth(page.state == state ? 2 : 0);
		});

		if (state == PageState.Home) {
			if (smooth) {
				this.map.resetLightControls();
				this.socket.fadeLight(() => {
					blocksManager.setDefaultLegend();
					this.socket.sendReset();
					this.scenarioPage.activateDataset("Nkpg/Orto20230921");
					this.map.setLayers("Nkpg/Orto20230921");
					this.socket.sendDeactivateTraffic();
				});
			} else {
				blocksManager.setDefaultLegend();
				this.socket.sendReset();
				this.scenarioPage.activateDataset("Nkpg/Orto20230921");
				this.map.setLayers("Nkpg/Orto20230921");
				this.socket.sendDeactivateTraffic();
			}
		}
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

				if (state) {
					this.socket.sendMovie();
				} else {
					this.map.resetLightControls();
					this.socket.fadeLight(() => {
						this.socket.sendReset();
						this.scenarioPage.activateDataset("Nkpg/Orto20230921");
					});
				}
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
			"guide",
			(value: boolean) => {
				this.navigation.setGuideMode(value);
				if (!value) {
					this.restart();
				}
			},
			this
		);

		this.scene.get("UIScene").events.on(
			"restart",
			() => {
				this.socket.sendReset();
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
