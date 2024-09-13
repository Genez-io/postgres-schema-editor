// React & React Router & React Query Modules
import { useState, useRef } from 'react';
import axios, { AxiosResponse } from 'axios';

// Stores imported:
import useDataStore from '../../store/dataStore.js';
import useSchemaStore from '../../store/schemaStore.js';
import useFlowStore from '../../store/flowStore.js';
import useSettingsStore from '../../store/settingsStore.js';
//import icon
import {
  ConnectDatabaseIcon,
  AddTableIcon,
  DeleteTableIcon,
} from '../../FeatureTabIcon';
// Components imported:
import QueryModal from '../Modals/QueryModal.js';
import DbNameInput from '../Modals/DbNameInput.js';
import LoadDbModal from '../Modals/LoadDbModal.js';
import DeleteDbModal from '../Modals/DeleteDbModal.js';

/** "FeatureTab" Component - a tab positioned in the left of the page to access features of the app; */
export default function FeatureTab(props: any) {
  //STATE DECLARATION (dbSpy3.0)
  const { setEdges, setNodes } = useFlowStore((state:any) => state);

  const { dataStore, setDataStore } = useDataStore((state:any) => state);

  const { schemaStore, setSchemaStore} = useSchemaStore(
    (state:any) => state
  );

  const { setWelcome, isSchema, setDarkMode, darkMode, setDBName } = useSettingsStore(
    (state:any) => state
  );
  const [action, setAction] = useState(new Array());
  const [queryModalOpened, setQueryModalOpened] = useState(false);
  const [saveDbNameModalOpened, setSaveDbNameModalOpened] = useState(false);
  const [loadDbModalOpened, setLoadDbModalOpened] = useState(false);
  const [deleteDbModalOpened, setDeleteDbModalOpened] = useState(false);
  const [nameArr] = useState<string[]>([]);
  //END: STATE DECLARATION

  //create references for HTML elements
  const confirmModal: any = useRef();
  /* When the user clicks, open the modal */
  const openModal: any = (callback: any) => {
    confirmModal.current.style.display = 'block';
    confirmModal.current.style.zIndex = '100';
    setAction([callback]);
  };
  /* When the user clicks 'yes' or 'no', close it */
  const closeModal: any = (response: boolean) => {
    confirmModal.current.style.display = 'none';
    if (response) action[0]();
  };

  // HELPER FUNCTIONS

  const connectDb = () => {
    //if Flow is rendered, openModal
    if (document.querySelector('.flow')) openModal(props.handleSidebar);
    else props.handleSidebar();
  };

  const buildDatabase = () => {
    setNodes([]);
    setEdges([]);
    setWelcome(false);
  };

  const closeQueryModal = () => {
    setQueryModalOpened(false);
  };

  const closeSaveDbNameModal = (input?: string) => {
    //pull dbName from input field and send it to the database along with the schema. - dbSpy 7.0
    if (input) {
      saveSchema(input);
    }
    setSaveDbNameModalOpened(false);
  };

  // Load selected database - dbSpy 7.0
  const closeLoadDbModal = (input?: string) => {
    if (input) {
      loadSchema(input);
      setDBName(input);
    }
    setLoadDbModalOpened(false);
  };
  // Delete selected database - dbSpy 7.0
  const closeDeleteDbModal = (input?: string) => {
    if (input) {
      deleteDatabase(input);
    }
    setDeleteDbModalOpened(false);
  };

  // Function for saving databases. Reworked for multiple saves - dbspy 7.0
  const saveSchema = (inputName: string): void => {
    //check to see if a table is present in the schemaStore
    if (Object.keys(schemaStore).length !== 0) {
      //Create request body with the schema to be saved and the inputted name to save it under
      const postBody = {
        schema: JSON.stringify(schemaStore),
        SaveName: inputName,
        TableData: JSON.stringify(dataStore),
      };
      //make a get request to see if the name already exists in the database
      axios
        .get<string[]>('/api/saveFiles/allSave')
        .then((res: AxiosResponse) => {
          const nameArr = [];
          for (let saveName of res.data.data) {
            nameArr.push(saveName.SaveName);
          }
          // if the name already exists then send to one route and if not then send to the other
          // route with combined middleware.
          if (nameArr.includes(inputName)) {
            axios
              .patch('/api/saveFiles/save', postBody)
              .catch((err) => console.error('err', err));
          } else {
            axios
              .post('/api/saveFiles/CreateAndSave', postBody)
              .catch((err) => console.error('err', err));
          }
        })
        .catch((err) => console.error('Err', err));
    } else {
      //if no table is present, send alert to the user
      alert('No schema displayed.');
    }
  };

  // Reworked for multiple loads -  dbSpy 7.0
  const loadSchema = async (inputName: string) => {
    try {
      //send the inputName along with the get request as query in the parameters.
      const data = await fetch(`/api/saveFiles/loadSave?SaveName=${inputName}`);
      if (data.status === 204) return alert('No database stored!');
      const schemaString = await data.json();

      setDataStore(JSON.parse(schemaString.tableData));

      return setSchemaStore(JSON.parse(schemaString.data));
    } catch (err) {
      console.log(err);
      console.error('err retrieve', err);
      window.alert(err);
    }
  };
  // Function for deleting databases - dbspy 7.0
  const deleteDatabase = (inputName: string) => {
    try {
      //send the inputName along with the delete request as query in the parameters.
      axios
        .delete(`/api/saveFiles/deleteSave/${inputName}`)
        .catch((err) => console.error('err', err));
    } catch (err) {
      console.log(err);
      console.error('err retrieve', err);
      window.alert(err);
    }
  };


  //Toggle function for DarkMode
  const toggleClass = (): void => {
    const page = document.getElementById('body');
    page!.classList.toggle('dark');
    setDarkMode();
  };

  // END: HELPER FUNCTIONS

  return (
    <>
      {/* PAGE */}
      <div className="mx-auto max-w-2xl">
        <aside
          className="featureTab z-index-10 light:bg-sky-800 absolute inset-y-0 left-0 top-24 w-64"
          aria-label="FeatureTab"
        >
          <div className="menuBar light:bg-sky-800 ml-3 overflow-auto rounded px-10 py-6 transition-colors duration-500">
            <button onClick={toggleClass}>
              <div className="ItemLink group inline-flex h-10 w-[160px] items-center justify-start gap-0 rounded-lg py-2 pl-0 pr-0">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.0"
                  stroke="currentColor"
                  className=" ml-2 mr-2 h-[24] stroke-current text-gray-500 group-hover:text-yellow-500 dark:text-[#f8f4eb] dark:group-hover:text-yellow-300"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.50488 10.7569C1.50488 16.4855 6.14803 21.1294 11.8756 21.1294C16.2396 21.1294 19.974 18.4335 21.5049 14.616C20.3104 15.0962 19.0033 15.3668 17.6372 15.3668C11.9095 15.3668 7.26642 10.7229 7.26642 4.99427C7.26642 3.63427 7.53299 2.3195 8.00876 1.12939C4.19637 2.66259 1.50488 6.39536 1.50488 10.7569Z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="DarkMode text-sm font-normal leading-normal text-gray-900 group-hover:text-yellow-500 group-hover:underline dark:text-[#f8f4eb] dark:group-hover:text-yellow-300 ">
                  {darkMode === true ? 'Light' : 'Dark'} Mode
                </span>
              </div>
            </button>

            <p className=" mt-4 text-slate-900 dark:text-[#f8f4eb]">Action</p>
            <hr />
            <ul className=" space-y-0">
              <li>
                <a
                  onClick={connectDb}
                  className="dark: group flex cursor-pointer items-center rounded-lg p-2 text-sm font-normal text-gray-900 hover:text-yellow-500 hover:underline dark:text-[#f8f4eb] dark:hover:text-yellow-300"
                  data-testid="connect-database"
                >
                  <ConnectDatabaseIcon />
                  <span className="ml-3">Connect Database</span>
                </a>
              </li>
              {/* TODO: Add SAVE feature */}

              <br />
              <p className="text-slate-900 dark:text-[#f8f4eb]">Edit</p>
              <hr />
              {isSchema ? (
                <li>
                  <a
                    onClick={() => {
                      props.openAddTableModal();
                      // if schemaStore is empty, initialize
                      if (!Object.keys(schemaStore).length) buildDatabase();
                    }}
                    id="addTable"
                    className="group flex cursor-pointer items-center rounded-lg p-2 text-sm font-normal text-gray-900 hover:text-yellow-500 hover:underline dark:text-[#f8f4eb] dark:hover:text-yellow-300 "
                  >
                    <AddTableIcon />
                    <span className="ml-3 flex-1 whitespace-nowrap">Add Table</span>
                  </a>
                </li>
              ) : null}
              {Object.keys(schemaStore).length ? (
                <li>
                  <a
                    onClick={() => {
                      props.openDeleteTableModal();
                    }}
                    id="deleteTable"
                    className="group flex cursor-pointer items-center rounded-lg p-2 text-sm font-normal text-gray-900 hover:text-yellow-500 hover:underline dark:text-[#f8f4eb] dark:hover:text-yellow-300"
                  >
                    <DeleteTableIcon />
                    <span className="ml-3 flex-1 whitespace-nowrap">Delete Table</span>
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </aside>

        {/* MODALS */}

        {/* MODAL FOR CONFIRMATION POPUP */}
        <div ref={confirmModal} id="confirmModal" className="confirmModal">
          {/* <!-- Confirm Modal content --> */}
          <div className="modal-content w-[30%] min-w-[300px] max-w-[550px] content-center rounded-md border-0 bg-[#f8f4eb] shadow-[0px_5px_10px_rgba(0,0,0,0.4)] dark:bg-slate-800 dark:shadow-[0px_5px_10px_#1e293b]">
            <p className="mb-4 text-center text-slate-900 dark:text-[#f8f4eb]">
              Are you sure you want to proceed? You will lose <strong>ALL</strong> unsaved
              changes.
            </p>
            <div className="mx-auto flex w-[50%] max-w-[200px] justify-between">
              <button
                onClick={() => closeModal(true)}
                className="modalButton text-slate-900 hover:opacity-70 dark:text-[#f8f4eb]"
              >
                Confirm
              </button>
              <button
                onClick={() => closeModal(false)}
                className="modalButton text-slate-900 hover:opacity-70 dark:text-[#f8f4eb]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Query Output Modal */}
        {/* Sending props to child components. */}
        {queryModalOpened ? <QueryModal closeQueryModal={closeQueryModal} /> : null}
        {saveDbNameModalOpened ? (
          <DbNameInput closeSaveDbNameModal={closeSaveDbNameModal} />
        ) : null}
        {loadDbModalOpened ? (
          <LoadDbModal nameArr={nameArr} closeLoadDbModal={closeLoadDbModal} />
        ) : null}
        {deleteDbModalOpened ? (
          <DeleteDbModal nameArr={nameArr} closeDeleteDbModal={closeDeleteDbModal} />
        ) : null}
      </div>
    </>
  );
}
