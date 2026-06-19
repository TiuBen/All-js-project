import { useContext, useEffect,useRef } from "react";
import { AnchorContext } from "context/index.js";
import "./layouts.scss";

function Anchor(props) {
    // console.log("anchor");
    const { anchorSize, color, children } = props;
    const { AnchorStyle, SetAnchorStyle } = useContext(AnchorContext);

    const anchorRef=useRef();

    useEffect(() => {
    
        function handleClickOutside(event) {
          if (anchorRef.current && !anchorRef.current.contains(event.target)) {
              const _prevStyle=Object.assign(AnchorStyle);
            SetAnchorStyle({_prevStyle,display:false})
          }
        }
       
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
         
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [anchorRef]);

    var _popoverElement;

    if (AnchorStyle.display === false) {
        console.log("anchor none");
        return <div> XXXXXX </div>;
    } else {
        // console.log("anchor ???");
        switch (AnchorStyle.position) {
            case "TOP":
                _popoverElement = (
                    <div
                        className="anchor-container test-border"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            width: AnchorStyle.width + "px",
                            height: AnchorStyle.height + "px",
                            position: "fixed",
                            left: AnchorStyle.x,
                            top: AnchorStyle.y,
                        }}
                    >
                        <div
                            ref={anchorRef}
                            className="anchor-children-container "
                            style={{ display: "flex", flexGrow: 1, justifyContent: "stretch" }}
                        >
                            {children}
                        </div>
                        <span
                            className="arrow-up anchor-triangle top-triangle"
                            style={{
                                width: 0,
                                height: 0,
                                borderLeft: `${anchorSize}px solid transparent`,
                                borderRight: `${anchorSize}px solid transparent`,
                                borderTop: `${anchorSize}px solid ${color}`,
                                position: "relative",
                                display: "inline-block",
                                alignSelf: "center",
                            }}
                        />
                    </div>
                );
                break;
            case "BOTTOM":
                _popoverElement = (
                    <div
                        className="anchor-container test-border"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            width: AnchorStyle.width + "px",
                            height: AnchorStyle.height + "px",
                            position: "fixed",
                            left: AnchorStyle.x,
                            top: AnchorStyle.y,
                        }}
                    >
                        <span
                            className="arrow-down anchor-triangle bottom-triangle"
                            style={{
                                width: 0,
                                height: 0,
                                borderLeft: `${anchorSize}px solid transparent`,
                                borderRight: `${anchorSize}px solid transparent`,
                                borderBottom: `${anchorSize}px solid ${color}`,
                                position: "relative",
                                display: "inline-block",
                                alignSelf: "center",
                            }}
                        />
                        <div
                            ref={anchorRef}
                            className="anchor-children-container "
                            style={{ display: "flex", flexGrow: 1, justifyContent: "stretch" }}
                        >
                            {children}
                        </div>
                    </div>
                );
                break;
            case "LEFT":
                _popoverElement = (
                    <div
                        className="anchor-container test-border"
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            width: AnchorStyle.width + "px",
                            height: AnchorStyle.height + "px",
                            position: "fixed",
                            left: AnchorStyle.x,
                            top: AnchorStyle.y,
                        }}
                    >
                        <div ref={anchorRef} style={{ display: "flex", flexGrow: 1, justifyContent: "stretch" }}>
                            {children}
                        </div>
                        <span
                            className="arrow-left  anchor-triangle left-triangle"
                            style={{
                                width: 0,
                                height: 0,
                                borderTop: `${anchorSize}px solid transparent`,
                                borderLeft: `${anchorSize}px solid ${color}`,
                                borderBottom: `${anchorSize}px solid transparent`,
                                position: "relative",
                                display: "inline-block",
                                alignSelf: "center",
                            }}
                        />
                    </div>
                );
                break;
            case "RIGHT":
                _popoverElement = (
                    <div
                        className="anchor-container test-border"
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            width: AnchorStyle.width + "px",
                            height: AnchorStyle.height + "px",
                            position: "fixed",
                            left: AnchorStyle.x,
                            top: AnchorStyle.y,
                        }}
                    >
                        <span
                            className="arrow-right"
                            style={{
                                width: 0,
                                height: 0,
                                borderRight: `${anchorSize}px solid ${color}`,
                                borderTop: `${anchorSize}px solid transparent`,
                                borderBottom: `${anchorSize}px solid transparent`,
                                position: "relative",
                                display: "inline-block",
                                alignSelf: "center",
                            }}
                        />
                        <div
                            ref={anchorRef}
                            className="anchor-children-container "
                            style={{ display: "flex", flexGrow: 1, justifyContent: "stretch" }}
                        >
                            {children}
                        </div>
                    </div>
                );
                break;
            default:
                _popoverElement = <h2 style={{ color: "red" }}>WRONG</h2>;
                break;
        }

        return _popoverElement;
    }
}

export { Anchor };
