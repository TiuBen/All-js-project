const Mock = require("mockjs");

var Random = Mock.Random;

function fakeSupplier(params) {
    const _supplier = Mock.mock({
        name: "@csentence",
        address: `${"@region()"}${"@province()"}${"@city()"}${"@county()"}`,
        category: `${"@cword()"},${"@cword()"},${"@cword()"},${"@cword()"}`,
        detail: "@cparagraph",
        staff: [],
    });

    for (let x = 0; x <1+ parseInt(4 * Math.random()); x++) {
        const _s = Mock.mock({
            name: "@cname",
            contact: [],
        });
        for (let y = 0; y <1+ parseInt(2 * Math.random()); y++) {
            const _c = Mock.mock({
                type: "电话",
                content: `${"@zip()"}${"@zip()"}${"@zip()"}`,
            });
            _s.contact.push(_c);
        }
        _supplier.staff.push(_s);
    }

    return _supplier;
}

function mockFakeTableData(params) {
    var suppliers = [];
    const length = parseInt(10 * Math.random());
    for (let index = 0; index < 2; index++) {
        const _s = fakeSupplier();
        suppliers.push(_s);
    }

    return suppliers;
}

export { mockFakeTableData };
