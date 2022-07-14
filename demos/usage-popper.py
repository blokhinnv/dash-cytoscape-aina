import dash
from dash.dependencies import Input, Output
from dash import html
import dash_cytoscape as cyto

cyto.load_extra_layouts()

app = dash.Dash(__name__)
server = app.server

elements = [
    {"data": {"id": "j", "name": "Node1", "tooltip": "Node 1"}},
    {
        "data": {
            "id": "e",
            "name": "Node2",
            "tooltip": "<table><thead><tr><th>Заголовок 1</th><th>Заголовок 2</th></tr></thead><tbody><tr><td>Строка 1. Ячейка 1.</td><td>Строка 1. Ячейка 2.</td></tr><tr><td>Строка 2. Ячейка 1.</td><td>Строка 2. Ячейка 2.</td></tr></tbody></table>",
        }
    },
    {"data": {"id": "k", "name": "Node3", "tooltip_fixed": "Node 3 (fixed)"}},
    {"data": {"id": "g", "name": "Node4", "tooltip": "Node 4", "tooltip_fixed": "Node 4 (fixed)"}},
    {"data": {"source": "j", "target": "e", "tooltip": "Edge 1", "tooltip_fixed":"Fixed tooltip for edge 1"}},
    {"data": {"source": "j", "target": "k", "tooltip": "Edge 2"}},
    {"data": {"source": "j", "target": "g", "tooltip": "Edge 3"}},
    {"data": {"source": "e", "target": "j", "tooltip": "Edge 4"}},
    {"data": {"source": "e", "target": "k", "tooltip": "Edge 5"}},
    {"data": {"source": "k", "target": "j", "tooltip": "Edge 6"}},
    {"data": {"source": "k", "target": "e", "tooltip": "Edge 7"}},
    {"data": {"source": "k", "target": "g", "tooltip": "Edge 8"}},
    {"data": {"source": "g", "target": "j", "tooltip": "Edge 9"}},
]

# App
app.layout = html.Div(
    [
        html.Div(
            id="output-div",
            style={
                "position": "absolute",
                "display": "flex",
                "alignItems": "center",
                "zIndex": "10",
            },
            children=[
                html.Button("Обновить элементы графа", id="update-button"),
            ],
        ),
        cyto.Cytoscape(
            id="cytoscape",
            boxSelectionEnabled=False,
            autounselectify=True,
            elements=elements,
            layout={"name": "grid", "padding": 10},
            stylesheet=[
                {
                    "selector": "node",
                    "style": {
                        "content": "data(name)",
                        "text-valign": "center",
                        "color": "white",
                        "text-outline-width": 2,
                        "background-color": "#999",
                        "text-outline-color": "#999",
                    },
                },
                {
                    "selector": "edge",
                    "style": {
                        "curve-style": "bezier",
                        "target-arrow-shape": "triangle",
                        "target-arrow-color": "#ccc",
                        "line-color": "#ccc",
                        "width": 1,
                    },
                },
                {
                    "selector": ":selected",
                    "style": {
                        "background-color": "black",
                        "line-color": "black",
                        "target-arrow-color": "black",
                        "source-arrow-color": "black",
                    },
                },
                {
                    "selector": "edge.questionable",
                    "style": {"line-style": "dotted", "target-arrow-shape": "diamond"},
                },
                {"selector": ".faded", "style": {"opacity": 0.25, "text-opacity": 0}},
            ],
            style={
                "width": "100%",
                "height": "100%",
                "position": "absolute",
                "left": 0,
                "top": 0,
            },
        ),
    ]
)


@app.callback(
    Output("cytoscape", "elements"),
    Input("update-button", "n_clicks"),
    prevent_initial_call=True,
)
def update_elements(n_clicks):
    if n_clicks:
        return [
            {"data": {"id": "j", "name": "Node1", "tooltip": "Node 1"}},
            {
                "data": {
                    "id": "e",
                    "name": "Node2",
                    "tooltip": "<table><thead><tr><th>Заголовок 1</th><th>Заголовок 2</th></tr></thead><tbody><tr><td>Строка 1. Ячейка 1.</td><td>Строка 1. Ячейка 2.</td></tr><tr><td>Строка 2. Ячейка 1.</td><td>Строка 2. Ячейка 2.</td></tr></tbody></table>",
                }
            },
            {"data": {"id": "k", "name": "Node3", "tooltip": "Node 3 (new tooltip)", "tooltip_fixed": ""}},
            {"data": {"id": "g", "name": "Node4", "tooltip": "Node 4", "tooltip_fixed": "Node 4 (fixed) (new)"}},
            {"data": {"id": "m", "name": "Node5", "tooltip": "Node 5 (new element)", "tooltip_fixed":"Fixed tooltip for node 5"}},
            {"data": {"source": "j", "target": "e", "tooltip": "Edge 1", "tooltip_fixed":"Updated fixed tooltip for edge 1"}},
            {"data": {"source": "j", "target": "k", "tooltip": "Edge 2"}},
            {"data": {"source": "j", "target": "g", "tooltip": "Edge 3"}},
            {"data": {"source": "e", "target": "j", "tooltip": "Edge 4"}},
            {"data": {"source": "e", "target": "k", "tooltip": "Edge 5"}},
            {"data": {"source": "k", "target": "j", "tooltip": "Edge 6"}},
            {"data": {"source": "k", "target": "e", "tooltip": "Edge 7"}},
            {"data": {"source": "k", "target": "g", "tooltip": "Edge 8"}},
            {"data": {"source": "g", "target": "j", "tooltip": "Edge 9", "tooltip_fixed": "Edge 9 (fixed)"}},
            {"data": {"source": "k", "target": "m", "tooltip": "Edge 10 (new element)"}},
        ]
    return []


if __name__ == "__main__":
    app.run_server(debug=True)
