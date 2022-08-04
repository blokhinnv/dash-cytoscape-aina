import undo_redo_list
import dash
from dash.dependencies import Input, Output
import dash_html_components as html

app = dash.Dash(__name__)
_options = [
    {
      "label": "Stylesheet changed",
      "value": "option_1"
    },
    {
      "label": "Coordiantes are changed",
      "value": "option_2"
    },
    {
      "label": "Layout was changed",
      "value": "option_3"
    },
    {
      "label": "Coordiantes are changed",
      "value": "option_4"
    },
    {
      "label": "Coordiantes are changed",
      "value": "option_5"
    },
    {
      "label": "Stylesheet changed",
      "value": "option_6"
    },
    {
      "label": "Nodes were selected from table",
      "value": "option_7"
    }
];
actions = [item['label'] for item in _options]

app.layout = html.Div([
    undo_redo_list.UndoRedoList(
        id='undoredo_list',
        actions=actions
    ),
    html.Div(id='output'),
    html.Button(id='btn')
])


@app.callback(Output('output', 'children'), 
             [Input('undoredo_list', 'undo_index')],
             prevent_initial_call=True)
def display_output(undo_index):
    return f'{undo_index}'


@app.callback(Output('undoredo_list', 'actions'), 
             [Input('btn', 'n_clicks')],
             prevent_initial_call=True)
def edit_actions(btn):
    return ['Действие 1', 'Действие 2']


if __name__ == '__main__':
    app.run_server(debug=True)
