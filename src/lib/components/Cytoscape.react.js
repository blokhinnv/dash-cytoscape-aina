/**
 * JavaScript Requirements: cytoscape, cytoscape-svg
 * React.js requirements: react-cytoscapejs
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import CytoscapeComponent from 'react-cytoscapejs';
import _ from 'lodash';

import CyResponsive from '../cyResponsive.js';
import CyCxtMenu from '../cyContextmenu.js';
import CyTooltips from '../cyTooltips.js';
import html2canvas from 'html2canvas';

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        {byteString = atob(dataURI.split(',')[1]);}
    else
        {byteString = unescape(dataURI.split(',')[1]);}

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

/**
A Component Library for Dash aimed at facilitating network visualization in
Python, wrapped around [Cytoscape.js](http://js.cytoscape.org/).
 */
class Cytoscape extends Component {
    constructor(props) {
        super(props);

        this.handleCy = this.handleCy.bind(this);
        this._handleCyCalled = false;
        this.handleImageGeneration = this.handleImageGeneration.bind(this);
        this.cyResponsiveClass = false;
        this.cyCxtMenuClass = false;
        this.cyTooltipsClass = false;
    }

    generateNode(event) {
        const ele = event.target;

        const isParent = ele.isParent(),
            isChildless = ele.isChildless(),
            isChild = ele.isChild(),
            isOrphan = ele.isOrphan(),
            renderedPosition = ele.renderedPosition(),
            relativePosition = ele.relativePosition(),
            parent = ele.parent(),
            style = ele.style();

        // Trim down the element objects to only the data contained
        const edgesData = ele.connectedEdges().map(ele => {
                return ele.data();
            }),
            childrenData = ele.children().map(ele => {
                return ele.data();
            }),
            ancestorsData = ele.ancestors().map(ele => {
                return ele.data();
            }),
            descendantsData = ele.descendants().map(ele => {
                return ele.data();
            }),
            siblingsData = ele.siblings().map(ele => {
                return ele.data();
            });

        const {timeStamp} = event;
        const {
            classes,
            data,
            grabbable,
            group,
            locked,
            position,
            selected,
            selectable
        } = ele.json();

        let parentData;
        if (parent) {
            parentData = parent.data();
        } else {
            parentData = null;
        }

        const nodeObject = {
            // Nodes attributes
            edgesData,
            renderedPosition,
            timeStamp,
            // From ele.json()
            classes,
            data,
            grabbable,
            group,
            locked,
            position,
            selectable,
            selected,
            // Compound Nodes additional attributes
            ancestorsData,
            childrenData,
            descendantsData,
            parentData,
            siblingsData,
            isParent,
            isChildless,
            isChild,
            isOrphan,
            relativePosition,
            // Styling
            style
        };
        return nodeObject;
    }

    generateEdge(event) {
        const ele = event.target;

        const midpoint = ele.midpoint(),
            isLoop = ele.isLoop(),
            isSimple = ele.isSimple(),
            sourceData = ele.source().data(),
            sourceEndpoint = ele.sourceEndpoint(),
            style = ele.style(),
            targetData = ele.target().data(),
            targetEndpoint = ele.targetEndpoint();

        const {timeStamp} = event;
        const {
            classes,
            data,
            grabbable,
            group,
            locked,
            selectable,
            selected
        } = ele.json();

        const edgeObject = {
            // Edges attributes
            isLoop,
            isSimple,
            midpoint,
            sourceData,
            sourceEndpoint,
            targetData,
            targetEndpoint,
            timeStamp,
            // From ele.json()
            classes,
            data,
            grabbable,
            group,
            locked,
            selectable,
            selected,
            // Styling
            style
        };

        return edgeObject;
    }

