export type ItemType = {
    id: number;
    name: string;
    pdf_url: string;
    book_type: string;
};
type Props = {
    chapters?: ItemType[] | null;
    activeChapter?: string | number;
    onChapterSelect?: (v: ItemType) => any;
};
declare function FileChapterMenu({ chapters, activeChapter, onChapterSelect }: Props): import("react/jsx-runtime").JSX.Element | null;
export default FileChapterMenu;
//# sourceMappingURL=FileChapterMenu.d.ts.map