import dash
import dash_cytoscape as cyto
import dash_bootstrap_components as dbc # docs: https://dash-bootstrap-components.opensource.faculty.ai/docs/components/
from dash import Input, Output, dcc, html, callback_context

app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.LITERA]
)

@app.server.route('/assets/<path:path>')
def static_file(path):
    """
    Обеспечивает включение всех файлов из папки /public/assets/
    """
    static_folder = os.path.join(os.getcwd(), 'assets')
    return send_from_directory(static_folder, path)

navbar = dbc.Navbar(
    html.Div(
        [
            dbc.DropdownMenu(
                [
                    dbc.DropdownMenuItem("Заголовок", header=True),
                    dbc.DropdownMenuItem("Пункт меню"),
                    dbc.DropdownMenuItem(divider=True),
                    dbc.DropdownMenuItem("Активный и отключенный", header=True),
                    dbc.DropdownMenuItem("Активный элемент", active=True),
                    dbc.DropdownMenuItem("Отключенный элемент", disabled=True),
                    dbc.DropdownMenuItem(divider=True),
                    html.P(
                        "Текстовое содержимое",
                        className="text-muted px-4 mt-4",
                    ),
                ],
                label="Файл",
                caret=False
            ),
            dbc.DropdownMenu(
                [
                    dbc.DropdownMenuItem("Пункт меню"),
                ],
                label="Рабочее пространство",
                caret=False
            ),
            dbc.DropdownMenu(
                [
                    dbc.DropdownMenuItem("Пункт меню"),
                ],
                label="Инструменты",
                caret=False
            ),
            dbc.DropdownMenu(
                [
                    dbc.DropdownMenuItem("Пункт меню"),
                ],
                label="Окно",
                caret=False
            ),
            dbc.DropdownMenu(
                [
                    dbc.DropdownMenuItem("Пункт меню"),
                ],
                label="Справка",
                caret=False
            )
        ],
    ),
    id="navbar"
)

tabs = dbc.Navbar(
    dbc.Tabs(
        [
            dbc.Tab(label="Workspace 1", tab_id="workspace1"),
        ],
        id="tabs",
        active_tab="workspace1",
    ),
    id="tabsbar"
)

sidebar = html.Div(
    [
        dbc.Accordion(
            [
                dbc.AccordionItem(
                    [
                        html.P("Здесь содержимое панели фильтрации"),
                        dbc.Button("Фильтровать", id="filter-btn"),
                    ],
                    title="Панель фильтрации",
                    item_id="filter-panel",
                ),
                dbc.AccordionItem(
                    [
                        html.P("Здесь содержимое панели агрегации"),
                        dbc.Button("Агрегировать", id="aggregation-btn"),
                    ],
                    title="Панель агрегации",
                    item_id="aggregation-panel",
                ),
                dbc.AccordionItem(
                    [
                        html.P("Здесь содержимое панели лэйаута"),
                        dbc.Button("Применить лэйаут", id="layout-btn"),
                    ],
                    title="Панель лэйаута",
                    item_id="layout-panel",
                ),
                dbc.AccordionItem(
                    [
                        html.P("Здесь содержимое панели внешнего вида"),
                        dbc.Button("Применить", id="appearance-btn"),
                    ],
                    title="Панель внешнего вида",
                    item_id="appearance-panel",
                )
            ],
            id="sidebar",
            active_item="filter-panel",
            flush=True
        )
    ],
    className="col-3",
    id="sidebar_container",
)

content = html.Div(
    [
        html.Div(id="tab-content", style={'height': '100%'}),
    ],
    className='col-9',
)

statusbar = html.Div(
    [
        'Строка состояния'
    ],
    id="statusbar"
)

app.layout = html.Div(
    [
        navbar,
        tabs,
        html.Div(
            [
                sidebar,
                content
            ],
            className="row",
            id="content",
        ),
        statusbar
    ],
    id="main",
)

@app.callback(
    Output("tab-content", "children"),
    Input("tabs", "active_tab"),
)
def render_tab_content(active_tab):
    """
    Принимает идентификатор активной вкладки сверху и в зависимости от его значения отображает содержимое графа
    """
    if active_tab is not None:
        if active_tab == "workspace1":
            return cyto.Cytoscape(
                        id='cytoscape-two-nodes',
                        layout={'name': 'preset'},
                        style={'width': '100%', 'height': '100%'},
                        elements=[
                            {'data': {'id': 'one', 'label': 'Node 1'}, 'position': {'x': 75, 'y': 75}},
                            {'data': {'id': 'two', 'label': 'Node 2'}, 'position': {'x': 200, 'y': 200}},
                            {'data': {'source': 'one', 'target': 'two'}}
                        ]
                    )
    return "Вкладка не выбрана"

@app.callback(
    Output('statusbar', 'children'),
    Input('filter-btn', 'n_clicks'),
    Input('aggregation-btn', 'n_clicks'),
    Input('layout-btn', 'n_clicks'),
    Input('appearance-btn', 'n_clicks'),
    Input("sidebar", "active_item"),
    prevent_initial_call=True
)
def update_statusbar(b1, b2, b3, b4, sidebar_id):
    triggered_id = callback_context.triggered[0]['prop_id']
    if 'filter-btn.n_clicks' == triggered_id:
         return "Нажата кнопка фильтрации"
    elif 'aggregation-btn.n_clicks' == triggered_id:
         return "Нажата кнопка агрегации"
    elif 'layout-btn.n_clicks' == triggered_id:
         return "Нажата кнопка применения лэйаута"
    elif 'appearance-btn.n_clicks' == triggered_id:
         return "Нажата кнопка применения настроек внешнего вида"
    elif 'sidebar.active_item' == triggered_id:
         return f"Идентификатор активной панели слева: {sidebar_id}"
    else:
        return triggered_id

if __name__ == "__main__":
    app.run_server(debug=True)