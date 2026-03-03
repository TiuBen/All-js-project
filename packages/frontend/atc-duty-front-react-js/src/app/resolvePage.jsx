// src/app/resolvePage.js
import { pageRegistry } from "./pageRegistry";
import NotFound from "./layout/NotFound";
import ComingSoon from "./layout/ComingSoon";

export function resolvePage(page) {
    if (!Object.prototype.hasOwnProperty.call(pageRegistry, page)) {
        return NotFound;
    }

    const Comp = pageRegistry[page];

    if (Comp === null) {
        return ComingSoon;
    }

    return Comp;
}
