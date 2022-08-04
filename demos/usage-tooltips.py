import dash
from dash.dependencies import Input, Output
from dash import html
import dash_cytoscape as cyto
import time

cyto.load_extra_layouts()

app = dash.Dash(__name__)
server = app.server

elements = [
    {"data": {"id": "node1", "name": "Node1"}},
    {"data": {"id": "node2", "name": "Node2"}},
    {"data": {"id": "node3", "name": "Node3"}},
    {"data": {"id": "node4", "name": "Node4"}},
    {
        "data": {
            "source": "node1",
            "target": "node2",
        }
    },
    {"data": {"source": "node1", "target": "node3"}},
    {"data": {"source": "node1", "target": "node4"}},
    {"data": {"source": "node2", "target": "node1"}},
]

# App
app.layout = html.Div(
    [
        html.Div(
            id="output-div",
            style={
                "position": "absolute",
                "zIndex": "10",
            },
            children=[
                html.Button("Обновить тултип", id="update-desired-tooltip"),
                html.Br(),
                html.Br(),
                html.Div(id="desired-status-bar"),
                html.Br(),
                html.Button("Обновить все тултипы", id="update-all-tooltip"),
                html.Br(),
                html.Br(),
                html.Div(id="all-status-bar"),
            ],
        ),
        cyto.Cytoscape(
            id="cytoscape",
            boxSelectionEnabled=False,
            autounselectify=True,
            elements=elements,
            tooltips=[],
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
    Output("cytoscape", "tooltipsData"),
    Input("update-desired-tooltip", "n_clicks"),
    prevent_initial_call=True,
)
def update_elements(n_clicks):
    if n_clicks == 1:
        # добавили привязанный комментарий
        return [
            {
                "event": "add",
                "data": {
                    "cy_el_id": "node1",
                    "content": '<textarea spellcheck="false"></textarea>'
                }
            }
        ]
    elif n_clicks == 2:
        # обновили привязанный комментарий
        return [
            {
                "event": "update",
                "data": {
                    "cy_el_id": "node1",
                    "content": '<textarea spellcheck="false">12345</textarea>'
                }
            }
        ]
    elif n_clicks == 3:
        # удалили привязанный комментарий
        return [
            {
                "event": "remove",
                "data": {
                    "cy_el_id": "node1"
                }
            }
        ]
    elif n_clicks == 4:
        # добавили свободный комментарий
        return [
            {
                "event": "add",
                "data": {
                    "id": "test", # необязательный
                    "content": '<textarea spellcheck="false"></textarea><br>',
                    "position": {"x": 500, "y": 100}
                }
            }
        ]
    elif n_clicks == 5:
        # обновили свободный комментарий
        return [
            {
                "event": "update",
                "data": {
                    "id": "test",
                    "content": '<textarea spellcheck="false">44444444</textarea><br>',
                    "position": {"x": 500, "y": 300}
                }
            }
        ]
    elif n_clicks == 6:
        # удалили свободный комментарий
        return [
            {
                "event": "remove",
                "data": {
                    "id": "test"
                }
            }
        ]

    return []

@app.callback(
    Output("cytoscape", "tooltips"),
    Input("update-all-tooltip", "n_clicks"),
    prevent_initial_call=True,
)
def update_elements(n_clicks):
    if n_clicks == 1:
        return [
            {
                "cy_el_id": "node1",
                "content": '<textarea spellcheck="false">12345</textarea>'
            },
            {
                "cy_el_id": "node2",
                "content": '<textarea spellcheck="false">54321</textarea>'
            },
            {
                "id": "test2",
                "content": '<textarea spellcheck="false">54321</textarea>',
                "position": {'x': 500, 'y': 50}
            }
        ]
    return []


@app.callback(
    Output("desired-status-bar", "children"),
    Input("cytoscape", "tooltipsData"),
    prevent_initial_call=True,
)
def hangle_desired_tooltips(tooltipsDataEvent):
    print(tooltipsDataEvent)
    return 'Тултип обновился! (timestamp: ' + str(time.time()) + ')'

@app.callback(
    Output("all-status-bar", "children"),
    Input("cytoscape", "tooltipsData"),
    prevent_initial_call=True,
)
def hangle_all_tooltips(tooltipsDataEvent):
    print(tooltipsDataEvent)
    return 'Все тултипы обновились! (timestamp: ' + str(time.time()) + ')'

if __name__ == "__main__":
    app.run_server(debug=True)
