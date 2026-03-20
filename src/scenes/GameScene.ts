import { BaseScene } from "@/scenes/BaseScene";
import { BlurPostFilter } from "@/utils/pipelines/BlurPostFilter";
import { Color } from "@/utils/colors";
import { Navigation } from "@/components/Navigation";
import { Map } from "@/components/Map";

import { Page, PageState } from "@/components/pages/Page";
import { HomePage } from "@/components/pages/HomePage";
import { ScenarioPage } from "@/components/pages/ScenarioPage";
import { CollectionPage } from "@/components/pages/CollectionPage";
import { LayerPage } from "@/components/pages/LayerPage";
import { DebugPage } from "@/components/pages/DebugPage";
import { LoggingOverlay } from "@/components/pages/LoggingOverlay";

import { SocketManager } from "@/utils/SocketManager";
import {
	Collection,
	CollectionKey,
	Layer,
	RasterKey,
	Scenario,
} from "@/utils/interfaces";
import { LayerRequestData } from "@/utils/protocol";
import { blocksManager } from "@/utils/BlocksManager";
import { contentManager } from "@/utils/ContentManager";
import { config } from "@/utils/RuntimeConfig";

export class GameScene extends BaseScene {
	private attractionOpen: boolean;
	private infoWindowOpen: boolean;
	private blurTween: Phaser.Tweens.Tween;
	private socket: SocketManager;

	private state: PageState;
	private pages: Page[];
	private homePage: HomePage;
	private scenarioPage: ScenarioPage;
	private scenariosPage: CollectionPage;
	private layerPage: LayerPage;
	private debugPage: DebugPage;
	private loggingOverlay: LoggingOverlay;
	private navigation: Navigation;
	private map: Map;

	private activeScenario: Scenario | undefined; // Currently active scenario
	private activeLayers: Layer[]; // Currently active map layers
	private lockedScenario: Scenario | undefined; // Locked scenario, displayed on the right side
	private lockedLayers: Layer[]; // Locked layers in map slicing mode, not necessarily tied to a scenario

	constructor() {
		super({ key: "GameScene" });
	}

	create(): void {
		this.fade(false, 200, Color.Black);
		this.cameras.main.setBackgroundColor(Color.Slate950);
		this.initBlur();

		this.activeScenario = undefined;
		this.lockedScenario = undefined;
		this.activeLayers = [];
		this.lockedLayers = [];

		// this.input.dragDistanceThreshold = 16;
		this.input.addPointer(1);

		this.socket = new SocketManager(this);
		this.socket.setDepth(1000);
		this.socket.connect();

		this.socket.on("reconnect", () => {
			// this.socket.sendReset();
			this.restart();
		});
		this.socket.on("onRecacheProgress", (count: number, max: number) => {
			this.events.emit("onRecacheProgress", count, max);
		});
		this.socket.on("onRecacheComplete", () => {
			this.events.emit("onRecacheComplete");
			this.layerPage.loadFolders();
		});

		/* Layout */

		this.pages = [];
		this.homePage = new HomePage(this, PageState.Home, this.socket);
		this.scenarioPage = new ScenarioPage(this, PageState.Scenario, this.socket);
		this.scenariosPage = new CollectionPage(
			this,
			PageState.Scenarios,
			this.socket,
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

			page.on("setCollection", this.setCollection, this);
			page.on("setScenario", this.setScenario, this);
			page.on("setLayers", this.setLayers, this);

			page.on("collection", (key: CollectionKey) => {
				this.setState(PageState.Scenario);
				this.scenarioPage.setCollection(key);
			});

			page.on("resetLight", () => {
				this.map.resetLightControls();
			});

			page.on("logging", (active: boolean) => {
				this.loggingOverlay.setVisible(active);
			});

			page.on("showLayerInfo", (active: boolean) => {
				this.layerPage.setShowLayerInfo(active);
			});
		});

