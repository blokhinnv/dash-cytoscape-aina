# AUTO GENERATED FILE - DO NOT EDIT

#' @export
'cyto'Cytoscape <- function(id=NULL, autoRefreshLayout=NULL, autolock=NULL, autoungrabify=NULL, autounselectify=NULL, boxSelectionEnabled=NULL, className=NULL, contextmenu=NULL, contextmenuData=NULL, degrees=NULL, dragNodeData=NULL, elements=NULL, extent=NULL, generateImage=NULL, grabNodeData=NULL, imageData=NULL, includeLoopInDegree=NULL, layout=NULL, maxZoom=NULL, minZoom=NULL, mouseoverEdgeData=NULL, mouseoverNodeData=NULL, pan=NULL, panningEnabled=NULL, responsive=NULL, scrollZoom=NULL, selectedEdgeData=NULL, selectedNodeData=NULL, style=NULL, stylesheet=NULL, tapEdge=NULL, tapEdgeData=NULL, tapNode=NULL, tapNodeData=NULL, tooltips=NULL, tooltipsData=NULL, userPanningEnabled=NULL, userZoomingEnabled=NULL, zoom=NULL, zoomingEnabled=NULL) {
    
    props <- list(id=id, autoRefreshLayout=autoRefreshLayout, autolock=autolock, autoungrabify=autoungrabify, autounselectify=autounselectify, boxSelectionEnabled=boxSelectionEnabled, className=className, contextmenu=contextmenu, contextmenuData=contextmenuData, degrees=degrees, dragNodeData=dragNodeData, elements=elements, extent=extent, generateImage=generateImage, grabNodeData=grabNodeData, imageData=imageData, includeLoopInDegree=includeLoopInDegree, layout=layout, maxZoom=maxZoom, minZoom=minZoom, mouseoverEdgeData=mouseoverEdgeData, mouseoverNodeData=mouseoverNodeData, pan=pan, panningEnabled=panningEnabled, responsive=responsive, scrollZoom=scrollZoom, selectedEdgeData=selectedEdgeData, selectedNodeData=selectedNodeData, style=style, stylesheet=stylesheet, tapEdge=tapEdge, tapEdgeData=tapEdgeData, tapNode=tapNode, tapNodeData=tapNodeData, tooltips=tooltips, tooltipsData=tooltipsData, userPanningEnabled=userPanningEnabled, userZoomingEnabled=userZoomingEnabled, zoom=zoom, zoomingEnabled=zoomingEnabled)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'Cytoscape',
        namespace = 'dash_cytoscape',
        propNames = c('id', 'autoRefreshLayout', 'autolock', 'autoungrabify', 'autounselectify', 'boxSelectionEnabled', 'className', 'contextmenu', 'contextmenuData', 'degrees', 'dragNodeData', 'elements', 'extent', 'generateImage', 'grabNodeData', 'imageData', 'includeLoopInDegree', 'layout', 'maxZoom', 'minZoom', 'mouseoverEdgeData', 'mouseoverNodeData', 'pan', 'panningEnabled', 'responsive', 'scrollZoom', 'selectedEdgeData', 'selectedNodeData', 'style', 'stylesheet', 'tapEdge', 'tapEdgeData', 'tapNode', 'tapNodeData', 'tooltips', 'tooltipsData', 'userPanningEnabled', 'userZoomingEnabled', 'zoom', 'zoomingEnabled'),
        package = 'dashCytoscape'
        )

    structure(component, class = c('dash_component', 'list'))
}
