% Auto-generated: do not edit by hand
\name{'cyto'Cytoscape}

\alias{'cyto'Cytoscape}

\title{Cytoscape component}

\description{
A Component Library for Dash aimed at facilitating network visualization in Python, wrapped around [Cytoscape.js](http://js.cytoscape.org/).
}

\usage{
'cyto'Cytoscape(id=NULL, autoRefreshLayout=NULL, autolock=NULL,
autoungrabify=NULL, autounselectify=NULL,
boxSelectionEnabled=NULL, className=NULL, contextmenu=NULL,
contextmenuData=NULL, degrees=NULL, dragNodeData=NULL,
elements=NULL, extent=NULL, generateImage=NULL,
grabNodeData=NULL, imageData=NULL, includeLoopInDegree=NULL,
layout=NULL, maxZoom=NULL, minZoom=NULL,
mouseoverEdgeData=NULL, mouseoverNodeData=NULL, pan=NULL,
panningEnabled=NULL, responsive=NULL, scrollZoom=NULL,
selectedEdgeData=NULL, selectedNodeData=NULL, style=NULL,
stylesheet=NULL, tapEdge=NULL, tapEdgeData=NULL,
tapNode=NULL, tapNodeData=NULL, tooltips=NULL,
tooltipsData=NULL, userPanningEnabled=NULL,
userZoomingEnabled=NULL, zoom=NULL, zoomingEnabled=NULL)
}

\arguments{
\item{id}{Character. The ID used to identify this component in Dash callbacks.}

\item{autoRefreshLayout}{Logical. Whether the layout should be refreshed when elements are added or removed.}

\item{autolock}{Logical. Whether nodes should be locked (not draggable at all) by default
(if true, overrides individual node state).}

\item{autoungrabify}{Logical. Whether nodes should be ungrabified (not grabbable by user) by
default (if true, overrides individual node state).}

\item{autounselectify}{Logical. Whether nodes should be unselectified (immutable selection state) by
default (if true, overrides individual element state).}

\item{boxSelectionEnabled}{Logical. Whether box selection (i.e. drag a box overlay around, and release it
to select) is enabled. If enabled, the user must taphold to pan the graph.}

\item{className}{Character. Sets the class name of the element (the value of an element's html
class attribute).}

\item{contextmenu}{List of lists containing elements 'id', 'selector', 'content', 'tooltiptext', 'disabled'.
those elements have the following types:
  - id (character; optional): id associated with option.
  - selector (character; optional): determines which cytoscape elements the option is attached to. takes in a cytoscape selector
(see cytoscape documentation for more information). examples of valid selectors include node,
edge, and core.
  - content (character; optional): label assigned to option.
  - tooltiptext (character; optional): hover tooltip text assigned to option.
  - disabled (logical; optional): toggles option disabled (greyed out).s. Displays a context menu on right click. Requires extra layouts loaded.
Accepts a list of dictionaries, each of which describes a context
menu option. Options are rendered in the order presented.}

\item{contextmenuData}{Lists containing elements 'id', 'position', 'timestamp', 'target', 'coordinates'.
those elements have the following types:
  - id (character; optional): id associated with option selected.
  - position (optional): position associated with option selected.. position has the following type: lists containing elements 'x', 'y'.
those elements have the following types:
  - x (numeric; optional)
  - y (numeric; optional)
  - timestamp (numeric; optional): time the option was selected.
  - target (named list; optional): dictionary containing information about the selected item. information provided varies depending
on the type of the selected item (node, edge, core, etc.).
  - coordinates (list of numerics; optional): array containing latitude and longitude where context menu was opened if leaflet is enabled.. Dictionary returned when a context menu option is selected. Read-only.}

\item{degrees}{Named list. Объект со степенями узлов. Ключ - ID узла, значение - разные типы степеней (degree, in\out\total degree).}

\item{dragNodeData}{Unnamed list. drag - схватили и перетаскиваем}

\item{elements}{List of lists containing elements 'group', 'data', 'position', 'selected', 'selectable', 'locked', 'grabbable', 'classes'.
those elements have the following types:
  - group (character; optional): either 'nodes' or 'edges'. if not given, it's automatically inferred.
  - data (optional): element specific data.. data has the following type: lists containing elements 'id', 'label', 'parent', 'source', 'target'.
those elements have the following types:
  - id (character; optional): reference to the element, useful for selectors and edges. randomly assigned if not given.
  - label (character; optional): optional name for the element, useful when `data(label)` is given to a style's `content`
or `label`. it is only a convention.
  - parent (character; optional): only for nodes. optional reference to another node. needed to create compound nodes.
  - source (character; optional): only for edges. the id of the source node, which is where the edge starts.
  - target (character; optional): only for edges. the id of the target node, where the edge ends.
  - position (optional): only for nodes. the position of the node.. position has the following type: lists containing elements 'x', 'y'.
those elements have the following types:
  - x (numeric; optional): the x-coordinate of the node.
  - y (numeric; optional): the y-coordinate of the node.
  - selected (logical; optional): if the element is selected upon initialisation.
  - selectable (logical; optional): if the element can be selected.
  - locked (logical; optional): only for nodes. if the position is immutable.
  - grabbable (logical; optional): only for nodes. if the node can be grabbed and moved by the user.
  - classes (character; optional): space separated string of class names of the element. those classes can be selected
by a style selector.s | lists containing elements 'nodes', 'edges'.
those elements have the following types:
  - nodes (unnamed list; optional)
  - edges (unnamed list; optional). A list of dictionaries representing the elements of the networks. Each dictionary describes an element, and
specifies its purpose. The [official Cytoscape.js documentation](https://js.cytoscape.org/#notation/elements-json)
offers an extensive overview and examples of element declaration.
Alternatively, a dictionary with the format { 'nodes': [], 'edges': [] } is allowed at initialization,
but arrays remain the recommended format.}

\item{extent}{Lists containing elements 'x1', 'x2', 'y1', 'y2', 'w', 'h'.
those elements have the following types:
  - x1 (numeric; optional)
  - x2 (numeric; optional)
  - y1 (numeric; optional)
  - y2 (numeric; optional)
  - w (numeric; optional)
  - h (numeric; optional). extent of the viewport, a bounding box in model co-ordinates 
that lets you know what model positions are visible in the viewport.}

\item{generateImage}{Lists containing elements 'type', 'options', 'action', 'filename'.
those elements have the following types:
  - type (a value equal to: 'svg', 'png', 'jpg', 'jpeg'; optional): file type to output
  - options (named list; optional): dictionary of options to cy.png() / cy.jpg() or cy.svg() for image generation.
see https://js.cytoscape.org/#core/export for details. for `'output'`, only 'base64'
and 'base64uri' are supported. default: `{'output': 'base64uri'}`.
  - action (a value equal to: 'store', 'download', 'both'; optional): `'store'`: stores the image data (only jpg and png are supported)
in `imagedata` and invokes server-side dash callbacks. `'download'`: downloads the image
as a file with all data handling done client-side. no `imagedata` callbacks are fired.
`'both'`: stores image data and downloads image as file. the default is `'store'`
  - filename (character; optional): name for the file to be downloaded. default: 'cyto'.. Dictionary specifying options to generate an image of the current cytoscape graph.
Value is cleared after data is received and image is generated. This property will
be ignored on the initial creation of the cytoscape object and must be invoked through
a callback after it has been rendered.

If the app does not need the image data server side and/or it will only be used to download
the image, it may be prudent to invoke `'download'` for `action` instead of
`'store'` to improve performance by preventing transfer of data to the server.}

\item{grabNodeData}{Unnamed list. grab - только схватили}

\item{imageData}{Character. String representation of the image requested with generateImage. Null if no
image was requested yet or the previous request failed. Read-only.}

\item{includeLoopInDegree}{Logical. Если true, то петли учитываются при подсчете степеней.}

\item{layout}{Lists containing elements 'name', 'fit', 'padding', 'animate', 'animationduration', 'boundingbox'.
those elements have the following types:
  - name (a value equal to: 'random', 'preset', 'circle', 'concentric', 'grid', 'breadthfirst', 'cose', 'cose-bilkent', 'fcose', 'cola', 'euler', 'spread', 'dagre', 'klay'; required): the layouts available by default are:
  `random`: randomly assigns positions.
  `preset`: assigns position based on the `position` key in element dictionaries.
  `circle`: single-level circle, with optional radius.
  `concentric`: multi-level circle, with optional radius.
  `grid`: square grid, optionally with numbers of `rows` and `cols`.
  `breadthfirst`: tree structure built using bfs, with optional `roots`.
  `cose`: force-directed physics simulation.

some external layouts are also included. to use them, run
  `dash_cytoscape.load_extra_layouts()` before creating your dash app. be careful about
  using the extra layouts when not necessary, since they require supplementary bandwidth
  for loading, which impacts the startup time of the app.
  the external layouts are:
  [cose-bilkent](https://github.com/cytoscape/cytoscape.js-cose-bilkent),
  [fcose](https://github.com/ivis-at-bilkent/cytoscape.js-fcose),
  [cola](https://github.com/cytoscape/cytoscape.js-cola),
  [euler](https://github.com/cytoscape/cytoscape.js-dagre),
  [spread](https://github.com/cytoscape/cytoscape.js-spread),
  [dagre](https://github.com/cytoscape/cytoscape.js-dagre),
  [klay](https://github.com/cytoscape/cytoscape.js-klay),
  - fit (logical; optional): whether to render the nodes in order to fit the canvas.
  - padding (numeric; optional): padding around the sides of the canvas, if fit is enabled.
  - animate (logical; optional): whether to animate change in position when the layout changes.
  - animationduration (numeric; optional): duration of animation in milliseconds, if enabled.
  - boundingbox (named list; optional): how to constrain the layout in a specific area. keys accepted are either
`x1, y1, x2, y2` or `x1, y1, w, h`, all of which receive a pixel value.. A dictionary specifying how to set the position of the elements in your
graph. The `'name'` key is required, and indicates which layout (algorithm) to
use. The keys accepted by `layout` vary depending on the algorithm, but these
keys are accepted by all layouts: `fit`,  `padding`, `animate`, `animationDuration`,
`boundingBox`.

 The complete list of layouts and their accepted options are available on the
 [Cytoscape.js docs](https://js.cytoscape.org/#layouts) . For the external layouts,
the options are listed in the "API" section of the  README.
 Note that certain keys are not supported in Dash since the value is a JavaScript
 function or a callback. Please visit this
[issue](https://github.com/plotly/dash-cytoscape/issues/25) for more information.}

\item{maxZoom}{Numeric. A maximum bound on the zoom level of the graph. The viewport can not be
scaled larger than this zoom level.}

\item{minZoom}{Numeric. A minimum bound on the zoom level of the graph. The viewport can not be
scaled smaller than this zoom level.}

\item{mouseoverEdgeData}{Named list. The data dictionary of an edge returned when you hover over it. Read-only.}

\item{mouseoverNodeData}{Named list. The data dictionary of a node returned when you hover over it. Read-only.}

\item{pan}{Lists containing elements 'x', 'y'.
those elements have the following types:
  - x (numeric; optional): the x-coordinate of the node
  - y (numeric; optional): the y-coordinate of the node. Dictionary indicating the initial panning position of the graph. The
following keys are accepted:}

\item{panningEnabled}{Logical. Whether panning the graph is enabled (i.e., the position of the graph is
mutable overall).}

\item{responsive}{Logical. Toggles intelligent responsive resize of Cytoscape graph with viewport size change}

\item{scrollZoom}{Numeric. значение зума при зумировании колесиком мыши}

\item{selectedEdgeData}{Unnamed list. The list of data dictionaries of all selected edges (e.g. using
Shift+Click to select multiple nodes, or Shift+Drag to use box selection). Read-only.}

\item{selectedNodeData}{Unnamed list. The list of data dictionaries of all selected nodes (e.g. using
Shift+Click to select multiple nodes, or Shift+Drag to use box selection). Read-only.}

\item{style}{Named list. Add inline styles to the root element.}

\item{stylesheet}{List of lists containing elements 'selector', 'style'.
those elements have the following types:
  - selector (character; required): which elements you are styling. generally, you select a group of elements (node, edges, both),
a class (that you declare in the element dictionary), or an element by id.
  - style (named list; required): what aspects of the elements you want to modify. this could be the size or
color of a node, the shape of an edge arrow, or many more.s. A list of dictionaries representing the styles of the elements.
Each dictionary requires the following keys: `selector` and `style`.

Both the [selector](https://js.cytoscape.org/#selectors) and
the [style](https://js.cytoscape.org/#style/node-body) are
exhaustively documented in the Cytoscape.js docs. Although methods such
as `cy.elements(...)` and `cy.filter(...)` are not available, the selector
string syntax stays the same.}

\item{tapEdge}{Lists containing elements 'isloop', 'issimple', 'midpoint', 'sourcedata', 'sourceendpoint', 'targetdata', 'targetendpoint', 'timestamp', 'classes', 'data', 'grabbable', 'group', 'locked', 'selectable', 'selected', 'style'.
those elements have the following types:
  - isloop (logical; optional): edge-specific item
  - issimple (logical; optional): edge-specific item
  - midpoint (named list; optional): edge-specific item
  - sourcedata (named list; optional): edge-specific item
  - sourceendpoint (named list; optional): edge-specific item
  - targetdata (named list; optional): edge-specific item
  - targetendpoint (named list; optional): edge-specific item
  - timestamp (numeric; optional): edge-specific item
  - classes (character; optional): general item (for all elements)
  - data (named list; optional): general item (for all elements)
  - grabbable (logical; optional): general item (for all elements)
  - group (character; optional): general item (for all elements)
  - locked (logical; optional): general item (for all elements)
  - selectable (logical; optional): general item (for all elements)
  - selected (logical; optional): general item (for all elements)
  - style (named list; optional): general item (for all elements). The complete edge dictionary returned when you tap or click it. Read-only.}

\item{tapEdgeData}{Named list. The data dictionary of an edge returned when you tap or click it. Read-only.}

\item{tapNode}{Lists containing elements 'edgesdata', 'renderedposition', 'timestamp', 'classes', 'data', 'grabbable', 'group', 'locked', 'position', 'selectable', 'selected', 'style', 'ancestorsdata', 'childrendata', 'descendantsdata', 'parentdata', 'siblingsdata', 'isparent', 'ischildless', 'ischild', 'isorphan', 'relativeposition'.
those elements have the following types:
  - edgesdata (unnamed list; optional): node specific item
  - renderedposition (named list; optional): node specific item
  - timestamp (numeric; optional): node specific item
  - classes (character; optional): general item (for all elements)
  - data (named list; optional): general item (for all elements)
  - grabbable (logical; optional): general item (for all elements)
  - group (character; optional): general item (for all elements)
  - locked (logical; optional): general item (for all elements)
  - position (named list; optional): general item (for all elements)
  - selectable (logical; optional): general item (for all elements)
  - selected (logical; optional): general item (for all elements)
  - style (named list; optional): general item (for all elements)
  - ancestorsdata (named list | unnamed list; optional): item for compound nodes
  - childrendata (named list | unnamed list; optional): item for compound nodes
  - descendantsdata (named list | unnamed list; optional): item for compound nodes
  - parentdata (named list | unnamed list; optional): item for compound nodes
  - siblingsdata (named list | unnamed list; optional): item for compound nodes
  - isparent (logical; optional): item for compound nodes
  - ischildless (logical; optional): item for compound nodes
  - ischild (logical; optional): item for compound nodes
  - isorphan (logical; optional): item for compound nodes
  - relativeposition (named list; optional): item for compound nodes. The complete node dictionary returned when you tap or click it. Read-only.}

\item{tapNodeData}{Named list. The data dictionary of a node returned when you tap or click it. Read-only.}

\item{tooltips}{List of lists containing elements 'id', 'cy_el_id', 'content', 'position', 'last_update_time'.
those elements have the following types:
  - id (character; optional): необязательный. идентификатор тултипа; при передаче пустого значения генерируется автоматически.
  - cy_el_id (character; optional): необязательный. идентификатор элемента графа, обязательно для создания привязанного тултипа.
  - content (character; optional): обязательный. содержимое тултипа. может содержать любой html. в случае передаче тега textarea,
при изменении текста в textarea или изменении размеров (ширины и высоты) textarea
будут изменяться и tooltip, и tooltipsdata.
  - position (optional): необязательный. позиция свободного тултипа в координатах cytoscape.
у привязанного тултипа такого поля нет.. position has the following type: lists containing elements 'x', 'y'.
those elements have the following types:
  - x (numeric; optional)
  - y (numeric; optional)
  - last_update_time (numeric; optional): время последнего обновления в unix формате.
игнорируется при попытки обновления этого свойства с бекенда.s. Содержит полную информацию о всех тултипах; список словарей.}

\item{tooltipsData}{List of lists containing elements 'event', 'data'.
those elements have the following types:
  - event (character; optional): информация о типе совершенного изменения. возможные значения: add, update, delete.
  - data (named list; optional): cодержит данные, описывающие тултип, имеет тот же формат, что и элемент списка tooltips.s. Перечень тултипов, данные которых изменились последний раз.
Можно использовать для обновления конкретных тултипов, а не передавать весь список, как в случае с tooltips.}

\item{userPanningEnabled}{Logical. Whether user events (e.g. dragging the graph background) are allowed to
pan the graph.}

\item{userZoomingEnabled}{Logical. Whether user events (e.g. dragging the graph background) are allowed
to pan the graph.}

\item{zoom}{Numeric. The initial zoom level of the graph. You can set `minZoom` and
`maxZoom` to set restrictions on the zoom level.}

\item{zoomingEnabled}{Logical. Whether zooming the graph is enabled (i.e., the zoom level of the graph
is mutable overall).}
}

\value{named list of JSON elements corresponding to React.js properties and their values}

