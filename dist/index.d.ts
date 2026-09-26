// Generated from the snackbyte brand guide v1.3.0. Do not edit.
export type Theme = 'day' | 'night';
export type Role = 'ground' | 'ink' | 'muted' | 'sky' | 'sage' | 'sage-text' | 'bitterbrush' | 'rule';
export type Shape = { d: string; role: 'ink' | 'sky' };
export type Mark = { viewBox: string; width: number; height: number; shapes: Shape[] };

export declare const version: string;
export declare const color: { "_": string; "ground": { "day": string; "night": string; "name": { "day": string; "night": string }; "use": string }; "ink": { "day": string; "night": string; "name": { "day": string; "night": string }; "use": string }; "muted": { "day": string; "night": string; "name": { "day": string; "night": string }; "use": string }; "sky": { "day": string; "night": string; "name": { "day": string; "night": string }; "use": string }; "sage": { "day": string; "night": string; "name": { "day": string; "night": string }; "use": string }; "sage-text": { "day": string; "night": string; "name": { "day": string; "night": string }; "use": string }; "bitterbrush": { "day": string; "night": string; "name": { "day": string; "night": string }; "use": string }; "rule": { "day": string; "night": string; "name": { "day": string; "night": string }; "use": string } };
export declare const geometry: { "_": string; "cell": number; "radius": number; "gap": number; "seam": number; "bite": { "r": number; "cx": number; "cy": number } };
export declare const forms: { "_": string; "row": { "nibbles": string[]; "direction": string; "bitten": string }; "stack": { "nibbles": string[]; "direction": string; "bitten": string }; "tile": { "size": number; "radius": number; "holds": string; "fill": string } };
export declare const type: { "_": string; "family": string; "fallback": string[]; "googleFonts": string; "source": string; "licence": string; "wordmark": { "text": string; "weight": number; "opsz": number; "width": number; "tracking": number }; "display": { "weight": number; "opsz": number; "tracking": number }; "text": { "weight": number; "opsz": number; "tracking": number }; "scale": { "_": string; "base": number; "ratio": number; "steps": number[] } };
export declare const space: { "_": string; "unit": number; "steps": { "gap": number; "seam": number; "cell": number; "cell-seam": number; "stack": number } };
export declare const motion: { "_": string; "arrival": { "letterMs": number; "holdMs": number; "biteMs": number; "offOpacity": number; "biteEasing": string } };
export declare const copy: { "_": string; "name": string; "headline": string; "headlineLines": string[]; "subhead": string; "based": string; "place": string };
export declare const theme: { "_": string; "default": string; "dark": string };
export declare const marks: { row: Mark; stack: Mark };