    handleCy(cy) {
        // If the cy pointer has not been modified, and handleCy has already
        // been called before, than we don't run this function.
        if (cy === this._cy && this._handleCyCalled) {
            return;
        }
        this._cy = cy;
        window.cy = cy;
        this._handleCyCalled = true;

        // ///////////////////////////////////// CONSTANTS /////////////////////////////////////////
        const SELECT_THRESHOLD = 100;

        const selectedNodes = cy.collection();
        const selectedEdges = cy.collection();

        // ///////////////////////////////////// FUNCTIONS /////////////////////////////////////////
        const refreshLayout = _.debounce(() => {
            /**
             * Refresh Layout if needed
             */
            const {autoRefreshLayout, layout} = this.props;

            if (autoRefreshLayout) {
                cy.layout(layout).run();
            }
        }, SELECT_THRESHOLD);

        const sendSelectedNodesData = _.debounce(() => {
            /**
             This function is repetitively called every time a node is selected
             or unselected, but keeps being debounced if it is called again
             within 100 ms (given by SELECT_THRESHOLD). Effectively, it only
             runs when all the nodes have been correctly selected/unselected and
             added/removed from the selectedNodes collection, and then updates
             the selectedNodeData prop.
             */
            const nodeData = selectedNodes.map(el => el.data());

            if (typeof this.props.setProps === 'function') {
                this.props.setProps({
                    selectedNodeData: nodeData
                });
            }
        }, SELECT_THRESHOLD);

        const sendSelectedEdgesData = _.debounce(() => {
            const edgeData = selectedEdges.map(el => el.data());

            if (typeof this.props.setProps === 'function') {
                this.props.setProps({
                    selectedEdgeData: edgeData
                });
            }
        }, SELECT_THRESHOLD);

        // /////////////////////////////////////// EVENTS //////////////////////////////////////////
        cy.on('grab', 'node', event => {
            const nodeObject = this.generateNode(event);

            let grabData;
            if (nodeObject.selected && selectedNodes.length) {
                grabData = selectedNodes.map(el => {
                    return {node: el.data(), oldCoords: el.relativePosition()}
                });
            } else {
                grabData = [{node: nodeObject.data,
                             oldCoords: nodeObject.relativePosition}]
            }

            if (typeof this.props.setProps === 'function') {
                this.props.setProps({
                    grabNodeData: grabData,
                });
            }
        });


        cy.on('dragfree', 'node', (event) => {
            const nodeObject = this.generateNode(event);

            let dragData;
            if (nodeObject.selected && selectedNodes.length) {
                dragData = selectedNodes.map(el => {
                    return {node: el.data(), newCoords: el.relativePosition()}
                });
            } else {
                dragData = [{node: nodeObject.data,
                             newCoords: nodeObject.relativePosition}]
            }

            if (typeof this.props.setProps === 'function') {
                this.props.setProps({
                    dragNodeData: dragData,
                });
            }
        });

        cy.on('tap', 'node', event => {
            const nodeObject = this.generateNode(event);

            if (typeof this.props.setProps === 'function') {
                this.props.setProps({
                    tapNode: nodeObject,
                    tapNodeData: nodeObject.data
                });
            }
        });

        cy.on('tap', 'edge', event => {
            const edgeObject = this.generateEdge(event);

            if (typeof this.props.setProps === 'function') {
                this.props.setProps({
                    tapEdge: edgeObject,
                    tapEdgeData: edgeObject.data
                });
            }
        });

        cy.on('mouseover', 'node', event => {
            if (typeof this.props.setProps === 'function') {
                this.props.setProps({
                    mouseoverNodeData: event.target.data()
                });
            }
        });

        cy.on('mouseover', 'edge', event => {
            if (typeof this.props.setProps === 'function') {
                this.props.setProps({
                    mouseoverEdgeData: event.target.data()
                });
            }
        });

        cy.on('select', 'node', event => {
            const ele = event.target;

            selectedNodes.merge(ele);
            sendSelectedNodesData();
        });

        cy.on('unselect remove', 'node', event => {
            const ele = event.target;

            selectedNodes.unmerge(ele);
            sendSelectedNodesData();
        });

        cy.on('select', 'edge', event => {
            const ele = event.target;

            selectedEdges.merge(ele);
            sendSelectedEdgesData();
        });

        cy.on('unselect remove', 'edge', event => {
            const ele = event.target;

            selectedEdges.unmerge(ele);
            sendSelectedEdgesData();
        });

        cy.on('add remove', () => {
            refreshLayout();
        });

        cy.on('zoom', event => {
            if (typeof this.props.setProps === 'function') {
                this.props.setProps({
                    scrollZoom: Math.floor(event.target.zoom() * 100) / 100,
                });
            }
        });

        this.cyResponsiveClass = new CyResponsive(cy);
        this.cyResponsiveClass.toggle(this.props.responsive);

        this.cyCxtMenuClass = new CyCxtMenu(cy);
        this.cyCxtMenuClass.update(this.props);

        this.cyTooltipsClass = new CyTooltips(cy);
        this.cyTooltipsClass.update(this.props);

        // extension is activating when extra config was used (cyto.load_extra_layouts())
        if (cy.nodeHtmlLabel) {
            const regex = new RegExp('\\.mark[0-9]+', 'gm') // REGEXP: \.marked[0-9]+
            cy.nodeHtmlLabel([{
                query: '.mark1, .mark2, .mark3, .mark4, .mark5, .mark6, .mark7, .mark8, .mark9, .mark10', // cytoscape query selector
                halign: 'right', // title vertical position. Can be 'left',''center, 'right'
                valign: 'center', // title vertical position. Can be 'top',''center, 'bottom'
                halignBox: 'right', // title vertical position. Can be 'left',''center, 'right'
                valignBox: 'center', // title relative box vertical position. Can be 'top',''center, 'bottom'
                cssClass: 'marked_container', // any classes will be as attribute of <div> container for every title
                tpl: function(data) {
                    if (data.extra.mark_desc) return '<span style="font-size: 14; margin-left: 3px">' + data.extra.mark_desc + '</span>';
                }
            }]);
        }
    }