		this.loggingOverlay = new LoggingOverlay(
			this,
			PageState.Logging,
			this.socket,
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
		this.initMapSlicing();

		this.setState(PageState.Home);

		// Preload essential textures
		contentManager.preloadEssentialTextures(this);
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
		this.layerPage.reset();
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
				this.socket.fadeLight(() => this.onHomeReset());
			} else {
				this.onHomeReset();
			}
		}
	}

	onResetButton() {
		this.socket.sendReset();
		this.restart();
	}

	onHomeReset() {
		if (this.mapSliceEnabled) this.disableMapSlicing();

		blocksManager.setDefaultLegend();
		this.socket.sendReset();

		const defaultScenario = contentManager.getScenario("default");
		if (defaultScenario) {
			this.setLayers(defaultScenario.layers);
			this.setScenario(defaultScenario);
		}
	}

	onAttractionReset() {
		const idleRaster = contentManager.getRaster(config.IDLE_RASTER);
		if (!idleRaster)
			return console.error(
				"IDLE_RASTER in config.json not found in available rasters",
			);
		const layer = contentManager.rasterToLayer(idleRaster);
		this.setLayers([layer]);
	}

	setCollection(collection: Collection) {
		blocksManager.setWallVideo(collection.blocks_video);
	}

	setScenario(scenario: Scenario) {
		this.activeScenario = scenario;

		if (this.hasDualScenarios && this.lockedScenario) {
			blocksManager.setDualLegend(
				this.activeScenario.key,
				this.lockedScenario.key,
			);
		} else {
			blocksManager.setLegend(scenario.key);
		}
	}

	setLayers(layers: Layer[], flush = true) {
		this.activeLayers = JSON.parse(JSON.stringify(layers));

		// Create combined layers with crop properties applied
		const combinedLayers = this.createCombinedLayers();

		this.layerPage.setLayers(this.activeLayers);

		this.map.setLayers(combinedLayers, flush);

		// this.socket.sendReset();
		// this.emit("map", "");

		const layerRequestData = this.convertLayersToProtocol(combinedLayers);
		this.socket.sendLayers(layerRequestData, flush);

		this.map.setSlicePinnable(this.canPin);
	}

	private createCombinedLayers(): Layer[] {
		if (!this.mapSliceEnabled) {
			return this.activeLayers;
		}

		const combined: Layer[] = [];

		// Add active layers with left-side crop
		this.activeLayers.forEach((layer) => {
			const layerCopy = { ...layer };
			layerCopy.crop = {
				type: "slice",
				slice: {
					min_u: this.map.sliceValue,
					max_u: 1,
					min_v: 0,
					max_v: 1,
				},
			};
			combined.push(layerCopy);
		});

		// Add locked layers with right-side crop
		this.lockedLayers.forEach((layer) => {
			const layerCopy = { ...layer };
			layerCopy.crop = {
				type: "slice",
				slice: {
					min_u: 0,
					max_u: this.map.sliceValue,
					min_v: 0,
					max_v: 1,
				},
			};
			combined.push(layerCopy);
		});

		// Right side pinned shaded area
		combined.push({
			type: "color",
			color: "#000000",
			opacity: 0.2,
			crop: {
				type: "slice",
				slice: {
					min_u: 0,
					max_u: this.map.sliceValue,
					min_v: 0,
					max_v: 1,
				},
			},
		});

		// Center line separator
		combined.push({
			type: "color",
			color: "#000000",
			opacity: 0.8,
			crop: {
				type: "slice",
				slice: {
					min_u: Math.max(this.map.sliceValue - 0.0025, 0),
					max_u: Math.min(this.map.sliceValue + 0.0025, 1),
					min_v: 0,
					max_v: 1,
				},
			},
		});

		return combined;
	}

	convertLayersToProtocol(layers: Layer[]): LayerRequestData[] {
		function getImage(rasterKey: RasterKey): string {
			const raster = contentManager.getRaster(rasterKey);
			if (raster && raster.image) return raster.image;
			if (raster && raster.video) return raster.video;
			return rasterKey;
		}

		return layers.map((layer, index) => {
			const common = {
				opacity: layer.opacity,
				emission: layer.emission,
				crop: layer.crop,
			};

			switch (layer.type) {
				case "image":
					return {
						type: "image",
						id: `${index}_${layer.raster}`,
						raster: getImage(layer.raster),
						...common,
					};

				case "flow":
					return {
						type: "flow",
						id: `${index}_${layer.raster}`,
						raster: getImage(layer.raster),
						flow: {
							texture: getImage(layer.flow.texture),
							scale: layer.flow.scale,
							speed: layer.flow.speed,
						},
						...common,
					};

				case "movie":
					return {
						type: "movie",
						id: `${index}_${layer.raster}`,
						raster: getImage(layer.raster),
						movie: layer.movie,
						...common,
					};

				case "color":
					return {
						type: "color",
						id: `${index}_${layer.color}`,
						color: layer.color,
						...common,
					};

				case "ndi":
					return {
						type: "ndi",
						id: `${index}_${layer.ndi.stream}`,
						ndi: layer.ndi,
						...common,
					};
			}
		});
	}

	/* Map slicing */

	initMapSlicing() {
		this.map.on("toggleMapSlice", () => {
			if (this.mapSliceEnabled) {
				this.disableMapSlicing();
			} else {
				this.enableMapSlicing();
			}

			this.map.setSlicePinnable(this.canPin);
			this.setLayers(this.activeLayers);
		});

		this.map.on("sliceValue", (value: number) => {
			this.setLayers(this.activeLayers, false);
		});

		this.map.on("pin", () => {
			this.lockedScenario = this.activeScenario;
			this.lockedLayers = JSON.parse(JSON.stringify(this.activeLayers));
			this.map.setSlicePinnable(false);
			this.setLayers(this.activeLayers);
		});

		this.disableMapSlicing();
	}

	enableMapSlicing() {
		this.lockedScenario = this.activeScenario;
		this.lockedLayers = JSON.parse(JSON.stringify(this.activeLayers));
		this.map.setSliceEnabled(true);
		this.map.setSliceValue(0.0, false);
		this.map.setSliceValue(0.33, true);
	}

	disableMapSlicing() {
		this.lockedScenario = undefined;
		this.lockedLayers = [];
		this.map.setSliceEnabled(false);

		if (this.activeScenario) {
			blocksManager.setLegend(this.activeScenario.key);
		}
	}

	get mapSliceEnabled(): boolean {
		return this.lockedLayers.length > 0;
	}

	/* Blur */

	initBlur(): void {
		// Listen for events from the UI scene
		this.scene.get("UIScene").events.on(
			"attraction",
			(isAttractionMode: boolean) => {
				this.attractionOpen = isAttractionMode;

				this.updateBlur();
				// this.foodWeb.toggleAttraction(state);

				if (isAttractionMode) {
					this.onAttractionReset();
				} else {
					this.map.resetLightControls();
					this.socket.fadeLight(() => {
						this.onHomeReset();
					});
				}
			},
			this,
		);

		this.scene.get("UIScene").events.on(
			"info",
			(state: boolean) => {
				this.infoWindowOpen = state;
				this.updateBlur();
			},
			this,
		);

		this.scene.get("UIScene").events.on(
			"guide",
			(isGuideMode: boolean) => {
				this.navigation.setGuideMode(isGuideMode);
				if (isGuideMode) {
					this.setState(PageState.Layer);
				} else {
					this.restart();
				}
			},
			this,
		);

		this.scene.get("UIScene").events.on("restart", this.onResetButton, this);
	}

	updateBlur(): void {
		let filter = this.cameras.main.getPostPipeline(
			BlurPostFilter,
		) as BlurPostFilter;
		let isActive = this.cameras.main.hasPostPipeline;
		let shouldBeActive = this.attractionOpen || this.infoWindowOpen;

		if (shouldBeActive) {
			if (!isActive) {
				this.cameras.main.setPostPipeline(BlurPostFilter);
				filter = this.cameras.main.getPostPipeline(
					BlurPostFilter,
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

	get hasDualScenarios(): boolean {
		if (!this.lockedScenario) {
			return false;
		}

		if (this.activeScenario == this.lockedScenario) {
			return false;
		}

		const defaultScenario = contentManager.getScenario("default");
		if (defaultScenario) {
			if (this.lockedScenario == defaultScenario) {
				return false;
			}
		}

		return true;
	}

	get canPin(): boolean {
		return (
			JSON.stringify(this.activeLayers) != JSON.stringify(this.lockedLayers)
		);
	}
}
