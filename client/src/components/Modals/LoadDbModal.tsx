import { useEffect } from 'react';
import axios from 'axios';
import useSchemaStore from '../../store/schemaStore.js';
import useSettingsStore from '../../store/settingsStore.js';

export default function LoadDbModal({
  closeLoadDbModal,
  dbId
}: {
  closeLoadDbModal: () => void;
  dbId: string
}) {
  const setSchemaStore = useSchemaStore((state:any) => state.setSchemaStore);
  const { setWelcome } = useSettingsStore((state:any) => state);

  const loadSchema = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Token not found, retrying in 1s');
      setTimeout(loadSchema, 1000);
      return;
    }

    const dataFromBackend = await axios
      .get(import.meta.env.VITE_API_URL + `/api/sql/postgres/schema`, { 
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept-Version': 'genezio-webapp/0.3.0',
          'Db-Id': dbId as string
        }
      })
      .then((res) => {
        return res.data;
      })
      .catch((err: ErrorEvent) => console.error('getSchema error', err));
    setSchemaStore(dataFromBackend.schema);
    setWelcome(false);
    closeLoadDbModal();
  }

  useEffect(() => {
    loadSchema();
  }, []);  

  // handleclose from FeatureTab to toggle this modal off
  return (
    <div className="modal" id="loadDbModal" style={{ display: 'block', zIndex: '100' }}>
      <form
        className="modal-content w-[30%] min-w-[300px] max-w-[850px] content-center rounded-md border-0 bg-[#f8f4eb] shadow-[0px_5px_10px_rgba(0,0,0,0.4)] dark:bg-slate-800 dark:shadow-[0px_5px_10px_#1e293b]"
      >
        <label
          className="ml-0 mt-0  text-slate-900 dark:text-[#f8f4eb]">
          Loading database schema...
          </label>
      </form>
    </div>
  );
}
