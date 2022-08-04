# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class UndoRedoList(Component):
    """An UndoRedoList component.
The component is showing list of items. 
Elements above hover are highlighted too.
Expected usage is for undo/redo list demonstration.

Keyword arguments:

- id (string; optional):
    The ID used to identify this component in Dash callbacks.

- actions (list of strings; optional):
    An array of history actions.

- undo_index (number; default undefined):
    Index of event, start of which we will undo."""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'dash_cytoscape'
    _type = 'UndoRedoList'
    @_explicitize_args
    def __init__(self, id=Component.UNDEFINED, actions=Component.UNDEFINED, undo_index=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'actions', 'undo_index']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'actions', 'undo_index']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}
        for k in []:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(UndoRedoList, self).__init__(**args)
