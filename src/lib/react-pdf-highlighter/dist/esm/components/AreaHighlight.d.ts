import { Component } from "react";
import "react-pdf-highlighter/dist/esm/style/AreaHighlight.css";
import type { LTWHP, ViewportHighlight } from "react-pdf-highlighter/dist/esm/types";
interface Props {
    highlight: ViewportHighlight;
    onChange: (rect: LTWHP) => void;
    isScrolledTo: boolean;
}
export declare class AreaHighlight extends Component<Props> {
    render(): JSX.Element;
}
export default AreaHighlight;
