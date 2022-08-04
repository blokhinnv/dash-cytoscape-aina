% Auto-generated: do not edit by hand
\name{cytoUndoRedoList}

\alias{cytoUndoRedoList}

\title{UndoRedoList component}

\description{
The component is showing list of items.  Elements above hover are highlighted too. Expected usage is for undo/redo list demonstration.
}

\usage{
cytoUndoRedoList(id=NULL, actions=NULL, undo_index=NULL)
}

\arguments{
\item{id}{Character. The ID used to identify this component in Dash callbacks.}

\item{actions}{List of characters. An array of history actions}

\item{undo_index}{Numeric. Index of event, start of which we will undo}
}

\value{named list of JSON elements corresponding to React.js properties and their values}

