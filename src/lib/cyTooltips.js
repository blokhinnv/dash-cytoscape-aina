function updateConnectedEdges(node) {
    node.connectedEdges().forEach(edge => {
        // timeout to wait until the new position of the edge has been correctly calculated
        setTimeout(() => {
            if (edge.popper && edge.popperRefObj) {
                edge.popperRefObj.update();
            }
        }, 10);
    });
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function parseXYFromTransform(transform) {
    let [x, y] = transform.replace('translate3d(', '').replace(')', '').replaceAll('px', '').split(',').map((item) => (parseFloat(item.trim())));
    return {x: x, y: y}
}

export default class cyTooltips {
    constructor(cy) {
        this.updateTooltips = this.update.bind(this);
        this.addConnected = this.addConnectedTooltip.bind(this);
        this.addConnected = this.addConnectedTooltip.bind(this);
        this.updateConnected = this.updateConnectedTooltip.bind(this);
        this.removeConnected = this.removeConnectedTooltip.bind(this);
        this.addFree = this.addFreeTooltip.bind(this);
        this.updateFree = this.updateFreeTooltip.bind(this);
        this.removeFree = this.removeFreeTooltip.bind(this);
        this.getContent = this.getTooltipContent.bind(this);
        this.getPosition = this.getTooltipPosition.bind(this);
        this.logTextAreaSizes = this.logTooltipTextAreaSizes.bind(this);
        this.addObserverToTextArea = this.addObserverToTooltipTextArea.bind(this);
        this.addTextChangeListener = this.addTextChangeTooltipListener.bind(this);
        this.setUpdateProps = this.setUpdateTooltipProps.bind(this);

        this.cy = cy;
        this.tooltips = [];
        this.tooltipsHash = '';
        this.tooltipsDataHash = '';
        this.setProps = null;

        // перемещаем все свободный тултипы при перемещении по холсту
        cy.on('pan', function (event) {
            document.querySelectorAll('.popper-core').forEach(tooltip => {
                let {x, y} = parseXYFromTransform(tooltip.style.transform)
                const lastPanX = parseFloat(tooltip.getAttribute('lastPanX'));
                const lastPanY = parseFloat(tooltip.getAttribute('lastPanY'));
                x += cy.pan().x - lastPanX;
                y += cy.pan().y - lastPanY;
                tooltip.setAttribute('lastPanX', cy.pan().x);
                tooltip.setAttribute('lastPanY', cy.pan().y);
                tooltip.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
            });
        });

        // перемещаем все свободный тултипы при зумировании холста
        this.cytoscape_container = cy.container();
        this.containerOffsetTop = this.cytoscape_container.offsetTop;
        this.containerOffsetLeft = this.cytoscape_container.offsetLeft;
        cy.on('zoom', function (event) {
            document.querySelectorAll('.popper-core').forEach(tooltip => {
                let {x, y} = parseXYFromTransform(tooltip.style.transform)
                const lastPanX = parseFloat(tooltip.getAttribute('lastPanX'));
                const lastPanY = parseFloat(tooltip.getAttribute('lastPanY'));
                const lastZoom = parseFloat(tooltip.getAttribute('lastZoom'));
                const scale = cy.zoom() / lastZoom - 1;
                let shiftX = tooltip.getBoundingClientRect().width / 2;
                x += (x - this.containerOffsetLeft - lastPanX + shiftX) * scale;
                y += (y - this.containerOffsetTop - lastPanY) * scale;
                tooltip.setAttribute('lastZoom', cy.zoom());
                tooltip.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
            });
        });

        // удаляем свободный тултип по нажатию на кнопку
        document.body.addEventListener('click', function (event) {
            if (event.target.className == 'remove_popper_core') {
                event.target.parentNode.remove();
            }
        });

        // перемещаем свободный тултип методом drag & drop
        document.body.addEventListener('mousedown', function (event) {
            if (event.target.tagName == 'TEXTAREA') {
                if (event.target.parentNode.parentNode.className != 'popper-div popper-core') {
                    return;
                }
                var tooltip = event.target.parentNode.parentNode;
                var textarea = event.target;
                if (event.clientX > tooltip.getBoundingClientRect().right - 20 ||
                    event.clientY > textarea.getBoundingClientRect().bottom - 20) {
                    return;
                }
            } else if (event.target.className == 'popper-div popper-core') {
                var tooltip = event.target;
            } else {
                return;
            }

            let shiftX = event.clientX - tooltip.getBoundingClientRect().left;
            let shiftY = event.clientY - tooltip.getBoundingClientRect().top + 5;

            moveAt(event.pageX, event.pageY);

            // перемещает всплывающую подсказку по координатам (pageX, pageY)
            // принимая во внимание первоначальные сдвиги тултипа
            function moveAt(pageX, pageY) {
                tooltip.style.transform = 'translate3d(' + (pageX - shiftX) + 'px, ' + (pageY - shiftY) + 'px, 0)';
            }

            function onMouseMove(event) {
                moveAt(event.pageX, event.pageY);
            }

            // перемещаем тултип при перемещении мыши
            document.addEventListener('mousemove', onMouseMove);

            // отпускаем всплывающую подсказку, удаляем ненужные обработчики
            tooltip.addEventListener('mouseup', function(tooltip) {
                document.removeEventListener('mousemove', onMouseMove);
                this.setUpdateProps(tooltip);
            }.bind(this, tooltip))
        }.bind(this));
    }

    update(props) {
        const {cy, setProps, tooltips, tooltipsData} = props;
        this.setProps = setProps;

        if (typeof tooltips !== 'object' || !this.cy) {
            return;
        }

        const tooltipsDataHashNew = JSON.stringify(tooltipsData);
        // если нам передели конкретные строки, то обновляем только их
        if (tooltipsDataHashNew !== this.tooltipsDataHash) {
            tooltipsData.forEach(tooltipsDataItem => {
                let tooltip_data = this.addTooltipsDataItem(tooltipsDataItem);
                if (tooltipsDataItem.event == 'remove') {
                    tooltips.forEach(function (tooltip_data, index) {
                        if (tooltip_data.id == tooltip_data.id) {
                            tooltips.splice(index, 1);
                        } else if (tooltip_data.cy_el_id == tooltipsDataItem.data.cy_el_id) {
                            tooltips.splice(index, 1);
                        }
                    });
                } else if (tooltipsDataItem.event == 'add') {
                    if (tooltip_data.cy_el_id != undefined) {
                        const new_tooltip = {
                            id: tooltip_data.id,
                            cy_el_id: tooltip_data.cy_el_id,
                            content: tooltip_data.content,
                            last_update_time: new Date().getTime()
                        }
                        tooltips.push(new_tooltip);
                        this.setProps({tooltips});
                    } else {
                        const new_tooltip = {
                            id: tooltip_data.id,
                            content: tooltip_data.content,
                            position: tooltip_data.position,
                            last_update_time: new Date().getTime()
                        }
                        tooltips.push(new_tooltip);
                        this.setProps({tooltips});
                    }
                } else if (tooltipsDataItem.event == 'update') {
                    tooltips.forEach(function (tooltip_data, index) {
                        if (tooltip_data.id == tooltip_data.id) {
                            tooltips[index].content = tooltip_data.content;
                            tooltips[index].position = tooltip_data.position;
                            tooltips[index].last_update_time = new Date().getTime();
                            this.setProps({tooltips});
                        } else if (tooltip_data.cy_el_id == tooltipsDataItem.data.cy_el_id) {
                            tooltips[index].id = tooltip_data.id;
                            tooltips[index].content = tooltip_data.content;
                            tooltips[index].last_update_time = new Date().getTime();
                            this.setProps({tooltips});
                        }
                    }.bind(this));
                }
            });
            this.tooltipsDataHash = tooltipsDataHashNew;
            return;
        }

        const tooltipsHashNew = JSON.stringify(tooltips);
        if (tooltipsHashNew === this.tooltipsHash) {
            return;
        }
        this.tooltipsHash = tooltipsHashNew;
        this.tooltips = tooltips;
    }

    addTooltipsDataItem(tooltipsDataItem) {
        const {event, data} = tooltipsDataItem;
        const {id, cy_el_id, content, position, last_update_time} = data;
        // если передан id
        if (id != undefined && id.length > 0) {
            // если есть tooltip с таким id
            let tooltip = document.querySelector(`[data-tooltip-id="${id}"]`);
            if (tooltip != undefined) {
                if (tooltip.dataset.tooltipCyElId == undefined) {
                    // если event = delete, то удаляем tooltip
                    if (event == 'remove') {
                        this.removeFree(tooltip);
                    } else {
                        if (this.getContent(tooltip) !== content || this.getPosition(tooltip) !== position) {
                            // обновляем данные тултипа
                            return this.updateFree(tooltip, content, position);
                        }
                    }
                } else {
                    // если event = delete, то удаляем этот привязанный tooltip
                    if (event == 'remove') {
                        this.removeConnected(tooltip);
                    } else {
                        if (this.getContent(tooltip) !== content) {
                            // устанавливаем новый контент
                            return this.updateConnected(tooltip, content);
                        }
                    }
                }
            }
            else {
                if (cy_el_id == undefined) {
                    return this.addFree(id, content, position);
                } else {
                    return this.addConnectedTooltip(id, cy_el_id, content);
                }
            }
        }
        // если передан cy_el_id
        else if (cy_el_id != undefined && cy_el_id.length > 0) {
            // если есть tooltip, связанный с таким элементом
            let tooltip = document.querySelector(`[data-tooltip-cy-el-id="${cy_el_id}"]`);
            if (tooltip != undefined) {
                // если event = delete, то удаляем этот привязанный tooltip
                if (event == 'remove') {
                    this.removeConnected(tooltip);
                } else {
                    if (this.getContent(tooltip) !== content) {
                        // устанавливаем новый контент
                        return this.updateConnected(tooltip, content);
                    }
                }
            }
            // добавляем свободный тултип
            else {
                // генерируем случайно идентификатор тултипа
                if (id != undefined && id.length > 0) {
                    return this.addConnected(id, cy_el_id, content);
                } else {
                    return this.addConnected(uuidv4(), cy_el_id, content);
                }
            }
        }
        // добавляем свободный тултип
        else if (position != undefined) {
            return this.addFree(uuidv4(), content, position);
        }
    }

    addConnectedTooltip(id, cy_el_id, content) {
        let element = this.cy.$id(cy_el_id);
        if (!element.isNode() && !element.isEdge()) {
            return;
        }
        element.popperRefObj = element.popper({
            content: () => {
                const tooltip = document.createElement("div");
                tooltip.classList.add("popper-div");
                tooltip.setAttribute("data-tooltip-id", id);
                tooltip.setAttribute("data-tooltip-cy-el-id", cy_el_id);
                tooltip.innerHTML = '<div data-popper-arrow></div><div class="content">' + content + '</div>';
                document.body.appendChild(tooltip);

                return tooltip;
            }
        });

        const update = () => {
            if (element.popperRefObj != undefined) {
                element.popperRefObj.update();
            }
            updateConnectedEdges(element);
        }

        if (element.isNode()) {
            element.on('position', update);
        } else if (element.isEdge()) {
            element.connectedNodes().forEach(node => {
                node.on('position', update);
            });
        }

        this.cy.on('pan zoom resize', update);

        let tooltip = element.popperRefObj.state.elements.popper;
        let textarea = tooltip.querySelector('textarea');
        if (textarea != undefined) {
            // слушаем изменение текстового содержимого textarea
            this.addTextChangeListener(textarea)
            // слушаем изменение размера textarea
            this.addObserverToTextArea(textarea)
        }

        const tooltip_data = {
            id: id,
            cy_el_id: cy_el_id,
            content: content
        }
        return tooltip_data
    }

    updateConnectedTooltip(tooltip, content) {
        tooltip.querySelector('.content').innerHTML = content;

        let textarea = tooltip.querySelector('textarea');
        if (textarea != undefined) {
            // слушаем изменение текстового содержимого textarea
            this.addTextChangeTooltipListener(textarea);
            // слушаем изменение размера textarea
            this.addObserverToTextArea(textarea)
        }

        const tooltip_data = {
            id: tooltip.getAttribute('data-tooltip-id'),
            cy_el_id: tooltip.getAttribute('data-tooltip-cy-el-id'),
            content: content
        }
        return tooltip_data
    }

    removeConnectedTooltip(tooltip) {
        let element = this.cy.$id(tooltip.getAttribute('data-tooltip-cy-el-id'));
        if (!element.isNode() && !element.isEdge()) {
            return;
        }
        if (element.popper && element.popperRefObj) {
            element.popperRefObj.state.elements.popper.remove();
            element.popperRefObj.destroy();
        }
    }

    addFreeTooltip(id, content, position) {
        let popperRefObj = this.cy.popper({
            content: () => {
                const tooltip = document.createElement("div");
                tooltip.classList.add("popper-div");
                tooltip.classList.add("popper-core");
                tooltip.setAttribute("data-tooltip-id", id);
                tooltip.setAttribute('lastPanX', this.cy.pan().x);
                tooltip.setAttribute('lastPanY', this.cy.pan().y);
                tooltip.setAttribute('lastZoom', this.cy.zoom());
                tooltip.innerHTML = '<div data-popper-arrow></div>';
                tooltip.innerHTML = '<div data-popper-arrow></div><div class="content">' + content + '</div>';
                tooltip.innerHTML += '<button class="remove_popper_core">X</button>';
                document.body.appendChild(tooltip);

                return tooltip;
            },
            renderedPosition: () => ({'x': position.x * this.cy.zoom() + this.cy.pan().x, 'y': position.y * this.cy.zoom() + this.cy.pan().y}),
        });

        let tooltip = popperRefObj.state.elements.popper;
        setTimeout(() => {
            tooltip.querySelector('[data-popper-arrow]').style.transform = 'translate3d(' + (tooltip.offsetWidth / 2 - 4) + 'px, 0px, 0)';
            },
        100);
        let textarea = tooltip.querySelector('textarea');
        if (textarea != undefined) {
            if (textarea != undefined) {
                // слушаем изменение текстового содержимого textarea
                this.addTextChangeTooltipListener(textarea);
                // слушаем изменение размера textarea
                this.addObserverToTextArea(textarea)
            }
        }

        const tooltip_data = {
            id: id,
            content: content,
            position: position
        }
        return tooltip_data
    }

    updateFreeTooltip(tooltip, content, position) {
        tooltip.querySelector('.content').innerHTML = content;
        tooltip.setAttribute('lastPanX', this.cy.pan().x);
        tooltip.setAttribute('lastPanY', this.cy.pan().y);
        tooltip.setAttribute('lastZoom', this.cy.zoom());
        let x = position.x * this.cy.zoom() + this.cy.pan().x;
        let y = position.y * this.cy.zoom() + this.cy.pan().y;
        tooltip.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        setTimeout(() => {
            tooltip.querySelector('[data-popper-arrow]').style.transform = 'translate3d(' + (tooltip.offsetWidth / 2 - 4) + 'px, 0px, 0)';
        },
        100);

        // отслеживаем изменение размера textarea
        let textarea = tooltip.querySelector('textarea');
        if (textarea != undefined) {
            // слушаем изменение текстового содержимого textarea
            this.addTextChangeTooltipListener(textarea);
            // слушаем изменение размера textarea
            this.addObserverToTextArea(textarea)
        }

        const tooltip_data = {
            id: tooltip.getAttribute('data-tooltip-id'),
            content: content,
            position: position
        }
        return tooltip_data
    }

    removeFreeTooltip(tooltip) {
        tooltip.remove();
    }

    getTooltipContent(tooltip) {
        return tooltip.querySelector('.content').innerHTML;
    }

    getTooltipPosition(tooltip) {
        let {x, y} = parseXYFromTransform(tooltip.style.transform);
        const lastPanX = parseFloat(tooltip.getAttribute('lastPanX'));
        const lastPanY = parseFloat(tooltip.getAttribute('lastPanY'));
        x += this.cy.pan().x - lastPanX;
        y += this.cy.pan().y - lastPanY;
        x = (x - this.containerOffsetLeft - this.cy.pan().x) / this.cy.zoom();
        y = (y - this.containerOffsetTop - this.cy.pan().y) / this.cy.zoom();
        let position = {x: x, y: y}
        return position;
    }

    addObserverToTooltipTextArea(textarea) {
        var self = this;
        new MutationObserver(function ([{target}]) {
            self.logTextAreaSizes(target);
        }).observe(textarea, {
            attributes: true,
            attributeFilter: ['style']
        });

        this.logTextAreaSizes(textarea);
    }

    addTextChangeTooltipListener(textarea) {
        let tooltip = textarea.parentNode.parentNode;
        if (textarea.addEventListener) {
            textarea.addEventListener('input', function(e) {
                textarea.innerHTML = e.target.value;
                this.setUpdateProps(tooltip);
            }.bind(this));
        }
    }

    setUpdateTooltipProps(tooltip) {
        // обходим весь список тултипов
        let tooltips = this.tooltips;
        tooltips.forEach(function (tooltip_data, index) {
            if (tooltip.getAttribute('data-tooltip-cy-el-id') != undefined &&
                tooltip_data.cy_el_id == tooltip.getAttribute('data-tooltip-cy-el-id')) {
                if (tooltip_data.content != this.getContent(tooltip)) {
                    let last_update_time = new Date().getTime();
                    const tooltipsData = [{
                        event: 'update',
                        data: {
                            id: tooltip.getAttribute('data-tooltip-id'),
                            cy_el_id: tooltip.getAttribute('data-tooltip-cy-el-id'),
                            content: this.getContent(tooltip),
                            last_update_time: last_update_time
                        }
                    }]
                    this.tooltipsDataHash = JSON.stringify(tooltipsData);
                    this.setProps({tooltipsData});

                    tooltips[index].id = tooltip.getAttribute('data-tooltip-id');
                    tooltips[index].content = this.getContent(tooltip);
                    tooltips[index].last_update_time = last_update_time;
                    this.tooltipsHash = JSON.stringify(tooltips);
                    this.setProps({tooltips});
                }
            } else if (tooltip_data.id == tooltip.getAttribute('data-tooltip-id')) {
                if (tooltip_data.content != this.getContent(tooltip) ||
                    tooltip_data.position != this.getPosition(tooltip)) {
                    let last_update_time = new Date().getTime();
                    const tooltipsData = [{
                        event: 'update',
                        data: {
                            id: tooltip.getAttribute('data-tooltip-id'),
                            content: this.getContent(tooltip),
                            position: this.getPosition(tooltip),
                            last_update_time: last_update_time
                        }
                    }]
                    this.tooltipsDataHash = JSON.stringify(tooltipsData);
                    this.setProps({tooltipsData});

                    tooltips[index].content = this.getContent(tooltip);
                    tooltips[index].position = this.getPosition(tooltip);
                    tooltips[index].last_update_time = last_update_time;
                    this.tooltipsHash = JSON.stringify(tooltips);
                    this.setProps({tooltips});
                }
            }
        }.bind(this));
    }

    // отслеживание изменений размеров textarea
    logTooltipTextAreaSizes(textarea) {
        let tooltip = textarea.parentNode.parentNode;
        // смещаем контейнер привязанного тултипа для позиционирования по центру элемента
        if (tooltip.getAttribute('data-tooltip-cy-el-id') != undefined) {
            let element = this.cy.$id(tooltip.getAttribute('data-tooltip-cy-el-id'));
            if (element.popperRefObj != undefined) {
                element.popperRefObj.update();
            }
            updateConnectedEdges(element);
        }
        // если это свободный тултип, то обновляем его координаты вручную
        else {
            // размещаем стрелку по центру контейнера тултипа
            let arrow = tooltip.querySelector('[data-popper-arrow]');
            let position = tooltip.offsetWidth / 2 - 8;
            arrow.style.transform = 'translate3d(' + (position) + 'px, 0px, 0)';
        }

        // определяем, изменился ли размер тултипа
        let width = textarea.style.width;
        let height = textarea.style.height;
        if (width.length > 0 && height.length > 0) {
            width = width.replace('px', '');
            height = height.replace('px', '');
        }
        width = parseFloat(width);
        height = parseFloat(height);
        if (isNaN(width) || isNaN(height)) {
            return false;
        }
        let lastWidth = tooltip.getAttribute('lastWidth');
        let lastHeight = tooltip.getAttribute('lastHeight');
        if (lastWidth != undefined && lastHeight != undefined) {
            lastWidth = lastWidth.replace('px', '');
            lastHeight = lastHeight.replace('px', '');
        }
        lastWidth = parseFloat(lastWidth);
        lastHeight = parseFloat(lastHeight);
        if (isNaN(lastWidth) || isNaN(lastHeight)) {
            tooltip.setAttribute('lastWidth', width);
            tooltip.setAttribute('lastHeight', height);
            return false;
        }
        if (width == lastWidth && height == lastHeight) {
            return;
        }
        tooltip.setAttribute('lastWidth', width);
        tooltip.setAttribute('lastHeight', height);

        // инициируем коллбек на бекенд
        this.setUpdateProps(tooltip);
    }
}