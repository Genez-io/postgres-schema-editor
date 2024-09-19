import React, { useEffect } from "react";
import {fetchTableNames} from "../../hooks/useData";

const Navbar = React.memo(({ setQuery, isOpen, setIsOpen }) => {
  const [TABLE_NAMES, setTableNames] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    fetchTableNames().then((data) => {
      setTableNames(data);
      if (data.length > 0) {
        handleQuery(data[0]);
      }
      setLoading(false);
    });
  }, []);

  const handleQuery = (tableName) => {
    setQuery(`select * from "${tableName}"`);
  };
  return (
    <>
      <nav
        className={`${
          isOpen ? "col-start-2" : "col-start-1"
        } col-end-3 row-start-1 row-end-2 bg-primary-dark shadow`}
      >
        <div className="px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center">
                {!isOpen && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-white mr-4 text-2xl cursor-pointer h-8 w-8"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <title id="hamburger">navigation menu</title>
                    <path
                      fillRule="evenodd"
                      d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <a className="text-white font-bold align-middle" href="#">
                  Postgres Data Editor
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {isOpen && (
        <div className="relative col-start-1 col-end-2 row-start-1 row-end-5">
          <div className="bg-secondary-dark text-white w-72 px-3 fixed top-0 bottom-0 z-50 m</div>in-h-screen overflow-y-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-white m-4 text-2xl cursor-pointer float-right h-8 w-8"
              viewBox="0 0 20 20"
              fill="currentColor"
              onClick={() => setIsOpen(!isOpen)}
            >
              <title id="rightArrow">right arrow</title>
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <aside className="p-5">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  Loading...
                </div>
              ) : (
                <>
                  {TABLE_NAMES.map((name) => {
                    return (
                      <button
                        className="flex items-center p-2 my-6 transition-colors text-secondary-light hover:text-white hover:bg-primary-dark duration-200 rounded-lg "
                        key={name}
                        onClick={() => {
                          handleQuery(name);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="mx-4 text-base font-normal">
                          {name}
                        </span>
                      </button>
                    );
                  })}
                </>
              )}
            </aside>
          </div>
        </div>
      )}
    </>
  );
});

export default Navbar;
