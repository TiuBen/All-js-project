import React from "react";

function VLine() {
    return <span className="flex self-stretch w-px bg-zinc-200 my-1 mx-2"></span>;
}

function FlexibleSpace() {
    return <span className="flex flex-grow "></span>;
}

function HorizontalTools({ children }) {
    return (
        <div className="flex flex-row  items-start content-center h-16 min-h-16 max-h-16 bg-white m-1 border border-dark-subtle rounded shadow-xl px-2">
            {children}
        </div>
    );
}

export { HorizontalTools, VLine, FlexibleSpace };
{
    /* <UnderlineButton title={"编辑"} iconName={"mode_edit"} />
<UnderlineButton title={"预览"} iconName={"preview"} />
<UnderlineButton title={"PDF"} iconName={"picture_as_pdf"} /> */
}
