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
    const [x, y] = transform.replace('translate3d(', '').replace('translate(', '').replace(')', '').replaceAll('px', '').split(',').map((item) => (parseFloat(item.trim())));
    return {x: x, y: y}
}

function hasPositionChanged(p1, p2) {
    if (Math.abs(p1.x - p2.x) < 0.1 && Math.abs(p1.y - p2.y) < 0.1) {
        return false;
    }
    return true;
}

function getTextareaDimensions(textarea) {
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
    return {w: width, h: height}
}

function getTooltipTextareLastDimension(tooltip) {
    let lastWidth = tooltip.getAttribute('lastWidth');
    let lastHeight = tooltip.getAttribute('lastHeight');
    if (lastWidth != undefined && lastHeight != undefined) {
        lastWidth = lastWidth.replace('px', '');
        lastHeight = lastHeight.replace('px', '');
    }
    lastWidth = parseFloat(lastWidth);
    lastHeight = parseFloat(lastHeight);
    if (isNaN(lastWidth) || isNaN(lastHeight)) {
        return false;
    }
    return {w: lastWidth, h: lastHeight}
}

export default class cyTooltips {
    constructor(cy) {
        this.updateTooltips = this.update.bind(this);
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
        this.setRemoveProps = this.setRemoveTooltipProps.bind(this);

        this.cy = cy;
        this.tooltips = [];
        this.tooltipsHash = JSON.stringify(this.tooltips);
        this.tooltipsDataHash = JSON.stringify([]);
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

        // перемещаем все свободные тултипы при зумировании холста
        this.containerOffsetTop = () => this.cy.container().offsetTop;
        this.containerOffsetLeft = () => this.cy.container().offsetLeft;
        cy.on('zoom', function (event) {
            document.querySelectorAll('.popper-core').forEach(tooltip => {
                let {x, y} = parseXYFromTransform(tooltip.style.transform);
                const lastPanX = parseFloat(tooltip.getAttribute('lastPanX'));
                const lastPanY = parseFloat(tooltip.getAttribute('lastPanY'));
                const lastZoom = parseFloat(tooltip.getAttribute('lastZoom'));
                const scale = cy.zoom() / lastZoom - 1;
                const shiftX = tooltip.getBoundingClientRect().width / 2;
                x += (x - this.containerOffsetLeft() - lastPanX + shiftX) * scale;
                y += (y - this.containerOffsetTop() - lastPanY) * scale;
                tooltip.setAttribute('lastZoom', cy.zoom());
                tooltip.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
            });
        }.bind(this));

        // удаляем свободный тултип по нажатию на кнопку
        document.body.addEventListener('click', function (event) {
            if (event.target.className == 'remove_popper_core') {
                const tooltip_id = event.target.parentNode.dataset.tooltipId;
                event.target.parentNode.remove();
                // инициируем обновление коллбеков
                this.setRemoveProps(tooltip_id);
            }
        }.bind(this));

        // перемещаем свободный тултип методом drag & drop
        document.body.addEventListener('mousedown', function (event) {
            if (event.target.tagName == 'TEXTAREA') {
                if (event.target.parentNode.parentNode.className != 'popper-div popper-core') {
                    return;
                }
                var tooltip = event.target.parentNode.parentNode;
                var textarea = event.target;
                if (event.clientX > tooltip.getBoundingClientRect().right - 25 &&
                    event.clientY > textarea.getBoundingClientRect().bottom - 25) {
                    return;
                }
            } else if (event.target.className == 'popper-div popper-core') {
                var tooltip = event.target;
            } else {
                return;
            }

            const shiftX = event.clientX - tooltip.getBoundingClientRect().left;
            const shiftY = event.clientY - tooltip.getBoundingClientRect().top + 5;

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
                // если изменился размер textarea, то инициируем коллбек
                // если появились стили ширины и высоты у textarea и до этого не были установлены атрибуты lastwidth, lastheight
                // или текущие длина и ширина отличается от предыдущих
                // то можно считать, что изменлся размер textarea
                let textareas = tooltip.getElementsByTagName('textarea');
                if (textareas.length == 0) {
                    return false;
                }
                let textarea = textareas[0];

                let dim = getTextareaDimensions(textarea);
                if (!dim) {
                    return false;
                }

                let lastdim = getTooltipTextareLastDimension(tooltip);
                if (!lastdim) {
                    tooltip.setAttribute('lastWidth', dim.w);
                    tooltip.setAttribute('lastHeight', dim.h);
                    this.setUpdateProps(tooltip);
                    return false;
                }

                if (dim.w == lastdim.w && dim.h == lastdim.h) {
                    return;
                }

                tooltip.setAttribute('lastWidth', dim.w);
                tooltip.setAttribute('lastHeight', dim.h);
                this.setUpdateProps(tooltip);
            }.bind(this, tooltip))
        }.bind(this));

        // удаляем tooltip при удалении элемента из графа
        cy.on('remove', 'node, edge', function(event) {
            this.setRemoveProps('', event.target.data().id);
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
            console.debug('tooltips_data changes are caught (new, old)', tooltipsDataHashNew, this.tooltipsDataHash);
            let newTooltipsData = [];
            let promises = [];
            tooltipsData.forEach(tooltipsDataItem => {
                promises.push((async () => {
                    let tooltipEventData = await this.applyTooltipsDataItem(tooltipsDataItem);
                    if (tooltipEventData == undefined) {
                        return;
                    }
                    if (tooltipsDataItem.event == 'remove') {
                        tooltips.forEach(function (tooltip_data, index) {
                            if (tooltipEventData.data.id == tooltipsDataItem.data.id) {
                                tooltips.splice(index, 1);
                                newTooltipsData.push(tooltipEventData);
                            } else if (tooltipEventData.data.cy_el_id == tooltipsDataItem.data.cy_el_id) {
                                tooltips.splice(index, 1);
                                newTooltipsData.push(tooltipEventData);
                            }
                        });
                    } else if (tooltipEventData.event == 'add') {
                        if (tooltipEventData.data.cy_el_id != undefined) {
                            tooltips.push(tooltipEventData.data);
                            newTooltipsData.push(tooltipEventData);
                        } else {
                            tooltips.push(tooltipEventData.data);
                            newTooltipsData.push(tooltipEventData);
                        }
                    } else if (tooltipEventData.event == 'update') {
                        tooltips.forEach(function (tooltip_data, index) {
                            if (tooltip_data.cy_el_id == tooltipEventData.data.cy_el_id) {
                                tooltips[index].id = tooltipEventData.data.id;
                                tooltips[index].content = tooltipEventData.data.content;
                                tooltips[index].last_update_time = tooltipEventData.data.last_update_time;
                            } else if (tooltip_data.id == tooltipEventData.data.id) {
                                tooltips[index].content = tooltipEventData.data.content;
                                tooltips[index].position = tooltipEventData.data.position;
                                tooltips[index].last_update_time = tooltipEventData.data.last_update_time;
                            }
                        });
                    }
                })());
            });
            Promise.all(promises).then(() => {
                this.tooltipsDataHash = JSON.stringify(newTooltipsData);
                this.tooltipsHash = JSON.stringify(tooltips);
                this.tooltips = tooltips;
                this.setProps({tooltipsData: newTooltipsData, tooltips: tooltips});
            });
            return;
        }

        const tooltipsHashNew = JSON.stringify(tooltips);
        if (tooltipsHashNew === this.tooltipsHash) {
            return;
        }
        console.debug('tooltips changes are caught (new, old)', tooltipsHashNew, this.tooltipsHash);
        this.tooltipsHash = tooltipsHashNew;

        // нам передали весь массив тултипов
        // нужно понять, что изменилось и соответственно добавить, обновить, удалить
        const toAdd = [];
        const toUpdate = [];
        // обходим новые элементы
        for (let newIndex = 0; newIndex < tooltips.length; newIndex++) {
            let tooltipsNewItem = tooltips[newIndex];
            let isOld = false;
            // обходим старые элементы
            for (let oldIndex = 0; oldIndex < this.tooltips.length; oldIndex++) {
                let tooltipsOldItem = this.tooltips[oldIndex];
                console.debug('(old, new)', tooltipsNewItem, tooltipsOldItem);
                // обновляем элемент
                if (tooltipsOldItem.cy_el_id != undefined && tooltipsOldItem.cy_el_id == tooltipsNewItem.cy_el_id) {
                    isOld = true;
                    toUpdate.push(tooltipsNewItem);
                    this.tooltips.splice(oldIndex, 1);
                    break;
                } else if (tooltipsOldItem.id == tooltipsNewItem.id) {
                    isOld = true;
                    toUpdate.push(tooltipsNewItem);
                    this.tooltips.splice(oldIndex, 1);
                    break;
                }
            }
            if (!isOld) {
                toAdd.push(tooltipsNewItem);
            }
        }

        console.debug('новые элементы', toAdd);
        console.debug('элементы, которые обновились, либо не изменились', toUpdate);
        console.debug('удаляемые элементы', this.tooltips);

        let promises = [];

        // в this.tooltips остались только элементы, подлежащие удалению
        const newTooltipsData = [];
        this.tooltips.forEach(function (tooltipsItem, index) {
            promises.push((async () => {
                const tooltipsDataItem = {
                    event: 'remove',
                    data: tooltipsItem
                }
                const tooltipEventData = await this.applyTooltipsDataItem(tooltipsDataItem);
                if (tooltipEventData == undefined) {
                    return;
                }
                newTooltipsData.push(tooltipEventData);
            })());
        }.bind(this));

        toAdd.forEach(function (tooltipsItem, index) {
            promises.push((async () => {
                const tooltipsDataItem = {
                    event: 'add',
                    data: tooltipsItem
                }
                const tooltipEventData = await this.applyTooltipsDataItem(tooltipsDataItem);
                console.debug('toAdd', tooltipsItem, tooltipEventData);
                if (tooltipEventData == undefined) {
                    return;
                }
                newTooltipsData.push(tooltipEventData);
            })());
        }.bind(this));

        toUpdate.forEach(function (tooltipsItem, index) {
            promises.push((async () => {
                const tooltipsDataItem = {
                    event: 'update',
                    data: tooltipsItem
                }
                const tooltipEventData = await this.applyTooltipsDataItem(tooltipsDataItem);
                if (tooltipEventData == undefined) {
                    return;
                }
                newTooltipsData.push(tooltipEventData);
            })());
        }.bind(this));

        Promise.all(promises).then(() => {
            this.tooltipsDataHash = JSON.stringify(newTooltipsData);
            this.tooltipsHash = JSON.stringify(tooltips);
            this.tooltips = tooltips;
            this.setProps({tooltipsData: newTooltipsData, tooltips});
        });
    }

    async applyTooltipsDataItem(tooltipsDataItem) {
        const {event, data} = tooltipsDataItem;
        const {id, cy_el_id, content, position, last_update_time} = data;
        if (position != undefined) {
            position.x = Math.ceil(position.x * 100) / 100;
            position.y = Math.ceil(position.y * 100) / 100;
        }
        // если передан id
        if (id != undefined && id.length > 0) {
            // если есть tooltip с таким id
            const tooltip = document.querySelector(`[data-tooltip-id="${id}"]`);
            if (tooltip != undefined) {
                if (tooltip.dataset.tooltipCyElId == undefined) {
                    // если event = delete, то удаляем tooltip
                    if (event == 'remove') {
                        return this.removeFree(tooltip);
                    }
                    console.debug('applyTooltipsDataItem', tooltipsDataItem, this.getContent(tooltip), content, hasPositionChanged(this.getPosition(tooltip), position));
                    if (this.getContent(tooltip) !== content || hasPositionChanged(this.getPosition(tooltip), position)) {
                        // обновляем данные тултипа
                        return this.updateFree(tooltip, content, position);
                    }
                } else {
                    // если event = delete, то удаляем этот привязанный tooltip
                    if (event == 'remove') {
                        return this.removeConnected(tooltip);
                    }
                    if (this.getContent(tooltip) !== content) {
                        // устанавливаем новый контент
                        return this.updateConnected(tooltip, content);
                    }
                }
            }
            else {
                if (cy_el_id == undefined) {
                    return this.addFree(id, content, position);
                }
                return this.addConnectedTooltip(id, cy_el_id, content);
            }
        }
        // если передан cy_el_id
        else if (cy_el_id != undefined && cy_el_id.length > 0) {
            // если есть tooltip, связанный с таким элементом
            const tooltip = document.querySelector(`[data-tooltip-cy-el-id="${cy_el_id}"]`);
            if (tooltip != undefined) {
                // если event = delete, то удаляем этот привязанный tooltip
                if (event == 'remove') {
                    return this.removeConnected(tooltip);
                }
                    if (this.getContent(tooltip) !== content) {
                        // устанавливаем новый контент
                        return this.updateConnected(tooltip, content);
                    }

            }
            // adding a free tooltip
            else {
                // randomly generating a tooltip id
                if (id != undefined && id.length > 0) {
                    return this.addConnected(id, cy_el_id, content);
                }
                    return this.addConnected(uuidv4(), cy_el_id, content);

            }
        }
        // adding a free tooltip
        else if (position != undefined) {
            return this.addFree(uuidv4(), content, position);
        }
    }

    async addConnectedTooltip(id, cy_el_id, content) {
        // returns a Promise that resolves after "ms" Milliseconds
        const timer = ms => new Promise(res => setTimeout(res, ms));
        let attempt_count = 20;
        // get the element
        let element = this.cy.$id(cy_el_id);
        // if there is no element, then within 10 seconds we check its presence 2 times per second
        while (element.length == 0 && --attempt_count) {
            await timer(500);
            element = this.cy.$id(cy_el_id);
        }

        if (element.length == 0 || (!element.isNode() && !element.isEdge())) {
            return false;
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

        const tooltip = element.popperRefObj.state.elements.popper;
        const textarea = tooltip.querySelector('textarea');
        if (textarea != undefined) {
            // listening to the textarea text content change
            this.addTextChangeListener(textarea)
            // listening to textarea resizing
            this.addObserverToTextArea(textarea)
        }

        const tooltipEventData = {
            event: 'add',
            data: {
                id: id,
                cy_el_id: cy_el_id,
                content: content,
                last_update_time: new Date().getTime()
            }
        }
        return tooltipEventData
    }

    updateConnectedTooltip(tooltip, content) {
        tooltip.querySelector('.content').innerHTML = content;

        const textarea = tooltip.querySelector('textarea');
        if (textarea != undefined) {
            // слушаем изменение текстового содержимого textarea
            this.addTextChangeTooltipListener(textarea);
            // слушаем изменение размера textarea
            this.addObserverToTextArea(textarea)
        }

        const tooltipEventData = {
            event: 'update',
            data: {
                id: tooltip.getAttribute('data-tooltip-id'),
                cy_el_id: tooltip.getAttribute('data-tooltip-cy-el-id'),
                content: content,
                last_update_time: new Date().getTime()
            }
        }
        return tooltipEventData
    }

    removeConnectedTooltip(tooltip) {
        const tooltip_id = tooltip.getAttribute('data-tooltip-id');
        const cy_el_id = tooltip.getAttribute('data-tooltip-cy-el-id');
        const element = this.cy.$id(cy_el_id);
        if (!element.isNode() && !element.isEdge()) {
            return;
        }
        if (element.popper && element.popperRefObj) {
            element.popperRefObj.state.elements.popper.remove();
            element.popperRefObj.destroy();
        }

        const tooltipEventData = {
            event: 'remove',
            data: {
                id: tooltip_id,
                cy_el_id: cy_el_id,
                last_update_time: new Date().getTime()
            }
        }
        return tooltipEventData
    }

    addFreeTooltip(id, content, position) {
        let tooltip = () => {
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
        };
        const popperRefObj = this.cy.popper({
            content: tooltip,
            renderedPosition: function () {
                if (tooltip.style.transform.length > 0) {
                    // by the identifier of the tooltip, we determine its coordinates
                    let tooltip_id = tooltip.getAttribute('data-tooltip-id');
                    this.tooltips.forEach(function (tooltip, index) {
                        if (tooltip.id == tooltip_id) {
                            position = tooltip.position;
                            return;
                        }
                    });
                }
                return {
                    'x': position.x * this.cy.zoom() + this.cy.pan().x,
                    'y': position.y * this.cy.zoom() + this.cy.pan().y
                };
            }.bind(this),
        });

        tooltip = popperRefObj.state.elements.popper;
        const textarea = tooltip.querySelector('textarea');
        if (textarea != undefined) {
            if (textarea != undefined) {
                // слушаем изменение текстового содержимого textarea
                this.addTextChangeTooltipListener(textarea);
                // слушаем изменение размера textarea
                this.addObserverToTextArea(textarea)
            }
        }

        const tooltipEventData = {
            event: 'add',
            data: {
                id: id,
                content: content,
                position: position,
                last_update_time: new Date().getTime()
            }
        }
        return tooltipEventData
    }

    updateFreeTooltip(tooltip, content, position) {
        tooltip.querySelector('.content').innerHTML = content;
        tooltip.setAttribute('lastPanX', this.cy.pan().x);
        tooltip.setAttribute('lastPanY', this.cy.pan().y);
        tooltip.setAttribute('lastZoom', this.cy.zoom());
        const x = Math.ceil((position.x * this.cy.zoom() + this.cy.pan().x + this.containerOffsetLeft() - tooltip.offsetWidth / 2) * 100) / 100;
        const y = Math.ceil((position.y * this.cy.zoom() + this.cy.pan().y + this.containerOffsetTop()) * 100) / 100;
        tooltip.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        setTimeout(() => {
            tooltip.querySelector('[data-popper-arrow]').style.transform = 'translate3d(' + (tooltip.offsetWidth / 2 - 4) + 'px, 0px, 0)';
        }, 100);

        // отслеживаем изменение размера textarea
        const textarea = tooltip.querySelector('textarea');
        if (textarea != undefined) {
            // слушаем изменение текстового содержимого textarea
            this.addTextChangeTooltipListener(textarea);
            // слушаем изменение размера textarea
            this.addObserverToTextArea(textarea)
        }

        const tooltipEventData = {
            event: 'update',
            data: {
                id: tooltip.getAttribute('data-tooltip-id'),
                content: content,
                position: position,
                last_update_time: new Date().getTime()
            }
        }
        return tooltipEventData
    }

    removeFreeTooltip(tooltip) {
        const tooltip_id = tooltip.getAttribute('data-tooltip-id');

        tooltip.remove();

        const tooltipEventData = {
            event: 'remove',
            data: {
                id: tooltip_id,
                last_update_time: new Date().getTime()
            }
        }
        return tooltipEventData
    }

    getTooltipContent(tooltip) {
        return tooltip.querySelector('.content').innerHTML;
    }

    getTooltipPosition(tooltip) {
        let {x, y} = parseXYFromTransform(tooltip.style.transform);
        x = Math.ceil(((x - this.containerOffsetLeft() - this.cy.pan().x + tooltip.offsetWidth / 2) / this.cy.zoom()) * 100) / 100;
        y = Math.ceil(((y - this.containerOffsetTop() - this.cy.pan().y) / this.cy.zoom()) * 100) / 100;
        const position = {x: x, y: y}
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
        const tooltip = textarea.parentNode.parentNode;
        if (textarea.addEventListener) {
            textarea.addEventListener('input', function(e) {
                textarea.innerHTML = e.target.value;
                this.setUpdateProps(tooltip);
            }.bind(this));
        }
    }

    setUpdateTooltipProps(tooltip) {
        // обходим весь список тултипов
        const tooltips = this.tooltips;
        tooltips.forEach(function (tooltip_data, index) {
            if (tooltip.getAttribute('data-tooltip-cy-el-id') != undefined &&
                tooltip_data.cy_el_id == tooltip.getAttribute('data-tooltip-cy-el-id')) {
                if (tooltip_data.content != this.getContent(tooltip)) {
                    const last_update_time = new Date().getTime();
                    const tooltipsData = [{
                        event: 'update',
                        data: {
                            id: tooltip.getAttribute('data-tooltip-id'),
                            cy_el_id: tooltip.getAttribute('data-tooltip-cy-el-id'),
                            content: this.getContent(tooltip),
                            last_update_time: last_update_time
                        }
                    }]
                    tooltips[index].id = tooltip.getAttribute('data-tooltip-id');
                    tooltips[index].content = this.getContent(tooltip);
                    tooltips[index].last_update_time = last_update_time;
                    this.tooltipsDataHash = JSON.stringify(tooltipsData);
                    this.tooltipsHash = JSON.stringify(tooltips);
                    this.setProps({tooltipsData, tooltips});
                }
            } else if (tooltip_data.id == tooltip.getAttribute('data-tooltip-id')) {
                if (tooltip_data.content != this.getContent(tooltip) ||
                    hasPositionChanged(this.getPosition(tooltip), tooltip_data.position)) {
                    const last_update_time = new Date().getTime();
                    const tooltipsData = [{
                        event: 'update',
                        data: {
                            id: tooltip.getAttribute('data-tooltip-id'),
                            content: this.getContent(tooltip),
                            position: this.getPosition(tooltip),
                            last_update_time: last_update_time
                        }
                    }]
                    tooltips[index].content = this.getContent(tooltip);
                    tooltips[index].position = this.getPosition(tooltip);
                    tooltips[index].last_update_time = last_update_time;
                    this.tooltipsDataHash = JSON.stringify(tooltipsData);
                    this.tooltipsHash = JSON.stringify(tooltips);
                    this.setProps({tooltipsData, tooltips});
                }
            }
        }.bind(this));
    }

    setRemoveTooltipProps(tooltip_id = '', cy_el_id = '') {
        const tooltips = this.tooltips;
        tooltips.forEach(function (tooltip_data, index) {
            if (tooltip_id != '' && tooltip_data.id == tooltip_id ||
                cy_el_id != '' && tooltip_data.cy_el_id == cy_el_id) {
                const last_update_time = new Date().getTime();
                const tooltipsData = [{
                    event: 'remove',
                    data: {
                        id: tooltip_data.id,
                        last_update_time: last_update_time
                    }
                }];
                if (cy_el_id != '') {
                    tooltipsData[0].data.cy_el_id = cy_el_id;
                    const element = this.cy.$id(cy_el_id);
                    if (element && element.popper && element.popperRefObj) {
                        element.popperRefObj.state.elements.popper.remove();
                        element.popperRefObj.destroy();
                    } else {
                        const tooltip = document.querySelector('[data-tooltip-cy-el-id="' + cy_el_id + '"]');
                        if (tooltip != undefined) {
                            tooltip.remove();
                        }
                    }
                }
                tooltips.splice(index, 1);
                this.tooltipsDataHash = JSON.stringify(tooltipsData);
                this.tooltipsHash = JSON.stringify(tooltips);
                this.setProps({tooltipsData, tooltips});
            }
        }.bind(this));
    }

    // отслеживание изменений размеров textarea
    logTooltipTextAreaSizes(textarea) {
        const tooltip = textarea.parentNode.parentNode;
        // смещаем контейнер привязанного тултипа для позиционирования по центру элемента
        if (tooltip.getAttribute('data-tooltip-cy-el-id') != undefined) {
            const element = this.cy.$id(tooltip.getAttribute('data-tooltip-cy-el-id'));
            if (element.popperRefObj != undefined) {
                element.popperRefObj.update();
            }
            updateConnectedEdges(element);
        }
        // если это свободный тултип, то обновляем его координаты вручную
        else {
            // размещаем стрелку по центру контейнера тултипа
            const arrow = tooltip.querySelector('[data-popper-arrow]');
            const position = tooltip.offsetWidth / 2 - 8;
            arrow.style.transform = 'translate3d(' + (position) + 'px, 0px, 0)';
        }
    }
}