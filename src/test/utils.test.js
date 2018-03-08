const getTagAndClassNamesAndId = require("../utils").getTagAndClassNamesAndId;

test("Get Tag works", () => {
  const result1 = getTagAndClassNamesAndId("div#id.someClass");
  const result2 = getTagAndClassNamesAndId("div#id.someClass.another.b");
  const result3 = getTagAndClassNamesAndId("div");
  const result4 = getTagAndClassNamesAndId("div.class");
  const result5 = getTagAndClassNamesAndId("h1#heading");
  const result6 = getTagAndClassNamesAndId(".heading");

  expect(result1).toEqual({ tag: "div", id: "id", className: "someClass" });
  expect(result2).toEqual({
    tag: "div",
    id: "id",
    className: "someClass another b"
  });
  expect(result3).toEqual({ tag: "div" });
  expect(result4).toEqual({ tag: "div", className: "class" });
  expect(result5).toEqual({ tag: "h1", id: "heading" });
  expect(result6).toEqual({ tag: "div", className: "heading" });
});