    handleImageGeneration(imageType, imageOptions, actionsToPerform, fileName) {
        let options = {};
        if (imageOptions) {
            options = imageOptions;
        }

        let desiredOutput = options.output;
        options.output = 'blob';

        let downloadImage;
        let storeImage;
        switch (actionsToPerform) {
            case 'store':
                downloadImage = false;
                storeImage = true;
                break;
            case 'download':
                downloadImage = true;
                storeImage = false;
                break;
            case 'both':
                downloadImage = true;
                storeImage = true;
                break;
            default:
                downloadImage = false;
                storeImage = true;
                break;
        }

        let output;
        let fName = fileName;
        if (!fileName) {
            fName = 'cyto';
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const bbox = cy.elements().boundingBox();
        let minX1 = 0, minY1 = 0, maxX2 = bbox.w * window.devicePixelRatio,
            maxY2 = bbox.h * window.devicePixelRatio;
        // calculate the required canvas sizes
        const tooltipList = document.querySelectorAll(".popper-div");
        let promisesList = [];
        for (let i = 0; i < tooltipList.length; i++) {
            const tooltip = tooltipList[i];
            promisesList.push(new Promise(async (resolve, reject) => {
                const position = await this.cyTooltipsClass.getTooltipPosition(tooltip);
                const x1 = (position.x - bbox.x1 - tooltip.offsetWidth / 2) * window.devicePixelRatio;
                const y1 = (position.y - bbox.y1) * window.devicePixelRatio;
                const x2 = x1 + tooltip.offsetWidth * window.devicePixelRatio;
                const y2 = y1 + tooltip.offsetHeight * window.devicePixelRatio;
                minX1 = Math.min(minX1, x1);
                minY1 = Math.min(minY1, y1);
                maxX2 = Math.max(maxX2, x2);
                maxY2 = Math.max(maxY2, y2);
                resolve(true);
            }));
        }
        const markerList = document.querySelectorAll(".marked_container");
        for (let i = 0; i < markerList.length; i++) {
            promisesList.push(new Promise((resolve, reject) => {
                const marker = markerList[i];
                let position = {
                    x: marker.getAttribute('position-x'),
                    y: marker.getAttribute('position-y') - marker.offsetHeight / 2,
                }
                const x1 = (position.x - bbox.x1) * window.devicePixelRatio;
                const y1 = (position.y - bbox.y1) * window.devicePixelRatio;
                const x2 = x1 + marker.offsetWidth * window.devicePixelRatio;
                const y2 = y1 + marker.offsetHeight * window.devicePixelRatio;
                minX1 = Math.min(minX1, x1);
                minY1 = Math.min(minY1, y1);
                maxX2 = Math.max(maxX2, x2);
                maxY2 = Math.max(maxY2, y2);
                resolve(true);
            }));
        }
        Promise.all(promisesList).then(values => {
            canvas.width = Math.ceil(Math.abs(minX1 - maxX2));
            canvas.height = Math.ceil(Math.abs(minY1 - maxY2));
            let scale = 1;
            // look at the maximum allowable canvas size and calculate the scale factor
            if (canvas.width > options.maxWidth) {
                let localScale = canvas.width / options.maxWidth;
                scale /= localScale;
                // we bring the current size to the maximum allowed width
                canvas.width /= localScale;
                canvas.height /= localScale;
            }
            if (canvas.height > options.maxHeight) {
                let localScale = canvas.height / options.maxHeight;
                scale /= localScale;
                // we bring the current size to the maximum allowed height
                canvas.width /= localScale;
                canvas.height /= localScale;
            }

            // get an image of the graph elements
            const img = new Image();
            img.onload = function (event) {
                URL.revokeObjectURL(event.target.src);
                ctx.drawImage(event.target, Math.abs(minX1) * scale, Math.abs(minY1) * scale);
                promisesList = [];
                for (let i = 0; i < tooltipList.length; i++) {
                    promisesList.push(new Promise((resolve, reject) => {
                        const tooltip = tooltipList[i];
                        html2canvas(tooltip, {
                            scale: scale * window.devicePixelRatio / cy.zoom(),
                            backgroundColor: null
                        }).then(async (tooltipCanvas) => {
                            const position = await this.cyTooltipsClass.getTooltipPosition(tooltip);
                            const dx = (position.x - bbox.x1 - tooltip.offsetWidth / 2) * scale * window.devicePixelRatio + Math.abs(minX1) * scale;
                            const dy = (position.y - bbox.y1) * scale * window.devicePixelRatio + Math.abs(minY1) * scale;
                            ctx.drawImage(tooltipCanvas, dx, dy);
                            resolve(true);
                        });
                    }));
                }
                for (let i = 0; i < markerList.length; i++) {
                    promisesList.push(new Promise((resolve, reject) => {
                        const marker = markerList[i];
                        html2canvas(marker, {
                            scale: scale * window.devicePixelRatio / cy.zoom(),
                            backgroundColor: null
                        }).then((markerCanvas) => {
                            let position = {
                                x: marker.getAttribute('position-x'),
                                y: marker.getAttribute('position-y') - marker.offsetHeight / 2,
                            }
                            const dx = (position.x - bbox.x1) * scale * window.devicePixelRatio + Math.abs(minX1) * scale;
                            const dy = (position.y - bbox.y1) * scale * window.devicePixelRatio + Math.abs(minY1) * scale;
                            ctx.drawImage(markerCanvas, dx, dy);
                            resolve(true);
                        });
                    }));
                }
                if (downloadImage) {
                    Promise.all(promisesList).then(values => {
                        canvas.toBlob(function (blob) {
                            this.downloadBlob(blob, fName + '.' + imageType);
                        }.bind(this));
                    });
                }
            }.bind(this);
            if (imageType === 'png') {
                output = this._cy.png({full: true, scale: scale});
            }
            if (imageType === 'jpg' || imageType === 'jpeg') {
                output = this._cy.jpg({full: true, scale: scale});
            }
            if (output.length > 0) {
                img.src = output;
            } else {
                // image from a single pixel
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            }
        });

        if (output && storeImage) {
            // Default output type if unspecified
            if (!desiredOutput) {
                desiredOutput = 'base64uri';
            }

            if (
                !(desiredOutput === 'base64uri' || desiredOutput === 'base64')
            ) {
                return;
            }

            /*
             * Convert blob to base64uri or base64 string to store the image data.
             * Thank you, base64guru https://base64.guru/developers/javascript/examples/encode-blob
             */
            const reader = new FileReader();
            reader.onload = () => {
                /* FileReader is asynchronous, so the read function is non-blocking.
                 * If this code block is placed after the read command, it
                 * may result in empty output because the blob has not been loaded yet.
                 */
                let callbackData = reader.result;
                if (desiredOutput === 'base64') {
                    callbackData = callbackData.replace(/^data:.+;base64,/, '');
                }
                this.props.setProps({imageData: callbackData});
            };
            reader.readAsDataURL(output);
        }
    }

    downloadBlob(blob, fileName) {
        /*
         * Download blob as file by dynamically creating link.
         * Chrome does not open data URLs when JS opens a new tab directed
         * at the data URL, so this is an alternate implementation
         * that doesn't require extra packages. It may not behave in
         * exactly the same way across browsers (might display image in new tab
         * intead of downloading as a file).
         * Thank you, koldev https://jsfiddle.net/koldev/cW7W5/
         */
        const downloadLink = document.createElement('a');
        downloadLink.style = 'display: none';
        document.body.appendChild(downloadLink);

        const url = window.URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = fileName;
        downloadLink.click();
        window.URL.revokeObjectURL(url);

        document.body.removeChild(downloadLink);
    }

    render() {
        const {
            // HTML attribute props
            id,
            style,
            className,
            // Common props
            elements,
            stylesheet,
            layout,
            // Viewport Manipulation
            pan,
            zoom,
            // Viewport Mutability and gesture Toggling
            panningEnabled,
            userPanningEnabled,
            minZoom,
            maxZoom,
            zoomingEnabled,
            userZoomingEnabled,
            boxSelectionEnabled,
            autoungrabify,
            autolock,
            autounselectify,
            // Image handling
            generateImage,
            // Responsive graphs
            responsive
        } = this.props;

        if (Object.keys(generateImage).length > 0) {
            // If no cytoscape object has been created yet, an image cannot be generated,
            // so generateImage will be ignored and cleared.
            this.props.setProps({generateImage: {}});
            if (this._cy) {
                this.handleImageGeneration(
                    generateImage.type,
                    generateImage.options,
                    generateImage.action,
                    generateImage.filename
                );
            }
        }

        if (this.cyResponsiveClass) {
            this.cyResponsiveClass.toggle(responsive);
        }

        if (this.cyCxtMenuClass) {
            this.cyCxtMenuClass.update(this.props);
        }

        if (this.cyTooltipsClass) {
            this.cyTooltipsClass.update(this.props);
        }

        return (
            <CytoscapeComponent
                id={id}
                cy={this.handleCy}
                className={className}
                style={style}
                elements={CytoscapeComponent.normalizeElements(elements)}
                stylesheet={stylesheet}
                layout={layout}
                pan={pan}
                zoom={zoom}
                panningEnabled={panningEnabled}
                userPanningEnabled={userPanningEnabled}
                minZoom={minZoom}
                maxZoom={maxZoom}
                zoomingEnabled={zoomingEnabled}
                userZoomingEnabled={userZoomingEnabled}
                boxSelectionEnabled={boxSelectionEnabled}
                autoungrabify={autoungrabify}
                autolock={autolock}
                autounselectify={autounselectify}
            />
        );
    }
}

Cytoscape.propTypes = {
    // HTML attribute props

    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * Sets the class name of the element (the value of an element's html
     * class attribute).
     */
    className: PropTypes.string,

    /**
     * Add inline styles to the root element.
     */
    style: PropTypes.object,

    // Dash specific props

    /**
     * Dash-assigned callback that should be called whenever any of the
     * properties change.
     */
    setProps: PropTypes.func,

    // Common props

    /**
     * A list of dictionaries representing the elements of the networks. Each dictionary describes an element, and
     * specifies its purpose. The [official Cytoscape.js documentation](https://js.cytoscape.org/#notation/elements-json)
     * offers an extensive overview and examples of element declaration.
     * Alternatively, a dictionary with the format { 'nodes': [], 'edges': [] } is allowed at initialization,
     * but arrays remain the recommended format.
     */
    elements: PropTypes.oneOfType([
        PropTypes.arrayOf(
            PropTypes.shape({
                /**
                 * Either 'nodes' or 'edges'. If not given, it's automatically inferred.
                 */
                group: PropTypes.string,
                /** Element specific data.*/
                data: PropTypes.shape({
                    /**  Reference to the element, useful for selectors and edges. Randomly assigned if not given.*/
                    id: PropTypes.string,
                    /**
                     * Optional name for the element, useful when `data(label)` is given to a style's `content`
                     * or `label`. It is only a convention. */
                    label: PropTypes.string,
                    /** Only for nodes. Optional reference to another node. Needed to create compound nodes. */
                    parent: PropTypes.string,
                    /** Only for edges. The id of the source node, which is where the edge starts. */
                    source: PropTypes.string,
                    /** Only for edges. The id of the target node, where the edge ends. */
                    target: PropTypes.string
                }),
                /** Only for nodes. The position of the node. */
                position: PropTypes.shape({
                    /** The x-coordinate of the node. */
                    x: PropTypes.number,
                    /** The y-coordinate of the node. */
                    y: PropTypes.number
                }),
                /** If the element is selected upon initialisation. */
                selected: PropTypes.bool,
                /** If the element can be selected. */
                selectable: PropTypes.bool,
                /** Only for nodes. If the position is immutable. */
                locked: PropTypes.bool,
                /** Only for nodes. If the node can be grabbed and moved by the user. */
                grabbable: PropTypes.bool,
                /**
                 * Space separated string of class names of the element. Those classes can be selected
                 * by a style selector.
                 */
                classes: PropTypes.string
            })
        ),
        PropTypes.exact({
            nodes: PropTypes.array,
            edges: PropTypes.array
        })
    ]),

    /**
     * A list of dictionaries representing the styles of the elements.
     * Each dictionary requires the following keys: `selector` and `style`.
     *
     * Both the [selector](https://js.cytoscape.org/#selectors) and
     * the [style](https://js.cytoscape.org/#style/node-body) are
     * exhaustively documented in the Cytoscape.js docs. Although methods such
     * as `cy.elements(...)` and `cy.filter(...)` are not available, the selector
     * string syntax stays the same.
     */
    stylesheet: PropTypes.arrayOf(
        PropTypes.exact({
            /**
             * Which elements you are styling. Generally, you select a group of elements (node, edges, both),
             * a class (that you declare in the element dictionary), or an element by ID.
             */
            selector: PropTypes.string.isRequired,
            /**
             * What aspects of the elements you want to modify. This could be the size or
             * color of a node, the shape of an edge arrow, or many more.
             */
            style: PropTypes.object.isRequired
        })
    ),

    /**
     * A dictionary specifying how to set the position of the elements in your
     * graph. The `'name'` key is required, and indicates which layout (algorithm) to
     * use. The keys accepted by `layout` vary depending on the algorithm, but these
     * keys are accepted by all layouts: `fit`,  `padding`, `animate`, `animationDuration`,
     * `boundingBox`.
     *
     *  The complete list of layouts and their accepted options are available on the
     *  [Cytoscape.js docs](https://js.cytoscape.org/#layouts) . For the external layouts,
     * the options are listed in the "API" section of the  README.
     *  Note that certain keys are not supported in Dash since the value is a JavaScript
     *  function or a callback. Please visit this
     * [issue](https://github.com/plotly/dash-cytoscape/issues/25) for more information.
     */
    layout: PropTypes.shape({
        /**
         * The layouts available by default are:
         *   `random`: Randomly assigns positions.
         *   `preset`: Assigns position based on the `position` key in element dictionaries.
         *   `circle`: Single-level circle, with optional radius.
         *   `concentric`: Multi-level circle, with optional radius.
         *   `grid`: Square grid, optionally with numbers of `rows` and `cols`.
         *   `breadthfirst`: Tree structure built using BFS, with optional `roots`.
         *   `cose`: Force-directed physics simulation.
         *
         * Some external layouts are also included. To use them, run
         *   `dash_cytoscape.load_extra_layouts()` before creating your Dash app. Be careful about
         *   using the extra layouts when not necessary, since they require supplementary bandwidth
         *   for loading, which impacts the startup time of the app.
         *   The external layouts are:
         *   [cose-bilkent](https://github.com/cytoscape/cytoscape.js-cose-bilkent),
         *   [fcose](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose),
         *   [cola](https://github.com/cytoscape/cytoscape.js-cola),
         *   [euler](https://github.com/cytoscape/cytoscape.js-dagre),
         *   [spread](https://github.com/cytoscape/cytoscape.js-spread),
         *   [dagre](https://github.com/cytoscape/cytoscape.js-dagre),
         *   [klay](https://github.com/cytoscape/cytoscape.js-klay),
         */
        name: PropTypes.oneOf([
            'random',
            'preset',
            'circle',
            'concentric',
            'grid',
            'breadthfirst',
            'cose',
            'cose-bilkent',
            'fcose',
            'cola',
            'euler',
            'spread',
            'dagre',
            'klay'
        ]).isRequired,
        /**  Whether to render the nodes in order to fit the canvas. */
        fit: PropTypes.bool,
        /** Padding around the sides of the canvas, if fit is enabled. */
        padding: PropTypes.number,
        /** Whether to animate change in position when the layout changes. */
        animate: PropTypes.bool,
        /** Duration of animation in milliseconds, if enabled. */
        animationDuration: PropTypes.number,
        /**
         * How to constrain the layout in a specific area. Keys accepted are either
         * `x1, y1, x2, y2` or `x1, y1, w, h`, all of which receive a pixel value.
         */
        boundingBox: PropTypes.object
    }),

    // Viewport Manipulation

    /**
     * Dictionary indicating the initial panning position of the graph. The
     * following keys are accepted:
     */
    pan: PropTypes.exact({
        /** The x-coordinate of the node */
        x: PropTypes.number,
        /** The y-coordinate of the node  */
        y: PropTypes.number
    }),

    /**
     * The initial zoom level of the graph. You can set `minZoom` and
     * `maxZoom` to set restrictions on the zoom level.
     */
    zoom: PropTypes.number,

    // Viewport Mutability and gesture Toggling
    /**
     * Whether panning the graph is enabled (i.e., the position of the graph is
     * mutable overall).
     */
    panningEnabled: PropTypes.bool,

    /**
     * Whether user events (e.g. dragging the graph background) are allowed to
     * pan the graph.
     */
    userPanningEnabled: PropTypes.bool,

    /**
     * A minimum bound on the zoom level of the graph. The viewport can not be
     * scaled smaller than this zoom level.
     */
    minZoom: PropTypes.number,

    /**
     * A maximum bound on the zoom level of the graph. The viewport can not be
     * scaled larger than this zoom level.
     */
    maxZoom: PropTypes.number,

    /**
     * Whether zooming the graph is enabled (i.e., the zoom level of the graph
     * is mutable overall).
     */
    zoomingEnabled: PropTypes.bool,

    /**
     * Whether user events (e.g. dragging the graph background) are allowed
     * to pan the graph.
     */
    userZoomingEnabled: PropTypes.bool,

    /**
     * Whether box selection (i.e. drag a box overlay around, and release it
     * to select) is enabled. If enabled, the user must taphold to pan the graph.
     */
    boxSelectionEnabled: PropTypes.bool,

    /**
     * Whether nodes should be ungrabified (not grabbable by user) by
     * default (if true, overrides individual node state).
     */
    autoungrabify: PropTypes.bool,

    /**
     * Whether nodes should be locked (not draggable at all) by default
     * (if true, overrides individual node state).
     */
    autolock: PropTypes.bool,

    /**
     * Whether nodes should be unselectified (immutable selection state) by
     * default (if true, overrides individual element state).
     */
    autounselectify: PropTypes.bool,

    /**
     * Whether the layout should be refreshed when elements are added or removed.
     */
    autoRefreshLayout: PropTypes.bool,

    // User Events Props

    /**
     * The complete node dictionary returned when you tap or click it. Read-only.
     */
    tapNode: PropTypes.exact({
        /** node specific item */
        edgesData: PropTypes.array,
        /** node specific item */
        renderedPosition: PropTypes.object,
        /** node specific item */
        timeStamp: PropTypes.number,
        /** General item (for all elements) */
        classes: PropTypes.string,
        /** General item (for all elements) */
        data: PropTypes.object,
        /** General item (for all elements) */
        grabbable: PropTypes.bool,
        /** General item (for all elements) */
        group: PropTypes.string,
        /** General item (for all elements) */
        locked: PropTypes.bool,
        /** General item (for all elements) */
        position: PropTypes.object,
        /** General item (for all elements) */
        selectable: PropTypes.bool,
        /** General item (for all elements) */
        selected: PropTypes.bool,
        /** General item (for all elements) */
        style: PropTypes.object,
        /** Item for compound nodes */
        ancestorsData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        /** Item for compound nodes */
        childrenData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        /** Item for compound nodes */
        descendantsData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        /** Item for compound nodes */
        parentData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        /** Item for compound nodes */
        siblingsData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        /** Item for compound nodes */
        isParent: PropTypes.bool,
        /** Item for compound nodes */
        isChildless: PropTypes.bool,
        /** Item for compound nodes */
        isChild: PropTypes.bool,
        /** Item for compound nodes */
        isOrphan: PropTypes.bool,
        /** Item for compound nodes */
        relativePosition: PropTypes.object
    }),

    /**
     * The data dictionary of a node returned when you tap or click it. Read-only.
     */
    tapNodeData: PropTypes.object,

    /**
     * The complete edge dictionary returned when you tap or click it. Read-only.
     */
    tapEdge: PropTypes.exact({
        /** Edge-specific item */
        isLoop: PropTypes.bool,
        /** Edge-specific item */
        isSimple: PropTypes.bool,
        /** Edge-specific item */
        midpoint: PropTypes.object,
        /** Edge-specific item */
        sourceData: PropTypes.object,
        /** Edge-specific item */
        sourceEndpoint: PropTypes.object,
        /** Edge-specific item */
        targetData: PropTypes.object,
        /** Edge-specific item */
        targetEndpoint: PropTypes.object,
        /** Edge-specific item */
        timeStamp: PropTypes.number,
        /** General item (for all elements) */
        classes: PropTypes.string,
        /** General item (for all elements) */
        data: PropTypes.object,
        /** General item (for all elements) */
        grabbable: PropTypes.bool,
        /** General item (for all elements) */
        group: PropTypes.string,
        /** General item (for all elements) */
        locked: PropTypes.bool,
        /** General item (for all elements) */
        selectable: PropTypes.bool,
        /** General item (for all elements) */
        selected: PropTypes.bool,
        /** General item (for all elements) */
        style: PropTypes.object
    }),

    /**
     * The data dictionary of an edge returned when you tap or click it. Read-only.
     */
    tapEdgeData: PropTypes.object,

    /**
     * The data dictionary of a node returned when you hover over it. Read-only.
     */
    mouseoverNodeData: PropTypes.object,

    /**
     * The data dictionary of an edge returned when you hover over it. Read-only.
     */
    mouseoverEdgeData: PropTypes.object,

    /**
     * The list of data dictionaries of all selected nodes (e.g. using
     * Shift+Click to select multiple nodes, or Shift+Drag to use box selection). Read-only.
     */
    selectedNodeData: PropTypes.array,

    /**
     * The list of data dictionaries of all selected edges (e.g. using
     * Shift+Click to select multiple nodes, or Shift+Drag to use box selection). Read-only.
     */
    selectedEdgeData: PropTypes.array,

    /**
     * grab - только схватили
     */
    grabNodeData: PropTypes.array,

    /**
     * drag - схватили и перетаскиваем
     */
    dragNodeData: PropTypes.array,

    /**
     * значение зума при зумировании колесиком мыши
     */
    scrollZoom: PropTypes.number,

    /**
     * Dictionary specifying options to generate an image of the current cytoscape graph.
     * Value is cleared after data is received and image is generated. This property will
     * be ignored on the initial creation of the cytoscape object and must be invoked through
     * a callback after it has been rendered.
     *
     * If the app does not need the image data server side and/or it will only be used to download
     * the image, it may be prudent to invoke `'download'` for `action` instead of
     * `'store'` to improve performance by preventing transfer of data to the server.
     */
    generateImage: PropTypes.shape({
        /** File type to output  */
        type: PropTypes.oneOf(['svg', 'png', 'jpg', 'jpeg']),
        /** Dictionary of options to cy.png() / cy.jpg() or cy.svg() for image generation.
         * See https://js.cytoscape.org/#core/export for details. For `'output'`, only 'base64'
         * and 'base64uri' are supported. Default: `{'output': 'base64uri'}`.*/
        options: PropTypes.object,
        /**
         * `'store'`: Stores the image data (only jpg and png are supported)
         * in `imageData` and invokes server-side Dash callbacks. `'download'`: Downloads the image
         * as a file with all data handling done client-side. No `imageData` callbacks are fired.
         * `'both'`: Stores image data and downloads image as file. The default is `'store'`
         */
        action: PropTypes.oneOf(['store', 'download', 'both']),
        /** Name for the file to be downloaded. Default: 'cyto'.*/
        filename: PropTypes.string
    }),

    /**
     * String representation of the image requested with generateImage. Null if no
     * image was requested yet or the previous request failed. Read-only.
     */
    imageData: PropTypes.string,

    /**
     * Toggles intelligent responsive resize of Cytoscape graph with viewport size change
     */
    responsive: PropTypes.bool,

    /**
     * Displays a context menu on right click. Requires extra layouts loaded.
     * Accepts a list of dictionaries, each of which describes a context
     * menu option. Options are rendered in the order presented.
     */
    contextmenu: PropTypes.arrayOf(
        PropTypes.exact({
            /** ID associated with option. */
            id: PropTypes.string,
            /**
             * Determines which Cytoscape elements the option is attached to. Takes in a Cytoscape selector
             * (see Cytoscape documentation for more information). Examples of valid selectors include node,
             * edge, and core.
             */
            selector: PropTypes.string,
            /** Label assigned to option. */
            content: PropTypes.string,
            /** Hover tooltip text assigned to option. */
            tooltipText: PropTypes.string,
            /** Toggles option disabled (greyed out). */
            disabled: PropTypes.bool
        })
    ),

    /**
     * Dictionary returned when a context menu option is selected. Read-only.
     */
    contextmenuData: PropTypes.exact({
        /** ID associated with option selected. */
        id: PropTypes.string,
        /** Position associated with option selected. */
        position: PropTypes.exact({
            x: PropTypes.number,
            y: PropTypes.number,
        }),
        /** Time the option was selected. */
        timestamp: PropTypes.number,
        /**
         * Dictionary containing information about the selected item. Information provided varies depending
         * on the type of the selected item (node, edge, core, etc.).
         */
        target: PropTypes.object,
        /** Array containing latitude and longitude where context menu was opened if leaflet is enabled. */
        coordinates: PropTypes.arrayOf(PropTypes.number),
    }),

    /**
     * Содержит полную информацию о всех тултипах; список словарей.
     */
    tooltips: PropTypes.arrayOf(
        PropTypes.exact({
            /** Необязательный. Идентификатор тултипа; при передаче пустого значения генерируется автоматически. */
            id: PropTypes.string,
            /** Необязательный. Идентификатор элемента графа, обязательно для создания привязанного тултипа. */
            cy_el_id: PropTypes.string,
            /**
             * Обязательный. Содержимое тултипа. Может содержать любой html. В случае передаче тега textarea,
             * при изменении текста в textarea или изменении размеров (ширины и высоты) textarea
             * будут изменяться и tooltip, и tooltipsData.
             */
            content: PropTypes.string,
            /**
             * Необязательный. Позиция свободного тултипа в координатах cytoscape.
             * У привязанного тултипа такого поля нет.
             */
            position: PropTypes.exact({
                x: PropTypes.number,
                y: PropTypes.number,
            }),
            /**
             * Время последнего обновления в unix формате.
             * Игнорируется при попытки обновления этого свойства с бекенда.
             * */
            last_update_time: PropTypes.number,
        })
    ),

    /**
     * Перечень тултипов, данные которых изменились последний раз.
     * Можно использовать для обновления конкретных тултипов, а не передавать весь список, как в случае с tooltips.
     */
    tooltipsData: PropTypes.arrayOf(
        PropTypes.exact({
            /** Информация о типе совершенного изменения. Возможные значения: add, update, delete. */
            event: PropTypes.string,
            /** Cодержит данные, описывающие тултип, имеет тот же формат, что и элемент списка tooltips. */
            data: PropTypes.object,
        }),
    ),
};

Cytoscape.defaultProps = {
    style: {width: '600px', height: '600px'},
    layout: {name: 'grid'},
    pan: {x: 0, y: 0},
    zoom: 1,
    minZoom: 1e-50,
    maxZoom: 1e50,
    zoomingEnabled: true,
    userZoomingEnabled: true,
    panningEnabled: true,
    userPanningEnabled: true,
    boxSelectionEnabled: false,
    autolock: false,
    autoungrabify: false,
    autounselectify: false,
    autoRefreshLayout: true,
    generateImage: {},
    imageData: null,
    responsive: false,
    elements: [],
    tooltips: [],
    tooltipsData: []
};

export default Cytoscape;
