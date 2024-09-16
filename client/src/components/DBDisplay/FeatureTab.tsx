// React & React Router & React Query Modules
import { useState, useRef } from 'react';

// Stores imported:
import useSchemaStore from '../../store/schemaStore.js';
import useFlowStore from '../../store/flowStore.js';
import useSettingsStore from '../../store/settingsStore.js';
//import icon
import {
  AddTableIcon,
  DeleteTableIcon,
} from '../../FeatureTabIcon';
// Components imported:
import LoadDbModal from '../Modals/LoadDbModal.js';

/** "FeatureTab" Component - a tab positioned in the left of the page to access features of the app; */
export default function FeatureTab(props: any) {
  const { setEdges, setNodes } = useFlowStore((state:any) => state);
  const { schemaStore } = useSchemaStore(
    (state:any) => state
  );

  const { setWelcome, setDarkMode, darkMode } = useSettingsStore(
    (state:any) => state
  );
  const [action] = useState(new Array());
  const [loadDbModalOpened, setLoadDbModalOpened] = useState(true);
  //END: STATE DECLARATION

  //create references for HTML elements
  const confirmModal: any = useRef();
  /* When the user clicks 'yes' or 'no', close it */
  const closeModal: any = (response: boolean) => {
    confirmModal.current.style.display = 'none';
    if (response) action[0]();
  };

  // HELPER FUNCTIONS

  const buildDatabase = () => {
    setNodes([]);
    setEdges([]);
    setWelcome(false);
  };

  const closeLoadDbModal = () => {
    setLoadDbModalOpened(false);
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
      {/* <button 
        className="btn"
        onClick={toggleClass}>
          <div className='ItemLink group inline-flex items-center justify-start gap-0 rounded-lg'>
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.0"
            stroke="currentColor"
            className="h-[18] stroke-current text-gray-500 group-hover:text-yellow-500 dark:text-[#f8f4eb] dark:group-hover:text-yellow-300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.50488 10.7569C1.50488 16.4855 6.14803 21.1294 11.8756 21.1294C16.2396 21.1294 19.974 18.4335 21.5049 14.616C20.3104 15.0962 19.0033 15.3668 17.6372 15.3668C11.9095 15.3668 7.26642 10.7229 7.26642 4.99427C7.26642 3.63427 7.53299 2.3195 8.00876 1.12939C4.19637 2.66259 1.50488 6.39536 1.50488 10.7569Z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="ml-3 flex-1 whitespace-nowrap">{darkMode === true ? 'Light' : 'Dark'} Mode</span>
        </div>
      </button> */}

      {!loadDbModalOpened ? (
        <button
          onClick={() => {
            props.openAddTableModal();
            // if schemaStore is empty, initialize
            if (!Object.keys(schemaStore).length) buildDatabase();
          }}
          id="addTable"
          className="btn"
          >
          <div className='ItemLink group inline-flex items-center justify-start gap-0 rounded-lg'>
            <AddTableIcon />
            <span className="ml-3 flex-1 whitespace-nowrap">Add Table</span>
          </div>
        </button>
      ) : null}
      {Object.keys(schemaStore).length ? (
        <button
          onClick={() => {
            props.openDeleteTableModal();
          }}
          id="deleteTable"
          className="btn"
        >
          <div className='ItemLink group inline-flex items-center justify-start gap-0 rounded-lg'>
          <DeleteTableIcon />
            <span className="ml-3 flex-1 whitespace-nowrap">Delete Table</span>
          </div>
        </button>
      ) : null}
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
        {loadDbModalOpened ? (
          <LoadDbModal dbId={props.dbId} closeLoadDbModal={closeLoadDbModal} />
        ) : null}
    </>
  );
}
