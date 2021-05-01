
import Compiler from './components/Compiler'
import Editor from "@monaco-editor/react";
import FirePad from "./components/FirePad/FirePad"

// var firepadDiv = document.getElementById('firepad');
// var firepadRef = firebase.database().ref();
// var codeMirror = CodeMirror(firepadDiv, { lineWrapping: true });
// var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
//     { richTextShortcuts: true, richTextToolbar: true });


import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom"
import { v4 as uuidV4 } from "uuid"

function App() {

  
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Redirect to={`/documents/${uuidV4()}`} />
        </Route>
        <Route path="/documents/:id">
          <Compiler />
        </Route>
      </Switch>
          {/* <FirePad /> */}
    </Router>
  )
}

export default App