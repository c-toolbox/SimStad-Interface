export type CityKey = string;
export type CollectionKey = string;
export type ScenarioKey = string;
export type RasterKey = string;
export type LegendKey = string;
export type SymbolKey = string;
export type TagKey = string;

type BlocksKey = string;
type Timestamp = string;
type ImageUrl = string;
type HexColor = string;

export interface Tag {
	created_at: Timestamp;
	changed_at: Timestamp;
	key: TagKey;
	name: string;
}

export interface Symbol {
	created_at: Timestamp;
	changed_at: Timestamp;
	key: SymbolKey;
	image: ImageUrl;
}

export interface LegendEntry {
	text: string;
	color: HexColor;
	symbol: SymbolKey;
	order: number;
}

export interface Legend {
	created_at: Timestamp;
	changed_at: Timestamp;
	key: LegendKey;
	title: string;
	entries: LegendEntry[];
}

export interface Raster {
	created_at: Timestamp;
	changed_at: Timestamp;
	key: RasterKey;
	name: string;
	notes: string | null;
	tags: TagKey[];
	image: ImageUrl;
	minimap: ImageUrl | null;
	thumbnail: ImageUrl | null;
}

export interface Scenario {
	created_at: Timestamp;
	changed_at: Timestamp;
	key: ScenarioKey;
	name: string;
	short_name: string;
	description: string;
	rasters: RasterKey[];
	legend: LegendKey | null;
	legend_image: ImageUrl | null;
	legend_image_source: string | null;
}

export interface Collection {
	created_at: Timestamp;
	changed_at: Timestamp;
	key: CollectionKey;
	name: string;
	blocks_video: BlocksKey;
	image: ImageUrl;
	scenarios: ScenarioKey[];
}

export interface City {
	created_at: Timestamp;
	changed_at: Timestamp;
	key: CityKey;
	name: string;
	min_x: number;
	min_y: number;
	max_x: number;
	max_y: number;
	default_blocks_video: BlocksKey;
	collections: CollectionKey[];
}
