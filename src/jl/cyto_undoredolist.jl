# AUTO GENERATED FILE - DO NOT EDIT

export cyto_undoredolist

"""
    cyto_undoredolist(;kwargs...)

An UndoRedoList component.
The component is showing list of items. 
Elements above hover are highlighted too.
Expected usage is for undo/redo list demonstration.
Keyword arguments:
- `id` (String; optional): The ID used to identify this component in Dash callbacks.
- `actions` (Array of Strings; optional): An array of history actions
- `undo_index` (Real; optional): Index of event, start of which we will undo
"""
function cyto_undoredolist(; kwargs...)
        available_props = Symbol[:id, :actions, :undo_index]
        wild_props = Symbol[]
        return Component("cyto_undoredolist", "UndoRedoList", "dash_cytoscape", available_props, wild_props; kwargs...)
end

