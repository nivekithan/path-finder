describe("Testing Grid functionality", () => {
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

  it("Clicking cell when both start and target cell is set should set the wall cell", () => {
    cy.getCell({ column: 5, row: 1 })
      .click()
      .should("have.attr", "data-state-type")
      .and("eq", "wallCellState");
    cy.getCell({ column: 5, row: 2 })
      .click()
      .should("have.attr", "data-state-type")
      .and("eq", "wallCellState");
  });

  it("Clicking wall cell again should toggle wallcellstate", () => {
    cy.getCell({ column: 5, row: 2 })
      .click()
      .should("have.attr", "data-state-type")
      .and("eq", "defaultCellState");
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

  it("Dragging startcell to another cell should transfer the startcell", () => {
    cy.getCell({ column: 2, row: 2 }).trigger("pointerdown");
    cy.wait(100);
    cy.getCell({ column: 2, row: 1 })
      .trigger("pointerup")
      // Start cell should have transferred to the new cell
      .should("have.attr", "data-state-type")
      .and("eq", "startCellState");

    // Original start cells should have changed to default cell
    cy.getCell({ column: 2, row: 2 })
      .should("have.attr", "data-state-type")
      .and("eq", "defaultCellState");
  });

  it("Dragging targetcell to another cell should tranfer the targetcell", () => {
    cy.getCell({ column: 10, row: 5 }).trigger("pointerdown");
    cy.wait(100);
    cy.getCell({ column: 10, row: 6 })
      .trigger("pointerup")
      // target cell should have transferred to the new cell
      .should("have.attr", "data-state-type")
      .and("eq", "targetCellState");

    // Original target cell should have changed to default cell
    cy.getCell({ column: 10, row: 5 })
      .should("have.attr", "data-state-type")
      .and("eq", "defaultCellState");
  });

  it("Dragging startcell to targetcell should transfer startcell and reset target cell", () => {
    cy.getCell({ column: 2, row: 1 }).trigger("pointerdown");
    cy.wait(100);
    cy.getCell({ column: 10, row: 6 })
      .trigger("pointerup")
      // Start cell should have transferred to the new cell
      .should("have.attr", "data-state-type")
      .and("eq", "startCellState");

    // Original start cells should have changed to default cell
    cy.getCell({ column: 2, row: 1 })
      .should("have.attr", "data-state-type")
      .and("eq", "defaultCellState");

    cy.getCell({ column: 10, row: 5 })
      .click()
      // If targetcell have be reset, then clicking should set the cell to targetcell
      .should("have.attr", "data-state-type")
      .and("eq", "targetCellState");
  });

  it("Dragging targetcell to startcell should transfer targetcell and reset start cell", () => {
    cy.getCell({ column: 10, row: 5 }).trigger("pointerdown");
    cy.wait(100);
    cy.getCell({ column: 10, row: 6 })
      .trigger("pointerup")
      // Target cell should have transferred to the new cell
      .should("have.attr", "data-state-type")
      .and("eq", "targetCellState");

    // Original target cell should have changed to default cell
    cy.getCell({ column: 10, row: 5 })
      .should("have.attr", "data-state-type")
      .and("eq", "defaultCellState");

    cy.getCell({ column: 2, row: 1 })
      .click()
      // if startcell have be reset, then clicking should set the cell to startcell
      .should("have.attr", "data-state-type")
      .and("eq", "startCellState");
  });

  it("Painting walls", () => {
    cy.getCell({ column: 4, row: 0 }).trigger("pointerdown");

    for (let i = 1; i <= 5; i++) {
      cy.getCell({ column: 4, row: i })
        .trigger("pointerover")
        .should("have.attr", "data-state-type")
        .and("eq", "wallCellState");
    }

    cy.getCell({ column: 4, row: 0 })
      .should("have.attr", "data-state-type")
      .and("eq", "wallCellState");

    for (let i = 5; i >= 0; i--) {
      cy.getCell({ column: 4, row: i }).trigger("pointerover");
    }

    for (let i = 0; i <= 5; i++) {
      cy.getCell({ column: 4, row: i })
        .should("have.attr", "data-state-type")
        .and("eq", "wallCellState");
    }

    cy.getCell({ column: 4, row: 0 })
      .trigger("pointerup")
      .should("have.attr", "data-state-type")
      .and("eq", "wallCellState");
  });
});
