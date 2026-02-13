/* Protocol types */

export enum Request {
	OmniToken = "token",

	Ping = "PingRequest",
	Layer = "LayerRequest",
	Light = "LightRequest",
	SetMarker = "SetMapMarkerRequest",
	RemoveMarker = "RemoveMapMarkerRequest",
	Reset = "ResetRequest",
	Recache = "RecacheRequest",
}

export enum Response {
	OmniConnect = "server_connect",
	OmniDisconnect = "server_disconnect",
	OmniAuthorized = "server_authorized",
	OmniJoin = "server_join",
	OmniLeave = "server_leave",
	OmniError = "server_error",

	Ping = "PingResponse",
	Layer = "LayerResponse",
	Marker = "MapMarkerResponse",
	Reset = "ResetResponse",
	Recache = "RecacheResponse",
}

/* Omni*/

// Sending token
export interface OmniToken {
	token: string;
}

// Upon connecting successfully
export interface OmniConnect {
	type: Response.OmniConnect;
	message: string;
}

// Upon forced disconnect, such as guests being kicked after host disconnects
export interface OmniDisconnect {
	type: Response.OmniDisconnect;
	message: string;
}

// Upon authorizing successfully
export interface OmniAuthorized {
	type: Response.OmniAuthorized;
	message: string;
}

// Upon new application connecting.
export interface OmniJoin {
	type: Response.OmniJoin;
	role: "host" | "client" | "guest";
	user: string;
}

// Upon application disconnecting.
export interface OmniLeave {
	type: Response.OmniLeave;
	role: "host" | "client" | "guest";
	user: string;
}

// Errors including non-json message sent or invalid token.
export interface OmniError {
	type: Response.OmniError;
	message: string;
}

/* Ping */

export interface PingRequest {
	type: Request.Ping;
}

export interface PingResponse {
	type: Response.Ping;
}

/* Data layer activation */

interface LayerSliceCrop {
	type: "slice";
	slice: {
		min_u?: number;
		max_u?: number;
		min_v?: number;
		max_v?: number;
	};
}

interface LayerCircleCrop {
	type: "circle";
	circle: {
		u?: number;
		v?: number;
		radius?: number;
	};
}

type LayerCrop = LayerSliceCrop | LayerCircleCrop;

interface LayerBaseData {
	id: string;
	opacity?: number;
	emission?: number;
	crop?: LayerCrop;
}

interface LayerImageData extends LayerBaseData {
	type: "image";
	raster: string;
}

interface LayerFlowData extends LayerBaseData {
	type: "flow";
	raster: string;
	flow: {
		texture: string;
		scale?: number;
		speed?: number;
	};
}

interface LayerMovieData extends LayerBaseData {
	type: "movie";
	raster: string;
	movie?: {
		speed: number;
	};
}

interface LayerColorData extends LayerBaseData {
	type: "color";
	color: string;
}

interface LayerBase64Data extends LayerBaseData {
	type: "base64";
	base64: string;
}

interface LayerNDIData extends LayerBaseData {
	type: "ndi";
	ndi: {
		machine?: string;
		stream: string;
	};
}

export type LayerRequestData =
	| LayerImageData
	| LayerFlowData
	| LayerMovieData
	| LayerColorData
	| LayerNDIData
	| LayerBase64Data;

export interface LayerRequest {
	type: Request.Layer;
	flush: boolean;
	layers: LayerRequestData[];
}

export interface LayerResponse {
	type: Response.Layer;
	id: string;
	error?: string;
}

/* Time of day */

export interface LightRequest {
	type: Request.Light;
	year: number;
	month: number;
	day: number;
	solar_time: number;
}

/* Spotlight */

export interface SetMarkerRequest {
	type: Request.SetMarker;
	id: string;
	u: number;
	v: number;
	radius: number;
	color?: string;
	emission?: number;
	opacity?: number;
	density?: number;
}

export interface RemoveMarkerRequest {
	type: Request.RemoveMarker;
	id: string;
}

/* Reset */

export interface ResetRequest {
	type: Request.Reset;
	misc: string;
}

export interface ResetResponse {
	type: Response.Reset;
}

/* Database recaching */

export interface RecacheRequest {
	type: Request.Recache;
	path: string;
}

export interface RecacheResponse {
	type: Response.Recache;
	index: number;
	max: number;
}

/* All requests*/

export type ValidRequests =
	| OmniToken
	| PingRequest
	| LayerRequest
	| LightRequest
	| SetMarkerRequest
	| RemoveMarkerRequest
	| ResetRequest
	| RecacheRequest;
