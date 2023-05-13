# AUTO GENERATED FILE - DO NOT EDIT

export 'cyto'_undoredolist

"""
    'cyto'_undoredolist(;kwargs...)

An UndoRedoList component.
The component is showing list of items. 
Elements above hover are highlighted too.
Expected usage is for undo/redo list demonstration.
Keyword arguments:
- `id` (String; optional): The ID used to identify this component in Dash callbacks.
- `actions` (Array of Strings; optional): An array of history actions
- `n_clicks` (Real; optional): Amount of clicks on the list
- `n_clicks_timestamp` (Real; optional): Time of click on the list
- `undo_index` (Real; optional): Index of event, start of which we will undo
"""
function 'cyto'_undoredolist(; kwargs...)
        available_props = Symbol[:id, :actions, :n_clicks, :n_clicks_timestamp, :undo_index]
        wild_props = Symbol[]
        return Component("'cyto'_undoredolist", "UndoRedoList", "dash_cytoscape", available_props, wild_props; kwargs...)
end

