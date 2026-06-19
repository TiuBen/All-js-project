function PlainButton(props) {
    const { children, ...otherPros } = props;
    return (
        <button className="ms-plain-button" {...otherPros}>
            {children}
        </button>
    );
}

function IconButton({ iconName }) {
    const { children, ...otherPros } = props;
    return (
        <PlainButton iconName={iconName}>
            <span class="material-symbols-outlined">{iconName}</span>
        </PlainButton>
    );
}
