import { useState, useEffect } from 'react';
import useSchemaStore from '../../store/schemaStore.js';
import useFlowStore from '../../store/flowStore';

type DeleteTableModalProps = {
  closeDeleteTableModal: () => void;
  dbId: string;
};
export default function DeleteTableModal({
  closeDeleteTableModal,
  dbId
}: DeleteTableModalProps) {
  const [tableName, setTableName] = useState<string>('');
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [connectPressed, setConnectPressed] = useState(false);

  const { schemaStore, setSchemaStore } = useSchemaStore((state:any) => state);
  const { setEdges, setNodes } = useFlowStore((state:any) => state);

  useEffect(() => {
    const fetchTableNames = async () => {
      try {
        const tableNameArr: string[] = [];
        for (const tableName in schemaStore) {
          tableNameArr.push(tableName);
        }
        setTableNames(tableNameArr);
      } catch (error: unknown) {
        console.error('Error retrieving table names from schemaStore:', error);
      }
    };
    fetchTableNames();
  }, []);

  const deleteTable = async (): Promise<void> => {
    try {
      setConnectPressed(true);
      for (let tableKey in schemaStore) {
        for (let rowKey in schemaStore[tableKey]) {
          if (
            schemaStore[tableKey][rowKey].IsForeignKey &&
            schemaStore[tableKey][rowKey].References[0].PrimaryKeyTableName === tableName
          ) {
            schemaStore[tableKey][rowKey].IsForeignKey = false;
          }
        }
      }
      await fetch(import.meta.env.VITE_API_URL + `/api/sql/postgres/deleteTable`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          'Accept-Version': 'genezio-webapp/0.3.0',
          'Db-Id': dbId
        },
        body: JSON.stringify({ tableName: tableName }),
      });

      //delete the table object from the schemaStore object
      delete schemaStore[tableName];
      setNodes([]);
      setEdges([]);
      //pass in modified schemaStore object which triggers a the rerender function in the flow.tsx component
      setSchemaStore(Object.keys(schemaStore).length > 0 ? { ...schemaStore } : {});
      setTableName('');
      setConnectPressed(false);
      closeDeleteTableModal();
    } catch (error) {
      console.error('Error fetching table names:', error);
      closeDeleteTableModal();
      setTableName('');
    }
  };
  return (
    <div id="deleteTableModal" className="input-modal">
      <div className="modal-content w-96 rounded-md bg-[#f8f4eb] shadow-[0px_5px_10px_rgba(0,0,0,0.4)] dark:bg-slate-800 dark:shadow-[0px_5px_10px_#1e293b]">
        <h2 className="pb-4 text-xl text-slate-900 dark:text-[#f8f4eb]">
          Select a table to delete:
        </h2>
        <ul className="text-slate-900 dark:text-[#f8f4eb]">
          {tableNames.map((name) => (
            <li key={`table-${name}`} className="flex items-center justify-between pb-2">
              {name}{' '}
              <button
                value={name}
                onClick={() => setTableName(name)}
                className="btn red"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        {!connectPressed ? (
          <>
            {tableName && (
              <div className="mt-4 text-slate-900 dark:text-[#f8f4eb]">
                <br></br>
                <h3 className="mb-2 flex justify-center">
                  Are you sure you want to delete the {tableName} table?
                </h3>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      deleteTable();
                      setTableName('');
                    }}
                    className="btn red"
                  >
                    Confirm
                  </button>{' '}
                  <button
                    onClick={() => setTableName('')}
                    className="btn"
                  >
                    Return
                  </button>
                </div>
              </div>
            )}
            <br></br>
            <div className="flex justify-center">
              <button
                type="button"
                className="btn"
                onClick={async (e) => {
                  e.preventDefault();
                  setTableNames([]);
                  setTableName('');
                  closeDeleteTableModal();
                }}
                data-testid="modal-cancel"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <br></br>
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
                <p>Deleting...</p>
                <p>Please wait, this could take a minute</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
