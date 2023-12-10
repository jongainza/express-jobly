const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("modifing one item", function () {
    const result = sqlForPartialUpdate({ k1: "v1" }, { k1: "2v1", k2: "2v2" });
    expect(result).toEqual({
      setCols: `"2v1"=$1`,
      values: ["v1"],
    });
  });
});
