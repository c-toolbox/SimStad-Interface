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
type LayerDisplayMode = "stacked" | "sequential";
type Orientation = "north" | "east" | "south" | "west";

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
	media_type: "image" | "video";
	image: ImageUrl | null;
	video: ImageUrl | null;
	minimap: ImageUrl;
	thumbnail: ImageUrl;
}

// Crop types for layers
export interface LayerSliceCrop {
	type: "slice";
	slice: {
		min_u: number;
		max_u: number;
		min_v: number;
		max_v: number;
	};
}

export interface LayerCircleCrop {
	type: "circle";
	circle: {
		u: number;
		v: number;
		radius: number;
	};
}

export type LayerCrop = LayerSliceCrop | LayerCircleCrop;

// Base layer data with common properties
export interface LayerBaseData {
	type: "image" | "flow" | "movie" | "color" | "ndi";
	opacity?: number;
	emission?: number;
	crop?: LayerCrop;
}

// Specific layer types
export interface LayerImageData extends LayerBaseData {
	type: "image";
	raster: RasterKey;
}

export interface LayerFlowData extends LayerBaseData {
	type: "flow";
	raster: RasterKey;
	flow: {
		texture: RasterKey;
		scale: number;
		speed: number;
	};
}

export interface LayerMovieData extends LayerBaseData {
	type: "movie";
	raster: RasterKey;
	movie: {
		speed: number;
	};
}

export interface LayerColorData extends LayerBaseData {
	type: "color";
	color: string;
}

export interface LayerNDIData extends LayerBaseData {
	type: "ndi";
	ndi: {
		stream: string;
		machine?: string;
	};
}

export type Layer =
	| LayerImageData
	| LayerFlowData
	| LayerMovieData
	| LayerColorData
	| LayerNDIData;

export interface SequenceLabel {
	text: string;
	order: number;
}

export interface Scenario {
	created_at: Timestamp;
	changed_at: Timestamp;
	key: ScenarioKey;
	name: string;
	short_name?: string;
	description: string;
	layers: Layer[];
	layer_display_mode: LayerDisplayMode;
	legend: LegendKey | null;
	legend_image: ImageUrl | null;
	legend_image_source?: string;
	sequence_title?: string;
	sequence_labels: SequenceLabel[];
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
	orientation: Orientation;
	raster_width: number;
	raster_height: number;
	default_blocks_video: BlocksKey;
	collections: CollectionKey[];
	featured_collections: CollectionKey[];
}
