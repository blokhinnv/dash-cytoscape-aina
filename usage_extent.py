import json

import dash
import dash_cytoscape as cyto
import dash_html_components as html
from dash import Input, Output, State

app = dash.Dash(__name__)
server = app.server

print(cyto.__file__)

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
    State("cytoscape", "extent"),
    State("cytoscape", "elements"),
)
def update_info(x, extent, elements):
    return json.dumps(
        {
            "extent": extent,
            "elements": {
                e["data"]["label"]: e["position"]
                for e in elements
                if "source" not in e["data"]
            },
        },
        indent=2,
        ensure_ascii=False,
    )


if __name__ == "__main__":
    app.run_server(debug=True)
