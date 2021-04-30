import { useCallback, useEffect, useState } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { io } from "socket.io-client"
import { useParams } from "react-router-dom"

const SAVE_INTERVAL_MS = 2000


export default function TextEditor({fieldName, fieldId, onChangeFunction, classNames}) {
  const { id: documentId } = useParams()
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()
  console.log(documentId)

  useEffect(() => {
    if(socket == null || quill == null) return

    socket.once("load-document", document => {
      quill.setContents(document)
      quill.enable()
    })

    socket.emit('get-document', documentId)
  }, [socket, quill, documentId])

  useEffect(() => {
    const s = io("http://localhost:3001")
    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [])

  useEffect(() => {
    //use for receiving information from server
    if(socket == null || quill == null) return 

    const handler = (delta) => {
      quill.updateContents(delta)
    }

    socket.on('receive-changes', handler)

    return () => {
      socket.off('receive-changes', handler)
    }
  }, [socket, quill])

  useEffect(() => {
    //use for sending information from server

    if(socket == null || quill == null) return 
    
    const handler = (delta, oldDelta, source) => {
      //onChangeFunction is a prop passed in to that is a "setState" hook to update values from the collabrative text environment
      onChangeFunction(document.getElementById(fieldId).children[0].firstChild.innerText)
      if (source !== 'user') return 
      socket.emit("send-changes", delta)
    }

    quill.on('text-change', handler)

    return () => {
      quill.off('text-change', handler)
    }
  }, [quill, socket])

  // useEffect(() => {
  //   if (socket == null || quill == null) return

  //   // socket.once("load-document"
  //   // , document => {
  //   //   quill.setContents(document)
  //   //   quill.enable()
  //   // }
  //   // )

  //   // socket.emit("get-document", documentId)
  // }, [socket, quill, documentId])

  // useEffect(() => {
  //   if (socket == null || quill == null) return

  //   // const interval = setInterval(() => {
  //     // socket.emit("save-document", quill.getContents())
  //   // }, SAVE_INTERVAL_MS)

  //   // return () => {
  //   //   clearInterval(interval)
  //   // }
  // }, [socket, quill])

  // useEffect(() => {
  //   if (socket == null || quill == null) return

  //   const handler = delta => {
  //     quill.updateContents(delta)
  //   }
  //   socket.on("receive-changes", handler)

  //   return () => {
  //     socket.off("receive-changes", handler)
  //   }
  // }, [socket, quill])

  // useEffect(() => {
  //   if (socket == null || quill == null) return

  //   const handler = (delta, oldDelta, source) => {
  //     if (source !== "user") return
  //     socket.emit("send-changes", delta)
  //   }
  //   quill.on("text-change", handler)

  //   return () => {
  //     quill.off("text-change", handler)
  //   }
  // }, [socket, quill])

  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return

    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    editor.setAttribute('name', fieldName) 
    editor.setAttribute('id', fieldId)
    editor.setAttribute('class', classNames)
    editor.addEventListener('onchange', (e) => onChangeFunction(e))

    wrapper.append(editor)
    const q = new Quill(editor, {
      "modules": {
      "toolbar": false
  }
    })
    q.disable()
    q.setText("Loading...")

    setQuill(q)

  }, [])
  return <div 
        className={"container"} 
        ref={wrapperRef}>
  </div>
  
}
