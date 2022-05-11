describe("Visit homepage", () => {
  before(() => {
    cy.visit("/");
  });
  it("Clicking cell should change its state to startCellState", () => {
    cy.getCell({ column: 2, row: 2 })
      .click()
      .should("have.attr", "data-state-type")
      .and("eq", "startCellState");
  });

  it("Clicking another cell should toggle targetCellState", () => {
    cy.getCell({ column: 10, row: 5 })
      .click()
      .should("have.attr", "data-state-type")
      .and("eq", "targetCellState");
  });

  it("Clicking start cell again should toggle startCellState", () => {
    cy.getCell({ column: 2, row: 2 })
      .click()
      .should("have.attr", "data-state-type")
      .and("eq", "defaultCellState");

    cy.getCell({ column: 2, row: 2 })
      .click()
      .should("have.attr", "data-state-type")
      .and("eq", "startCellState");
  });

  it("Clicking target cell should toggle targetCellState", () => {
    cy.getCell({ column: 10, row: 5 })
      .click()
      .should("have.attr", "data-state-type")
      .and("eq", "defaultCellState");

    cy.getCell({ column: 10, row: 5 })
      .click()
      .should("have.attr", "data-state-type")
      .and("eq", "targetCellState");
  });

  it("Clicking cell while startCell and targetCell is set should lead to nothing", () => {
    cy.getCell({ column: 1, row: 10 })
      .click()
      .should("have.attr", "data-state-type")
      .and("eq", "defaultCellState");
  });
});
