import React, { useState, Suspense } from "react";
import "../assets/output.css";
import { Toaster } from "react-hot-toast";
import Loader from "../components/reusable/Loader.jsx";
const NavigationMenu = React.lazy(() =>
  import("../components/layouts/NavigationMenu.jsx")
);
const Editor = React.lazy(() => import("../components/editor/Editor.jsx"));
const TableSection = React.lazy(() =>
  import("../components/table/TableSection.jsx")
);
const Footer = React.lazy(() => import("../components/layouts/Footer.jsx"));

const DBData = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Toaster
        position="top-center"
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: "",
          duration: 5000,
          style: {
            background: "#ffffff",
            color: "#3A4374",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4661E6",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#D73737",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <div className="grid grid-cols-layout-desktop grid-rows-layout-desktop min-h-screen">
        <Suspense fallback={<Loader />}>
          <NavigationMenu
            setQuery={setQuery}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
          <Editor
            setQuery={setQuery}
            query={query}
            isOpen={isOpen}
          />
          {query ? <TableSection query={query} isOpen={isOpen} /> : null}
          <Footer isOpen={isOpen} />
        </Suspense>
      </div>
    </>
  );
};

export default DBData;
