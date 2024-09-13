// React & React Router & React Query Modules;
import React, { useState } from 'react';
import axios from 'axios';
import 'tippy.js/dist/tippy.css';

// Components Imported;
import useCredentialsStore from '../../store/credentialsStore.js';
import useSchemaStore from '../../store/schemaStore.js';
import useSettingsStore from '../../store/settingsStore.js';
import useDataStore from '../../store/dataStore.js';
// const server_url = process.env.NODE_ENV === 'dev' ? process.env.DEV_SERVER_ENDPOINT : process.env.SERVER_ENDPOINT


const Sidebar = (props: any) => {
  //STATE DECLARATION (dbSpy3.0)
  const setDbCredentials = useCredentialsStore((state:any) => state.setDbCredentials);
  const setSchemaStore = useSchemaStore((state:any) => state.setSchemaStore);
  const setDataStore = useDataStore((state:any) => state.setDataStore);
  const { setWelcome } = useSettingsStore((state:any) => state);
  const [_, setDBName] = useState('');
  //used to signal whether loading indicator should appear on sidebar or not, if connect button is pressed
  const [connectPressed, setConnectPressed] = useState(false);
  //used to signal whether full database url input should display in form
  const [_selected, setSelected] = useState('postgres');
  const [dbList, setDbList] = useState([{label: "Loading..."}]);


  //form state hooks
  const [formValues, setFormValues] = useState<{
    dbId?: string;
  }>({});
  //END: STATE DECLARATION

  if(dbList.length === 1 && dbList[0].label === "Loading...") {
    axios.get('https://api.genez.io/databases', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Accept-Version': 'genezio-webapp/0.3.0'
      }
    }).then(async (response: any) => {
      const dbList = response.data.databases.map((database: any) => ({
        value: database.id,
        label: database.name
      }));
      
      setDbList(dbList); // Set the options from API response
      if (dbList.length > 0) {
        setFormValues({dbId: dbList[0].value });
      }
    }).catch((e) => {
      console.error('Error getting database list', e);
    });
  }

  //HELPER FUNCTIONS
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const values: any = formValues;
    localStorage.setItem('dbId', values.dbId);

    //update dbCredentials
    setDbCredentials(values);
    setConnectPressed(true);

    const dataFromBackend = await axios
      .get(import.meta.env.VITE_API_URL + `/api/sql/postgres/schema`, { 
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          'Accept-Version': 'genezio-webapp/0.3.0',
          'Db-Id': localStorage.getItem('dbId') as string
        }
      })
      .then((res) => {
        return res.data;
      })
      .catch((err: ErrorEvent) => console.error('getSchema error', err));
    setSchemaStore(dataFromBackend.schema);
    setDataStore(dataFromBackend.data);
    setWelcome(false);
    setConnectPressed(false);
    props.closeNav();
  };

  //on change for db type selection, will affect state to conditionally render database URL
  const handleChange = (event: any) => {
    setSelected(event.target.value);
    setDBName('');
  };
  //END: HELPER FUNCTIONS

  return (
    <form id="dbconnect" className="bg-[#fbf3de] dark:bg-gray-800">
      <label className="dark:text-[#f8f4eb]">
        <h3>Connect to Database</h3>
      </label>
      <br></br>
      <div>
        <div className="form-item">
          <span className="position flex">
            <label htmlFor="dbId" className="rounded-md dark:text-[#f8f4eb] ">
              Database
            </label>
          </span>
          <select
          className="form-box rounded bg-[#f8f4eb] hover:shadow-sm focus:shadow-inner focus:shadow-[#eae7dd]/75 dark:hover:shadow-[#f8f4eb]"
          id="dbId"
          name="dbId"
          onChange={(e) => {
            setFormValues({ ...formValues, dbId: e.target.value });
            handleChange(e);
          }}
        >
          {dbList.map((option: any, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        </div>
      </div>
      <button
        className="form-button rounded border bg-[#f8f4eb] px-4 py-2 hover:opacity-80 hover:shadow-inner dark:border-none dark:bg-slate-500 dark:text-[#f8f4eb] dark:hover:shadow-lg"
        id="submit"
        onClick={(e) => handleSubmit(e)}
      >
        Connect
      </button>
      <br></br>
      {!connectPressed ? (
        <div className="h-[58px]"></div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex items-center justify-center space-x-1 dark:text-[#f8f4eb]">
            <svg
              fill="none"
              className="h-6 w-6 animate-spin"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
            <div>
              <p>Loading...</p>
              <p>Please wait, this could take a minute</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default Sidebar;