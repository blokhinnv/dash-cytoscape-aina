import json

import dash
import dash_cytoscape as cyto
import dash_html_components as html
from dash import Input, Output, State

app = dash.Dash(__name__)
server = app.server

app.layout = html.Div(
    [
        cyto.Cytoscape(
            id="cytoscape",
            elements=[
                {
                    "data": {"id": "one", "label": "Node 1"},
                    "position": {"x": 50, "y": 50},
                },
                {
                    "data": {"id": "two", "label": "Node 2"},
                    "position": {"x": 200, "y": 200},
                },
                {"data": {"source": "one", "target": "two", "label": "1 to 2"}},
            ],
            layout={"name": "preset"},
            includeLoopInDegree=True,
        ),
        html.Button("update info", id="update_info_btn"),
        html.Button("change graph", id="add_node_btn"),
        html.Pre(id="degrees_div", style={"fontSize": "20px"}),
    ]
)


@app.callback(
    Output("degrees_div", "children"),
    Input("update_info_btn", "n_clicks"),
    State("cytoscape", "layout"),
    State("cytoscape", "degrees"),
)
def update_info(x, layout, degrees):
    return json.dumps(degrees, indent=2, ensure_ascii=False)


@app.callback(
    Output("cytoscape", "elements"),
    Input("add_node_btn", "n_clicks"),
    State("cytoscape", "elements"),
    prevent_initial_call=True,
)
def add_node(x, elements):
    match x:
        case 1:
            elements.extend(
                [
                    {
                        "data": {"id": "three", "label": "Node 3"},
                        "position": {"x": 50, "y": 200},
                    },
                    {"data": {"source": "one", "target": "three", "label": "1 to 3"}},
                ]
            )
        case 2:
            del elements[1:3]
        case 3:
            del elements[-1]
        case 4:
            elements.append({"data": {"source": "one", "target": "one", "label": "1 to 1"}},)
        case _:
            pass
    return elements



if __name__ == "__main__":
    app.run_server(debug=True)
