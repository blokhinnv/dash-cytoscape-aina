# AUTO GENERATED FILE - DO NOT EDIT

#' @export
cytoUndoRedoList <- function(id=NULL, actions=NULL, undo_index=NULL) {
    
    props <- list(id=id, actions=actions, undo_index=undo_index)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'UndoRedoList',
        namespace = 'dash_cytoscape',
        propNames = c('id', 'actions', 'undo_index'),
        package = 'dashCytoscape'
        )

    structure(component, class = c('dash_component', 'list'))
}
