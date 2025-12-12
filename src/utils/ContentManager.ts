import { config } from "./RuntimeConfig";
import {
	City,
	Collection,
	CollectionKey,
	Legend,
	LegendEntry,
	LegendKey,
	Raster,
	Scenario,
	ScenarioKey,
	Symbol,
	Tag,
} from "./interfaces";

export interface Layer {
	name: string;
	isInDrive: boolean;
	isInLocal: boolean;
	useCount: number;
}

export interface Folder {
	name: string;
	layers: Layer[];
	isSequential: boolean;
	isInDrive: boolean;
	isInLocal: boolean;
}

class ContentManager {
	private localization: {
		sv: { [key: string]: string };
		en: { [key: string]: string };
	};
	private city: City | null;
	private collections: Collection[] = [];
	private scenarios: Scenario[] = [];
	private rasters: Raster[] = [];
	private legends: Legend[] = [];
	private symbols: Symbol[] = [];
	private tags: Tag[] = [];

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
		if (data) this.city = data as City;
	}

	private async fetchCollections(): Promise<void> {
		const data = await this.fetch("get_collections/");
		if (data) this.collections = data as Collection[];
	}

	private async fetchScenarios(): Promise<void> {
		const data = await this.fetch("get_scenarios/");
		if (data) this.scenarios = data as Scenario[];
	}

	private async fetchRasters(): Promise<void> {
		const data = await this.fetch("get_rasters/");
		if (data) this.rasters = data as Raster[];
	}

	private async fetchSymbols(): Promise<void> {
		const data = await this.fetch("get_symbols/");
		if (data) this.symbols = data as Symbol[];
	}

	private async fetchTags(): Promise<void> {
		const data = await this.fetch("get_tags/");
		if (data) this.tags = data as Tag[];
	}

	private async fetchAll() {
		await this.fetchLocalization();
		await this.fetchCity();
		await this.fetchCollections();
		await this.fetchScenarios();
		await this.fetchRasters();
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

	/* Old */

	getFolders(): Folder[] {
		return this.tags.map((tag) => ({
			name: tag.key,
			layers: this.getLayers(tag.name),
			isSequential: false,
			isInDrive: true,
			isInLocal: true,
		}));
	}

	getLayers(tagKey: string): Layer[] {
		const tagObj = this.tags.find((tag) => tag.key === tagKey);
		if (!tagObj) return [];

		return this.rasters
			.filter((raster) => raster.tags.includes(tagKey))
			.map((raster) => ({
				name: raster.key,
				isInDrive: true,
				isInLocal: true,
				useCount: 0,
			}));
	}
}

export const contentManager: ContentManager = new ContentManager();
