export function createRouteNotice(activeRouteIds) {
    const container = document.getElementById("routeNoticeContainer");

    function render() {
        container.innerHTML = "";
        // console.log(activeRouteIds);
        activeRouteIds.forEach((route) => {
            // console.log(route);

            const commentText = route?.comment ??route?.routes?.[0]?.comment ;

            // console.log(commentText);
            if (!commentText) return;
       

            const div = document.createElement("div");
            div.className = "route-notice";

            const title = document.createElement("div");
            title.className = "title";
            title.textContent = route.id;

            const comment = document.createElement("div");
            comment.className = "comment";
            comment.textContent = commentText;

            div.append(title, comment);
            container.appendChild(div);
        });
    }

    return { render };
}
