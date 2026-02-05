import { config } from "./RuntimeConfig";
import { BaseScene } from "@/scenes/BaseScene";
import {
	City,
	Collection,
	CollectionKey,
	Layer,
	Legend,
	LegendKey,
	Raster,
	RasterKey,
	Scenario,
	ScenarioKey,
	Symbol,
	Tag,
} from "./interfaces";
import { layoutManager } from "./LayoutManager";
import { textureManager } from "./TextureManager";

class ContentManager {
	private localization: {
		sv: { [key: string]: string };
		en: { [key: string]: string };
	};
	private city: City | null;
	private collections: Collection[];
	private scenarios: Scenario[];
	private rasters: Raster[];
	private legends: Legend[];
	private symbols: Symbol[];
	private tags: Tag[];

	constructor() {
		this.localization = { sv: {}, en: {} };
		this.city = null;
		this.collections = [];
		this.scenarios = [];
		this.rasters = [];
		this.legends = [];
		this.symbols = [];
		this.tags = [];
	}

	/* Omni */

	private async fetch(apiMethod: string): Promise<any | undefined> {
		const url = new URL(apiMethod, config.OMNI_URL).href;
		try {
			const response = await fetch(url, { method: "GET" });
			if (!response.ok) throw new Error();
			return await response.json();
		} catch (e) {}
	}

	private async fetchLocalization(): Promise<void> {
		const dataSv = await this.fetch(`get_localization/?language=sv`);
		if (dataSv) this.localization.sv = dataSv;
		const dataEn = await this.fetch(`get_localization/?language=en`);
		if (dataEn) this.localization.en = dataEn;
	}

	private async fetchCity(): Promise<void> {
		const data = await this.fetch(`get_city/${config.CITY_ID}/`);
		if (data) {
			this.city = data as City;
			this.city.name = `city_${this.city.key}_name`;

			const angles = { north: 0, west: 90, south: 180, east: 270 };
			layoutManager.mapAngle = angles[this.city.orientation] ?? 0;
		}
	}

	private async fetchCollections(): Promise<void> {
		const data = await this.fetch("get_collections/");
		if (data) {
			this.collections = data as Collection[];
			this.collections.forEach((collection) => {
				collection.name = `collection_${collection.key}_name`;
				collection.image = this.stripImagePath(collection.image);
			});
		}
	}

	private async fetchScenarios(): Promise<void> {
		const data = await this.fetch("get_scenarios/");
		if (data) {
			this.scenarios = data as Scenario[];
			this.scenarios.forEach((scenario) => {
				scenario.name = `scenario_${scenario.key}_name`;
				if (scenario.short_name)
					scenario.short_name = `scenario_${scenario.key}_short_name`;
				scenario.description = `scenario_${scenario.key}_description`;
				if (scenario.sequence_title)
					scenario.sequence_title = `scenario_${scenario.key}_sequence_title`;
				scenario.sequence_labels.forEach((label) => {
					label.text = `scenario_${scenario.key}_sequence_label_${label.order}`;
				});
				scenario.legend_image = scenario.legend_image
					? this.stripImagePath(scenario.legend_image)
					: null;
				scenario.legend_image_source = `scenario_${scenario.key}_legend_image_source`;
			});
		}
	}

	private async fetchRasters(): Promise<void> {
		const data = await this.fetch("get_rasters/");
		if (data) {
			this.rasters = data as Raster[];
			this.rasters.forEach((raster) => {
				raster.name = `raster_${raster.key}_name`;
				raster.image = raster.image ? this.stripImagePath(raster.image) : null;
				raster.video = raster.video ? this.stripImagePath(raster.video) : null;
				raster.minimap = this.stripImagePath(raster.minimap);
				raster.thumbnail = this.stripImagePath(raster.thumbnail);
			});
		}
	}

	private async fetchLegends(): Promise<void> {
		const data = await this.fetch("get_legends/");
		if (data) {
			this.legends = data as Legend[];
			this.legends.forEach((legend) => {
				legend.title = `legend_${legend.key}_title`;
				legend.entries.forEach((entry) => {
					entry.text = `legend_${legend.key}_${entry.order}_text`;
				});
			});
		}
	}

	private async fetchSymbols(): Promise<void> {
		const data = await this.fetch("get_symbols/");
		if (data) {
			this.symbols = data as Symbol[];
			this.symbols.forEach((symbol) => {
				symbol.image = this.stripImagePath(symbol.image);
			});
		}
	}

	private async fetchTags(): Promise<void> {
		const data = await this.fetch("get_tags/");
		if (data) {
			this.tags = data as Tag[];
			this.tags.forEach((tag) => {
				tag.name = `tag_${tag.key}`;
			});
		}
	}

