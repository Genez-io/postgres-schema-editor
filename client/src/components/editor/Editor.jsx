import React, { useEffect, useState, useRef } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/mode-mysql";
import "ace-builds/src-noconflict/theme-github";
import { Button, SecondaryButton } from "../reusable/Button.jsx";

const Editor = ({ query, setQuery, isOpen, schema }) => {

  const [value, setValue] = useState("");
  const [tableName, setTableName] = useState("");
  const editorRef = useRef(null);

  const onChange = (newValue) => {
    setValue(newValue);
  };

  const onSubmit = () => {
    setQuery(value);
  };

  const onSelectStatement = () => {
    let query = `SELECT * FROM "${tableName}"`;

    setValue(query);
  };

  const onInsertStatement = () => {
    // Generate the column names part
    const columns= schema.map((element) => `"${element}"`).join(", ");
    // Generate the question marks part based on the number of columns
    const placeholders = schema.map(() => "?").join(", ");
    
    let query = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders})`;
  
    setValue(query);
  };

  const onUpdateStatement = () => {
    // Generate the column names part
    const values= schema.map((element) => `"${element}"=?`).join(", ");

    let query = `UPDATE "${tableName}" SET ${values} WHERE ?`;
  
    setValue(query);
  };

  const onDeleteStatement = () => {
    let query = `DELETE FROM "${tableName}" WHERE ?`;
  
    setValue(query);
  };

  useEffect(() => {
    const matches = value.match(/^\s*select\s+\*\s+from\s+\"?([^"\s]*)\"?\s*$/i);
    if (matches) {
      setTableName(matches[1]);
    } else {
      //setTableName("");
    }
  }, [value]);

  useEffect(() => {
    setValue(query);
  }, [query]);

  // Custom completer for table and column names
  useEffect(() => {
    if (editorRef.current) {
      const langTools = ace.require('ace/ext/language_tools');

      const customCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
          const completions = [];

          if (tableName) {
            completions.push({
              caption: tableName,
              value: `"${tableName}"`,
              meta: "table"
            });
          }

          if (schema && schema.length > 0) {
            schema.forEach((column) => {
              completions.push({
                caption: column,
                value: `"${column}"`,
                meta: "column"
              });
            });
          }

          callback(null, completions);
        }
      };

      // Replace existing completers to prevent duplicates
      editorRef.current.completers = [customCompleter];
    }
  }, [schema, tableName]);

  const onLoad = (editorInstance) => {
    editorRef.current = editorInstance;
  };

  return (
    <main
      className={`${
        isOpen ? "col-start-2" : "col-start-1"
      } col-end-3 row-start-2 row-end-3 mx-6 my-12 lg:mx-12`}
    >
      <label htmlFor="editor">
        <AceEditor
          id="editor"
          aria-label="editor"
          mode="mysql"
          theme="github"
          name="editor"
          fontSize={16}
          minLines={15}
          maxLines={10}
          width="100%"
          showPrintMargin={false}
          showGutter
          placeholder="Write your Query here..."
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
          }}
          value={value}
          onChange={onChange}
          showLineNumbers
          onLoad={onLoad}
        />
      </label>
      <div>
        <Button handleClick={onSubmit} iconName="fas fa-play">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 inline mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <title id="run">run query</title>
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Run Query
        </Button>
        {tableName != "" && (
          <>
            &nbsp;
            <SecondaryButton handleClick={onSelectStatement}>
              Select
            </SecondaryButton>
            &nbsp;
            <SecondaryButton handleClick={onInsertStatement}>
              Insert
            </SecondaryButton>
            &nbsp;
            <SecondaryButton handleClick={onUpdateStatement}>
              Update
            </SecondaryButton>
            &nbsp;
            <SecondaryButton handleClick={onDeleteStatement}>
              Delete
            </SecondaryButton>
          </>
        )}
      </div>
    </main>
  );
};

export default Editor;
