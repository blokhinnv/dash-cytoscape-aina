"""
Original Demo: http://js.cytoscape.org/demos/labels/

Note: This example is broken because layout takes a function as input:
```
  layout: {
    name: 'grid',
    cols: 4,
    sort: function( a, b ){
      if( a.id() < b.id() ){
        return -1;
      } else if( a.id() > b.id() ){
        return 1;
      } else {
        return 0;
      }
    }
  },
```
"""
import json
import dash
from dash import html
import dash_cytoscape as cyto

app = dash.Dash(__name__)
server = app.server

app.scripts.config.serve_locally = True
app.css.config.serve_locally = True
cyto.load_extra_layouts()
elements = [
    {'data': {'extra': {'mark_desc': 'first'}}, 'classes': 'marked1'},
    {'data': {'extra': {'mark_desc': 'second'}}, 'classes': 'marked2'},
    {'data': {'extra': {'mark_desc': 'third'}}, 'classes': 'marked3'},

    {'data': {'extra': {'mark_desc': 'second'}}, 'classes': 'marked2'},
    {'data': {'extra': {'mark_desc': 'first'}}, 'classes': 'marked1'},
    {'data': {'extra': {'mark_desc': '44'}}, 'classes': 'marked44'},
]

# App
app.layout = html.Div([
    cyto.Cytoscape(
        id='cytoscape',
        boxSelectionEnabled=False,
        autounselectify=True,
        elements=elements,
        layout={"name": "random", "padding": 10},
        style={
            'width': '100%',
            'height': '100%',
            'position': 'absolute',
            'left': 0,
            'top': 0,
            'bottom': 0,
            'right': 0,
            'z-index': 999
        }
    )
])

if __name__ == '__main__':
    app.run_server(debug=True)
