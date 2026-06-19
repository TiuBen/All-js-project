import IconButton from "./IconButton";

export default function VerticalButton(props) {
    const {iconName, children,...otherProps}=props;
    return (
        <button className="ms-button icon-button ms-vertical-button" {...otherProps}>
            <IconButton  class="material-symbols-outlined">{iconName}</IconButton>
            <span>{children}</span>
        </button>
    )
}
