export function createTable(tableElement, tableTitle, routeConfig, activeRouteIds, options) {
    const runways = [];
    const fixSet = new Set();
    const table = {};

    const { draw, notice } = options;

    routeConfig.forEach((rwy) => {
        runways.push({ id: rwy.id, label: rwy.label });
        table[rwy.id] = {};

        rwy.children?.forEach((fix) => {
            fixSet.add(fix.label);

            // table[rwy.id][fix.label] =
            //     fix.children?.map((c) => console.log(c)) ;

                
            table[rwy.id][fix.label] =
                fix.children?.map((c) => ({
                    // id: c.id, // ⭐ 新增：用于绘制匹配 lineName
                    // label: c.label,
                    // routes: c.routes,
                    ...c,
                })) || [];
        });
    });

    const fixes = Array.from(fixSet);
    // console.log("fixes");
    // console.log(fixes);

    tableElement.innerHTML = "";

    const tbl = document.createElement("table");
    tbl.className = "sid-table";

    // ===== 表头 =====
    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    hr.innerHTML = `<th>${tableTitle}</th>` + fixes.map((f) => `<th>${f}</th>`).join("");
    thead.appendChild(hr);
    tbl.appendChild(thead);

    // ===== 表体 =====
    const tbody = document.createElement("tbody");

    runways.forEach((rwy) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td class="rwy">${rwy.label}</td>`;

        fixes.forEach((fix) => {
            const td = document.createElement("td");
            const items = table[rwy.id][fix] || [];

            items.forEach((item) => {
                const cb = document.createElement("input");
                cb.type = "checkbox";
                // ⭐ 与当前状态同步
                cb.checked = activeRouteIds.has(item);
                cb.onchange = () => {
                    // console.warn(item);
                    // console.warn( item.id);

                    // if (!routeIndex?.has(item.id)) {
                    //     console.warn("[TABLE] 找不到对应 line:", item.id);
                    //     console.warn(item);
                    // }

                    item.routes.forEach((r) => (cb.checked ? activeRouteIds.add(item) : activeRouteIds.delete(item)));
                    // console.log(activeRouteIds);
                    // activeRouteIds.forEach((item) => {
                    //     console.log(item);
                    // });
                    // ✅ 调用 canvasControls 的 renderTransformed，保持缩放和平移
                    draw();
                    // //⭐ 新增
                    notice.render();
                };

                const span = document.createElement("span");
                span.textContent = item.label;

                const wrap = document.createElement("label");
                wrap.append(cb, span);
                td.appendChild(wrap);
            });

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    tbl.appendChild(tbody);
    tableElement.appendChild(tbl);
}
