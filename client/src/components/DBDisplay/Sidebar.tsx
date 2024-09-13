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
    db_type?: string;
    database_link?: string;
    hostname?: string;
    port?: string;
    username?: string;
    password?: string;
    database_name?: string;
    service_name?: string;
    file_path?: string;
  }>({ db_type: 'postgres' });
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
        setFormValues({database_link: dbList[0].value });
      }
    }).catch((e) => {
      console.error('Error getting database list', e);
    });
  }

  //HELPER FUNCTIONS
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const values: any = formValues;
    //parsing postgres database URL defers from parsing mySQL database URL
    if (values.database_link) {
      const response = await axios.get('https://api.genez.io/databases/' + values.database_link, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          'Accept-Version': 'genezio-webapp/0.3.0'
      }});
      const fullLink = response.data.connectionUrl.replace('?sslmode=require', '');
      const splitURI = fullLink.split('/');
      switch (splitURI[0]) {
        default: // PostgreSQL
          const postgresName = splitURI[3];
          const postgresPort = splitURI[2].split(':')[2];
          const internalLinkArray_Postgres = splitURI[2].split(':')[1].split('@');
          values.hostname = internalLinkArray_Postgres[1];
          values.username = splitURI[2].split(':')[0];
          values.password = internalLinkArray_Postgres[0];
          values.port = postgresPort ? postgresPort : '5432';
          values.database_name = postgresName;
          values.db_type = 'postgres';
          break;
      }
    }

    //update dbCredentials
    setDbCredentials(values);
    setConnectPressed(true);

    //change between which getSchema from MySQL to postgres based on db_type

    const dataFromBackend = await axios
      .get(import.meta.env.VITE_API_URL + `/api/sql/${values.db_type}/schema`, { params: values })
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
    if (event.target.value === 'oracle') {
      setFormValues({ ...formValues, service_name: 'ORCL' });
      setDBName('oracle');
    } else if (event.target.value === 'sqlite') {
      setDBName('sqlite');
    } else setDBName('');
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
            <label htmlFor="database_link" className="rounded-md dark:text-[#f8f4eb] ">
              Database
            </label>
          </span>
          <select
          className="form-box rounded bg-[#f8f4eb] hover:shadow-sm focus:shadow-inner focus:shadow-[#eae7dd]/75 dark:hover:shadow-[#f8f4eb]"
          id="database_link"
          name="database_link"
          onChange={(e) => {
            setFormValues({ ...formValues, database_link: e.target.value });
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