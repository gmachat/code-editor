
import React, { Component, useEffect, useState } from "react";
import "./Compiler.css";
// import TextEditor from '../components/TextEditor/TextEditor'
import FirePad from "./FirePad/FirePad";


const API_KEY = process.env.REACT_APP_JUDGE0_KEY


const Compiler = () => {

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language_id, setLanguage_id] = useState(63);
  const [language_name, setLanguage_name] = useState('javascript');
  const [user_input, setUser_input] = useState('');
  const [codeLines, setCodeLines] = useState()


  // const handleLanguageChange = (target) => {
  //   setLanguage_id(target.value)
  //   let languageByName
  //   switch(target.value){
  //     case '63':
  //       languageByName=  'javascript'
  //       break
  //     case '75':
  //       languageByName = 'c'
  //       break
  //     case '54':
  //       languageByName = 'c++'
  //       break
  //     case '62':
  //       languageByName = 'java'
  //       break
  //     case '71':
  //       languageByName = 'python'
  //       break
  //   }
  //   setLanguage_name(languageByName)
  // }


  const observeCodeChange = () => {
    //add 'onChange-like' handler to each individual line
    const  codeLines = document.querySelector('.CodeMirror-code')

    //for each mutation to the .CodeMirror-code div call to get text from editor
    function callback(mutationList, observer) {
      getTextFromCodeEditor()
    }
    const observerOptions = {
      childList: true,
      // attributes: true,
      subtree: true
    }
    //observe changes in the "div" add similiar functionality to an onChange callback
    const observer = new MutationObserver(callback);
    observer.observe(codeLines, observerOptions);
  }

  const getTextFromCodeEditor = () => {
    const lines = document.querySelectorAll('.CodeMirror-line ')
    let textFromCode = []
    for(let line of lines){
      textFromCode.push(line.innerText)
    }
    //filters out ''ZERO WIDTH SPACE' (U+200B)' that was appearing at the end of blank lines
    let filteredCode = textFromCode.filter(text => {
      return /\S+/.test(text.replace(/\u200B/g,''))
    }
    )
    //joins code with a new line char
    const parsedCodeText = filteredCode.join('\n')
    setInput(parsedCodeText)
  }


    useEffect(() => {
      getTextFromCodeEditor()
      observeCodeChange()
    }, [])


  const submit = async (e) => {
    e.preventDefault();
    let outputText = document.getElementById("output");
    outputText.innerHTML = "";
    outputText.innerHTML += "Creating Submission ...\n";


    const response = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions/?base64_encoded=false&wait=false",
      {
        method: "POST",
        headers: {
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "x-rapidapi-key": API_KEY, 
          "Content-Type": "application/json",
          "useQueryString": true
        },
        body: JSON.stringify({
          source_code: input,
          stdin: user_input,
          language_id: language_id,
        }),
      }
    );
    outputText.innerHTML += "Submission Created ...\n";
    const jsonResponse = await response.json();
    console.log(jsonResponse)


    let jsonGetSolution = {
      status: { description: "Queue" },
      stderr: null,
      compile_output: null,
    };
    
    while (
      jsonGetSolution.status.description !== "Accepted" &&
      jsonGetSolution.stderr == null &&
      jsonGetSolution.compile_output == null
    ) {

      outputText.innerHTML = `Creating Submission ... \nSubmission Created ...\nChecking Submission Status\nstatus : ${jsonGetSolution.status.description}`;
      if (jsonResponse.token) {
        let url = `https://judge0-ce.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true`;

        const getSolution = await fetch(url, {
          method: "GET",
          headers: {
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "x-rapidapi-key": API_KEY,
            "Content-Type": "application/json",
          },
        });


        jsonGetSolution = await getSolution.json();
        console.log('jsongetsolution', jsonGetSolution)
      }
    }
    if (jsonGetSolution.stdout) {
      const outputSolution = atob(jsonGetSolution.stdout);

      outputText.innerHTML = "";

      outputText.innerHTML += `Results : ${outputSolution}\nExecution Time : ${jsonGetSolution.time} Secs\nMemory used : ${jsonGetSolution.memory} bytes`;
    } else if (jsonGetSolution.stderr) {
      const error = atob(jsonGetSolution.stderr);

      outputText.innerHTML = "";

      outputText.innerHTML += `\n Error :${error}`;
    } else {
      const compilation_error = atob(jsonGetSolution.compile_output);

      outputText.innerHTML = "";

      outputText.innerHTML += `\n Error :${compilation_error}`;
    }
  };

    return (
      <>
        <div className="ide-grid">
          <div className="user-input-section">
            <label for="solution ">
              <span className="badge badge-info heading mt-2 ">
                <i className=""></i> Code Here
                Language: {language_name}

              </span>
            </label>
            {/* <TextEditor fieldName={'solution'} fieldId={'source'} onChangeFunction={setInput} classNames="source"/> */}
            <FirePad language_name={language_name} />


            <button
              type="submit"
              className="btn btn-danger ml-2 mr-2 "
              onClick={(event) => submit(event)}
            >
              <i class="fas fa-cog fa-fw"></i> Run
            </button>

            {/* <label for="tags" className="mr-1">
              <b className="heading">Language:</b>
            </label>
            <select
              value={language_id}
              onChange={(event) => handleLanguageChange(event.target)}
              id="tags"
              className="form-control form-inline mb-2 language"
            >
              <option value="63">Javascript</option>
              <option value="75">C</option>
              <option value="54">C++</option>
              <option value="62">Java</option>
              <option value="71">Python</option>
            </select> */}
          </div>
          <div className="col-5">
            <div>
              <span className="badge badge-info heading my-2 ">
                <i className="fas fa-exclamation fa-fw fa-md"></i> Output
              </span>
              <textarea id="output" disabled></textarea>
            </div>
          </div>
        </div>

        <div className="mt-2 ml-5">
          <span className="badge badge-primary heading my-2 ">
            <i className="fas fa-user fa-fw fa-md"></i> User Input
          </span>
          <br />
          <textarea id="input" onChange={(event) => setUser_input(event.target.value)}></textarea>
        </div>
      </>
    );
  
}

export default Compiler