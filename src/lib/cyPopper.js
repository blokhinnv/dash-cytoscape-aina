export default class cyPopper {
    constructor(cy) {
        this.cy = cy;
        let self = this;

        // навешиваем фиксированный tooltip при инициализации графа
        cy.one('render', function(event) {
            for (const element of cy.elements('*[tooltip_fixed]')) {
                self.destroyPopper(element);
                self.createPopper(element, 'tooltip_fixed');
            }
        });

        // добавляем tooltip при добавлении элемента на граф
        cy.on('add', '*[tooltip_fixed]', function(event) {
            self.createPopper(event.target, 'tooltip_fixed')
        });

        // удаляем tooltip при удаляем элемента из графа
        cy.on('remove', '*[tooltip_fixed]', function(event) {
            self.destroyPopper(event.target);
        });

        // обновляем tooltip при изменении содержимого
        cy.on('data', '*', function(event) {
            self.destroyPopper(event.target);
            if (event.target.data().hasOwnProperty('tooltip_fixed')) {
                self.createPopper(event.target, 'tooltip_fixed')
            }
        });

        // по наведение на элемент
        cy.on('mouseover', '*[tooltip]', function(event) {
            if (event.target.data().hasOwnProperty('tooltip_fixed')) {
                self.destroyPopper(event.target)
            }
            self.createPopper(event.target, 'tooltip')
        });

        // когда убрали мышку с элемента
        cy.on('mouseout', '*[tooltip]', function(event) {
            self.destroyPopper(event.target)
            if (event.target.data().hasOwnProperty('tooltip_fixed')) {
                self.createPopper(event.target, 'tooltip_fixed')
            }
        });
    }

    createPopper(element, attr) {
        if (element.data()[attr] != "") {
            element.popperRefObj = element.popper({
                content: () => {
                    const content = document.createElement("div");

                    content.classList.add("popper-div");

                    content.innerHTML = '<div data-popper-arrow></div>' + element.data()[attr];

                    document.body.appendChild(content);
                    return content;
                }
            });
        }

        const update = () => {
            if (element.data()[attr] != "")
                element.popperRefObj.update();
            if (element.isNode()) {
                element.connectedEdges().forEach(edge => {
                    // timeout to wait until the new position of the edge has been correctly calculated
                    setTimeout(() => {
                        if (edge.popper && edge.popperRefObj) {
                            edge.popperRefObj.update();
                        }
                    }, 10);
                });
            }
        };

        element.on('position', update);

        this.cy.on('pan zoom resize', update);
    }

    destroyPopper(element) {
        if (element.popper && element.popperRefObj) {
            element.popperRefObj.state.elements.popper.remove();
            element.popperRefObj.destroy();
        }
    }
}