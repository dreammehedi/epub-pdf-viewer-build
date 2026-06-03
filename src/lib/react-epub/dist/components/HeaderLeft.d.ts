import { NavItem, Rendition } from "epubjs";
import { ItemType } from "./FileChapterMenu";
type Props = {
    navItem: NavItem[] | null;
    rendition: Rendition | null;
    onBackClick?: () => any;
    chapters?: ItemType[] | null;
    activeChapter?: string | number;
    onChapterSelect?: (v: ItemType) => any;
};
declare function HeaderLeft({ navItem, rendition, onBackClick, ...props }: Props): import("react/jsx-runtime").JSX.Element;
export default HeaderLeft;
//# sourceMappingURL=HeaderLeft.d.ts.map