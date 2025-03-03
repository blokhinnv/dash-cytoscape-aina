# AUTO GENERATED FILE - DO NOT EDIT

export 'cyto'_cytoscape

"""
    'cyto'_cytoscape(;kwargs...)

A Cytoscape component.
A Component Library for Dash aimed at facilitating network visualization in
Python, wrapped around [Cytoscape.js](http://js.cytoscape.org/).
Keyword arguments:
- `id` (String; optional): The ID used to identify this component in Dash callbacks.
- `autoRefreshLayout` (Bool; optional): Whether the layout should be refreshed when elements are added or removed.
- `autolock` (Bool; optional): Whether nodes should be locked (not draggable at all) by default
(if true, overrides individual node state).
- `autoungrabify` (Bool; optional): Whether nodes should be ungrabified (not grabbable by user) by
default (if true, overrides individual node state).
- `autounselectify` (Bool; optional): Whether nodes should be unselectified (immutable selection state) by
default (if true, overrides individual element state).
- `boxSelectionEnabled` (Bool; optional): Whether box selection (i.e. drag a box overlay around, and release it
to select) is enabled. If enabled, the user must taphold to pan the graph.
- `className` (String; optional): Sets the class name of the element (the value of an element's html
class attribute).
- `contextmenu` (optional): Displays a context menu on right click. Requires extra layouts loaded.
Accepts a list of dictionaries, each of which describes a context
menu option. Options are rendered in the order presented.. contextmenu has the following type: Array of lists containing elements 'id', 'selector', 'content', 'tooltipText', 'disabled'.
Those elements have the following types:
  - `id` (String; optional): ID associated with option.
  - `selector` (String; optional): Determines which Cytoscape elements the option is attached to. Takes in a Cytoscape selector
(see Cytoscape documentation for more information). Examples of valid selectors include node,
edge, and core.
  - `content` (String; optional): Label assigned to option.
  - `tooltipText` (String; optional): Hover tooltip text assigned to option.
  - `disabled` (Bool; optional): Toggles option disabled (greyed out).s
- `contextmenuData` (optional): Dictionary returned when a context menu option is selected. Read-only.. contextmenuData has the following type: lists containing elements 'id', 'position', 'timestamp', 'target', 'coordinates'.
Those elements have the following types:
  - `id` (String; optional): ID associated with option selected.
  - `position` (optional): Position associated with option selected.. position has the following type: lists containing elements 'x', 'y'.
Those elements have the following types:
  - `x` (Real; optional)
  - `y` (Real; optional)
  - `timestamp` (Real; optional): Time the option was selected.
  - `target` (Dict; optional): Dictionary containing information about the selected item. Information provided varies depending
on the type of the selected item (node, edge, core, etc.).
  - `coordinates` (Array of Reals; optional): Array containing latitude and longitude where context menu was opened if leaflet is enabled.
- `degrees` (Dict; optional): Объект со степенями узлов. Ключ - ID узла, значение - разные типы степеней (degree, in\out\total degree).
- `dragNodeData` (Array; optional): drag - схватили и перетаскиваем
- `elements` (optional): A list of dictionaries representing the elements of the networks. Each dictionary describes an element, and
specifies its purpose. The [official Cytoscape.js documentation](https://js.cytoscape.org/#notation/elements-json)
offers an extensive overview and examples of element declaration.
Alternatively, a dictionary with the format { 'nodes': [], 'edges': [] } is allowed at initialization,
but arrays remain the recommended format.. elements has the following type: Array of lists containing elements 'group', 'data', 'position', 'selected', 'selectable', 'locked', 'grabbable', 'classes'.
Those elements have the following types:
  - `group` (String; optional): Either 'nodes' or 'edges'. If not given, it's automatically inferred.
  - `data` (optional): Element specific data.. data has the following type: lists containing elements 'id', 'label', 'parent', 'source', 'target'.
Those elements have the following types:
  - `id` (String; optional): Reference to the element, useful for selectors and edges. Randomly assigned if not given.
  - `label` (String; optional): Optional name for the element, useful when `data(label)` is given to a style's `content`
or `label`. It is only a convention.
  - `parent` (String; optional): Only for nodes. Optional reference to another node. Needed to create compound nodes.
  - `source` (String; optional): Only for edges. The id of the source node, which is where the edge starts.
  - `target` (String; optional): Only for edges. The id of the target node, where the edge ends.
  - `position` (optional): Only for nodes. The position of the node.. position has the following type: lists containing elements 'x', 'y'.
Those elements have the following types:
  - `x` (Real; optional): The x-coordinate of the node.
  - `y` (Real; optional): The y-coordinate of the node.
  - `selected` (Bool; optional): If the element is selected upon initialisation.
  - `selectable` (Bool; optional): If the element can be selected.
  - `locked` (Bool; optional): Only for nodes. If the position is immutable.
  - `grabbable` (Bool; optional): Only for nodes. If the node can be grabbed and moved by the user.
  - `classes` (String; optional): Space separated string of class names of the element. Those classes can be selected
by a style selector.s | lists containing elements 'nodes', 'edges'.
Those elements have the following types:
  - `nodes` (Array; optional)
  - `edges` (Array; optional)
- `extent` (optional): extent of the viewport, a bounding box in model co-ordinates 
that lets you know what model positions are visible in the viewport.. extent has the following type: lists containing elements 'x1', 'x2', 'y1', 'y2', 'w', 'h'.
Those elements have the following types:
  - `x1` (Real; optional)
  - `x2` (Real; optional)
  - `y1` (Real; optional)
  - `y2` (Real; optional)
  - `w` (Real; optional)
  - `h` (Real; optional)
- `generateImage` (optional): Dictionary specifying options to generate an image of the current cytoscape graph.
Value is cleared after data is received and image is generated. This property will
be ignored on the initial creation of the cytoscape object and must be invoked through
a callback after it has been rendered.

If the app does not need the image data server side and/or it will only be used to download
the image, it may be prudent to invoke `'download'` for `action` instead of
`'store'` to improve performance by preventing transfer of data to the server.. generateImage has the following type: lists containing elements 'type', 'options', 'action', 'filename'.
Those elements have the following types:
  - `type` (a value equal to: 'svg', 'png', 'jpg', 'jpeg'; optional): File type to output
  - `options` (Dict; optional): Dictionary of options to cy.png() / cy.jpg() or cy.svg() for image generation.
See https://js.cytoscape.org/#core/export for details. For `'output'`, only 'base64'
and 'base64uri' are supported. Default: `{'output': 'base64uri'}`.
  - `action` (a value equal to: 'store', 'download', 'both'; optional): `'store'`: Stores the image data (only jpg and png are supported)
in `imageData` and invokes server-side Dash callbacks. `'download'`: Downloads the image
as a file with all data handling done client-side. No `imageData` callbacks are fired.
`'both'`: Stores image data and downloads image as file. The default is `'store'`
  - `filename` (String; optional): Name for the file to be downloaded. Default: 'cyto'.
- `grabNodeData` (Array; optional): grab - только схватили
- `imageData` (String; optional): String representation of the image requested with generateImage. Null if no
image was requested yet or the previous request failed. Read-only.
- `includeLoopInDegree` (Bool; optional): Если true, то петли учитываются при подсчете степеней.
- `layout` (optional): A dictionary specifying how to set the position of the elements in your
graph. The `'name'` key is required, and indicates which layout (algorithm) to
use. The keys accepted by `layout` vary depending on the algorithm, but these
keys are accepted by all layouts: `fit`,  `padding`, `animate`, `animationDuration`,
`boundingBox`.

 The complete list of layouts and their accepted options are available on the
 [Cytoscape.js docs](https://js.cytoscape.org/#layouts) . For the external layouts,
the options are listed in the "API" section of the  README.
 Note that certain keys are not supported in Dash since the value is a JavaScript
 function or a callback. Please visit this
[issue](https://github.com/plotly/dash-cytoscape/issues/25) for more information.. layout has the following type: lists containing elements 'name', 'fit', 'padding', 'animate', 'animationDuration', 'boundingBox'.
Those elements have the following types:
  - `name` (a value equal to: 'random', 'preset', 'circle', 'concentric', 'grid', 'breadthfirst', 'cose', 'cose-bilkent', 'fcose', 'cola', 'euler', 'spread', 'dagre', 'klay'; required): The layouts available by default are:
  `random`: Randomly assigns positions.
  `preset`: Assigns position based on the `position` key in element dictionaries.
  `circle`: Single-level circle, with optional radius.
  `concentric`: Multi-level circle, with optional radius.
  `grid`: Square grid, optionally with numbers of `rows` and `cols`.
  `breadthfirst`: Tree structure built using BFS, with optional `roots`.
  `cose`: Force-directed physics simulation.

Some external layouts are also included. To use them, run
  `dash_cytoscape.load_extra_layouts()` before creating your Dash app. Be careful about
  using the extra layouts when not necessary, since they require supplementary bandwidth
  for loading, which impacts the startup time of the app.
  The external layouts are:
  [cose-bilkent](https://github.com/cytoscape/cytoscape.js-cose-bilkent),
  [fcose](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose),
  [cola](https://github.com/cytoscape/cytoscape.js-cola),
  [euler](https://github.com/cytoscape/cytoscape.js-dagre),
  [spread](https://github.com/cytoscape/cytoscape.js-spread),
  [dagre](https://github.com/cytoscape/cytoscape.js-dagre),
  [klay](https://github.com/cytoscape/cytoscape.js-klay),
  - `fit` (Bool; optional): Whether to render the nodes in order to fit the canvas.
  - `padding` (Real; optional): Padding around the sides of the canvas, if fit is enabled.
  - `animate` (Bool; optional): Whether to animate change in position when the layout changes.
  - `animationDuration` (Real; optional): Duration of animation in milliseconds, if enabled.
  - `boundingBox` (Dict; optional): How to constrain the layout in a specific area. Keys accepted are either
`x1, y1, x2, y2` or `x1, y1, w, h`, all of which receive a pixel value.
- `maxZoom` (Real; optional): A maximum bound on the zoom level of the graph. The viewport can not be
scaled larger than this zoom level.
- `minZoom` (Real; optional): A minimum bound on the zoom level of the graph. The viewport can not be
scaled smaller than this zoom level.
- `mouseoverEdgeData` (Dict; optional): The data dictionary of an edge returned when you hover over it. Read-only.
- `mouseoverNodeData` (Dict; optional): The data dictionary of a node returned when you hover over it. Read-only.
- `pan` (optional): Dictionary indicating the initial panning position of the graph. The
following keys are accepted:. pan has the following type: lists containing elements 'x', 'y'.
Those elements have the following types:
  - `x` (Real; optional): The x-coordinate of the node
  - `y` (Real; optional): The y-coordinate of the node
- `panningEnabled` (Bool; optional): Whether panning the graph is enabled (i.e., the position of the graph is
mutable overall).
- `responsive` (Bool; optional): Toggles intelligent responsive resize of Cytoscape graph with viewport size change
- `scrollZoom` (Real; optional): значение зума при зумировании колесиком мыши
- `selectedEdgeData` (Array; optional): The list of data dictionaries of all selected edges (e.g. using
Shift+Click to select multiple nodes, or Shift+Drag to use box selection). Read-only.
- `selectedNodeData` (Array; optional): The list of data dictionaries of all selected nodes (e.g. using
Shift+Click to select multiple nodes, or Shift+Drag to use box selection). Read-only.
- `style` (Dict; optional): Add inline styles to the root element.
- `stylesheet` (optional): A list of dictionaries representing the styles of the elements.
Each dictionary requires the following keys: `selector` and `style`.

Both the [selector](https://js.cytoscape.org/#selectors) and
the [style](https://js.cytoscape.org/#style/node-body) are
exhaustively documented in the Cytoscape.js docs. Although methods such
as `cy.elements(...)` and `cy.filter(...)` are not available, the selector
string syntax stays the same.. stylesheet has the following type: Array of lists containing elements 'selector', 'style'.
Those elements have the following types:
  - `selector` (String; required): Which elements you are styling. Generally, you select a group of elements (node, edges, both),
a class (that you declare in the element dictionary), or an element by ID.
  - `style` (Dict; required): What aspects of the elements you want to modify. This could be the size or
color of a node, the shape of an edge arrow, or many more.s
- `tapEdge` (optional): The complete edge dictionary returned when you tap or click it. Read-only.. tapEdge has the following type: lists containing elements 'isLoop', 'isSimple', 'midpoint', 'sourceData', 'sourceEndpoint', 'targetData', 'targetEndpoint', 'timeStamp', 'classes', 'data', 'grabbable', 'group', 'locked', 'selectable', 'selected', 'style'.
Those elements have the following types:
  - `isLoop` (Bool; optional): Edge-specific item
  - `isSimple` (Bool; optional): Edge-specific item
  - `midpoint` (Dict; optional): Edge-specific item
  - `sourceData` (Dict; optional): Edge-specific item
  - `sourceEndpoint` (Dict; optional): Edge-specific item
  - `targetData` (Dict; optional): Edge-specific item
  - `targetEndpoint` (Dict; optional): Edge-specific item
  - `timeStamp` (Real; optional): Edge-specific item
  - `classes` (String; optional): General item (for all elements)
  - `data` (Dict; optional): General item (for all elements)
  - `grabbable` (Bool; optional): General item (for all elements)
  - `group` (String; optional): General item (for all elements)
  - `locked` (Bool; optional): General item (for all elements)
  - `selectable` (Bool; optional): General item (for all elements)
  - `selected` (Bool; optional): General item (for all elements)
  - `style` (Dict; optional): General item (for all elements)
- `tapEdgeData` (Dict; optional): The data dictionary of an edge returned when you tap or click it. Read-only.
- `tapNode` (optional): The complete node dictionary returned when you tap or click it. Read-only.. tapNode has the following type: lists containing elements 'edgesData', 'renderedPosition', 'timeStamp', 'classes', 'data', 'grabbable', 'group', 'locked', 'position', 'selectable', 'selected', 'style', 'ancestorsData', 'childrenData', 'descendantsData', 'parentData', 'siblingsData', 'isParent', 'isChildless', 'isChild', 'isOrphan', 'relativePosition'.
Those elements have the following types:
  - `edgesData` (Array; optional): node specific item
  - `renderedPosition` (Dict; optional): node specific item
  - `timeStamp` (Real; optional): node specific item
  - `classes` (String; optional): General item (for all elements)
  - `data` (Dict; optional): General item (for all elements)
  - `grabbable` (Bool; optional): General item (for all elements)
  - `group` (String; optional): General item (for all elements)
  - `locked` (Bool; optional): General item (for all elements)
  - `position` (Dict; optional): General item (for all elements)
  - `selectable` (Bool; optional): General item (for all elements)
  - `selected` (Bool; optional): General item (for all elements)
  - `style` (Dict; optional): General item (for all elements)
  - `ancestorsData` (Dict | Array; optional): Item for compound nodes
  - `childrenData` (Dict | Array; optional): Item for compound nodes
  - `descendantsData` (Dict | Array; optional): Item for compound nodes
  - `parentData` (Dict | Array; optional): Item for compound nodes
  - `siblingsData` (Dict | Array; optional): Item for compound nodes
  - `isParent` (Bool; optional): Item for compound nodes
  - `isChildless` (Bool; optional): Item for compound nodes
  - `isChild` (Bool; optional): Item for compound nodes
  - `isOrphan` (Bool; optional): Item for compound nodes
  - `relativePosition` (Dict; optional): Item for compound nodes
- `tapNodeData` (Dict; optional): The data dictionary of a node returned when you tap or click it. Read-only.
- `tooltips` (optional): Содержит полную информацию о всех тултипах; список словарей.. tooltips has the following type: Array of lists containing elements 'id', 'cy_el_id', 'content', 'position', 'last_update_time'.
Those elements have the following types:
  - `id` (String; optional): Необязательный. Идентификатор тултипа; при передаче пустого значения генерируется автоматически.
  - `cy_el_id` (String; optional): Необязательный. Идентификатор элемента графа, обязательно для создания привязанного тултипа.
  - `content` (String; optional): Обязательный. Содержимое тултипа. Может содержать любой html. В случае передаче тега textarea,
при изменении текста в textarea или изменении размеров (ширины и высоты) textarea
будут изменяться и tooltip, и tooltipsData.
  - `position` (optional): Необязательный. Позиция свободного тултипа в координатах cytoscape.
У привязанного тултипа такого поля нет.. position has the following type: lists containing elements 'x', 'y'.
Those elements have the following types:
  - `x` (Real; optional)
  - `y` (Real; optional)
  - `last_update_time` (Real; optional): Время последнего обновления в unix формате.
Игнорируется при попытки обновления этого свойства с бекенда.s
- `tooltipsData` (optional): Перечень тултипов, данные которых изменились последний раз.
Можно использовать для обновления конкретных тултипов, а не передавать весь список, как в случае с tooltips.. tooltipsData has the following type: Array of lists containing elements 'event', 'data'.
Those elements have the following types:
  - `event` (String; optional): Информация о типе совершенного изменения. Возможные значения: add, update, delete.
  - `data` (Dict; optional): Cодержит данные, описывающие тултип, имеет тот же формат, что и элемент списка tooltips.s
- `userPanningEnabled` (Bool; optional): Whether user events (e.g. dragging the graph background) are allowed to
pan the graph.
- `userZoomingEnabled` (Bool; optional): Whether user events (e.g. dragging the graph background) are allowed
to pan the graph.
- `zoom` (Real; optional): The initial zoom level of the graph. You can set `minZoom` and
`maxZoom` to set restrictions on the zoom level.
- `zoomingEnabled` (Bool; optional): Whether zooming the graph is enabled (i.e., the zoom level of the graph
is mutable overall).
"""
function 'cyto'_cytoscape(; kwargs...)
        available_props = Symbol[:id, :autoRefreshLayout, :autolock, :autoungrabify, :autounselectify, :boxSelectionEnabled, :className, :contextmenu, :contextmenuData, :degrees, :dragNodeData, :elements, :extent, :generateImage, :grabNodeData, :imageData, :includeLoopInDegree, :layout, :maxZoom, :minZoom, :mouseoverEdgeData, :mouseoverNodeData, :pan, :panningEnabled, :responsive, :scrollZoom, :selectedEdgeData, :selectedNodeData, :style, :stylesheet, :tapEdge, :tapEdgeData, :tapNode, :tapNodeData, :tooltips, :tooltipsData, :userPanningEnabled, :userZoomingEnabled, :zoom, :zoomingEnabled]
        wild_props = Symbol[]
        return Component("'cyto'_cytoscape", "Cytoscape", "dash_cytoscape", available_props, wild_props; kwargs...)
end

