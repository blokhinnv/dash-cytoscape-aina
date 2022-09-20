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

export function parseXYFromTransform(transform) {
    let scaleIndex = transform.indexOf('scale');
    if (scaleIndex == -1) {
        scaleIndex = transform.length;
    }
    const [x, y] = transform.substring(0, scaleIndex).replace('translate3d(', '').replace('translate(', '').replace(')', '').replaceAll('px', '').split(',').map((item) => (parseFloat(item.trim())));
    return {x: x, y: y}
}

function hasPositionChanged(p1, p2) {
    if (Math.abs(p1.x - p2.x) < 0.1 && Math.abs(p1.y - p2.y) < 0.1) {
        return false;
    }
    return true;
}

// returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms));

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
        this.queue = [];
        this.popperInstances = {};
        this.queue_in_work = false;

        // move all the free tooltips when moving across the canvas
        cy.on('pan', (event) => {
            document.querySelectorAll('.popper-core').forEach(tooltip => {
                this.popperInstances[tooltip.getAttribute('data-tooltip-id')].update();
            });
        });

        // move all the free tooltips when zooming the canvas
        this.containerOffsetTop = () => this.cy.container().offsetTop;
        this.containerOffsetLeft = () => this.cy.container().offsetLeft;
        cy.on('zoom', (event) => {
            document.querySelectorAll('.popper-core').forEach(tooltip => {
                this.popperInstances[tooltip.getAttribute('data-tooltip-id')].update();
            });
        });

        // delete the free tooltip by clicking on the button
        document.body.addEventListener('click', function (event) {
            if (event.target.className == 'remove_popper_core') {
                const tooltip_id = event.target.parentNode.dataset.tooltipId;
                event.target.parentNode.remove();
                // инициируем обновление коллбеков
                this.setRemoveProps(tooltip_id);
            }
        }.bind(this));

        // move a free tooltip using the drag & drop method
        document.body.addEventListener('mousedown', function (event) {
            if (event.target.tagName == 'TEXTAREA') {
                var tooltip = event.target.parentNode.parentNode;
                var textarea = event.target;
            } else if (event.target.tagName == 'DIV' && event.target.className == 'content') {
                var tooltip = event.target.parentNode;
                var textarea = tooltip.querySelector('textarea');
                tooltip.setAttribute('data-resize', true);
            } else if (event.target.className == 'popper-div popper-core') {
                var tooltip = event.target;
                var textarea = tooltip.querySelector('textarea');
            } else {
                return;
            }

            const shiftX = event.clientX - tooltip.getBoundingClientRect().left - tooltip.offsetWidth * (cy.zoom() - 1) / 2;
            const shiftY = event.clientY - tooltip.getBoundingClientRect().top - tooltip.offsetHeight * (cy.zoom() - 1) / 2;

            tooltip.setAttribute('data-shift-x', shiftX);
            tooltip.setAttribute('data-shift-y', shiftY);
            tooltip.setAttribute('data-last-pos-x', event.clientX);
            tooltip.setAttribute('data-last-pos-y', event.clientY);

            // moves the tooltip by coordinates (pageX, pageY)
            // taking into account the initial shifts of the tooltip
            function moveAt(pageX, pageY) {
                tooltip.style.transform = 'translate3d(' + (pageX - shiftX) + 'px, ' + (pageY - shiftY) + 'px, 0) scale(' + cy.zoom() + ')';
            }

            // changes the size of the textarea
            function changeTextArea(pageX, pageY) {
                // changing the width and height textarea
                let deltaX = (pageX - tooltip.getAttribute('data-last-pos-x'));
                let deltaY = pageY - tooltip.getAttribute('data-last-pos-y');
                deltaX = deltaX * 2 * (1 / cy.zoom());
                deltaY = deltaY * (1 / cy.zoom());
                if (textarea.offsetWidth + deltaX >= 100) {
                    textarea.style.width = textarea.offsetWidth + deltaX + 'px';
                } else {
                    deltaX = 0;
                }
                if (textarea.offsetHeight + deltaY >= 50) {
                    textarea.style.height = textarea.offsetHeight + deltaY + 'px';
                } else {
                    deltaY = 0;
                }
                // shift the tooltip up and to the left by delta * cy.zoom(), if the tooltip is connected
                let {x, y} = parseXYFromTransform(tooltip.style.transform);
                tooltip.style.transform = 'translate3d(' + (x - deltaX / 2) + 'px, ' + (y + deltaY / 2 * (cy.zoom() - 1)) + 'px, 0) scale(' + cy.zoom() + ')';
                tooltip.setAttribute('data-last-pos-x', pageX);
                tooltip.setAttribute('data-last-pos-y', pageY);
            }

            let onMouseMove = (event) => {
                if (tooltip.hasAttribute('data-resize')) {
                    changeTextArea(event.pageX, event.pageY);
                } else if (tooltip.classList.contains('popper-core')) {
                    moveAt(event.pageX, event.pageY);
                }
            }

            // move the tooltip when moving the mouse
            document.addEventListener('mousemove', onMouseMove);
            tooltip.setAttribute('data-moving', 'true');

            // releasing the tooltip, removing unnecessary handlers
            let onMouseUp = () => {
                if (tooltip.getAttribute('data-moving') == 'true') {
                    tooltip.removeAttribute('data-shift-x');
                    tooltip.removeAttribute('data-shift-y');
                    tooltip.removeAttribute('data-resize');
                    tooltip.removeAttribute('data-moving');
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    let textareas = tooltip.getElementsByTagName('textarea');
                    if (textareas.length != 0) {
                        let textarea = textareas[0];
                        let dim = getTextareaDimensions(textarea);
                        if (dim) {
                            tooltip.setAttribute('lastWidth', dim.w);
                            tooltip.setAttribute('lastHeight', dim.h);
                        }
                    }
                    this.setUpdateProps(tooltip);
                }
            }
            document.addEventListener('mouseup', onMouseUp)
        }.bind(this));

        // removing the tooltip after removing an element from the graph
        cy.on('remove', 'node, edge', function(event) {
            this.setRemoveProps('', event.target.data().id);
        }.bind(this));
    }

    update(props) {
        let {cy, setProps, tooltips, tooltipsData} = props;
        this.setProps = setProps;

        if (typeof tooltips !== 'object' || !this.cy) {
            return;
        }

        // if there is something in the queue, then we put it in the queue and finish the work
        // if the queue is empty, then we process the update as usual
        if (this.queue_in_work) {
            this.queue.push({tooltips, tooltipsData});
            return;
        } else if (this.queue.length != 0) {
            tooltips = this.queue[0].tooltips;
            tooltipsData = this.queue[0].tooltipsData;
        }
        const tooltipsDataHashNew = JSON.stringify(tooltipsData);
        // if we were given specific data, then we update only them
        if (tooltipsDataHashNew !== this.tooltipsDataHash) {
            this.queue_in_work = true;
            let newTooltipsData = [];
            let promises = [];
            tooltipsData.forEach(tooltipsDataItem => {
                promises.push((async (tooltipsDataItem) => {
                    let tooltipEventData = await this.applyTooltipsDataItem(tooltipsDataItem);
                    if (tooltipEventData == undefined) {
                        return;
                    }
                    if (tooltipsDataItem.event == 'remove') {
                        tooltips.forEach(function (tooltip_data, index) {
                            if (tooltipEventData.data.id == tooltip_data.id) {
                                tooltips.splice(index, 1);
                                newTooltipsData.push(tooltipEventData);
                            } else if (tooltipEventData.data.cy_el_id == tooltip_data.cy_el_id) {
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
                })(tooltipsDataItem));
            });
            Promise.all(promises).then(() => {
                this.tooltipsDataHash = JSON.stringify(newTooltipsData);
                this.tooltipsHash = JSON.stringify(tooltips);
                this.tooltips = tooltips;
                // at the end of processing, we check the queue
                this.queue_in_work = false;
                this.queue.splice(0);
                this.setProps({tooltipsData: newTooltipsData, tooltips: tooltips});
                // if there is something in the queue, then we continue processing
                if (this.queue.length !== 0) {
                    this.forceUpdate();
                }
            });
            return;
        }

        const tooltipsHashNew = JSON.stringify(tooltips);
        if (tooltipsHashNew === this.tooltipsHash) {
            return;
        }
        this.queue_in_work = true;
        this.tooltipsHash = tooltipsHashNew;

        // we were given the entire array of tooltips
        // you need to understand what has changed and add, update, delete accordingly
        const toAdd = [];
        const toUpdate = [];
        // the new elements
        for (let newIndex = 0; newIndex < tooltips.length; newIndex++) {
            let tooltipsNewItem = tooltips[newIndex];
            let isOld = false;
            // the old elements
            for (let oldIndex = 0; oldIndex < this.tooltips.length; oldIndex++) {
                let tooltipsOldItem = this.tooltips[oldIndex];
                // update the element
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

        let promises = [];

        // in this.tooltips, only the elements to be deleted are left
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
            // at the end of processing, we check the queue
            this.queue_in_work = false;
            this.queue.splice(0);
            this.setProps({tooltipsData: newTooltipsData, tooltips});
            // if there is something in the queue, then we continue processing
            if (this.queue.length !== 0) {
                this.forceUpdate();
            }
        });
    }

    async applyTooltipsDataItem(tooltipsDataItem) {
        const {event, data} = tooltipsDataItem;
        const {id, cy_el_id, content, position, last_update_time} = data;
        if (position != undefined) {
            position.x = Math.ceil(position.x * 100) / 100;
            position.y = Math.ceil(position.y * 100) / 100;
        }
        // if id is passed
        if (id != undefined && id.length > 0) {
            // if there is a tooltip with this id
            const tooltip = document.querySelector(`[data-tooltip-id="${id}"]`);
            if (tooltip != undefined) {
                if (tooltip.dataset.tooltipCyElId == undefined) {
                    // if event = delete, then delete the tooltip
                    if (event == 'remove') {
                        return this.removeFree(tooltip);
                    }
                    if (this.getContent(tooltip) !== content || hasPositionChanged(await this.getPosition(tooltip), position)) {
                        // updating the tooltip data
                        return this.updateFree(tooltip, content, position);
                    }
                } else {
                    // if event = delete, then delete this connected tooltip
                    if (event == 'remove') {
                        return this.removeConnected(tooltip);
                    }
                    if (this.getContent(tooltip) !== content) {
                        // setting new content
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
        // if cy_el_id is passed
        else if (cy_el_id != undefined && cy_el_id.length > 0) {
            // if there is a tooltip associated with such an element
            const tooltip = document.querySelector(`[data-tooltip-cy-el-id="${cy_el_id}"]`);
            if (tooltip != undefined) {
                // if event = delete, then delete this connected tooltip
                if (event == 'remove') {
                    return this.removeConnected(tooltip);
                }
                    if (this.getContent(tooltip) !== content) {
                        // setting new content
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

        const myModifier = {
            name: 'myModifier',
            enabled: true,
            phase: "beforeWrite",
            requires: ["computeStyles"],
            fn: ({ state }) => {
                const pos = parseXYFromTransform(state.styles.popper.transform);
                const popperTransform = `translate3d(${pos.x}px, ${pos.y + tooltip.offsetHeight * (this.cy.zoom() - 1) / 2 + 5 + 5 * (this.cy.zoom() - 1)}px, 0px) scale(${cy.zoom()})`;
                state.styles.popper.transform = popperTransform;
                const arrowTransform = `translate3d(${tooltip.offsetWidth / 2 - 4}px, 0px, 0px)`;
                state.styles.arrow.transform = arrowTransform;
            }
        };
        element.popperRefObj = element.popper({
            content: () => {
                const tooltip = document.createElement("div");
                tooltip.classList.add("popper-div");
                tooltip.setAttribute("data-tooltip-id", id);
                tooltip.setAttribute("data-tooltip-cy-el-id", cy_el_id);
                tooltip.innerHTML = '<div data-popper-arrow></div><div class="content">' + content + '</div>';
                document.body.appendChild(tooltip);

                return tooltip;
            },
            popper: {
                modifiers: [
                    {
                        name: 'flip',
                        enabled: false,
                    },
                    {
                        name: 'preventOverflow',
                        enabled: false,
                    },
                    myModifier
                ],
            }
        });

        this.popperInstances[id] = element.popperRefObj;

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
            // listening to the textarea text content change
            this.addTextChangeTooltipListener(textarea);
            // listening to textarea resizing
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

        delete this.popperInstances[tooltip_id];

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

    async addFreeTooltip(id, content, position) {
        let tooltip = () => {
            const tooltip = document.createElement("div");
            tooltip.classList.add("popper-div");
            tooltip.classList.add("popper-core");
            tooltip.setAttribute("data-tooltip-id", id);
            tooltip.setAttribute('lastPanX', this.cy.pan().x);
            tooltip.setAttribute('lastPanY', this.cy.pan().y);
            tooltip.setAttribute('lastZoom', this.cy.zoom());
            tooltip.innerHTML = '<div data-popper-arrow></div>';
            tooltip.innerHTML += '<div class="content">' + content + '</div>';
            tooltip.innerHTML += '<button class="remove_popper_core">X</button>';
            document.body.appendChild(tooltip);

            return tooltip;
        };
        const myModifier = {
            name: 'myModifier',
            enabled: true,
            phase: "beforeWrite",
            requires: ["computeStyles"],
            fn: ({ state }) => {
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
                let pos = {};
                pos.x = position.x * this.cy.zoom() + this.cy.pan().x + this.containerOffsetLeft() - tooltip.offsetWidth / 2;
                pos.y = position.y * this.cy.zoom() + this.cy.pan().y + this.containerOffsetTop() + tooltip.offsetHeight * (this.cy.zoom() - 1) / 2;
                const popperTransform = `translate3d(${pos.x}px, ${pos.y}px, 0px) scale(${cy.zoom()})`;
                state.styles.popper.transform = popperTransform;
                const arrowTransform = `translate3d(${tooltip.offsetWidth / 2 - 4}px, 0px, 0px)`;
                state.styles.arrow.transform = arrowTransform;
            }
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
            popper: {
                modifiers: [
                    {
                        name: 'flip',
                        enabled: false,
                    },
                    myModifier
                ],
            }
        });
        this.popperInstances[id] = popperRefObj;

        tooltip = popperRefObj.state.elements.popper;
        const textarea = tooltip.querySelector('textarea');
        if (textarea != undefined) {
            // listening to the textarea text content change
            this.addTextChangeTooltipListener(textarea);
            // listening to textarea resizing
            this.addObserverToTextArea(textarea)
        }
        const tooltipEventData = {
            event: 'add',
            data: {
                id: id,
                content: content,
                position: await this.getPosition(tooltip),
                last_update_time: new Date().getTime()
            }
        }
        return tooltipEventData
    }

    async updateFreeTooltip(tooltip, content, position) {
        tooltip.querySelector('.content').innerHTML = content;
        tooltip.setAttribute('lastPanX', this.cy.pan().x);
        tooltip.setAttribute('lastPanY', this.cy.pan().y);
        tooltip.setAttribute('lastZoom', this.cy.zoom());
        const x = Math.ceil((position.x * this.cy.zoom() + this.cy.pan().x + this.containerOffsetLeft() - tooltip.offsetWidth / 2) * 100) / 100;
        const y = Math.ceil((position.y * this.cy.zoom() + this.cy.pan().y + this.containerOffsetTop()) * 100) / 100;
        tooltip.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) scale(' + cy.zoom() + ')';

        // tracking the change in the size of textarea
        const textarea = tooltip.querySelector('textarea');
        if (textarea != undefined) {
            // listening to the textarea text content change
            this.addTextChangeTooltipListener(textarea);
            // listening to textarea resizing
            this.addObserverToTextArea(textarea)
        }

        const tooltipEventData = {
            event: 'update',
            data: {
                id: tooltip.getAttribute('data-tooltip-id'),
                content: content,
                position: await this.getPosition(tooltip),
                last_update_time: new Date().getTime()
            }
        }
        return tooltipEventData
    }

    removeFreeTooltip(tooltip) {
        const tooltip_id = tooltip.getAttribute('data-tooltip-id');

        tooltip.remove();
        delete this.popperInstances[tooltip_id];

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

    async getTooltipPosition(tooltip) {
        let attempt_count = 20;
        while (tooltip.style.transform.length == 0 && --attempt_count) {
            await timer(500);
        }
        let {x, y} = parseXYFromTransform(tooltip.style.transform);
        x = Math.ceil(((x - this.containerOffsetLeft() - this.cy.pan().x + tooltip.offsetWidth / 2) / this.cy.zoom()) * 100) / 100;
        y = Math.ceil(((y - this.containerOffsetTop() - this.cy.pan().y - tooltip.offsetHeight * (this.cy.zoom() - 1) / 2) / this.cy.zoom()) * 100) / 100;
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
        // go through the entire list of tooltips
        const tooltips = this.tooltips;
        tooltips.forEach(async function (tooltip_data, index) {
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
                    hasPositionChanged(await this.getPosition(tooltip), tooltip_data.position)) {
                    const last_update_time = new Date().getTime();
                    const tooltipsData = [{
                        event: 'update',
                        data: {
                            id: tooltip.getAttribute('data-tooltip-id'),
                            content: this.getContent(tooltip),
                            position: await this.getPosition(tooltip),
                            last_update_time: last_update_time
                        }
                    }]
                    tooltips[index].content = tooltipsData[0].data.content;
                    tooltips[index].position = tooltipsData[0].data.position;
                    tooltips[index].last_update_time = tooltipsData[0].data.last_update_time;
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

    // tracking textarea size changes
    logTooltipTextAreaSizes(textarea) {
        const tooltip = textarea.parentNode.parentNode;
        this.popperInstances[tooltip.getAttribute('data-tooltip-id')].update();
        if (tooltip.getAttribute('data-tooltip-cy-el-id') != undefined) {
            const element = this.cy.$id(tooltip.getAttribute('data-tooltip-cy-el-id'));
            if (element.popperRefObj != undefined) {
                element.popperRefObj.update();
            }
            updateConnectedEdges(element);
        }
    }
}