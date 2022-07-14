export default class cyPopper {
    constructor(cy) {
        cy.on('mouseover', 'node, edge', function(event) {
            if (event.target.data().hasOwnProperty("tooltip")) {
                event.target.popperRefObj = event.target.popper({
                    content: () => {
                        const content = document.createElement("div");

                        content.classList.add("popper-div");

                        content.innerHTML = '<div data-popper-arrow></div>' + event.target.data().tooltip;

                        document.body.appendChild(content);
                        return content;
                    }
                });

                const update = () => {
                    event.target.popperRefObj.update();
                };

                event.target.on('position', update);

                cy.on('pan zoom resize', update);
            }
        });

        cy.on('mouseout', 'node, edge', function(event) {
          if (event.target.popper && event.target.popperRefObj) {
              event.target.popperRefObj.state.elements.popper.remove();
              event.target.popperRefObj.destroy();
          }
        });
    }
}