	private async fetchAll() {
		await this.fetchLocalization();
		await this.fetchCity();
		await this.fetchCollections();
		await this.fetchScenarios();
		await this.fetchRasters();
		await this.fetchLegends();
		await this.fetchSymbols();
		await this.fetchTags();
	}

	async reloadLayers() {
		await this.fetchAll();
	}

	/**
	 * Preload essential textures that are important enough to always be available.
	 * These include: collection images, scenario legend images, symbol images,
	 * and raster minimap/thumbnail images from scenario layers.
	 * Should be called from PreloadScene after Phaser scene is initialized.
	 */
	async preloadEssentialTextures(scene: BaseScene): Promise<void> {
		for (const collection of this.collections) {
			if (collection.image) {
				textureManager.requestTexture(scene, collection.image);
			}
		}

		for (const symbol of this.symbols) {
			if (symbol.image) {
				textureManager.requestTexture(scene, symbol.image);
			}
		}

		for (const scenario of this.scenarios) {
			if (scenario.legend_image) {
				textureManager.requestTexture(scene, scenario.legend_image);
			}
		}

		for (const scenario of this.scenarios) {
			for (const layer of scenario.layers) {
				const raster = this.layerToRaster(layer);
				if (raster) {
					if (raster.thumbnail) {
						textureManager.requestTexture(scene, raster.thumbnail);
					}
				}
			}
		}

		for (const scenario of this.scenarios) {
			for (const layer of scenario.layers) {
				const raster = this.layerToRaster(layer);
				if (raster) {
					if (raster.minimap) {
						textureManager.requestTexture(scene, raster.minimap);
					}
				}
			}
		}
	}

	/* Content sharing */

	getSwedishLocales(): { [key: string]: string } {
		return this.localization.sv;
	}

	getEnglishLocales(): { [key: string]: string } {
		return this.localization.en;
	}

	getDefaultBlocksVideo() {
		if (this.city) {
			return this.city.default_blocks_video;
		}
	}

	getCity(): City {
		if (this.city) return this.city;
		throw new Error("City data not found");
	}

	getFeaturedCollections(): Collection[] {
		const city = this.getCity();
		return city.featured_collections.map((key) => this.getCollection(key));
	}

	getCollections(): Collection[] {
		return this.collections;
	}

	getCollection(key: CollectionKey): Collection {
		const collection = this.collections.find((c) => c.key == key);
		if (!collection) throw new Error(`Collection "${key}" not found`);
		return collection!;
	}

	getScenarios(): Scenario[] {
		return this.scenarios;
	}

	getScenario(key: ScenarioKey): Scenario {
		const scenario = this.scenarios.find((s) => s.key == key);
		if (!scenario) throw new Error(`Scenario "${key}" not found`);
		return scenario!;
	}

	getLegend(key: LegendKey): Legend {
		const legend = this.legends.find((l) => l.key == key);
		if (!legend) throw new Error(`Legend "${key}" not found`);
		return legend!;
	}

	getTags(): Tag[] {
		return this.tags;
	}

	getRaster(rasterKey: RasterKey): Raster | undefined {
		return this.rasters.find((raster) => raster.key == rasterKey);
	}

	getRastersByTag(tag: Tag): Raster[] {
		return this.rasters.filter((raster) => raster.tags.includes(tag.key));
	}

	getLegendSymbol(symbolKey: string): Symbol {
		const symbol = this.symbols.find((s) => s.key == symbolKey);
		if (!symbol) throw new Error(`Symbol "${symbolKey}" not found`);
		return symbol!;
	}

	/* Methods */

	rasterToLayer(raster: Raster): Layer {
		if (raster.media_type == "image")
			return {
				type: "image",
				raster: raster.key,
			};
		else
			return {
				type: "movie",
				raster: raster.key,
				movie: {
					speed: 1,
				},
			};
	}

	layerToRaster(layer: Layer): Raster | undefined {
		switch (layer.type) {
			case "image":
			case "flow":
			case "movie":
				return this.rasters.find((raster) => raster.key == layer.raster);
		}
	}

	stripImagePath(path: string): string {
		return decodeURIComponent(path)
			.replace(/^\/media\//, "")
			.replace(/\.[^/.]+$/, "")
			.replace(/\//g, "_");
	}

	/**
	 * Refresh all rasters from the server and reload their textures.
	 * Also refreshes the raster-related textures through TextureManager.
	 */
	async refreshRasters(scene: BaseScene): Promise<void> {
		// Clear existing rasters
		this.rasters = [];

		// Fetch fresh raster data from server
		await this.fetchRasters();

		// Refresh raster textures through TextureManager
		await textureManager.refreshRasterTextures(scene);
	}
}

export const contentManager = new ContentManager();
