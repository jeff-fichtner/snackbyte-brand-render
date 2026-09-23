// Generated from the snackbyte brand guide v1.1.0. Do not edit.
export type Theme = 'day' | 'night';
export type Role = 'ground' | 'ink' | 'muted' | 'sky' | 'sage' | 'sage-text' | 'bitterbrush' | 'rule';
export type Shape = { d: string; role: 'ink' | 'sky' };
export type Mark = { viewBox: string; width: number; height: number; shapes: Shape[] };

export declare const version: string;
export declare const color: Record<Role, { day: string; night: string; name: Record<Theme, string>; use: string }>;
export declare const geometry: { cell: number; radius: number; gap: number; seam: number; bite: { r: number; cx: number; cy: number } };
export declare const type: Record<string, unknown>;
export declare const space: { unit: number; steps: Record<string, number> };
export declare const copy: { name: string; headline: string; headlineLines: string[]; subhead: string; place: string };
export declare const marks: { row: Mark; stack: Mark };
