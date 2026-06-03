import { Book, Rendition } from "epubjs";
import { ReactNode } from "react";
import { colorTheme } from "../../src/components/SettingsDropdown";
import { Functionality } from "../../src/EpubReader";
type ColorTheme = (typeof colorTheme)[0];
type Setting = {
    theme: ColorTheme;
    fontSize: number;
    fontFamily: string;
    direction: string;
};
type Provider = {
    setting: Setting;
    rendition: Rendition | null;
    dispatch: React.Dispatch<OptionSetting>;
    book: Book | null;
} & Functionality;
type Props = {
    children?: ReactNode;
    rendition: Rendition | null;
    state: [Setting, React.Dispatch<OptionSetting>];
    book: Book | null;
} & Functionality;
type OptionSetting = {
    [k in keyof Setting]?: Setting[k];
};
export declare const reducer: (state: Setting, action: OptionSetting) => {
    theme: ColorTheme;
    fontSize: number;
    fontFamily: string;
    direction: string;
};
export type Highlight = {
    cfi: string;
    txt: string;
    noteTxt?: string;
};
declare function ViewerProvider({ rendition, children, state, book, ...props }: Props): import("react/jsx-runtime").JSX.Element;
export declare const useViewerData: () => Provider;
export default ViewerProvider;
//# sourceMappingURL=ViewerWrapper.d.ts.map