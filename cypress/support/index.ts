import "./commands";

declare global {
  namespace Cypress {
    interface Chainable {
      getCell(cellPos: {
        row: number;
        column: number;
      }): Chainable<JQuery<Element>>;
    }
  }
}

Cypress.Commands.add("getCell", (cellPos: { row: number; column: number }) => {
  return cy.get(
    `div[data-column-pos='${cellPos.column}'][data-row-pos='${cellPos.row}']`
  );
});
