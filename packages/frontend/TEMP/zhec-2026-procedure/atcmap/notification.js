export function createRouteNotice(routeIndex, activeRouteIds) {
    const container = document.getElementById("routeNoticeContainer");

    function render() {
        container.innerHTML = "";

        activeRouteIds.forEach(routeId => {
            const line = routeIndex.get(routeId);
            if (!line || !line.comment) return;

            const div = document.createElement("div");
            div.className = "route-notice";

            const title = document.createElement("div");
            title.className = "title";
            title.textContent = line.lineName || routeId;

            const comment = document.createElement("div");
            comment.className = "comment";
            comment.textContent = line.comment;

            div.append(title, comment);
            container.appendChild(div);
        });
    }

    return { render };
}
