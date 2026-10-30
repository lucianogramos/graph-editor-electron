import { Shape } from "./Shape.interface";

export type Direction = "ltr" | "rtl";

export interface Text extends Shape {
    readonly text: string;
    readonly textDecoration: string;
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly fontVariant: string;
    readonly fontStyle: string;
    readonly textAlign: string;
    readonly textVerticalAlign: string;
    readonly lineHeight: number;
    readonly letterSpacing: number;
    readonly direction: Direction;
    readonly wrap: string;
    readonly ellipsis: boolean;
    readonly width: number;
    readonly height: number;

    setText(text: string): void;
    setTextDecoration(decoration: string): void;
    setFontFamily(fontFamily: string): void;
    setFontSize(size: number): void;
    setFontStyle(fontStyle: string): void;
    setFontVariant(variant: string): void;
    setTextAlign(textAlign: string): void;
    setTextVerticalAlign(textVerticalAlign: string): void;
    setEllipsis(value: boolean): void;
    setLineHeight(height: number): void;
    setLetterSpacing(spacing: number): void;
    setDirection(direction: Direction): void;
    setWrap(wrap: string): void;
    setWidth(width: number): void;
    setHeight(height: number): void;
}