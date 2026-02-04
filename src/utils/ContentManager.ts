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
	Scenario,
	ScenarioKey,
	Symbol,
	Tag,
} from "./interfaces";
import { filesystem } from "@neutralinojs/lib";

type SubscriptionCallback = (isLoaded: boolean) => void;

/**
 * Media folders that support lazy loading.
 * These are used as prefixes for texture keys.
 */
const LAZY_LOAD_FOLDERS = {
	THUMBNAILS: "thumbnails",
	MINIMAPS: "minimaps",
	COLLECTIONS: "collections",
	LEGENDS: "legends",
	LEGEND_SYMBOLS: "legendsymbols",
	RASTERS: "rasters",
	VIDEOS: "videos",
};

/**
 * Raster-related folders that are updated together.
 * When refreshRasters is called, only these folders are refreshed.
 */
const RASTER_REFRESH_FOLDERS = [
	LAZY_LOAD_FOLDERS.THUMBNAILS,
	LAZY_LOAD_FOLDERS.MINIMAPS,
	LAZY_LOAD_FOLDERS.RASTERS,
	LAZY_LOAD_FOLDERS.VIDEOS,
];

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
	private loadQueue: Array<{
		scene: BaseScene;
		textureKey: string;
		resolve: (value: boolean) => void;
	}>;
	private isLoading: boolean;
	private textureSubscriptions: Map<string, Array<SubscriptionCallback>>;

	constructor() {
		this.localization = { sv: {}, en: {} };
		this.city = null;
		this.collections = [];
		this.scenarios = [];
		this.rasters = [];
		this.legends = [];
		this.symbols = [];
		this.tags = [];
		this.loadQueue = [];
		this.isLoading = false;
		this.textureSubscriptions = new Map();
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
	 * Extracts the folder and filename from a texture key.
	 * Texture keys are formatted as "{folder}_{filename}" from mediaLoader.
	 * Returns { folder, filename } or null if the key format is invalid.
	 */
	private extractFolderAndFilename(
		textureKey: string,
	): { folder: string; filename: string } | null {
		const parts = textureKey.split("_");
		if (parts.length < 2) {
			console.warn(`Invalid texture key format: ${textureKey}`);
			return null;
		}

		const folder = parts[0];
		const filename = parts.slice(1).join("_"); // Handle filenames with underscores

		return { folder, filename };
	}

	/**
	 * Loads a media asset image asynchronously on-demand.
	 * Takes a texture key (e.g., "thumbnails_Buller") and loads the corresponding file.
	 * Images are loaded sequentially to avoid blocking the main thread.
	 * Returns true if the load was queued/triggered, false if the texture already exists.
	 */
	async requestTexture(scene: BaseScene, textureKey: string): Promise<boolean> {
		// Check if texture already exists
		if (scene.textures.exists(textureKey)) {
			return false;
		}

		return new Promise((resolve) => {
			// Add to load queue
			this.loadQueue.push({ scene, textureKey, resolve });

			// Process queue if not already loading
			if (!this.isLoading) {
				this.processLoadQueue();
			}
		});
	}

	/**
	 * Attempts to find a file with the given filename and any supported extension.
	 * Returns an object with the full file path and MIME type, or null if not found.
	 */
	private async findMediaFile(
		baseFolder: string,
		filename: string,
	): Promise<{ filePath: string; mimeType: string } | null> {
		const mimeTypes: Record<string, string> = {
			".png": "image/png",
			".jpg": "image/jpeg",
			".jpeg": "image/jpeg",
		};

		for (const ext of Object.keys(mimeTypes)) {
			const filePath = `${config.MEDIA_PATH}\\${baseFolder}\\${filename}${ext}`;

			try {
				await filesystem.readBinaryFile(filePath);
				return { filePath, mimeType: mimeTypes[ext] };
			} catch {
				continue;
			}
		}

		return null;
	}

	/**
	 * Processes the load queue sequentially, loading one image at a time.
	 */
	private async processLoadQueue(): Promise<void> {
		if (this.isLoading || this.loadQueue.length === 0) {
			return;
		}

		this.isLoading = true;
		const { scene, textureKey, resolve } = this.loadQueue.shift()!;

		// Skip if texture already exists
		if (scene.textures.exists(textureKey)) {
			resolve(false);
			this.isLoading = false;
			this.processLoadQueue();
			return;
		}

		const folderAndFile = this.extractFolderAndFilename(textureKey);
		if (!folderAndFile) {
			resolve(false);
			this.isLoading = false;
			this.processLoadQueue();
			return;
		}

		const { folder, filename } = folderAndFile;

		try {
			// Find the media file with any supported extension
			const mediaFile = await this.findMediaFile(folder, filename);

			if (!mediaFile) {
				console.error(
					`Failed to find media asset ${textureKey} with any supported extension (png, jpg, jpeg)`,
				);
				resolve(false);
				this.isLoading = false;
				this.processLoadQueue();
				return;
			}

			const { filePath, mimeType } = mediaFile;

			// Read the binary file
			const data = await filesystem.readBinaryFile(filePath);
			const blob = new Blob([data], { type: mimeType });
			const objectUrl = URL.createObjectURL(blob);

			// Add the image to the loader
			scene.load.image(textureKey, objectUrl);

			// Start the loader and handle completion
			scene.load.once("complete", () => {
				// Revoke the object URL after loading
				URL.revokeObjectURL(objectUrl);

				// Notify all subscribers that this texture is loaded
				this.notifyTextureSubscribers(textureKey, true);

				resolve(true);

				// Move to next item in queue
				this.isLoading = false;
				this.processLoadQueue();
			});

			scene.load.start();
		} catch (error) {
			console.error(`Failed to load media asset ${textureKey}:`, error);
			resolve(false);

			// Continue with next item in queue
			this.isLoading = false;
			this.processLoadQueue();
		}
	}

	/**
	 * Subscribe a callback to be called when a texture is loaded.
	 * The callback will be invoked when the texture becomes available.
	 * @param textureKey The texture key to subscribe to
	 * @param callback Function to call when texture is loaded
	 * @returns An unsubscribe function
	 */
	subscribeToTexture(
		textureKey: string,
		callback: SubscriptionCallback,
	): () => void {
		if (!this.textureSubscriptions.has(textureKey)) {
			this.textureSubscriptions.set(textureKey, []);
		}

		this.textureSubscriptions.get(textureKey)!.push(callback);

		// Return unsubscribe function
		return () => {
			const callbacks = this.textureSubscriptions.get(textureKey);
			if (callbacks) {
				const index = callbacks.indexOf(callback);
				if (index !== -1) {
					callbacks.splice(index, 1);
				}
			}
		};
	}

	/**
	 * Notify all subscribers that a texture has been loaded.
	 * Called internally when a texture finishes loading.
	 */
	private notifyTextureSubscribers(
		textureKey: string,
		isLoaded: boolean,
	): void {
		const callbacks = this.textureSubscriptions.get(textureKey);
		if (callbacks) {
			callbacks.forEach((callback) => callback(isLoaded));
		}
	}

	/**
	 * Refresh all rasters from the server and reload their textures.
	 * Only refreshes textures from raster-related folders: thumbnails, minimaps, rasters, and videos.
	 * Does not refresh collections, legends, or legendsymbols as they are not updated regularly.
	 */
	async refreshRasters(scene: BaseScene): Promise<void> {
		// Clear existing rasters
		this.rasters = [];

		// Notify all subscribers of raster-related textures to reset to placeholder
		const subscribedTextures = Array.from(this.textureSubscriptions.keys());
		for (const textureKey of subscribedTextures) {
			if (this.isRasterRelatedTexture(textureKey)) {
				this.notifyTextureSubscribers(textureKey, false);
			}
		}

		// Remove all raster-related textures from the scene
		for (const textureKey of subscribedTextures) {
			if (this.isRasterRelatedTexture(textureKey)) {
				if (scene.textures.exists(textureKey)) {
					scene.textures.remove(textureKey);
				}
			}
		}

		// Fetch fresh raster data from server
		await this.fetchRasters();

		// Load all raster-related textures that have subscribers
		for (const textureKey of subscribedTextures) {
			if (this.isRasterRelatedTexture(textureKey)) {
				await this.requestTexture(scene, textureKey);
			}
		}
	}

	/**
	 * Check if a texture key belongs to a raster-related folder.
	 */
	private isRasterRelatedTexture(textureKey: string): boolean {
		return RASTER_REFRESH_FOLDERS.some((folder) =>
			textureKey.startsWith(folder + "_"),
		);
	}
}

export const contentManager = new ContentManager();
