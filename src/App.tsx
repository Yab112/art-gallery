import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

export default function App() {
  return (
    <>
      {/* <DefaultMetadata /> */}
      <RouterProvider router={router} />
    </>
  );
}
